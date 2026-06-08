import os
import uuid
import base64
import hashlib
from datetime import date
from io import BytesIO
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, VehicleInspection, VehicleDamage, InspectionStatus
from ..auth import get_current_user, require_vehicle_agent, require_admin, get_current_user_download
from ..schemas import (
    VehicleIntakeCreate, VehicleIntakeUpdate, SignBody,
    VehicleDamageUpdate, VehicleDamageOut,
    VehicleInspectionOut, VehicleInspectionListItem,
    PaginatedResponse, ChecklistUpdate, CompleteBody,
)
from ..audit import log_action
from ..config import settings

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


def _sig_hash(inspection_id: uuid.UUID, nombre: Optional[str], fecha, firma_data: str) -> str:
    content = f"{inspection_id}|{nombre or ''}|{str(fecha or '')}|{firma_data}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# ── helpers ──────────────────────────────────────────────────────────────────

def _get_inspection(db: Session, inspection_id: uuid.UUID) -> VehicleInspection:
    insp = (
        db.query(VehicleInspection)
        .options(joinedload(VehicleInspection.damages))
        .filter(VehicleInspection.id == inspection_id, VehicleInspection.is_deleted == False)
        .first()
    )
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    return insp


async def _save_photo(file: UploadFile, inspection_id: uuid.UUID, damage_id: uuid.UUID) -> str:
    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    dir_path = os.path.join(settings.UPLOADS_DIR, "vehicles", str(inspection_id), str(damage_id))
    os.makedirs(dir_path, exist_ok=True)
    contents = await file.read()
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(contents)
    return f"/uploads/vehicles/{inspection_id}/{damage_id}/{filename}"


def _generate_liability_pdf(insp: VehicleInspection) -> str:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image, HRFlowable
    )

    pdfs_dir = os.path.join(settings.UPLOADS_DIR, "pdfs")
    os.makedirs(pdfs_dir, exist_ok=True)
    out_path = os.path.join(pdfs_dir, f"{insp.id}_liability.pdf")

    doc = SimpleDocTemplate(out_path, pagesize=letter,
                            leftMargin=0.75*inch, rightMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    amber = colors.HexColor("#F5A623")
    dark = colors.HexColor("#0f1117")

    title_style = ParagraphStyle("title", parent=styles["Title"],
                                 textColor=dark, fontSize=18, spaceAfter=4)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"],
                               fontSize=10, textColor=colors.HexColor("#555555"), spaceAfter=12)
    label_style = ParagraphStyle("label", parent=styles["Normal"],
                                 fontSize=8, textColor=colors.HexColor("#777777"),
                                 fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=8, spaceAfter=4)
    legal_style = ParagraphStyle("legal", parent=styles["Normal"], fontSize=7.5, leading=11)

    story = []

    story.append(Paragraph("ARNIAN GROUP", title_style))
    story.append(Paragraph("Vehicle Receiving — Liability Release / Descargo de Responsabilidad", sub_style))
    story.append(HRFlowable(width="100%", thickness=1, color=amber))
    story.append(Spacer(1, 0.15*inch))

    # Vehicle info
    story.append(Paragraph("VEHICLE INFORMATION / INFORMACIÓN DEL VEHÍCULO", label_style))
    story.append(Spacer(1, 0.05*inch))

    def cell(v): return str(v) if v is not None else "—"

    veh_data = [
        ["Date / Fecha", cell(insp.fecha), "City / Ciudad", cell(insp.city)],
        ["Customer / Cliente", cell(insp.nombre), "ID", cell(insp.id_cliente)],
        ["Year", cell(insp.year), "Make", cell(insp.make)],
        ["Model", cell(insp.model), "Color", cell(insp.color)],
        ["Plates / Placas", cell(insp.placas), "Odometer", cell(insp.odometer)],
        ["VIN", cell(insp.vin), "Fuel / Gasolina", cell(insp.gasolina)],
    ]
    veh_table = Table(veh_data, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
    veh_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f5f5f5")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#f5f5f5")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(veh_table)
    story.append(Spacer(1, 0.15*inch))

    # Checklist
    story.append(Paragraph("DOCUMENTS RECEIVED / DOCUMENTOS RECIBIDOS", label_style))
    story.append(Spacer(1, 0.05*inch))
    checklist = insp.checklist or {}
    doc_labels = {
        "licencia": "Copia de Licencia / Driver's License Copy",
        "circulacion": "Tarjeta de Circulación / Circulation Card",
        "aseguranza": "Copia de Aseguranza / Insurance Copy",
        "cotizacion": "Copia de Cotización Firmada / Signed Quote",
        "autorizacion": "Carta de Autorización / Authorization Letter",
    }
    chk_data = [[
        ("✓" if checklist.get(k) else "☐") + "  " + v
    ] for k, v in doc_labels.items()]
    chk_table = Table([[Paragraph(row[0], body_style)] for row in chk_data], colWidths=[7*inch])
    chk_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 0.15*inch))

    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.1*inch))

    # Legal text
    story.append(Paragraph("LIABILITY RELEASE / DESCARGO DE RESPONSABILIDAD", label_style))
    story.append(Spacer(1, 0.05*inch))

    origin_text = (
        "ORIGIN / ORIGEN<br/>"
        "Received by owner in apparent good condition EXCEPT AS NOTED. "
        "I agree with Arnian's assessment of the vehicle's condition at the time of delivery. "
        "I have read and understand the terms and conditions. "
        "I agree to be bound by these terms. "
        "This Vehicle is free of contents."
    )
    dest_text = (
        "DESTINATION / DESTINO<br/>"
        "We have received the above vehicle in good condition except as noted, "
        "thereby releasing Arnian from any further claims regarding pre-existing damage."
    )

    legal_table = Table(
        [[Paragraph(origin_text, legal_style), Paragraph(dest_text, legal_style)]],
        colWidths=[3.5*inch, 3.5*inch]
    )
    legal_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(legal_table)
    story.append(Spacer(1, 0.2*inch))

    # Signatures
    def _decode_sig(b64: str):
        try:
            data = b64.split(",")[-1]
            return BytesIO(base64.b64decode(data))
        except Exception:
            return None

    sig_content = [["ORIGIN SIGNATURE", "DESTINATION SIGNATURE"]]
    sig_row = []

    for sig_b64, name_field, date_field in [
        (insp.firma_origen, insp.nombre_firma_origen, insp.fecha_firma_origen),
        (insp.firma_destino, insp.nombre_firma_destino, insp.fecha_firma_destino),
    ]:
        cell_items = []
        if sig_b64:
            buf = _decode_sig(sig_b64)
            if buf:
                cell_items.append(Image(buf, width=2.5*inch, height=0.8*inch))
        cell_items.append(Paragraph(f"Name: {name_field or '_______________'}", body_style))
        cell_items.append(Paragraph(f"Date: {date_field or '_______________'}", body_style))
        sig_row.append(cell_items)

    if sig_row:
        sig_table = Table(
            [sig_content[0], sig_row],
            colWidths=[3.5*inch, 3.5*inch]
        )
        sig_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(sig_table)

    if insp.notas:
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph("Notes / Notas:", label_style))
        story.append(Paragraph(insp.notas, body_style))

    doc.build(story)
    return f"/uploads/pdfs/{insp.id}_liability.pdf"


def _generate_full_report_pdf(insp: VehicleInspection, base_url: Optional[str] = None, token: Optional[str] = None) -> str:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image,
        HRFlowable, PageBreak
    )

    pdfs_dir = os.path.join(settings.UPLOADS_DIR, "pdfs")
    os.makedirs(pdfs_dir, exist_ok=True)
    out_path = os.path.join(pdfs_dir, f"{insp.id}_report.pdf")

    doc = SimpleDocTemplate(out_path, pagesize=letter,
                            leftMargin=0.75*inch, rightMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    amber = colors.HexColor("#F5A623")

    label_style = ParagraphStyle("label", parent=styles["Normal"],
                                 fontSize=8, textColor=colors.HexColor("#777777"),
                                 fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=8, spaceAfter=4)
    link_style = ParagraphStyle("link", parent=styles["Normal"], fontSize=8,
                                textColor=colors.HexColor("#1a6fc4"), spaceAfter=4)
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=16, spaceAfter=4)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"], fontSize=10,
                               textColor=colors.HexColor("#555555"), spaceAfter=12)

    story = []

    story.append(Paragraph("ARNIAN GROUP", title_style))
    folio_str = f"  [{insp.folio}]" if insp.folio else ""
    story.append(Paragraph(
        f"Vehicle Inspection Report{folio_str} — {insp.make or ''} {insp.model or ''} {insp.year or ''}",
        sub_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=amber))
    story.append(Spacer(1, 0.1*inch))

    def cell(v): return str(v) if v is not None else "—"

    veh_data = [
        ["Folio", cell(insp.folio), "Date", cell(insp.fecha), "City", cell(insp.city)],
        ["Status", cell(insp.status.value), "Vehicle Type", cell(insp.vehicle_type.value), "Customer", cell(insp.nombre)],
        ["ID", cell(insp.id_cliente), "", "", "", ""],
        ["Year", cell(insp.year), "Make", cell(insp.make), "Model", cell(insp.model)],
        ["Color", cell(insp.color), "Plates", cell(insp.placas), "Odometer", cell(insp.odometer)],
        ["VIN", cell(insp.vin), "Fuel", cell(insp.gasolina), "", ""],
    ]
    veh_table = Table(veh_data, colWidths=[1*inch, 1.5*inch, 1*inch, 1.5*inch, 1*inch, 1*inch])
    veh_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (4, 0), (4, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(veh_table)
    story.append(Spacer(1, 0.15*inch))

    # Damage summary
    damages = insp.damages or []
    story.append(Paragraph(f"DAMAGE REPORT — {len(damages)} item(s) recorded", label_style))
    story.append(Spacer(1, 0.05*inch))

    if damages:
        dmg_header = [["Vista", "Tipo", "Descripción", "Foto"]]
        dmg_rows = []
        for d in damages:
            if d.photos and base_url and token:
                photo_url = f"{base_url}{d.photos[0]}?token={token}"
                photo_cell = Paragraph(
                    f'<link href="{photo_url}" color="#1a6fc4">Ver →</link>',
                    link_style
                )
            else:
                photo_cell = Paragraph(str(len(d.photos)) if d.photos else "—", body_style)
            dmg_rows.append([
                d.view.upper(),
                d.damage_type.title(),
                Paragraph(d.description or "—", body_style),
                photo_cell,
            ])
        dmg_table = Table(dmg_header + dmg_rows,
                          colWidths=[0.8*inch, 1*inch, 4.5*inch, 0.7*inch])
        dmg_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(dmg_table)
        story.append(Spacer(1, 0.15*inch))
    else:
        story.append(Paragraph("No damages recorded.", body_style))

    # ── Appendix: Liability Release ───────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("APPENDIX A — LIABILITY RELEASE / DESCARGO DE RESPONSABILIDAD", label_style))
    story.append(HRFlowable(width="100%", thickness=1, color=amber))
    story.append(Spacer(1, 0.15*inch))

    # Checklist
    story.append(Paragraph("DOCUMENTS RECEIVED / DOCUMENTOS RECIBIDOS", label_style))
    story.append(Spacer(1, 0.05*inch))
    checklist = insp.checklist or {}
    doc_labels = {
        "licencia":     "Copia de Licencia / Driver's License Copy",
        "circulacion":  "Tarjeta de Circulación / Circulation Card",
        "aseguranza":   "Copia de Aseguranza / Insurance Copy",
        "cotizacion":   "Copia de Cotización Firmada / Signed Quote",
        "autorizacion": "Carta de Autorización / Authorization Letter",
    }
    chk_table = Table(
        [[Paragraph(("✓  " if checklist.get(k) else "☐  ") + v, body_style)] for k, v in doc_labels.items()],
        colWidths=[7*inch]
    )
    chk_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 0.2*inch))

    # Legal text
    story.append(Paragraph("LIABILITY RELEASE / DESCARGO DE RESPONSABILIDAD", label_style))
    story.append(Spacer(1, 0.05*inch))
    legal_style = ParagraphStyle("legal", parent=styles["Normal"], fontSize=7.5, leading=11)
    origin_text = (
        "<b>ORIGIN / ORIGEN</b><br/>"
        "Received by owner in apparent good condition EXCEPT AS NOTED. "
        "I agree with Arnian's assessment of the vehicle's condition at the time of delivery. "
        "I have read and understand the terms and conditions. "
        "I agree to be bound by these terms. This Vehicle is free of contents."
    )
    dest_text = (
        "<b>DESTINATION / DESTINO</b><br/>"
        "We have received the above vehicle in good condition except as noted, "
        "thereby releasing Arnian from any further claims regarding pre-existing damage. "
        "All items as specified above were received."
    )
    legal_table = Table(
        [[Paragraph(origin_text, legal_style), Paragraph(dest_text, legal_style)]],
        colWidths=[3.5*inch, 3.5*inch]
    )
    legal_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(legal_table)
    story.append(Spacer(1, 0.2*inch))

    # Signatures
    def _decode_sig(b64: str):
        try:
            return BytesIO(base64.b64decode(b64.split(",")[-1]))
        except Exception:
            return None

    sigs = [
        (insp.firma_origen, insp.nombre_firma_origen, insp.fecha_firma_origen, insp.firma_hash_origen),
        (insp.firma_destino, insp.nombre_firma_destino, insp.fecha_firma_destino, insp.firma_hash_destino),
    ]
    sig_row = []
    for sig_b64, name_field, date_field, sig_hash in sigs:
        cell_items = []
        if sig_b64:
            buf = _decode_sig(sig_b64)
            if buf:
                cell_items.append(Image(buf, width=2.5*inch, height=0.8*inch))
        cell_items.append(Paragraph(f"Name: {name_field or '_______________'}", body_style))
        cell_items.append(Paragraph(f"Date: {date_field or '_______________'}", body_style))
        if sig_hash:
            cell_items.append(Paragraph(f"Hash: {sig_hash[:16].upper()}", body_style))
        sig_row.append(cell_items)

    sig_table = Table(
        [["ORIGIN SIGNATURE", "DESTINATION SIGNATURE"], sig_row],
        colWidths=[3.5*inch, 3.5*inch]
    )
    sig_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(sig_table)

    if insp.notas_finales:
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph("Final Notes / Nota Final:", label_style))
        story.append(Paragraph(insp.notas_finales, body_style))

    doc.build(story)
    return f"/uploads/pdfs/{insp.id}_report.pdf"


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse)
def list_inspections(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    q = db.query(VehicleInspection).filter(VehicleInspection.is_deleted == False)
    if status:
        q = q.filter(VehicleInspection.status == status)
    if vehicle_type:
        q = q.filter(VehicleInspection.vehicle_type == vehicle_type)
    if city:
        q = q.filter(VehicleInspection.city == city)
    total = q.count()
    items = (
        q.order_by(VehicleInspection.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    log_action(db, current_user.id, "vehicles_listed", metadata={"page": page, "total": total})
    return {
        "items": [VehicleInspectionListItem.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", response_model=VehicleInspectionOut, status_code=201)
def create_inspection(
    body: VehicleIntakeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    from datetime import date as date_type
    ref_date = body.fecha or date_type.today()
    year_month = ref_date.strftime("%Y%m")
    prefix = f"VH-{year_month}-"
    existing = db.query(VehicleInspection.folio).filter(
        VehicleInspection.folio.like(f"{prefix}%")
    ).all()
    nums = []
    for (f,) in existing:
        if f:
            suffix = f[len(prefix):]
            if suffix.isdigit():
                nums.append(int(suffix))
    next_num = (max(nums) + 1) if nums else 1
    folio = f"{prefix}{next_num:04d}"

    insp = VehicleInspection(
        id=uuid.uuid4(),
        folio=folio,
        vehicle_type=body.vehicle_type,
        status=InspectionStatus.intake,
        fecha=ref_date,
        city=body.city,
        nombre=body.nombre,
        id_cliente=body.id_cliente,
        year=body.year,
        make=body.make,
        model=body.model,
        color=body.color,
        placas=body.placas,
        odometer=body.odometer,
        vin=body.vin,
        gasolina=body.gasolina,
        notas=body.notas,
        checklist=body.checklist,
        created_by=current_user.id,
    )
    db.add(insp)
    db.commit()
    log_action(db, current_user.id, "vehicle_inspection_created", "vehicle_inspection",
               str(insp.id), {"vehicle_type": body.vehicle_type.value})
    return _get_inspection(db, insp.id)


@router.get("/{inspection_id}", response_model=VehicleInspectionOut)
def get_inspection(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    log_action(db, current_user.id, "vehicle_inspection_viewed", "vehicle_inspection", str(insp.id))
    return insp


@router.patch("/{inspection_id}/intake", response_model=VehicleInspectionOut)
def update_intake(
    inspection_id: uuid.UUID,
    body: VehicleIntakeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(insp, field, value)
    db.commit()
    db.refresh(insp)
    log_action(db, current_user.id, "vehicle_intake_updated", "vehicle_inspection", str(insp.id))
    return insp


@router.post("/{inspection_id}/sign", response_model=VehicleInspectionOut)
def sign_inspection(
    inspection_id: uuid.UUID,
    body: SignBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")

    insp.firma_origen = body.firma_origen
    insp.nombre_firma_origen = body.nombre_firma_origen
    insp.fecha_firma_origen = body.fecha_firma_origen
    insp.firma_hash_origen = _sig_hash(
        inspection_id, body.nombre_firma_origen, body.fecha_firma_origen, body.firma_origen
    )
    if body.firma_destino:
        insp.firma_destino = body.firma_destino
        insp.nombre_firma_destino = body.nombre_firma_destino
        insp.fecha_firma_destino = body.fecha_firma_destino
        insp.firma_hash_destino = _sig_hash(
            inspection_id, body.nombre_firma_destino, body.fecha_firma_destino, body.firma_destino
        )
    insp.status = InspectionStatus.intake_complete
    db.commit()

    pdf_path = _generate_liability_pdf(insp)
    insp.liability_pdf_path = pdf_path
    db.commit()
    db.refresh(insp)

    log_action(db, current_user.id, "vehicle_signed", "vehicle_inspection", str(insp.id))
    return insp


@router.patch("/{inspection_id}/start-inspection", response_model=VehicleInspectionOut)
def start_inspection(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status not in (InspectionStatus.intake_complete, InspectionStatus.in_inspection):
        raise HTTPException(status_code=400, detail="Debe completar el intake primero")
    if insp.status == InspectionStatus.intake_complete:
        insp.status = InspectionStatus.in_inspection
        db.commit()
        db.refresh(insp)
    log_action(db, current_user.id, "vehicle_inspection_started", "vehicle_inspection", str(insp.id))
    return insp


@router.post("/{inspection_id}/damages", response_model=VehicleDamageOut, status_code=201)
async def add_damage(
    inspection_id: uuid.UUID,
    view: str = Form(...),
    x_pct: float = Form(...),
    y_pct: float = Form(...),
    damage_type: str = Form(...),
    description: Optional[str] = Form(None),
    photos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")
    if insp.status == InspectionStatus.intake:
        raise HTTPException(status_code=400, detail="Debe completar el intake antes de registrar daños")

    damage_id = uuid.uuid4()
    saved_photos = []
    for f in photos:
        if f.content_type and f.content_type not in ALLOWED_MIME and not f.content_type.startswith("image/"):
            continue
        path = await _save_photo(f, inspection_id, damage_id)
        saved_photos.append(path)

    damage = VehicleDamage(
        id=damage_id,
        inspection_id=inspection_id,
        view=view,
        x_pct=x_pct,
        y_pct=y_pct,
        damage_type=damage_type,
        description=description,
        photos=saved_photos,
        created_by=current_user.id,
    )
    db.add(damage)

    if insp.status == InspectionStatus.intake_complete:
        insp.status = InspectionStatus.in_inspection

    db.commit()
    db.refresh(damage)
    log_action(db, current_user.id, "damage_added", "vehicle_damage", str(damage_id),
               {"inspection_id": str(inspection_id), "view": view, "type": damage_type})
    return damage


@router.patch("/{inspection_id}/damages/{damage_id}", response_model=VehicleDamageOut)
def update_damage(
    inspection_id: uuid.UUID,
    damage_id: uuid.UUID,
    body: VehicleDamageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    damage = db.query(VehicleDamage).filter(
        VehicleDamage.id == damage_id,
        VehicleDamage.inspection_id == inspection_id,
    ).first()
    if not damage:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(damage, field, value)
    db.commit()
    db.refresh(damage)
    return damage


@router.delete("/{inspection_id}/damages/{damage_id}", status_code=204)
def delete_damage(
    inspection_id: uuid.UUID,
    damage_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    damage = db.query(VehicleDamage).filter(
        VehicleDamage.id == damage_id,
        VehicleDamage.inspection_id == inspection_id,
    ).first()
    if not damage:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    db.delete(damage)
    db.commit()
    log_action(db, current_user.id, "damage_deleted", "vehicle_damage", str(damage_id))


@router.patch("/{inspection_id}/checklist", response_model=VehicleInspectionOut)
def update_checklist(
    inspection_id: uuid.UUID,
    body: ChecklistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status.value == "completed":
        raise HTTPException(status_code=400, detail="No se puede modificar una inspección completada")
    if body.checklist is not None:
        insp.checklist = body.checklist
    if body.notas is not None:
        insp.notas = body.notas
    db.commit()
    log_action(db, current_user.id, "vehicle_checklist_updated", "vehicle_inspection", str(insp.id))
    return _get_inspection(db, inspection_id)


@router.post("/{inspection_id}/complete", response_model=VehicleInspectionOut)
def complete_inspection(
    inspection_id: uuid.UUID,
    body: CompleteBody = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    if insp.status == InspectionStatus.completed:
        return insp
    if body and body.notas_finales:
        insp.notas_finales = body.notas_finales
    insp.status = InspectionStatus.completed
    db.commit()

    pdf_path = _generate_full_report_pdf(insp)
    insp.full_report_pdf_path = pdf_path
    db.commit()
    db.refresh(insp)

    log_action(db, current_user.id, "vehicle_inspection_completed", "vehicle_inspection", str(insp.id))
    return insp


@router.get("/{inspection_id}/liability-pdf")
def get_liability_pdf(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    insp = _get_inspection(db, inspection_id)
    if not insp.liability_pdf_path:
        raise HTTPException(status_code=404, detail="PDF no disponible aún")
    file_path = os.path.join(
        settings.UPLOADS_DIR, "pdfs", f"{insp.id}_liability.pdf"
    )
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado")
    return FileResponse(file_path, media_type="application/pdf",
                        filename=f"liability_{insp.id}.pdf")


@router.get("/{inspection_id}/report-pdf")
def get_report_pdf(
    request: Request,
    inspection_id: uuid.UUID,
    token: Optional[str] = Query(default=None, alias="token"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    insp = _get_inspection(db, inspection_id)
    if not insp.full_report_pdf_path:
        raise HTTPException(status_code=404, detail="PDF no disponible aún")
    scheme = request.headers.get("x-forwarded-proto", "https")
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    base_url = f"{scheme}://{host}" if host else None
    _generate_full_report_pdf(insp, base_url=base_url, token=token)
    fs_path = os.path.join(settings.UPLOADS_DIR, "pdfs", f"{insp.id}_report.pdf")
    return FileResponse(fs_path, media_type="application/pdf",
                        filename=f"report_{insp.id}.pdf")



@router.delete("/{inspection_id}", status_code=204)
def delete_inspection(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    insp = (
        db.query(VehicleInspection)
        .filter(VehicleInspection.id == inspection_id)
        .first()
    )
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    insp.is_deleted = True
    db.commit()
    log_action(db, current_user.id, "vehicle_inspection_deleted", "vehicle_inspection", str(insp.id))
