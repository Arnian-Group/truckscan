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


@router.get("/{path:path}")
def serve_upload(
    path: str,
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
    return FileResponse(abs_file)
