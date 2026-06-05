from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import AuditLog, User
from ..auth import require_admin
from ..schemas import AuditLogOut, PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
def list_audit(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    user_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    q = db.query(AuditLog).options(joinedload(AuditLog.user))
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if date_from:
        q = q.filter(AuditLog.timestamp >= date_from)
    if date_to:
        q = q.filter(AuditLog.timestamp <= date_to)

    total = q.count()
    items = (
        q.order_by(AuditLog.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}
