from sqlalchemy.orm import Session
from .models import AuditLog
from typing import Optional
import uuid


def log_action(
    db: Session,
    user_id,
    action: str,
    entity: Optional[str] = None,
    entity_id: Optional[str] = None,
    metadata: Optional[dict] = None,
):
    entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id else None,
        metadata_=metadata,
    )
    db.add(entry)
    db.commit()
