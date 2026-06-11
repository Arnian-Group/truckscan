import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, DateTime, Date, ForeignKey, Text, JSON,
    Enum as SAEnum, Integer, Float, Boolean
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


class VehicleType(str, enum.Enum):
    sedan = "sedan"
    pickup = "pickup"
    van = "van"
    golf = "golf"
    canam = "canam"
    motorcycle = "motorcycle"
    atv = "atv"
    racer = "racer"
    mercancias = "mercancias"


class InspectionStatus(str, enum.Enum):
    intake = "intake"
    intake_complete = "intake_complete"
    in_inspection = "in_inspection"
    completed = "completed"


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

    # Permission flags (v2)
    is_admin = Column(Boolean, default=False, server_default='false')
    can_trailers = Column(Boolean, default=False, server_default='false')
    can_vehicles = Column(Boolean, default=False, server_default='false')

    trailers = relationship("Trailer", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    vehicle_inspections = relationship("VehicleInspection", back_populates="creator")


class Trailer(Base):
    __tablename__ = "trailers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate = Column(String(50), nullable=True)
    reference = Column(String(255), nullable=True)
    status = Column(SAEnum(TrailerStatus), nullable=False, default=TrailerStatus.open)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    is_deleted = Column(Boolean, default=False, server_default='false', nullable=False)

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


class VehicleInspection(Base):
    __tablename__ = "vehicle_inspections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_type = Column(SAEnum(VehicleType), nullable=False)
    status = Column(SAEnum(InspectionStatus), nullable=False, default=InspectionStatus.intake)

    fecha = Column(Date, nullable=True)
    city = Column(String(100), nullable=True)
    nombre = Column(String(255), nullable=True)
    id_cliente = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    make = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    color = Column(String(100), nullable=True)
    placas = Column(String(50), nullable=True)
    odometer = Column(Integer, nullable=True)
    vin = Column(String(17), nullable=True)
    gasolina = Column(String(10), nullable=True)
    notas = Column(Text, nullable=True)
    checklist = Column(JSON, nullable=True)
    mercancias_descripcion = Column(Text, nullable=True)
    nombre_entrega = Column(String(255), nullable=True)
    mercancias_fotos = Column(JSON, nullable=True, default=list)

    firma_origen = Column(Text, nullable=True)
    nombre_firma_origen = Column(String(255), nullable=True)
    fecha_firma_origen = Column(Date, nullable=True)
    firma_hash_origen = Column(String(64), nullable=True)

    firma_destino = Column(Text, nullable=True)
    nombre_firma_destino = Column(String(255), nullable=True)
    fecha_firma_destino = Column(Date, nullable=True)
    firma_hash_destino = Column(String(64), nullable=True)

    notas_finales = Column(Text, nullable=True)

    folio = Column(String(20), nullable=True, unique=True, index=True)

    liability_pdf_path = Column(String(500), nullable=True)
    full_report_pdf_path = Column(String(500), nullable=True)

    is_deleted = Column(Boolean, default=False, server_default='false', nullable=False)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    creator = relationship("User", back_populates="vehicle_inspections")
    damages = relationship(
        "VehicleDamage", back_populates="inspection",
        order_by="VehicleDamage.created_at", cascade="all, delete-orphan"
    )


class SharedLink(Base):
    __tablename__ = "shared_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String(64), unique=True, nullable=False, index=True)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_inspections.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    label = Column(String(255), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    access_count = Column(Integer, default=0, server_default='0', nullable=False)
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    inspection = relationship("VehicleInspection")
    creator = relationship("User", foreign_keys=[created_by])


class VehicleDamage(Base):
    __tablename__ = "vehicle_damages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_inspections.id"), nullable=False)
    view = Column(String(50), nullable=False)
    x_pct = Column(Float, nullable=False)
    y_pct = Column(Float, nullable=False)
    damage_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    photos = Column(JSON, nullable=False, default=list)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    inspection = relationship("VehicleInspection", back_populates="damages")
    creator = relationship("User", foreign_keys=[created_by])
