"""Tamper-evident hash chain for checklist submissions.

Extends the same sha256-hex-digest idiom already used for signature hashing in
routers/vehicles.py (`_sig_hash`), scoped per-submission rather than as one global
chain — see the plan notes on why (offline-filled submissions from different
devices must never need a strict cross-device write order).
"""
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from .models import ChecklistLogEntry

GENESIS_HASH = "0" * 64


def _canonical_json(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str, ensure_ascii=False)


def payload_hash(payload: dict) -> str:
    return hashlib.sha256(_canonical_json(payload).encode("utf-8")).hexdigest()


def sig_hash(submission_id, role: str, name: Optional[str], signed_at, signature_data: str) -> str:
    content = f"{submission_id}|{role}|{name or ''}|{str(signed_at or '')}|{signature_data}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _entry_hash(submission_id, seq: int, prev_hash: str, p_hash: str, event_type: str,
                 actor_id, client_created_at_iso: str) -> str:
    content = f"{submission_id}|{seq}|{prev_hash}|{p_hash}|{event_type}|{actor_id}|{client_created_at_iso}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def append_log_entry(
    db: Session,
    submission_id,
    event_type: str,
    actor_id,
    payload: dict,
    client_created_at: Optional[datetime] = None,
) -> ChecklistLogEntry:
    """Appends the next entry in a submission's hash chain. Must be called inside the
    same DB transaction as the business mutation it records, and only after the
    Idempotency-Key cache check has confirmed this isn't a replayed request — a
    replayed write must never append a duplicate log entry."""
    last = (
        db.query(ChecklistLogEntry)
        .filter(ChecklistLogEntry.submission_id == submission_id)
        .order_by(ChecklistLogEntry.seq.desc())
        .first()
    )
    seq = (last.seq + 1) if last else 0
    prev_hash = last.entry_hash if last else GENESIS_HASH
    p_hash = payload_hash(payload)
    client_ts = client_created_at or datetime.now(timezone.utc)
    entry_hash = _entry_hash(submission_id, seq, prev_hash, p_hash, event_type, actor_id, client_ts.isoformat())

    entry = ChecklistLogEntry(
        id=uuid.uuid4(),
        submission_id=submission_id,
        seq=seq,
        event_type=event_type,
        actor_id=actor_id,
        payload=payload,
        payload_hash=p_hash,
        prev_hash=prev_hash,
        entry_hash=entry_hash,
        client_created_at=client_ts,
    )
    db.add(entry)
    return entry


def verify_chain(db: Session, submission_id) -> dict:
    entries = (
        db.query(ChecklistLogEntry)
        .filter(ChecklistLogEntry.submission_id == submission_id)
        .order_by(ChecklistLogEntry.seq.asc())
        .all()
    )
    expected_prev = GENESIS_HASH
    for entry in entries:
        recomputed_payload_hash = payload_hash(entry.payload)
        if recomputed_payload_hash != entry.payload_hash or entry.prev_hash != expected_prev:
            return {"valid": False, "entries_checked": entry.seq, "first_break_seq": entry.seq}
        recomputed_entry_hash = _entry_hash(
            entry.submission_id, entry.seq, entry.prev_hash, entry.payload_hash,
            entry.event_type, entry.actor_id, entry.client_created_at.isoformat(),
        )
        if recomputed_entry_hash != entry.entry_hash:
            return {"valid": False, "entries_checked": entry.seq, "first_break_seq": entry.seq}
        expected_prev = entry.entry_hash
    return {"valid": True, "entries_checked": len(entries), "first_break_seq": None}
