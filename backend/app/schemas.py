from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from .models import UserRole, TrailerStatus, SectionStatus, VehicleType, InspectionStatus


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


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    is_admin: bool = False
    can_trailers: bool = False
    can_vehicles: bool = False
    role: str = "operator"
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def compute_role(self) -> "UserOut":
        if self.is_admin:
            self.role = "admin"
        elif self.can_trailers and self.can_vehicles:
            self.role = "multi"
        elif self.can_vehicles:
            self.role = "vehicle_agent"
        else:
            self.role = "operator"
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
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserOut] = None
    sections: List[SectionOut] = []

    model_config = {"from_attributes": True}


class TrailerListItem(BaseModel):
    id: UUID
    plate: Optional[str]
    reference: Optional[str]
    status: TrailerStatus
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserOut] = None
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
    fecha_firma_origen: Optional[date] = None
    firma_destino: Optional[str] = None
    nombre_firma_destino: Optional[str] = None
    fecha_firma_destino: Optional[date] = None


class VehicleDamageUpdate(BaseModel):
    damage_type: Optional[str] = None
    description: Optional[str] = None


class UserUpdate(BaseModel):
    is_admin: Optional[bool] = None
    can_trailers: Optional[bool] = None
    can_vehicles: Optional[bool] = None


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
    mercancias_fotos: Optional[list] = []
    firma_origen: Optional[str]
    nombre_firma_origen: Optional[str]
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
    created_at: datetime
    updated_at: Optional[datetime]
    damages: List[VehicleDamageOut] = []

    model_config = {"from_attributes": True}


class VehicleInspectionListItem(BaseModel):
    id: UUID
    folio: Optional[str]
    vehicle_type: VehicleType
    status: InspectionStatus
    fecha: Optional[date]
    city: Optional[str]
    nombre: Optional[str]
    nombre_entrega: Optional[str]
    mercancias_descripcion: Optional[str]
    year: Optional[int]
    make: Optional[str]
    model: Optional[str]
    color: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# Share links
class SharedLinkCreate(BaseModel):
    inspection_id: UUID
    label: str
    expires_hours: Optional[int] = None  # None = never expires


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

    model_config = {"from_attributes": True}
