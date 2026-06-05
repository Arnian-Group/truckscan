from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .models import UserRole, TrailerStatus, SectionStatus


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
    role: UserRole = UserRole.operator


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


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


# Section
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
