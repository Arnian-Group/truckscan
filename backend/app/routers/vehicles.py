import os
import uuid
import base64
import hashlib
import json
from datetime import date, datetime
from io import BytesIO
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, Request, Query
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from ..database import get_db
from ..models import (
    User, VehicleInspection, VehicleDamage, InspectionEditor, InspectionStatus, VehicleType,
    VehicleInspectionHistory, AuditLog, SignerRole,
)
from ..auth import get_current_user, require_vehicle_agent, require_admin, get_current_user_download
from ..schemas import (
    VehicleIntakeCreate, VehicleIntakeUpdate, SignBody,
    VehicleDamageUpdate, VehicleDamageOut,
    VehicleInspectionOut, VehicleInspectionListItem,
    PaginatedResponse, ChecklistUpdate, CompleteBody,
    EditorCreate, EditorOut, UserOut, VehicleHistoryEntryOut,
)
from ..audit import log_action
from ..idempotency import get_cached, save_cached
from ..permissions import assert_can_edit_inspection, assert_can_manage_inspection_editors
from ..config import settings

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


def _sig_hash(inspection_id: uuid.UUID, nombre: Optional[str], fecha, firma_data: str) -> str:
    content = f"{inspection_id}|{nombre or ''}|{str(fecha or '')}|{firma_data}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


FIELD_LABELS = {
    "fecha": "Fecha",
    "city": "Ciudad",
    "nombre": "Nombre",
    "id_cliente": "ID Cliente",
    "year": "Año",
    "make": "Marca",
    "model": "Modelo",
    "color": "Color",
    "placas": "Placas",
    "odometer": "Kilometraje",
    "vin": "VIN",
    "gasolina": "Gasolina",
    "notas": "Notas",
    "checklist": "Checklist",
}

HISTORY_ACTION_LABELS = {
    "vehicle_inspection_created": "Creó la inspección",
    "vehicle_signed": "Firmó la inspección",
    "vehicle_inspection_started": "Inició la inspección",
    "vehicle_inspection_completed": "Completó la inspección",
    "mercancias_saved": "Guardó la mercancía",
    "inspection_editor_added": "Agregó un editor",
    "inspection_editor_removed": "Quitó un editor",
    "vehicle_inspection_deleted": "Eliminó la inspección",
}


def _serialize_history_value(value):
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, default=str)
    return str(value)


def _apply_and_record_changes(db: Session, insp: VehicleInspection, user_id, changes: dict) -> None:
    for field, new_value in changes.items():
        old_value = getattr(insp, field)
        if old_value != new_value:
            db.add(VehicleInspectionHistory(
                id=uuid.uuid4(),
                inspection_id=insp.id,
                field=field,
                old_value=_serialize_history_value(old_value),
                new_value=_serialize_history_value(new_value),
                changed_by=user_id,
            ))
        setattr(insp, field, new_value)


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


def _get_inspection_any(db: Session, inspection_id: uuid.UUID) -> VehicleInspection:
    """Same as _get_inspection but also returns soft-deleted records (read-only views)."""
    insp = (
        db.query(VehicleInspection)
        .options(joinedload(VehicleInspection.damages))
        .filter(VehicleInspection.id == inspection_id)
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


async def _save_mercancias_photo(file: UploadFile, inspection_id: uuid.UUID) -> str:
    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    dir_path = os.path.join(settings.UPLOADS_DIR, "vehicles", str(inspection_id), "mercancias")
    os.makedirs(dir_path, exist_ok=True)
    contents = await file.read()
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(contents)
    return f"/uploads/vehicles/{inspection_id}/mercancias/{filename}"


_LOGO_URL = "https://arniangroup.com/assets/arnian-logo-CPJoN4j0.png"
_NAVY = "#1B3A7A"
_NAVY_LIGHT = "#E8EDF5"
_GRAY_LINE = "#C5CDD9"


def _get_logo_path() -> str:
    """Return cached logo path, or '' if not yet downloaded."""
    cached = os.path.join(settings.UPLOADS_DIR, "arnian_logo.png")
    return cached if os.path.isfile(cached) else ""


def _prefetch_logo() -> None:
    """Download logo at startup (best-effort, never raises)."""
    import urllib.request
    cached = os.path.join(settings.UPLOADS_DIR, "arnian_logo.png")
    if os.path.isfile(cached):
        return
    try:
        req = urllib.request.Request(_LOGO_URL, headers={"User-Agent": "TruckScan/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
        with open(cached, "wb") as f:
            f.write(data)
        print("[logo] downloaded OK")
    except Exception as e:
        print(f"[logo] prefetch failed (PDF will use text fallback): {e}")


def _make_logo_image(path: str, max_w_in: float = 1.8, max_h_in: float = 0.8):
    from reportlab.lib.units import inch
    from reportlab.platypus import Image
    img = Image(path)
    natural_w = img.imageWidth or 1
    natural_h = img.imageHeight or 1
    scale = min(max_w_in * inch / natural_w, max_h_in * inch / natural_h)
    img.drawWidth = natural_w * scale
    img.drawHeight = natural_h * scale
    return img


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
    navy = colors.HexColor(_NAVY)

    sub_style = ParagraphStyle("sub", parent=styles["Normal"],
                               fontSize=10, textColor=colors.HexColor("#555555"), spaceAfter=4)
    label_style = ParagraphStyle("label", parent=styles["Normal"],
                                 fontSize=8, textColor=colors.HexColor("#555555"),
                                 fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=8, spaceAfter=4)
    legal_style = ParagraphStyle("legal", parent=styles["Normal"], fontSize=7.5, leading=11)

    story = []

    # Header with logo
    header_items = []
    _logo = _get_logo_path()
    if _logo:
        header_items.append(_make_logo_image(_logo))
    else:
        header_items.append(Paragraph("ARNIAN TRUCKSCAN", ParagraphStyle("t", parent=styles["Title"], fontSize=16)))
    header_items.append(Paragraph(
        "Vehicle Receiving — Liability Release<br/>"
        "<font size='9' color='#777777'>Descargo de Responsabilidad</font>",
        ParagraphStyle("hs", parent=styles["Normal"], fontSize=11, leading=15,
                       textColor=colors.HexColor(_NAVY), fontName="Helvetica-Bold")
    ))
    header_table = Table([header_items], colWidths=[2*inch, 5*inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=navy))
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
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(_NAVY_LIGHT)),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor(_NAVY_LIGHT)),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor(_NAVY)),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor(_NAVY)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
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
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 0.15*inch))

    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor(_GRAY_LINE)))
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
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
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
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(_NAVY_LIGHT)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(_NAVY)),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
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
    navy = colors.HexColor(_NAVY)

    label_style = ParagraphStyle("label", parent=styles["Normal"],
                                 fontSize=8, textColor=colors.HexColor("#555555"),
                                 fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=8, spaceAfter=4)
    link_style = ParagraphStyle("link", parent=styles["Normal"], fontSize=8,
                                textColor=colors.HexColor("#1a6fc4"), spaceAfter=4)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"], fontSize=10,
                               textColor=colors.HexColor(_NAVY), fontName="Helvetica-Bold", leading=15)

    story = []

    folio_str = f"  [{insp.folio}]" if insp.folio else ""
    vehicle_str = " ".join(filter(None, [insp.make, insp.model, str(insp.year) if insp.year else None]))
    header_text = f"Vehicle Inspection Report{folio_str}"
    if vehicle_str:
        header_text += f"<br/><font size='9' color='#555555'>{vehicle_str}</font>"

    header_items = []
    _logo = _get_logo_path()
    if _logo:
        header_items.append(_make_logo_image(_logo))
    else:
        header_items.append(Paragraph("ARNIAN TRUCKSCAN", ParagraphStyle("t", parent=styles["Title"], fontSize=14)))
    header_items.append(Paragraph(header_text, sub_style))
    header_table = Table([header_items], colWidths=[2*inch, 5*inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=navy))
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
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(_NAVY_LIGHT)),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor(_NAVY_LIGHT)),
        ("BACKGROUND", (4, 0), (4, -1), colors.HexColor(_NAVY_LIGHT)),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor(_NAVY)),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor(_NAVY)),
        ("TEXTCOLOR", (4, 0), (4, -1), colors.HexColor(_NAVY)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
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
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(_NAVY_LIGHT)),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
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
    story.append(HRFlowable(width="100%", thickness=1, color=navy))
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
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
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
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
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
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(_NAVY_LIGHT)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
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


def _generate_mercancias_pdf(insp: VehicleInspection) -> str:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image, HRFlowable
    )

    pdfs_dir = os.path.join(settings.UPLOADS_DIR, "pdfs")
    os.makedirs(pdfs_dir, exist_ok=True)
    out_path = os.path.join(pdfs_dir, f"{insp.id}_mercancias.pdf")

    doc = SimpleDocTemplate(out_path, pagesize=letter,
                            leftMargin=0.75*inch, rightMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    navy = colors.HexColor(_NAVY)

    label_style = ParagraphStyle("label", parent=styles["Normal"], fontSize=8,
                                 textColor=colors.HexColor("#555555"), fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=9, spaceAfter=4, leading=14)
    name_style = ParagraphStyle("ns", parent=styles["Normal"], fontSize=8, spaceAfter=2)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"], fontSize=11,
                               textColor=navy, fontName="Helvetica-Bold", leading=15)

    def cell(v): return str(v) if v is not None else "—"

    story = []
    folio_str = f"  [{insp.folio}]" if insp.folio else ""

    header_items = []
    _logo = _get_logo_path()
    if _logo:
        header_items.append(_make_logo_image(_logo))
    else:
        header_items.append(Paragraph("ARNIAN TRUCKSCAN", ParagraphStyle("t", parent=styles["Title"], fontSize=14)))
    header_items.append(Paragraph(
        f"Recibo de Mercancía{folio_str}<br/>"
        "<font size='9' color='#555555'>Goods Receipt</font>",
        sub_style
    ))
    header_table = Table([header_items], colWidths=[2*inch, 5*inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=navy))
    story.append(Spacer(1, 0.15*inch))

    info_data = [
        ["Folio", cell(insp.folio), "Fecha / Date", cell(insp.fecha), "Ciudad / City", cell(insp.city)],
        ["Entregado por / Delivered by", cell(insp.nombre_entrega), "Recibido por / Received by", cell(insp.nombre), "", ""],
    ]
    info_table = Table(info_data, colWidths=[1.1*inch, 1.8*inch, 0.9*inch, 1.4*inch, 0.8*inch, 1*inch])
    info_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (4, 0), (4, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(_NAVY_LIGHT)),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor(_NAVY_LIGHT)),
        ("BACKGROUND", (4, 0), (4, -1), colors.HexColor(_NAVY_LIGHT)),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor(_NAVY)),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor(_NAVY)),
        ("TEXTCOLOR", (4, 0), (4, -1), colors.HexColor(_NAVY)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("DESCRIPCIÓN DE MERCANCÍA / GOODS DESCRIPTION", label_style))
    story.append(Spacer(1, 0.05*inch))
    desc_table = Table(
        [[Paragraph(insp.mercancias_descripcion or "—", body_style)]],
        colWidths=[7*inch]
    )
    desc_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(desc_table)
    story.append(Spacer(1, 0.15*inch))

    if insp.notas:
        story.append(Paragraph("NOTAS / NOTES", label_style))
        story.append(Spacer(1, 0.05*inch))
        notes_table = Table([[Paragraph(insp.notas, body_style)]], colWidths=[7*inch])
        notes_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(notes_table)
        story.append(Spacer(1, 0.15*inch))

    foto_count = len(insp.mercancias_fotos or [])
    if foto_count:
        story.append(Paragraph(
            f"EVIDENCIA FOTOGRÁFICA / PHOTO EVIDENCE: {foto_count} foto(s) registrada(s) / photo(s) on file", label_style
        ))
        story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph("FIRMAS / SIGNATURES", label_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor(_GRAY_LINE)))
    story.append(Spacer(1, 0.1*inch))

    def _decode_sig(b64: str):
        try:
            return BytesIO(base64.b64decode(b64.split(",")[-1]))
        except Exception:
            return None

    sig_row = []
    for sig_b64, name_field in [
        (insp.firma_origen, insp.nombre_firma_origen),
        (insp.firma_destino, insp.nombre_firma_destino),
    ]:
        items = []
        if sig_b64:
            buf = _decode_sig(sig_b64)
            if buf:
                items.append(Image(buf, width=2.5*inch, height=0.8*inch))
        items.append(Paragraph(f"Nombre / Name: {name_field or '_______________'}", name_style))
        sig_row.append(items)

    sig_table = Table(
        [["ENTREGA / DELIVERS", "RECIBE / RECEIVES"], sig_row],
        colWidths=[3.5*inch, 3.5*inch]
    )
    sig_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(_NAVY_LIGHT)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(_NAVY)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(sig_table)

    doc.build(story)
    return f"/uploads/pdfs/{insp.id}_mercancias.pdf"


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse)
def list_inspections(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    q = db.query(VehicleInspection).options(
        joinedload(VehicleInspection.editor_links)
    ).filter(VehicleInspection.is_deleted == archived)
    if status:
        q = q.filter(VehicleInspection.status == status)
    if vehicle_type:
        q = q.filter(VehicleInspection.vehicle_type == vehicle_type)
    if city:
        q = q.filter(VehicleInspection.city == city)
    if date_from:
        q = q.filter(VehicleInspection.created_at >= date_from)
    if date_to:
        q = q.filter(VehicleInspection.created_at <= date_to)
    if search:
        term = f"%{search.strip()}%"
        q = q.filter(
            or_(
                VehicleInspection.folio.ilike(term),
                VehicleInspection.placas.ilike(term),
                VehicleInspection.vin.ilike(term),
                VehicleInspection.nombre.ilike(term),
                VehicleInspection.entry_number.ilike(term),
            )
        )
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
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status, payload = cached
        return JSONResponse(status_code=status, content=payload)

    from datetime import date as date_type
    ref_date = body.fecha or date_type.today()
    year_month = ref_date.strftime("%Y%m")
    type_code = "MC" if body.vehicle_type == VehicleType.mercancias else "VH"
    prefix = f"{type_code}-{year_month}-"
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
    result = _get_inspection(db, insp.id)
    save_cached(db, idempotency_key, current_user.id, "create_inspection", 201,
                VehicleInspectionOut.model_validate(result))
    return result


@router.get("/editor-candidates", response_model=List[UserOut])
def list_editor_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    return (
        db.query(User)
        .filter(User.is_active == True, or_(User.can_vehicles == True, User.is_admin == True))
        .order_by(User.name)
        .all()
    )


@router.get("/{inspection_id}", response_model=VehicleInspectionOut)
def get_inspection(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection_any(db, inspection_id)
    log_action(db, current_user.id, "vehicle_inspection_viewed", "vehicle_inspection", str(insp.id))
    return insp


@router.get("/{inspection_id}/history", response_model=List[VehicleHistoryEntryOut])
def get_inspection_history(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    _get_inspection_any(db, inspection_id)

    field_rows = (
        db.query(VehicleInspectionHistory)
        .options(joinedload(VehicleInspectionHistory.user))
        .filter(VehicleInspectionHistory.inspection_id == inspection_id)
        .all()
    )
    entries = [
        VehicleHistoryEntryOut(
            type="field_change",
            timestamp=row.changed_at,
            user=row.user,
            field=row.field,
            field_label=FIELD_LABELS.get(row.field, row.field),
            old_value=row.old_value,
            new_value=row.new_value,
        )
        for row in field_rows
    ]

    audit_rows = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .filter(
            AuditLog.entity == "vehicle_inspection",
            AuditLog.entity_id == str(inspection_id),
            AuditLog.action.in_(list(HISTORY_ACTION_LABELS.keys())),
        )
        .all()
    )
    entries += [
        VehicleHistoryEntryOut(
            type="event",
            timestamp=row.timestamp,
            user=row.user,
            action=row.action,
            action_label=HISTORY_ACTION_LABELS.get(row.action, row.action),
        )
        for row in audit_rows
    ]

    entries.sort(key=lambda e: e.timestamp, reverse=True)
    return entries


@router.get("/{inspection_id}/editors", response_model=List[EditorOut])
def list_inspection_editors(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    _get_inspection_any(db, inspection_id)
    return (
        db.query(InspectionEditor)
        .options(joinedload(InspectionEditor.user))
        .filter(InspectionEditor.inspection_id == inspection_id)
        .order_by(InspectionEditor.created_at)
        .all()
    )


@router.post("/{inspection_id}/editors", response_model=EditorOut, status_code=201)
def add_inspection_editor(
    inspection_id: uuid.UUID,
    body: EditorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    assert_can_manage_inspection_editors(current_user, insp)
    target = db.query(User).filter(User.id == body.user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not (target.is_admin or target.can_vehicles):
        raise HTTPException(status_code=400, detail="El usuario no tiene permiso del módulo de vehículos")
    existing = db.query(InspectionEditor).filter(
        InspectionEditor.inspection_id == inspection_id,
        InspectionEditor.user_id == body.user_id,
    ).first()
    if existing:
        return existing
    editor = InspectionEditor(
        id=uuid.uuid4(),
        inspection_id=inspection_id,
        user_id=body.user_id,
        created_by=current_user.id,
    )
    db.add(editor)
    db.commit()
    db.refresh(editor)
    log_action(db, current_user.id, "inspection_editor_added", "vehicle_inspection", str(inspection_id),
               {"user_id": str(body.user_id)})
    return editor


@router.delete("/{inspection_id}/editors/{user_id}", status_code=204)
def remove_inspection_editor(
    inspection_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    assert_can_manage_inspection_editors(current_user, insp)
    editor = db.query(InspectionEditor).filter(
        InspectionEditor.inspection_id == inspection_id,
        InspectionEditor.user_id == user_id,
    ).first()
    if not editor:
        raise HTTPException(status_code=404, detail="Editor no encontrado")
    db.delete(editor)
    db.commit()
    log_action(db, current_user.id, "inspection_editor_removed", "vehicle_inspection", str(inspection_id),
               {"user_id": str(user_id)})


@router.patch("/{inspection_id}/intake", response_model=VehicleInspectionOut)
def update_intake(
    inspection_id: uuid.UUID,
    body: VehicleIntakeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")
    _apply_and_record_changes(db, insp, current_user.id, body.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(insp)
    return insp


@router.post("/{inspection_id}/sign", response_model=VehicleInspectionOut)
def sign_inspection(
    inspection_id: uuid.UUID,
    body: SignBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status, payload = cached
        return JSONResponse(status_code=status, content=payload)

    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")
    if insp.firma_origen and (
        body.firma_origen != insp.firma_origen
        or body.nombre_firma_origen != insp.nombre_firma_origen
        or body.rol_firma_origen != insp.rol_firma_origen
    ):
        raise HTTPException(
            status_code=400,
            detail="La firma y los datos de quien entrega ya fueron registrados y no se pueden modificar",
        )
    if body.firma_destino and insp.firma_destino and (
        body.firma_destino != insp.firma_destino
        or body.nombre_firma_destino != insp.nombre_firma_destino
    ):
        raise HTTPException(
            status_code=400,
            detail="La firma y los datos de quien recibe ya fueron registrados y no se pueden modificar",
        )

    insp.firma_origen = body.firma_origen
    insp.nombre_firma_origen = body.nombre_firma_origen
    insp.rol_firma_origen = body.rol_firma_origen
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
    save_cached(db, idempotency_key, current_user.id, "sign_inspection", 200,
                VehicleInspectionOut.model_validate(insp))
    return insp


@router.patch("/{inspection_id}/start-inspection", response_model=VehicleInspectionOut)
def start_inspection(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
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
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status, payload = cached
        return JSONResponse(status_code=status, content=payload)

    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
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
    save_cached(db, idempotency_key, current_user.id, "add_damage", 201,
                VehicleDamageOut.model_validate(damage))
    return damage


@router.patch("/{inspection_id}/damages/{damage_id}", response_model=VehicleDamageOut)
def update_damage(
    inspection_id: uuid.UUID,
    damage_id: uuid.UUID,
    body: VehicleDamageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección ya está completada")
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
    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
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
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status.value == "completed":
        raise HTTPException(status_code=400, detail="No se puede modificar una inspección completada")
    changes = {}
    if body.checklist is not None:
        changes["checklist"] = body.checklist
    if body.notas is not None:
        changes["notas"] = body.notas
    _apply_and_record_changes(db, insp, current_user.id, changes)
    db.commit()
    return _get_inspection(db, inspection_id)


@router.post("/{inspection_id}/complete", response_model=VehicleInspectionOut)
def complete_inspection(
    inspection_id: uuid.UUID,
    body: CompleteBody = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status, payload = cached
        return JSONResponse(status_code=status, content=payload)

    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status == InspectionStatus.completed:
        return insp
    if body and body.notas_finales:
        insp.notas_finales = body.notas_finales
    insp.status = InspectionStatus.completed
    db.commit()

    try:
        pdf_path = _generate_full_report_pdf(insp)
        insp.full_report_pdf_path = pdf_path
        db.commit()
    except Exception as e:
        import traceback
        print(f"[PDF] full_report generation failed for {insp.id}: {e}\n{traceback.format_exc()}")
    db.refresh(insp)

    log_action(db, current_user.id, "vehicle_inspection_completed", "vehicle_inspection", str(insp.id))
    save_cached(db, idempotency_key, current_user.id, "complete_inspection", 200,
                VehicleInspectionOut.model_validate(insp))
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
    if insp.status != InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="La inspección no está completada")
    scheme = request.headers.get("x-forwarded-proto", "https")
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    base_url = f"{scheme}://{host}" if host else None
    try:
        pdf_path = _generate_full_report_pdf(insp, base_url=base_url, token=token)
    except Exception as e:
        import traceback
        print(f"[PDF] report generation error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {e}")
    if not insp.full_report_pdf_path:
        insp.full_report_pdf_path = pdf_path
        db.commit()
    fs_path = os.path.join(settings.UPLOADS_DIR, "pdfs", f"{insp.id}_report.pdf")
    return FileResponse(fs_path, media_type="application/pdf",
                        filename=f"report_{insp.id}.pdf")



@router.post("/{inspection_id}/mercancias-save", response_model=VehicleInspectionOut)
async def save_mercancias(
    inspection_id: uuid.UUID,
    nombre_recibe: str = Form(...),
    nombre_entrega: str = Form(...),
    descripcion: str = Form(...),
    notas: Optional[str] = Form(None),
    fecha: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    firma_origen: str = Form(...),
    nombre_firma_origen: Optional[str] = Form(None),
    rol_firma_origen: Optional[SignerRole] = Form(None),
    firma_destino: Optional[str] = Form(None),
    nombre_firma_destino: Optional[str] = Form(None),
    fotos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status, payload = cached
        return JSONResponse(status_code=status, content=payload)

    insp = _get_inspection(db, inspection_id)
    assert_can_edit_inspection(db, current_user, insp)
    if insp.status == InspectionStatus.completed:
        raise HTTPException(status_code=400, detail="Ya está completado")

    insp.nombre = nombre_recibe
    insp.nombre_entrega = nombre_entrega
    insp.mercancias_descripcion = descripcion
    insp.notas = notas
    if city:
        insp.city = city
    if fecha:
        try:
            from datetime import date as date_type
            insp.fecha = date_type.fromisoformat(fecha)
        except ValueError:
            pass

    saved_photos = list(insp.mercancias_fotos or [])
    for f in fotos:
        if f.filename and f.size and f.size > 0:
            path = await _save_mercancias_photo(f, inspection_id)
            saved_photos.append(path)
    insp.mercancias_fotos = saved_photos

    insp.firma_origen = firma_origen
    insp.nombre_firma_origen = nombre_firma_origen
    insp.rol_firma_origen = rol_firma_origen
    insp.firma_hash_origen = _sig_hash(inspection_id, nombre_firma_origen, insp.fecha, firma_origen)
    if firma_destino:
        insp.firma_destino = firma_destino
        insp.nombre_firma_destino = nombre_firma_destino
        insp.firma_hash_destino = _sig_hash(inspection_id, nombre_firma_destino, insp.fecha, firma_destino)

    insp.status = InspectionStatus.completed
    db.commit()

    pdf_path = _generate_mercancias_pdf(insp)
    insp.full_report_pdf_path = pdf_path
    db.commit()
    db.refresh(insp)

    log_action(db, current_user.id, "mercancias_saved", "vehicle_inspection", str(insp.id))
    result = _get_inspection(db, insp.id)
    save_cached(db, idempotency_key, current_user.id, "save_mercancias", 200,
                VehicleInspectionOut.model_validate(result))
    return result


@router.get("/{inspection_id}/mercancias-pdf")
def get_mercancias_pdf(
    inspection_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    insp = _get_inspection(db, inspection_id)
    fs_path = os.path.join(settings.UPLOADS_DIR, "pdfs", f"{insp.id}_mercancias.pdf")
    try:
        _generate_mercancias_pdf(insp)
    except Exception as e:
        import traceback
        print(f"[PDF] mercancias generation error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {e}")
    return FileResponse(fs_path, media_type="application/pdf",
                        filename=f"recibo_{insp.folio or insp.id}.pdf")


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
