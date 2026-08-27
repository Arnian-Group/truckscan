import base64
import os
from io import BytesIO

from .config import settings
from .models import ChecklistLogEntry
from .routers.vehicles import _get_logo_path, _make_logo_image, _NAVY, _NAVY_LIGHT, _GRAY_LINE

RESULT_LABELS = {
    "C": "Cumple", "NC": "No cumple", "NA": "No aplica",
    "Si": "Sí", "No": "No",
}

CLASSIFICATION_LABELS = {
    "APTO": "APTO PARA OPERAR",
    "OPERAR_CON_OBSERVACIONES": "APTO CON OBSERVACIONES",
    "NO_OPERAR": "NO OPERAR / REPORTAR",
    "APTO_CON_OBSERVACIONES": "APTO CON OBSERVACIONES",
    "NO_APTO": "NO APTO PARA OPERAR",
}


def generate_checklist_pdf(sub) -> str:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image, HRFlowable, PageBreak
    )

    pdfs_dir = os.path.join(settings.UPLOADS_DIR, "pdfs")
    os.makedirs(pdfs_dir, exist_ok=True)
    out_path = os.path.join(pdfs_dir, f"{sub.id}_checklist.pdf")

    snapshot = sub.template_snapshot or {}
    sections = snapshot.get("sections", [])
    header_fields = snapshot.get("header_fields", [])
    response_type = snapshot.get("response_type", "c_nc_na")
    responses_by_key = {r.get("item_key"): r for r in (sub.responses or [])}

    doc = SimpleDocTemplate(out_path, pagesize=letter,
                             leftMargin=0.6 * inch, rightMargin=0.6 * inch,
                             topMargin=0.6 * inch, bottomMargin=0.6 * inch)
    styles = getSampleStyleSheet()
    navy = colors.HexColor(_NAVY)

    label_style = ParagraphStyle("label", parent=styles["Normal"], fontSize=8,
                                  textColor=colors.HexColor("#555555"), fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=7.5, leading=10)
    section_style = ParagraphStyle("section", parent=styles["Normal"], fontSize=9,
                                    textColor=colors.white, fontName="Helvetica-Bold")
    tiny_style = ParagraphStyle("tiny", parent=styles["Normal"], fontSize=6.5,
                                 textColor=colors.HexColor("#777777"))

    story = []

    header_items = []
    logo = _get_logo_path()
    if logo:
        header_items.append(_make_logo_image(logo))
    else:
        header_items.append(Paragraph("ARNIAN TRUCKSCAN", ParagraphStyle("t", parent=styles["Title"], fontSize=16)))
    header_items.append(Paragraph(
        f"{snapshot.get('name', 'Checklist')}<br/>"
        f"<font size='9' color='#777777'>Código: {snapshot.get('code', '—')} | "
        f"Revisión: {snapshot.get('revision', '—')} | Folio: {sub.folio or '—'}</font>",
        ParagraphStyle("hs", parent=styles["Normal"], fontSize=12, leading=15,
                        textColor=navy, fontName="Helvetica-Bold")
    ))
    header_table = Table([header_items], colWidths=[2 * inch, 5 * inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=navy))
    story.append(Spacer(1, 0.12 * inch))

    # Unit / header info
    def cell(v):
        return str(v) if v not in (None, "") else "—"

    header_values = sub.header_values or {}
    pairs = [(f.get("label", f["key"]), cell(header_values.get(f["key"]))) for f in header_fields]
    rows = []
    for i in range(0, len(pairs), 2):
        left = pairs[i]
        right = pairs[i + 1] if i + 1 < len(pairs) else ("", "")
        rows.append([left[0], left[1], right[0], right[1]])
    if rows:
        info_table = Table(rows, colWidths=[1.4 * inch, 2.1 * inch, 1.4 * inch, 2.1 * inch])
        info_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(_NAVY_LIGHT)),
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor(_NAVY_LIGHT)),
            ("TEXTCOLOR", (0, 0), (0, -1), navy),
            ("TEXTCOLOR", (2, 0), (2, -1), navy),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.15 * inch))

    # Sections
    for section in sections:
        story.append(Table([[Paragraph(section.get("label", "").upper(), section_style)]],
                            colWidths=[6.8 * inch],
                            style=TableStyle([
                                ("BACKGROUND", (0, 0), (-1, -1), navy),
                                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                                ("TOPPADDING", (0, 0), (-1, -1), 3),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                            ])))
        item_rows = []
        for item in section.get("items", []):
            r = responses_by_key.get(item["key"], {})
            result_raw = r.get("result") or ""
            result_label = RESULT_LABELS.get(result_raw, result_raw or "—")
            crit_marker = " ⚠" if item.get("criticality") == "critico" else ""
            label_text = f"{item['label']}{crit_marker}"
            obs = r.get("observation") or ""
            item_rows.append([
                Paragraph(label_text, body_style),
                Paragraph(result_label, body_style),
                Paragraph(obs, body_style),
            ])
        if item_rows:
            sect_table = Table(item_rows, colWidths=[3.8 * inch, 0.9 * inch, 2.1 * inch])
            sect_table.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor(_GRAY_LINE)),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fc")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            story.append(sect_table)
        story.append(Spacer(1, 0.08 * inch))

    story.append(Spacer(1, 0.1 * inch))

    # Result / classification
    classification_label = CLASSIFICATION_LABELS.get(sub.classification, sub.classification or "—")
    result_style = ParagraphStyle("result", parent=styles["Normal"], fontSize=11,
                                   fontName="Helvetica-Bold", textColor=navy)
    story.append(Paragraph(f"RESULTADO DE LA INSPECCIÓN: {classification_label}", result_style))
    if sub.corrective_action:
        story.append(Spacer(1, 0.05 * inch))
        story.append(Paragraph("Acción correctiva:", label_style))
        story.append(Paragraph(sub.corrective_action, body_style))
    story.append(Spacer(1, 0.15 * inch))

    # Signatures
    def _decode_sig(b64):
        try:
            data = b64.split(",")[-1]
            return BytesIO(base64.b64decode(data))
        except Exception:
            return None

    sig_roles = snapshot.get("signature_roles", [])
    signatures_by_role = {s.get("role"): s for s in (sub.signatures or [])}
    sig_cells = []
    header_row = []
    for role_def in sig_roles:
        s = signatures_by_role.get(role_def["key"])
        cell_items = []
        if s and s.get("signature_data"):
            buf = _decode_sig(s["signature_data"])
            if buf:
                cell_items.append(Image(buf, width=1.9 * inch, height=0.6 * inch))
        cell_items.append(Paragraph(f"Nombre: {s.get('name') if s else '_______________'}", body_style))
        cell_items.append(Paragraph(f"Fecha: {s.get('signed_at', '')[:10] if s else '_______________'}", body_style))
        sig_cells.append(cell_items)
        header_row.append(role_def.get("label", role_def["key"]))

    if sig_cells:
        col_w = 6.8 * inch / len(sig_cells)
        sig_table = Table([header_row, sig_cells], colWidths=[col_w] * len(sig_cells))
        sig_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(_NAVY_LIGHT)),
            ("TEXTCOLOR", (0, 0), (-1, 0), navy),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(_GRAY_LINE)),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(sig_table)

    story.append(Spacer(1, 0.15 * inch))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor(_GRAY_LINE)))
    story.append(Spacer(1, 0.05 * inch))

    last_entry = (
        sub.log_entries[-1] if sub.log_entries else None
    )
    verify_code = last_entry.entry_hash[:16] if last_entry else "—"
    retention = snapshot.get("retention_months", 12)
    ref = snapshot.get("source_reference")
    footer_lines = [
        f"Documento controlado · Código: {snapshot.get('code', '—')} · Revisión: {snapshot.get('revision', '—')} · "
        f"Conservación sugerida: {retention} meses",
        f"Código de verificación de integridad: {verify_code} (checklist_submissions/{sub.id})",
    ]
    if ref:
        footer_lines.append(f"Referencia normativa: {ref}")
    story.append(Paragraph("<br/>".join(footer_lines), tiny_style))

    doc.build(story)
    return f"/uploads/pdfs/{sub.id}_checklist.pdf"
