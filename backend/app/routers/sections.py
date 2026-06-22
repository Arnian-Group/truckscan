import uuid
import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Trailer, Section, SectionStatus, User
from ..auth import require_trailer_agent
from ..schemas import SectionOut, SectionDoneBody
from ..audit import log_action
from ..permissions import assert_can_edit_trailer
from ..config import settings

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


def _get_trailer_or_404(db: Session, trailer_id: uuid.UUID) -> Trailer:
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return trailer


def _get_section(db: Session, trailer_id: uuid.UUID, section_number: int) -> Section:
    _get_trailer_or_404(db, trailer_id)
    section = (
        db.query(Section)
        .options(joinedload(Section.updater))
        .filter(
            Section.trailer_id == trailer_id,
            Section.number == section_number,
        )
        .first()
    )
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.get("/{trailer_id}/sections/{section_number}", response_model=SectionOut)
def get_section(
    trailer_id: uuid.UUID,
    section_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    section = _get_section(db, trailer_id, section_number)
    log_action(
        db,
        current_user.id,
        "section_viewed",
        "section",
        str(section.id),
        {"section_number": section_number},
    )
    return section


@router.post(
    "/{trailer_id}/sections/{section_number}/photos",
    response_model=SectionOut,
    status_code=201,
)
async def upload_photos(
    trailer_id: uuid.UUID,
    section_number: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file required")

    trailer = _get_trailer_or_404(db, trailer_id)
    assert_can_edit_trailer(db, current_user, trailer)
    section = _get_section(db, trailer_id, section_number)

    saved_paths: List[str] = []
    section_dir = os.path.join(settings.UPLOADS_DIR, str(trailer_id), str(section_number))
    os.makedirs(section_dir, exist_ok=True)

    for upload in files:
        if upload.content_type and upload.content_type not in ALLOWED_MIME:
            raise HTTPException(
                status_code=400,
                detail=f"File type {upload.content_type} not allowed",
            )
        ext = os.path.splitext(upload.filename or "photo.jpg")[1] or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        dest = os.path.join(section_dir, filename)
        with open(dest, "wb") as f:
            shutil.copyfileobj(upload.file, f)
        rel_path = f"/uploads/{trailer_id}/{section_number}/{filename}"
        saved_paths.append(rel_path)

    existing = list(section.photos or [])
    existing.extend(saved_paths)
    section.photos = existing
    section.updated_by = current_user.id
    db.commit()
    db.refresh(section)

    log_action(
        db,
        current_user.id,
        "section_photos_added",
        "section",
        str(section.id),
        {"section_number": section_number, "count": len(saved_paths)},
    )
    return section


@router.patch("/{trailer_id}/sections/{section_number}/done", response_model=SectionOut)
def mark_section_done(
    trailer_id: uuid.UUID,
    section_number: int,
    body: SectionDoneBody = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trailer_agent),
):
    trailer = _get_trailer_or_404(db, trailer_id)
    assert_can_edit_trailer(db, current_user, trailer)
    section = _get_section(db, trailer_id, section_number)

    if not section.photos:
        raise HTTPException(
            status_code=400, detail="Upload at least one photo before marking done"
        )

    section.status = SectionStatus.done
    section.updated_by = current_user.id
    if body and body.notes is not None:
        section.notes = body.notes
    db.commit()
    db.refresh(section)

    log_action(
        db,
        current_user.id,
        "section_marked_done",
        "section",
        str(section.id),
        {"section_number": section_number},
    )
    return section
