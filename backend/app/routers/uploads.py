import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user_download_or_none
from ..models import User, SharedLink
from ..database import get_db
from ..config import settings

router = APIRouter()

THUMB_MAX_DIM = 400
THUMB_QUALITY = 68


def _thumb_path(abs_file: str) -> str:
    base, _ext = os.path.splitext(abs_file)
    return f"{base}_thumb.jpg"


def _ensure_thumbnail(abs_file: str) -> Optional[str]:
    """Generate (once) and cache a small JPEG thumbnail next to the original. Returns
    the thumbnail path, or None if generation fails (caller should fall back to the original)."""
    thumb_file = _thumb_path(abs_file)
    if os.path.isfile(thumb_file):
        return thumb_file
    try:
        from PIL import Image
        with Image.open(abs_file) as img:
            img = img.convert("RGB")
            img.thumbnail((THUMB_MAX_DIM, THUMB_MAX_DIM))
            img.save(thumb_file, "JPEG", quality=THUMB_QUALITY)
        return thumb_file
    except Exception:
        return None


@router.get("/{path:path}")
def serve_upload(
    path: str,
    thumb: bool = Query(False),
    share_token: Optional[str] = Query(None, alias="share_token"),
    current_user: Optional[User] = Depends(get_current_user_download_or_none),
    db: Session = Depends(get_db),
):
    if not current_user:
        if not share_token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        now = datetime.now(timezone.utc)
        link = db.query(SharedLink).filter(
            SharedLink.token == share_token,
            SharedLink.revoked_at == None,
        ).first()
        if not link:
            raise HTTPException(status_code=403, detail="Invalid share token")
        if link.expires_at and link.expires_at < now:
            raise HTTPException(status_code=410, detail="Share link expired")
        if not path.startswith(f"vehicles/{link.inspection_id}"):
            raise HTTPException(status_code=403, detail="Access denied")

    abs_uploads = os.path.realpath(settings.UPLOADS_DIR)
    abs_file = os.path.realpath(os.path.join(abs_uploads, path))
    if not abs_file.startswith(abs_uploads + os.sep):
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.isfile(abs_file):
        raise HTTPException(status_code=404, detail="File not found")

    serve_path = abs_file
    if thumb:
        thumb_file = _ensure_thumbnail(abs_file)
        if thumb_file:
            serve_path = thumb_file

    return FileResponse(serve_path, headers={"Cache-Control": "private, max-age=86400"})
