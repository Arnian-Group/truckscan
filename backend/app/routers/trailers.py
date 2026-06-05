import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Trailer, Section, TrailerStatus, SectionStatus, User
from ..auth import get_current_user
from ..schemas import TrailerCreate, TrailerOut, TrailerListItem, PaginatedResponse
from ..audit import log_action

router = APIRouter()

SECTION_COUNT = 8


def _create_sections(db: Session, trailer_id):
    for i in range(1, SECTION_COUNT + 1):
        section = Section(
            id=uuid.uuid4(),
            trailer_id=trailer_id,
            number=i,
            status=SectionStatus.pending,
            photos=[],
            notes=None,
        )
        db.add(section)


@router.get("", response_model=PaginatedResponse)
def list_trailers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Trailer).options(
        joinedload(Trailer.creator),
        joinedload(Trailer.sections).joinedload(Section.updater),
    )
    if status:
        q = q.filter(Trailer.status == status)
    total = q.count()
    items = (
        q.order_by(Trailer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    log_action(db, current_user.id, "trailers_listed", "trailer", None)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("", response_model=TrailerOut, status_code=201)
def create_trailer(
    body: TrailerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trailer = Trailer(
        id=uuid.uuid4(),
        plate=body.plate,
        reference=body.reference,
        status=TrailerStatus.open,
        created_by=current_user.id,
    )
    db.add(trailer)
    db.flush()
    _create_sections(db, trailer.id)
    db.commit()
    db.refresh(trailer)
    log_action(
        db,
        current_user.id,
        "trailer_created",
        "trailer",
        str(trailer.id),
        {"plate": body.plate, "reference": body.reference},
    )
    return trailer


@router.get("/{trailer_id}", response_model=TrailerOut)
def get_trailer(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trailer = (
        db.query(Trailer)
        .options(
            joinedload(Trailer.creator),
            joinedload(Trailer.sections).joinedload(Section.updater),
        )
        .filter(Trailer.id == trailer_id)
        .first()
    )
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    log_action(db, current_user.id, "trailer_viewed", "trailer", str(trailer_id))
    return trailer


@router.patch("/{trailer_id}/complete", response_model=TrailerOut)
def complete_trailer(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trailer = (
        db.query(Trailer)
        .options(
            joinedload(Trailer.creator),
            joinedload(Trailer.sections).joinedload(Section.updater),
        )
        .filter(Trailer.id == trailer_id)
        .first()
    )
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    if trailer.status == TrailerStatus.completed:
        raise HTTPException(status_code=400, detail="Trailer already completed")

    trailer.status = TrailerStatus.completed
    db.commit()
    db.refresh(trailer)
    log_action(db, current_user.id, "trailer_completed", "trailer", str(trailer_id))
    return trailer
