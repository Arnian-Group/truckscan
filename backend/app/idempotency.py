from typing import Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from .models import IdempotencyKey


def get_cached(db: Session, key: Optional[str], user_id) -> Optional[Tuple[int, Any]]:
    if not key:
        return None
    row = db.query(IdempotencyKey).filter(IdempotencyKey.key == key).first()
    if not row or str(row.user_id) != str(user_id):
        return None
    return row.response_status, row.response_body


def save_cached(db: Session, key: Optional[str], user_id, endpoint: str, status: int, body: Any) -> None:
    if not key:
        return
    existing = db.query(IdempotencyKey).filter(IdempotencyKey.key == key).first()
    if existing:
        return
    db.add(IdempotencyKey(
        key=key,
        user_id=user_id,
        endpoint=endpoint,
        response_status=status,
        response_body=jsonable_encoder(body),
    ))
    db.commit()
