import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse, Response
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import (
    User, ChecklistAsset, ChecklistTemplate, ChecklistSubmission, ChecklistLogEntry,
    ChecklistSubmissionStatus,
)
from ..auth import get_current_user, require_admin, require_checklist_agent, get_current_user_download
from ..schemas import (
    ChecklistAssetCreate, ChecklistAssetUpdate, ChecklistAssetOut, ChecklistTemplateOut, ChecklistAssetTypeOut,
    ChecklistSubmissionCreate, ChecklistSubmissionUpdate, ChecklistSubmissionOut,
    ChecklistSubmissionListItem, ChecklistSignatureIn, ChecklistVerifyOut, ChecklistPublicVerifyOut,
    PaginatedResponse,
)
from ..audit import log_action
from ..idempotency import get_cached, save_cached
from ..config import settings
from .. import checklist_hash
from ..qr import generate_qr_png_bytes

router = APIRouter()

ALLOWED_PHOTO_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}

SEED_DATA_DIR = Path(__file__).resolve().parent.parent / "checklist_seed_data"

# Access to a specific checklist type is a dynamic grant (ChecklistAssetTypeGrant),
# not a fixed column — any asset_type not explicitly granted is denied by construction,
# so a brand new checklist type is fail-closed by default with zero code changes here.
FOLIO_PREFIX = {
    "forklift": "FK",
    "utility_vehicle": "UV",
}


def _require_asset_type_access(user: User, asset_type: str) -> None:
    if user.is_admin:
        return
    if asset_type in user.checklist_asset_types:
        return
    raise HTTPException(status_code=403, detail=f"No tienes acceso al tipo de checklist '{asset_type}'")


def seed_checklist_templates(db: Session) -> None:
    """Idempotent: inserts the known templates (by `code`) if not already present.
    New checklist types are added by dropping another JSON file here, not by code changes."""
    if not SEED_DATA_DIR.is_dir():
        return
    for path in sorted(SEED_DATA_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        exists = db.query(ChecklistTemplate.id).filter(ChecklistTemplate.code == data["code"]).first()
        if exists:
            continue
        db.add(ChecklistTemplate(
            id=uuid.uuid4(),
            asset_type=data["asset_type"],
            code=data["code"],
            name=data["name"],
            revision=data.get("revision", "00"),
            retention_months=data.get("retention_months", 12),
            response_type=data["response_type"],
            source_reference=data.get("source_reference"),
            header_fields=data["header_fields"],
            signature_roles=data["signature_roles"],
            sections=data["sections"],
            is_active=True,
        ))
    db.commit()


def _item_criticality_map(sections: list) -> dict:
    result = {}
    for section in sections:
        for item in section.get("items", []):
            result[item["key"]] = item.get("criticality", "normal")
    return result


def _fail_values(response_type: str) -> set:
    return {"No"} if response_type == "si_no_na" else {"NC"}


def _compute_classification(sections: list, responses: list, response_type: str) -> str:
    criticality = _item_criticality_map(sections)
    fail_values = _fail_values(response_type)
    any_fail = False
    critical_fail = False
    for r in responses or []:
        if r.get("result") in fail_values:
            any_fail = True
            if criticality.get(r.get("item_key")) == "critico":
                critical_fail = True
    if response_type == "si_no_na":
        if critical_fail:
            return "NO_APTO"
        return "APTO_CON_OBSERVACIONES" if any_fail else "APTO"
    if critical_fail:
        return "NO_OPERAR"
    return "OPERAR_CON_OBSERVACIONES" if any_fail else "APTO"


def _get_submission(db: Session, submission_id: uuid.UUID) -> ChecklistSubmission:
    sub = (
        db.query(ChecklistSubmission)
        .options(joinedload(ChecklistSubmission.template), joinedload(ChecklistSubmission.asset))
        .filter(ChecklistSubmission.id == submission_id, ChecklistSubmission.is_deleted == False)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Checklist no encontrado")
    return sub


def _assert_can_edit_submission(user: User, sub: ChecklistSubmission) -> None:
    if user.is_admin:
        return
    if sub.created_by and str(sub.created_by) == str(user.id):
        return
    raise HTTPException(status_code=403, detail="Solo el creador o un administrador puede editar este checklist")


# ── templates ────────────────────────────────────────────────────────────────

@router.get("/templates", response_model=List[ChecklistTemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    templates = db.query(ChecklistTemplate).filter(ChecklistTemplate.is_active == True).order_by(
        ChecklistTemplate.name
    ).all()
    if current_user.is_admin:
        return templates
    allowed = set(current_user.checklist_asset_types)
    return [t for t in templates if t.asset_type in allowed]


@router.get("/asset-types", response_model=List[ChecklistAssetTypeOut])
def list_asset_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Distinct asset_types across active templates — powers the admin permission
    checkboxes dynamically, so a newly seeded checklist template shows up here
    automatically without any frontend change."""
    templates = db.query(ChecklistTemplate).filter(ChecklistTemplate.is_active == True).order_by(
        ChecklistTemplate.name
    ).all()
    seen = {}
    for t in templates:
        seen.setdefault(t.asset_type, t.name)
    return [{"asset_type": k, "label": v} for k, v in seen.items()]


@router.get("/templates/{template_id}", response_model=ChecklistTemplateOut)
def get_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    _require_asset_type_access(current_user, template.asset_type)
    return template


# ── assets ───────────────────────────────────────────────────────────────────

@router.get("/assets", response_model=List[ChecklistAssetOut])
def list_assets(
    asset_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    q = db.query(ChecklistAsset).filter(ChecklistAsset.is_active == True)
    if asset_type:
        _require_asset_type_access(current_user, asset_type)
        q = q.filter(ChecklistAsset.asset_type == asset_type)
    return q.order_by(ChecklistAsset.economic_number).all()


@router.post("/assets", response_model=ChecklistAssetOut, status_code=201)
def create_asset(
    body: ChecklistAssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    asset = ChecklistAsset(
        id=uuid.uuid4(),
        asset_type=body.asset_type,
        economic_number=body.economic_number,
        brand=body.brand,
        model=body.model,
        serial=body.serial,
        plate=body.plate,
        energy_type=body.energy_type,
        ctpat_scope=body.ctpat_scope,
        qr_token=uuid.uuid4().hex,
        is_active=True,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    log_action(db, current_user.id, "checklist_asset_created", "checklist_asset", str(asset.id),
               {"asset_type": body.asset_type, "economic_number": body.economic_number})
    return asset


def _get_asset(db: Session, asset_id: uuid.UUID) -> ChecklistAsset:
    asset = db.query(ChecklistAsset).filter(ChecklistAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    return asset


# NOTE: FastAPI/Starlette match routes in declaration order, not by specificity —
# unlike a UUID-typed *path converter* (`{asset_id:uuid}`), a bare `{asset_id}`
# segment matches any string at the routing layer, so a literal path like
# "/assets/qr-sheet" must be declared BEFORE "/assets/{asset_id}" or the generic
# route intercepts it first (and its differently-authed dependency then 401s).
@router.get("/assets/qr-sheet")
def get_assets_qr_sheet(
    asset_type: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    _require_asset_type_access(current_user, asset_type)
    assets = (
        db.query(ChecklistAsset)
        .filter(ChecklistAsset.asset_type == asset_type, ChecklistAsset.is_active == True)
        .order_by(ChecklistAsset.economic_number)
        .all()
    )
    if not assets:
        raise HTTPException(status_code=404, detail="No hay unidades activas de este tipo")
    from ..checklist_pdf import generate_asset_qr_label_pdf
    pdf_bytes = generate_asset_qr_label_pdf(assets)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="qr_sheet_{asset_type}.pdf"'
    })


@router.get("/assets/{asset_id}", response_model=ChecklistAssetOut)
def get_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    asset = _get_asset(db, asset_id)
    _require_asset_type_access(current_user, asset.asset_type)
    return asset


@router.get("/assets/by-qr/{token}", response_model=ChecklistAssetOut)
def get_asset_by_qr(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    asset = db.query(ChecklistAsset).filter(
        ChecklistAsset.qr_token == token, ChecklistAsset.is_active == True
    ).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Código QR no reconocido")
    _require_asset_type_access(current_user, asset.asset_type)
    return asset


@router.patch("/assets/{asset_id}", response_model=ChecklistAssetOut)
def update_asset(
    asset_id: uuid.UUID,
    body: ChecklistAssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    asset = _get_asset(db, asset_id)
    for field in ("economic_number", "brand", "model", "serial", "plate", "energy_type", "ctpat_scope", "is_active"):
        value = getattr(body, field)
        if value is not None:
            setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    log_action(db, current_user.id, "checklist_asset_updated", "checklist_asset", str(asset.id))
    return asset


@router.get("/assets/{asset_id}/qr-label")
def get_asset_qr_label(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    asset = _get_asset(db, asset_id)
    _require_asset_type_access(current_user, asset.asset_type)
    from ..checklist_pdf import generate_asset_qr_label_pdf
    pdf_bytes = generate_asset_qr_label_pdf([asset])
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="qr_{asset.economic_number}.pdf"'
    })


# ── submissions ──────────────────────────────────────────────────────────────

SORT_OPTIONS = {
    "recent": lambda: ChecklistSubmission.created_at.desc(),
    "oldest": lambda: ChecklistSubmission.created_at.asc(),
    "folio": lambda: ChecklistSubmission.folio.desc().nulls_last(),
    "unit": lambda: ChecklistAsset.economic_number.asc().nulls_last(),
}


def _apply_submission_filters(q, current_user, asset_type, status, classification):
    if asset_type:
        _require_asset_type_access(current_user, asset_type)
        q = q.filter(ChecklistTemplate.asset_type == asset_type)
    elif not current_user.is_admin:
        q = q.filter(ChecklistTemplate.asset_type.in_(current_user.checklist_asset_types))
    if status:
        q = q.filter(ChecklistSubmission.status == status)
    if classification:
        # Comma-separated: the two templates use different classification strings
        # for the same semantic bucket (e.g. NO_OPERAR vs NO_APTO), so the frontend
        # groups them into one filter chip and passes all matching values at once.
        values = [v for v in classification.split(",") if v]
        q = q.filter(ChecklistSubmission.classification.in_(values))
    return q


@router.get("/submissions", response_model=PaginatedResponse)
def list_submissions(
    asset_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    classification: Optional[str] = Query(None),
    sort: str = Query("recent"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    q = (
        db.query(ChecklistSubmission)
        .options(joinedload(ChecklistSubmission.template), joinedload(ChecklistSubmission.asset))
        .join(ChecklistTemplate, ChecklistSubmission.template_id == ChecklistTemplate.id)
        .outerjoin(ChecklistAsset, ChecklistSubmission.asset_id == ChecklistAsset.id)
        .filter(ChecklistSubmission.is_deleted == False)
    )
    q = _apply_submission_filters(q, current_user, asset_type, status, classification)
    total = q.count()
    order_by = SORT_OPTIONS.get(sort, SORT_OPTIONS["recent"])()
    items = (
        q.order_by(order_by, ChecklistSubmission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [ChecklistSubmissionListItem.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# NOTE: declared before "/submissions/{submission_id}" for the same reason as the
# "/assets/qr-sheet" ordering fix above — FastAPI matches by declaration order.
@router.get("/submissions/counts")
def get_submission_counts(
    asset_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    """Quick-glance counts for the list header: how many are still drafts, and how
    many of each classification — lets an operator/supervisor spot at a glance how
    many units are flagged NO_OPERAR/NO_APTO without paging through the list."""
    base = (
        db.query(ChecklistSubmission)
        .join(ChecklistTemplate, ChecklistSubmission.template_id == ChecklistTemplate.id)
        .filter(ChecklistSubmission.is_deleted == False)
    )
    base = _apply_submission_filters(base, current_user, asset_type, None, None)
    draft = base.filter(ChecklistSubmission.status == ChecklistSubmissionStatus.draft.value).count()
    rows = (
        base.filter(ChecklistSubmission.classification.isnot(None))
        .with_entities(ChecklistSubmission.classification, func.count())
        .group_by(ChecklistSubmission.classification)
        .all()
    )
    return {"draft": draft, "by_classification": {c: n for c, n in rows}}


@router.post("/submissions", response_model=ChecklistSubmissionOut, status_code=201)
def create_submission(
    body: ChecklistSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status_code, payload = cached
        return JSONResponse(status_code=status_code, content=payload)

    template = db.query(ChecklistTemplate).filter(
        ChecklistTemplate.id == body.template_id, ChecklistTemplate.is_active == True
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    _require_asset_type_access(current_user, template.asset_type)

    if body.asset_id:
        asset = db.query(ChecklistAsset).filter(ChecklistAsset.id == body.asset_id).first()
        if not asset or asset.asset_type != template.asset_type:
            raise HTTPException(status_code=400, detail="La unidad no corresponde al tipo de plantilla")

    sub = ChecklistSubmission(
        id=uuid.uuid4(),
        template_id=template.id,
        asset_id=body.asset_id,
        header_values=body.header_values or {},
        responses=[],
        status=ChecklistSubmissionStatus.draft.value,
        created_by=current_user.id,
    )
    db.add(sub)
    db.flush()
    checklist_hash.append_log_entry(
        db, sub.id, "created", current_user.id,
        {"template_id": str(template.id), "asset_id": str(body.asset_id) if body.asset_id else None,
         "header_values": body.header_values or {}},
    )
    db.commit()
    log_action(db, current_user.id, "checklist_submission_created", "checklist_submission", str(sub.id),
               {"asset_type": template.asset_type})
    result = _get_submission(db, sub.id)
    save_cached(db, idempotency_key, current_user.id, "create_checklist_submission", 201,
                ChecklistSubmissionOut.model_validate(result))
    return result


@router.get("/submissions/{submission_id}", response_model=ChecklistSubmissionOut)
def get_submission(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    return sub


@router.patch("/submissions/{submission_id}", response_model=ChecklistSubmissionOut)
def update_submission(
    submission_id: uuid.UUID,
    body: ChecklistSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status_code, payload = cached
        return JSONResponse(status_code=status_code, content=payload)

    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    _assert_can_edit_submission(current_user, sub)
    if sub.status != ChecklistSubmissionStatus.draft.value:
        raise HTTPException(status_code=400, detail="Solo se puede editar un checklist en borrador")

    if body.header_values is not None:
        sub.header_values = {**(sub.header_values or {}), **body.header_values}

    changed_items = []
    if body.responses is not None:
        old_by_key = {r.get("item_key"): r for r in (sub.responses or [])}
        for r in body.responses:
            old = old_by_key.get(r.get("item_key"))
            if old != r:
                changed_items.append(r)
        sub.responses = body.responses

    if body.corrective_action is not None:
        sub.corrective_action = body.corrective_action
    if body.corrective_responsible is not None:
        sub.corrective_responsible = body.corrective_responsible

    if changed_items or body.header_values is not None:
        checklist_hash.append_log_entry(
            db, sub.id, "item_answered", current_user.id,
            {"changed_items": changed_items, "header_values": body.header_values or {}},
        )
    db.commit()
    result = _get_submission(db, sub.id)
    save_cached(db, idempotency_key, current_user.id, "update_checklist_submission", 200,
                ChecklistSubmissionOut.model_validate(result))
    return result


@router.post("/submissions/{submission_id}/sign", response_model=ChecklistSubmissionOut)
def sign_submission(
    submission_id: uuid.UUID,
    body: ChecklistSignatureIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status_code, payload = cached
        return JSONResponse(status_code=status_code, content=payload)

    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    _assert_can_edit_submission(current_user, sub)
    if sub.status != ChecklistSubmissionStatus.draft.value:
        raise HTTPException(status_code=400, detail="Solo se puede firmar un checklist en borrador")

    valid_roles = {r["key"] for r in sub.template.signature_roles}
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Rol de firma inválido: {body.role}")

    signed_at = datetime.now(timezone.utc)
    hash_value = checklist_hash.sig_hash(sub.id, body.role, body.name, signed_at, body.signature_data)

    signatures = [s for s in (sub.signatures or []) if s.get("role") != body.role]
    signatures.append({
        "role": body.role,
        "name": body.name,
        "signature_data": body.signature_data,
        "sig_hash": hash_value,
        "signed_at": signed_at.isoformat(),
    })
    sub.signatures = signatures

    checklist_hash.append_log_entry(
        db, sub.id, "signed", current_user.id,
        {"role": body.role, "name": body.name, "sig_hash": hash_value},
        client_created_at=signed_at,
    )
    db.commit()
    result = _get_submission(db, sub.id)
    save_cached(db, idempotency_key, current_user.id, "sign_checklist_submission", 200,
                ChecklistSubmissionOut.model_validate(result))
    return result


async def _save_checklist_photo(file: UploadFile, submission_id: uuid.UUID, item_key: str) -> str:
    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    dir_path = os.path.join(settings.UPLOADS_DIR, "checklists", str(submission_id), item_key)
    os.makedirs(dir_path, exist_ok=True)
    contents = await file.read()
    with open(os.path.join(dir_path, filename), "wb") as f:
        f.write(contents)
    return f"/uploads/checklists/{submission_id}/{item_key}/{filename}"


@router.post("/submissions/{submission_id}/photos", response_model=ChecklistSubmissionOut)
async def add_submission_photos(
    submission_id: uuid.UUID,
    item_key: str = Form(...),
    photos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status_code, payload = cached
        return JSONResponse(status_code=status_code, content=payload)

    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    _assert_can_edit_submission(current_user, sub)
    if sub.status != ChecklistSubmissionStatus.draft.value:
        raise HTTPException(status_code=400, detail="Solo se puede adjuntar fotos a un checklist en borrador")

    valid_keys = {item["key"] for section in sub.template.sections for item in section["items"]}
    if item_key not in valid_keys:
        raise HTTPException(status_code=400, detail="Punto de checklist inválido")

    saved_paths = []
    for f in photos:
        if f.content_type and f.content_type not in ALLOWED_PHOTO_MIME and not f.content_type.startswith("image/"):
            continue
        saved_paths.append(await _save_checklist_photo(f, submission_id, item_key))

    # Build brand-new dicts rather than mutating the ones already referenced by
    # sub.responses in place — SQLAlchemy's dirty-check on a plain JSON column
    # compares the old value against the new one, and if the same dict object is
    # mutated before reassignment, the "old" side reflects the mutation too (dicts
    # are shared by reference, not snapshotted), so the comparison sees no change
    # and silently drops the column from the UPDATE.
    responses = []
    found = False
    for r in (sub.responses or []):
        if r.get("item_key") == item_key:
            r = {**r, "photos": [*(r.get("photos") or []), *saved_paths]}
            found = True
        responses.append(r)
    if not found:
        responses.append({"item_key": item_key, "result": None, "observation": "", "photos": saved_paths})
    sub.responses = responses

    checklist_hash.append_log_entry(
        db, sub.id, "photo_added", current_user.id,
        {"item_key": item_key, "photos": saved_paths},
    )
    db.commit()
    result = _get_submission(db, sub.id)
    save_cached(db, idempotency_key, current_user.id, "add_checklist_photos", 200,
                ChecklistSubmissionOut.model_validate(result))
    return result


def _next_folio(db: Session, asset_type: str, ref_date) -> str:
    prefix_code = FOLIO_PREFIX.get(asset_type, asset_type[:2].upper())
    year_month = ref_date.strftime("%Y%m")
    prefix = f"{prefix_code}-{year_month}-"
    existing = db.query(ChecklistSubmission.folio).filter(ChecklistSubmission.folio.like(f"{prefix}%")).all()
    nums = []
    for (f,) in existing:
        if f:
            suffix = f[len(prefix):]
            if suffix.isdigit():
                nums.append(int(suffix))
    next_num = (max(nums) + 1) if nums else 1
    return f"{prefix}{next_num:04d}"


@router.post("/submissions/{submission_id}/submit", response_model=ChecklistSubmissionOut)
def submit_submission(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    cached = get_cached(db, idempotency_key, current_user.id)
    if cached:
        status_code, payload = cached
        return JSONResponse(status_code=status_code, content=payload)

    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    _assert_can_edit_submission(current_user, sub)
    if sub.status != ChecklistSubmissionStatus.draft.value:
        raise HTTPException(status_code=400, detail="Este checklist ya fue enviado")

    required_roles = {r["key"] for r in sub.template.signature_roles if r.get("required")}
    signed_roles = {s.get("role") for s in (sub.signatures or [])}
    missing = required_roles - signed_roles
    if missing:
        raise HTTPException(status_code=400, detail=f"Faltan firmas requeridas: {', '.join(sorted(missing))}")

    template = sub.template
    sub.template_snapshot = {
        "code": template.code,
        "name": template.name,
        "revision": template.revision,
        "retention_months": template.retention_months,
        "response_type": template.response_type,
        "source_reference": template.source_reference,
        "header_fields": template.header_fields,
        "signature_roles": template.signature_roles,
        "sections": template.sections,
    }
    sub.classification = _compute_classification(template.sections, sub.responses, template.response_type)
    sub.status = ChecklistSubmissionStatus.submitted.value
    if not sub.folio:
        from datetime import date as date_type
        sub.folio = _next_folio(db, template.asset_type, date_type.today())

    checklist_hash.append_log_entry(
        db, sub.id, "submitted", current_user.id,
        {"classification": sub.classification, "responses_hash": checklist_hash.payload_hash({"r": sub.responses})},
    )
    db.commit()
    log_action(db, current_user.id, "checklist_submission_submitted", "checklist_submission", str(sub.id),
               {"classification": sub.classification, "folio": sub.folio})
    result = _get_submission(db, sub.id)
    save_cached(db, idempotency_key, current_user.id, "submit_checklist_submission", 200,
                ChecklistSubmissionOut.model_validate(result))
    return result


@router.get("/submissions/{submission_id}/verify", response_model=ChecklistVerifyOut)
def verify_submission(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    return checklist_hash.verify_chain(db, sub.id)


@router.get("/verify/{submission_id}", response_model=ChecklistPublicVerifyOut)
def public_verify_submission(
    submission_id: uuid.UUID,
    h: str = Query(..., min_length=8),
    db: Session = Depends(get_db),
):
    """Public, unauthenticated endpoint backing the QR code printed on a submitted
    checklist's PDF. `h` must match some entry_hash that was genuinely produced by
    this submission's chain (the PDF embeds the hash of its last event at the time
    it was generated) — proving the requester holds a real printed/exported copy —
    and the full chain is then re-verified from genesis, so a chain tampered with
    at any point (before or after that checkpoint) is still caught."""
    sub = (
        db.query(ChecklistSubmission)
        .options(joinedload(ChecklistSubmission.template), joinedload(ChecklistSubmission.asset))
        .filter(ChecklistSubmission.id == submission_id, ChecklistSubmission.is_deleted == False)
        .first()
    )
    if not sub:
        return {"valid": False, "entries_checked": 0, "error": "Checklist no encontrado"}

    # autoescape=True is required — SQLAlchemy's .startswith() does NOT escape LIKE
    # wildcards by default, so plain .startswith(h) is just as exploitable as
    # .like(f"{h}%"): h="%" (or "_") would match any/every hash for this submission,
    # verifying it without actually knowing a real prefix of its chain.
    token_entry = (
        db.query(ChecklistLogEntry)
        .filter(
            ChecklistLogEntry.submission_id == submission_id,
            ChecklistLogEntry.entry_hash.startswith(h, autoescape=True),
        )
        .first()
    )
    if not token_entry:
        return {"valid": False, "entries_checked": 0, "error": "Código de verificación inválido"}

    result = checklist_hash.verify_chain(db, submission_id)
    snapshot = sub.template_snapshot or {}
    return {
        "valid": result["valid"],
        "entries_checked": result["entries_checked"],
        "folio": sub.folio,
        "template_name": snapshot.get("name") or (sub.template.name if sub.template else None),
        "template_code": snapshot.get("code") or (sub.template.code if sub.template else None),
        "classification": sub.classification,
        "asset_economic_number": sub.asset.economic_number if sub.asset else (sub.header_values or {}).get("no_economico") or (sub.header_values or {}).get("unidad_no_economico"),
        "submitted_at": sub.updated_at,
        "error": None if result["valid"] else f"Se detectó una alteración en el evento #{result['first_break_seq']}",
    }


@router.get("/submissions/{submission_id}/pdf")
def get_submission_pdf(
    submission_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_download),
):
    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    if sub.status == ChecklistSubmissionStatus.draft.value:
        raise HTTPException(status_code=400, detail="El checklist aún no ha sido enviado")

    scheme = request.headers.get("x-forwarded-proto", "https")
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    base_url = f"{scheme}://{host}" if host else None

    from ..checklist_pdf import generate_checklist_pdf
    try:
        pdf_path = generate_checklist_pdf(sub, base_url=base_url)
    except Exception as e:
        import traceback
        print(f"[PDF] checklist generation error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {e}")
    if not sub.pdf_path:
        sub.pdf_path = pdf_path
        db.commit()
    fs_path = os.path.join(settings.UPLOADS_DIR, "pdfs", f"{sub.id}_checklist.pdf")
    return FileResponse(fs_path, media_type="application/pdf", filename=f"checklist_{sub.id}.pdf")


@router.delete("/submissions/{submission_id}", status_code=204)
def delete_submission(
    submission_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_checklist_agent),
):
    sub = _get_submission(db, submission_id)
    _require_asset_type_access(current_user, sub.template.asset_type)
    # A draft is a work in progress, not yet part of the compliance record — its own
    # creator can clean up a mistake without needing an admin. Anything already
    # submitted+ is part of the hash-chained audit trail and only an admin removes it.
    is_own_draft = sub.status == ChecklistSubmissionStatus.draft.value and str(sub.created_by) == str(current_user.id)
    if not (current_user.is_admin or is_own_draft):
        raise HTTPException(status_code=403, detail="Solo un administrador puede eliminar un checklist ya enviado")
    sub.is_deleted = True
    db.commit()
    log_action(db, current_user.id, "checklist_submission_deleted", "checklist_submission", str(submission_id),
               {"status": sub.status})
