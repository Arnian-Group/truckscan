import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Trailer, Section, TrailerStatus, SectionStatus, User, TrailerEditor
from ..auth import require_admin, require_trailer_agent
from ..schemas import (
    TrailerCreate, TrailerOut, TrailerListItem, PaginatedResponse,
    EditorCreate, EditorOut, UserOut,
)
from ..audit import log_action
from ..permissions import assert_can_edit_trailer, assert_can_manage_trailer_editors
from sqlalchemy import or_

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
    archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    q = db.query(Trailer).options(
        joinedload(Trailer.creator),
        joinedload(Trailer.sections).joinedload(Section.updater),
        joinedload(Trailer.editor_links),
    ).filter(Trailer.is_deleted == archived)
    if status:
        q = q.filter(Trailer.status == status)
    total = q.count()
    items = (
        q.order_by(Trailer.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    log_action(db, current_user.id, "trailers_listed", "trailer", None)
    return {"items": [TrailerListItem.model_validate(i) for i in items], "total": total, "page": page, "page_size": page_size}


@router.post("", response_model=TrailerOut, status_code=201)
def create_trailer(
    body: TrailerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
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


@router.get("/editor-candidates", response_model=List[UserOut])
def list_editor_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    return (
        db.query(User)
        .filter(User.is_active == True, or_(User.can_trailers == True, User.is_admin == True))
        .order_by(User.name)
        .all()
    )


@router.get("/{trailer_id}", response_model=TrailerOut)
def get_trailer(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
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


@router.get("/{trailer_id}/editors", response_model=List[EditorOut])
def list_trailer_editors(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return (
        db.query(TrailerEditor)
        .options(joinedload(TrailerEditor.user))
        .filter(TrailerEditor.trailer_id == trailer_id)
        .order_by(TrailerEditor.created_at)
        .all()
    )


@router.post("/{trailer_id}/editors", response_model=EditorOut, status_code=201)
def add_trailer_editor(
    trailer_id: uuid.UUID,
    body: EditorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id, Trailer.is_deleted == False).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    assert_can_manage_trailer_editors(current_user, trailer)
    target = db.query(User).filter(User.id == body.user_id, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not (target.is_admin or target.can_trailers):
        raise HTTPException(status_code=400, detail="El usuario no tiene permiso del módulo de trailers")
    existing = db.query(TrailerEditor).filter(
        TrailerEditor.trailer_id == trailer_id,
        TrailerEditor.user_id == body.user_id,
    ).first()
    if existing:
        return existing
    editor = TrailerEditor(
        id=uuid.uuid4(),
        trailer_id=trailer_id,
        user_id=body.user_id,
        created_by=current_user.id,
    )
    db.add(editor)
    db.commit()
    db.refresh(editor)
    log_action(db, current_user.id, "trailer_editor_added", "trailer", str(trailer_id),
               {"user_id": str(body.user_id)})
    return editor


@router.delete("/{trailer_id}/editors/{user_id}", status_code=204)
def remove_trailer_editor(
    trailer_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    assert_can_manage_trailer_editors(current_user, trailer)
    editor = db.query(TrailerEditor).filter(
        TrailerEditor.trailer_id == trailer_id,
        TrailerEditor.user_id == user_id,
    ).first()
    if not editor:
        raise HTTPException(status_code=404, detail="Editor no encontrado")
    db.delete(editor)
    db.commit()
    log_action(db, current_user.id, "trailer_editor_removed", "trailer", str(trailer_id),
               {"user_id": str(user_id)})


@router.patch("/{trailer_id}/complete", response_model=TrailerOut)
def complete_trailer(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    trailer = (
        db.query(Trailer)
        .options(
            joinedload(Trailer.creator),
            joinedload(Trailer.sections).joinedload(Section.updater),
        )
        .filter(Trailer.id == trailer_id, Trailer.is_deleted == False)
        .first()
    )
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    assert_can_edit_trailer(db, current_user, trailer)
    if trailer.status == TrailerStatus.completed:
        raise HTTPException(status_code=400, detail="Trailer already completed")

    trailer.status = TrailerStatus.completed
    db.commit()
    db.refresh(trailer)
    log_action(db, current_user.id, "trailer_completed", "trailer", str(trailer_id))
    return trailer


@router.delete("/{trailer_id}", status_code=204)
def delete_trailer(
    trailer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    trailer = (
        db.query(Trailer)
        .filter(Trailer.id == trailer_id, Trailer.is_deleted == False)
        .first()
    )
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer no encontrado")

    trailer.is_deleted = True
    db.commit()
    log_action(db, current_user.id, "trailer_deleted", "trailer", str(trailer_id),
               {"plate": trailer.plate, "reference": trailer.reference})
