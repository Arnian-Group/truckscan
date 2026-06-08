import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse

from ..auth import get_current_user_download
from ..models import User
from ..config import settings

router = APIRouter()


@router.get("/{path:path}")
def serve_upload(
    path: str,
    current_user: User = Depends(get_current_user_download),
):
    abs_uploads = os.path.realpath(settings.UPLOADS_DIR)
    abs_file = os.path.realpath(os.path.join(abs_uploads, path))
    if not abs_file.startswith(abs_uploads + os.sep):
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.isfile(abs_file):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(abs_file)
