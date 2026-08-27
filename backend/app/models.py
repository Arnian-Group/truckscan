import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, DateTime, Date, ForeignKey, Text, JSON,
    Enum as SAEnum, Integer, Float, Boolean, UniqueConstraint
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


class SignerRole(str, enum.Enum):
    transportista = "transportista"
    cliente_final = "cliente_final"


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

    # Checklist module (v3): can_checklists gates the module itself; per-asset-type
    # write access is a dynamic grant set (checklist_access below), not a fixed column
    # per type — a new checklist type (e.g. "cajas") never needs a migration here.
    can_checklists = Column(Boolean, default=False, server_default='false')

    trailers = relationship("Trailer", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    vehicle_inspections = relationship("VehicleInspection", back_populates="creator")
    checklist_access = relationship(
        "ChecklistAssetTypeGrant", back_populates="user",
        cascade="all, delete-orphan", foreign_keys="ChecklistAssetTypeGrant.user_id",
    )

    @property
    def checklist_asset_types(self):
        return [g.asset_type for g in self.checklist_access]


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
    editor_links = relationship("TrailerEditor", back_populates="trailer", cascade="all, delete-orphan")

    @property
    def editor_ids(self):
        return [el.user_id for el in self.editor_links]


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
    entry_number = Column(String(10), nullable=True)

    firma_origen = Column(Text, nullable=True)
    nombre_firma_origen = Column(String(255), nullable=True)
    rol_firma_origen = Column(SAEnum(SignerRole), nullable=True)
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
    editor_links = relationship("InspectionEditor", back_populates="inspection", cascade="all, delete-orphan")

    @property
    def editor_ids(self):
        return [el.user_id for el in self.editor_links]


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


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    key = Column(String(255), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)
    response_status = Column(Integer, nullable=False)
    response_body = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class VehicleInspectionHistory(Base):
    __tablename__ = "vehicle_inspection_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_inspections.id"), nullable=False, index=True)
    field = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime(timezone=True), default=utcnow)

    inspection = relationship("VehicleInspection")
    user = relationship("User", foreign_keys=[changed_by])


class InspectionEditor(Base):
    __tablename__ = "inspection_editors"
    __table_args__ = (UniqueConstraint("inspection_id", "user_id", name="uq_inspection_editor"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_inspections.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    inspection = relationship("VehicleInspection", back_populates="editor_links")
    user = relationship("User", foreign_keys=[user_id])
    adder = relationship("User", foreign_keys=[created_by])


class TrailerEditor(Base):
    __tablename__ = "trailer_editors"
    __table_args__ = (UniqueConstraint("trailer_id", "user_id", name="uq_trailer_editor"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trailer_id = Column(UUID(as_uuid=True), ForeignKey("trailers.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    trailer = relationship("Trailer", back_populates="editor_links")
    user = relationship("User", foreign_keys=[user_id])
    adder = relationship("User", foreign_keys=[created_by])


class ChecklistSubmissionStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    reviewed = "reviewed"
    released = "released"


class ChecklistAssetTypeGrant(Base):
    """Per-user, per-asset-type write grant for the checklist module (e.g. a user
    granted "forklift" and/or "utility_vehicle"). Deliberately a table, not a fixed
    boolean column per type — granting access to a brand new checklist type (e.g. a
    future "trailer_box" type) never requires a migration or a new dependency
    function, only a row here. `can_checklists` on User still gates whether the
    module is visible at all; this table gates which specific types within it."""
    __tablename__ = "checklist_asset_type_grants"
    __table_args__ = (UniqueConstraint("user_id", "asset_type", name="uq_checklist_grant"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="checklist_access", foreign_keys=[user_id])
    granter = relationship("User", foreign_keys=[granted_by])


class ChecklistAsset(Base):
    """Physical unit registry (forklifts, utility vehicles, and future asset types).
    Deliberately unrelated to VehicleInspection/VehicleType, which cover customer
    vehicle receiving, not equipment safety inspection."""
    __tablename__ = "checklist_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_type = Column(String(50), nullable=False, index=True)  # "forklift" | "utility_vehicle" | ...
    economic_number = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial = Column(String(100), nullable=True)
    plate = Column(String(50), nullable=True)
    energy_type = Column(String(20), nullable=True)  # forklift-specific: lp/electrico/diesel/gasolina
    ctpat_scope = Column(Boolean, default=False, server_default='false', nullable=False)
    qr_token = Column(String(64), unique=True, nullable=True, index=True)
    is_active = Column(Boolean, default=True, server_default='true', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class ChecklistTemplate(Base):
    """Versioned checklist definition. Never edited in place once it has submissions —
    changes create a new revision row instead, so historical submissions keep their
    own frozen template_snapshot regardless of later template edits."""
    __tablename__ = "checklist_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_type = Column(String(50), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    revision = Column(String(10), nullable=False, default="00")
    retention_months = Column(Integer, nullable=False, default=12)
    response_type = Column(String(20), nullable=False)  # "c_nc_na" | "si_no_na"
    source_reference = Column(String(100), nullable=True)  # e.g. "NOM-006-STPS-2023"
    header_fields = Column(JSON, nullable=False)
    signature_roles = Column(JSON, nullable=False)
    sections = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True, server_default='true', nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ChecklistSubmission(Base):
    __tablename__ = "checklist_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("checklist_templates.id"), nullable=False)
    template_snapshot = Column(JSON, nullable=True)  # frozen at submit time
    asset_id = Column(UUID(as_uuid=True), ForeignKey("checklist_assets.id"), nullable=True)
    header_values = Column(JSON, nullable=False, default=dict)
    responses = Column(JSON, nullable=False, default=list)  # [{item_key, result, observation, photos}]
    classification = Column(String(50), nullable=True)
    folio = Column(String(20), nullable=True, unique=True, index=True)
    status = Column(String(20), nullable=False, default=ChecklistSubmissionStatus.draft.value)
    corrective_action = Column(Text, nullable=True)
    corrective_responsible = Column(String(255), nullable=True)
    signatures = Column(JSON, nullable=False, default=list)  # [{role, name, sig_hash, signed_at}]
    pdf_path = Column(String(500), nullable=True)
    is_deleted = Column(Boolean, default=False, server_default='false', nullable=False)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    template = relationship("ChecklistTemplate")
    asset = relationship("ChecklistAsset")
    creator = relationship("User", foreign_keys=[created_by])
    log_entries = relationship(
        "ChecklistLogEntry", back_populates="submission",
        order_by="ChecklistLogEntry.seq", cascade="all, delete-orphan",
    )


class ChecklistLogEntry(Base):
    """Tamper-evident hash chain, scoped per submission (not a single global chain —
    see plan notes: a submission's events are only ever produced sequentially by the
    one device/session that owns it, so a per-submission chain avoids needing a strict
    cross-device write order for offline-filled checklists synced later)."""
    __tablename__ = "checklist_log_entries"
    __table_args__ = (UniqueConstraint("submission_id", "seq", name="uq_checklist_log_seq"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("checklist_submissions.id"), nullable=False, index=True)
    seq = Column(Integer, nullable=False)
    event_type = Column(String(30), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payload = Column(JSON, nullable=False, default=dict)
    payload_hash = Column(String(64), nullable=False)
    prev_hash = Column(String(64), nullable=False)
    entry_hash = Column(String(64), nullable=False)
    client_created_at = Column(DateTime(timezone=True), nullable=True)
    server_recorded_at = Column(DateTime(timezone=True), default=utcnow)

    submission = relationship("ChecklistSubmission", back_populates="log_entries")
    actor = relationship("User", foreign_keys=[actor_id])
