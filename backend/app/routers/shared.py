import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, VehicleInspection, VehicleDamage, SharedLink
from ..auth import require_admin, require_vehicle_agent
from ..schemas import VehicleInspectionOut, SharedLinkOut, SharedLinkCreate

router = APIRouter()


def _utcnow():
    return datetime.now(timezone.utc)


def _link_out(link: SharedLink) -> SharedLinkOut:
    return SharedLinkOut(
        id=link.id,
        token=link.token,
        inspection_id=link.inspection_id,
        label=link.label,
        expires_at=link.expires_at,
        revoked_at=link.revoked_at,
        access_count=link.access_count or 0,
        last_accessed_at=link.last_accessed_at,
        created_at=link.created_at,
        created_by=link.created_by,
        folio=link.inspection.folio if link.inspection else None,
    )


# ── Admin: list all links ─────────────────────────────────────────────────────

@router.get("/links", response_model=List[SharedLinkOut])
def list_all_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    links = (
        db.query(SharedLink)
        .options(joinedload(SharedLink.inspection))
        .order_by(SharedLink.created_at.desc())
        .all()
    )
    return [_link_out(l) for l in links]


# ── List links for a specific inspection ─────────────────────────────────────

@router.get("/links/inspection/{inspection_id}", response_model=List[SharedLinkOut])
def list_links_for_inspection(
    inspection_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_vehicle_agent),
):
    links = (
        db.query(SharedLink)
        .options(joinedload(SharedLink.inspection))
        .filter(SharedLink.inspection_id == inspection_id)
        .order_by(SharedLink.created_at.desc())
        .all()
    )
    return [_link_out(l) for l in links]


# ── Create link ───────────────────────────────────────────────────────────────

@router.post("/links", response_model=SharedLinkOut, status_code=201)
def create_link(
    body: SharedLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    insp = db.query(VehicleInspection).filter(
        VehicleInspection.id == body.inspection_id,
        VehicleInspection.is_deleted == False,
    ).first()
    if not insp:
        raise HTTPException(404, "Inspección no encontrada")

    expires_at = None
    if body.expires_hours:
        expires_at = _utcnow() + timedelta(hours=body.expires_hours)

    link = SharedLink(
        token=secrets.token_urlsafe(9),
        inspection_id=body.inspection_id,
        created_by=current_user.id,
        label=body.label,
        expires_at=expires_at,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    # Reload with inspection for folio
    db.refresh(insp)
    link.inspection = insp
    return _link_out(link)


# ── Revoke link ───────────────────────────────────────────────────────────────

@router.delete("/links/{link_id}", status_code=204)
def revoke_link(
    link_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    link = db.query(SharedLink).filter(SharedLink.id == link_id).first()
    if not link:
        raise HTTPException(404, "Enlace no encontrado")
    link.revoked_at = _utcnow()
    db.commit()


# ── Public: get shared inspection ─────────────────────────────────────────────
# NOTE: no auth dependency — this is intentionally public

@router.get("/{token}")
def get_shared_inspection(
    token: str,
    db: Session = Depends(get_db),
):
    link = (
        db.query(SharedLink)
        .options(
            joinedload(SharedLink.inspection)
            .joinedload(VehicleInspection.damages)
        )
        .filter(SharedLink.token == token)
        .first()
    )
    if not link:
        raise HTTPException(404, "Enlace no encontrado")
    if link.revoked_at:
        raise HTTPException(410, "Este enlace fue revocado")
    if link.expires_at and link.expires_at < _utcnow():
        raise HTTPException(410, "Este enlace ha vencido")

    insp = link.inspection
    if not insp or insp.is_deleted:
        raise HTTPException(404, "Inspección no encontrada")

    link.access_count = (link.access_count or 0) + 1
    link.last_accessed_at = _utcnow()
    db.commit()

    return {
        "inspection": VehicleInspectionOut.model_validate(insp),
        "share_token": token,
        "expires_at": link.expires_at,
        "label": link.label,
    }
