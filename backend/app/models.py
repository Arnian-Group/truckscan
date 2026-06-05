import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, DateTime, ForeignKey, Text, JSON,
    Enum as SAEnum, Integer, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base
import enum


def utcnow():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"


class TrailerStatus(str, enum.Enum):
    open = "open"
    completed = "completed"


class SectionStatus(str, enum.Enum):
    pending = "pending"
    done = "done"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.operator)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    trailers = relationship("Trailer", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")


class Trailer(Base):
    __tablename__ = "trailers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate = Column(String(50), nullable=True)
    reference = Column(String(255), nullable=True)
    status = Column(SAEnum(TrailerStatus), nullable=False, default=TrailerStatus.open)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    creator = relationship("User", back_populates="trailers")
    sections = relationship("Section", back_populates="trailer", order_by="Section.number")


class Section(Base):
    __tablename__ = "sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trailer_id = Column(UUID(as_uuid=True), ForeignKey("trailers.id"), nullable=False)
    number = Column(Integer, nullable=False)  # 1-8
    status = Column(SAEnum(SectionStatus), nullable=False, default=SectionStatus.pending)
    photos = Column(JSON, nullable=False, default=list)  # list of file paths
    notes = Column(Text, nullable=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trailer = relationship("Trailer", back_populates="sections")
    updater = relationship("User", foreign_keys=[updated_by])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=True)
    entity_id = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
    metadata_ = Column("metadata", JSON, nullable=True)

    user = relationship("User", back_populates="audit_logs")
