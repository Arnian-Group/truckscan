from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from .models import UserRole, TrailerStatus, SectionStatus, VehicleType, InspectionStatus, SignerRole


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# User
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_admin: bool = False
    can_trailers: bool = False
    can_vehicles: bool = False
    can_checklists: bool = False
    checklist_asset_types: List[str] = []


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    is_admin: bool = False
    can_trailers: bool = False
    can_vehicles: bool = False
    can_checklists: bool = False
    checklist_asset_types: List[str] = []
    role: str = "operator"
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def compute_role(self) -> "UserOut":
        # NOTE: the frontend's canTrailers() treats role=="operator" as implying
        # trailer access (a pre-v2 holdover, back when "operator" meant exactly
        # "trailers-only user") — so "operator" must only be assigned when
        # can_trailers is actually true, or a checklists-only/no-access user would
        # incorrectly show the trailers nav item despite can_trailers being False.
        if self.is_admin:
            self.role = "admin"
        elif self.can_trailers and self.can_vehicles:
            self.role = "multi"
        elif self.can_vehicles:
            self.role = "vehicle_agent"
        elif self.can_trailers:
            self.role = "operator"
        elif self.can_checklists:
            self.role = "checklist_agent"
        else:
            self.role = "operator"  # no module access at all — matches the pre-v2 default
        return self


# Section
class SectionOut(BaseModel):
    id: UUID
    trailer_id: UUID
    number: int
    status: SectionStatus
    photos: List[str]
    notes: Optional[str]
    updated_by: Optional[UUID]
    updated_at: datetime
    updater: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class SectionDoneBody(BaseModel):
    notes: Optional[str] = None


# Trailer
class TrailerCreate(BaseModel):
    plate: Optional[str] = None
    reference: Optional[str] = None


class TrailerOut(BaseModel):
    id: UUID
    plate: Optional[str]
    reference: Optional[str]
    status: TrailerStatus
    is_deleted: bool = False
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserOut] = None
    editor_ids: List[UUID] = []
    sections: List[SectionOut] = []

    model_config = {"from_attributes": True}


class TrailerListItem(BaseModel):
    id: UUID
    plate: Optional[str]
    reference: Optional[str]
    status: TrailerStatus
    is_deleted: bool = False
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserOut] = None
    editor_ids: List[UUID] = []
    sections: List[SectionOut] = []

    model_config = {"from_attributes": True}


# Audit
class AuditLogOut(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    entity: Optional[str]
    entity_id: Optional[str]
    timestamp: datetime
    metadata_: Optional[dict] = None
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int


# Vehicle
class VehicleIntakeCreate(BaseModel):
    vehicle_type: VehicleType
    fecha: Optional[date] = None
    city: Optional[str] = None
    nombre: Optional[str] = None
    id_cliente: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    placas: Optional[str] = None
    odometer: Optional[int] = None
    vin: Optional[str] = None
    gasolina: Optional[str] = None
    notas: Optional[str] = None
    checklist: Optional[dict] = None


class VehicleIntakeUpdate(BaseModel):
    fecha: Optional[date] = None
    city: Optional[str] = None
    nombre: Optional[str] = None
    id_cliente: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    placas: Optional[str] = None
    odometer: Optional[int] = None
    vin: Optional[str] = None
    gasolina: Optional[str] = None
    notas: Optional[str] = None
    checklist: Optional[dict] = None


class SignBody(BaseModel):
    firma_origen: str
    nombre_firma_origen: Optional[str] = None
    rol_firma_origen: Optional[SignerRole] = None
    fecha_firma_origen: Optional[date] = None
    firma_destino: Optional[str] = None
    nombre_firma_destino: Optional[str] = None
    fecha_firma_destino: Optional[date] = None


class VehicleDamageUpdate(BaseModel):
    damage_type: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None


class UserUpdate(BaseModel):
    is_admin: Optional[bool] = None
    can_trailers: Optional[bool] = None
    can_vehicles: Optional[bool] = None
    can_checklists: Optional[bool] = None
    checklist_asset_types: Optional[List[str]] = None  # None = leave unchanged, [] = revoke all


class ChecklistUpdate(BaseModel):
    checklist: Optional[dict] = None
    notas: Optional[str] = None


class CompleteBody(BaseModel):
    notas_finales: Optional[str] = None


class VehicleDamageOut(BaseModel):
    id: UUID
    inspection_id: UUID
    view: str
    x_pct: float
    y_pct: float
    damage_type: str
    description: Optional[str]
    photos: List[str]
    created_by: Optional[UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class VehicleInspectionOut(BaseModel):
    id: UUID
    folio: Optional[str]
    vehicle_type: VehicleType
    status: InspectionStatus
    is_deleted: bool = False
    fecha: Optional[date]
    city: Optional[str]
    nombre: Optional[str]
    id_cliente: Optional[str]
    year: Optional[int]
    make: Optional[str]
    model: Optional[str]
    color: Optional[str]
    placas: Optional[str]
    odometer: Optional[int]
    vin: Optional[str]
    gasolina: Optional[str]
    notas: Optional[str]
    checklist: Optional[dict]
    mercancias_descripcion: Optional[str]
    nombre_entrega: Optional[str]
    entry_number: Optional[str] = None
    mercancias_fotos: Optional[list] = []
    firma_origen: Optional[str]
    nombre_firma_origen: Optional[str]
    rol_firma_origen: Optional[SignerRole] = None
    fecha_firma_origen: Optional[date]
    firma_hash_origen: Optional[str]
    firma_destino: Optional[str]
    nombre_firma_destino: Optional[str]
    fecha_firma_destino: Optional[date]
    firma_hash_destino: Optional[str]
    notas_finales: Optional[str]
    liability_pdf_path: Optional[str]
    full_report_pdf_path: Optional[str]
    created_by: Optional[UUID]
    creator: Optional[UserOut] = None
    editor_ids: List[UUID] = []
    created_at: datetime
    updated_at: Optional[datetime]
    damages: List[VehicleDamageOut] = []

    model_config = {"from_attributes": True}


class VehicleHistoryEntryOut(BaseModel):
    type: str  # "field_change" | "event"
    timestamp: datetime
    user: Optional[UserOut] = None
    field: Optional[str] = None
    field_label: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    action: Optional[str] = None
    action_label: Optional[str] = None


class VehicleInspectionListItem(BaseModel):
    id: UUID
    folio: Optional[str]
    vehicle_type: VehicleType
    status: InspectionStatus
    is_deleted: bool = False
    fecha: Optional[date]
    city: Optional[str]
    nombre: Optional[str]
    nombre_entrega: Optional[str]
    entry_number: Optional[str] = None
    mercancias_descripcion: Optional[str]
    year: Optional[int]
    make: Optional[str]
    model: Optional[str]
    color: Optional[str]
    vin: Optional[str] = None
    created_by: Optional[UUID] = None
    editor_ids: List[UUID] = []
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class VehicleVinSiblingOut(BaseModel):
    id: UUID
    folio: Optional[str]
    city: Optional[str]
    fecha: Optional[date]
    status: InspectionStatus
    created_at: datetime
    year: Optional[int]
    make: Optional[str]
    model: Optional[str]
    damage_count: int = 0


# Editors (creator-managed edit/close access)
class EditorCreate(BaseModel):
    user_id: UUID


class EditorOut(BaseModel):
    id: UUID
    user_id: UUID
    user: Optional[UserOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# Share links
class SharedLinkCreate(BaseModel):
    inspection_id: UUID
    label: str
    expires_hours: Optional[int] = None  # None = never expires
    entry_number: Optional[str] = None  # if set, saved onto the inspection


class SharedLinkOut(BaseModel):
    id: UUID
    token: str
    inspection_id: UUID
    label: Optional[str] = None
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    access_count: int = 0
    last_accessed_at: Optional[datetime] = None
    created_at: datetime
    created_by: UUID
    folio: Optional[str] = None  # populated from inspection
    entry_number: Optional[str] = None  # populated from inspection

    model_config = {"from_attributes": True}


# Checklists (forklifts, utility vehicles, and future asset types)
class ChecklistAssetTypeOut(BaseModel):
    """One entry per known asset_type (derived from active templates), used to render
    the admin permission checkboxes dynamically — adding a new checklist type never
    requires a frontend code change here, just a new seeded template."""
    asset_type: str
    label: str


class ChecklistAssetCreate(BaseModel):
    asset_type: str
    economic_number: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial: Optional[str] = None
    plate: Optional[str] = None
    energy_type: Optional[str] = None
    ctpat_scope: bool = False


class ChecklistAssetUpdate(BaseModel):
    economic_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial: Optional[str] = None
    plate: Optional[str] = None
    energy_type: Optional[str] = None
    ctpat_scope: Optional[bool] = None
    is_active: Optional[bool] = None


class ChecklistAssetOut(BaseModel):
    id: UUID
    asset_type: str
    economic_number: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial: Optional[str] = None
    plate: Optional[str] = None
    energy_type: Optional[str] = None
    ctpat_scope: bool = False
    qr_token: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


class ChecklistTemplateOut(BaseModel):
    id: UUID
    asset_type: str
    code: str
    name: str
    revision: str
    retention_months: int
    response_type: str
    source_reference: Optional[str] = None
    header_fields: list
    signature_roles: list
    sections: list
    is_active: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


class ChecklistSubmissionCreate(BaseModel):
    template_id: UUID
    asset_id: Optional[UUID] = None
    header_values: dict = {}


class ChecklistSubmissionUpdate(BaseModel):
    header_values: Optional[dict] = None
    responses: Optional[list] = None
    corrective_action: Optional[str] = None
    corrective_responsible: Optional[str] = None


class ChecklistSignatureIn(BaseModel):
    role: str
    name: str
    signature_data: str  # base64 PNG, same convention as SignatureCanvas output


class ChecklistLogEntryOut(BaseModel):
    seq: int
    event_type: str
    actor_id: Optional[UUID] = None
    entry_hash: str
    server_recorded_at: datetime

    model_config = {"from_attributes": True}


class ChecklistSubmissionOut(BaseModel):
    id: UUID
    template_id: UUID
    asset_id: Optional[UUID] = None
    header_values: dict = {}
    responses: list = []
    classification: Optional[str] = None
    folio: Optional[str] = None
    status: str = "draft"
    corrective_action: Optional[str] = None
    corrective_responsible: Optional[str] = None
    signatures: list = []
    pdf_path: Optional[str] = None
    is_deleted: bool = False
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    template: Optional[ChecklistTemplateOut] = None
    asset: Optional[ChecklistAssetOut] = None
    creator: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class ChecklistSubmissionListItem(BaseModel):
    id: UUID
    template_id: UUID
    asset_id: Optional[UUID] = None
    classification: Optional[str] = None
    folio: Optional[str] = None
    status: str = "draft"
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    asset: Optional[ChecklistAssetOut] = None
    template: Optional[ChecklistTemplateOut] = None

    model_config = {"from_attributes": True}


class ChecklistVerifyOut(BaseModel):
    valid: bool
    entries_checked: int
    first_break_seq: Optional[int] = None


class ChecklistPublicVerifyOut(BaseModel):
    valid: bool
    folio: Optional[str] = None
    template_name: Optional[str] = None
    template_code: Optional[str] = None
    classification: Optional[str] = None
    asset_economic_number: Optional[str] = None
    submitted_at: Optional[datetime] = None
    entries_checked: int = 0
    error: Optional[str] = None
