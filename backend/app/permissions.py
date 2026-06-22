from fastapi import HTTPException
from sqlalchemy.orm import Session
from .models import User, VehicleInspection, Trailer, InspectionEditor, TrailerEditor

EDIT_DENIED_DETAIL = "Solo el creador, un editor invitado o un administrador puede editar este documento"
MANAGE_DENIED_DETAIL = "Solo el creador o un administrador puede gestionar los editores de este documento"


def assert_can_edit_inspection(db: Session, user: User, insp: VehicleInspection) -> None:
    if user.is_admin:
        return
    if insp.created_by and str(insp.created_by) == str(user.id):
        return
    is_editor = db.query(InspectionEditor.id).filter(
        InspectionEditor.inspection_id == insp.id,
        InspectionEditor.user_id == user.id,
    ).first()
    if is_editor:
        return
    raise HTTPException(status_code=403, detail=EDIT_DENIED_DETAIL)


def assert_can_manage_inspection_editors(user: User, insp: VehicleInspection) -> None:
    if user.is_admin:
        return
    if insp.created_by and str(insp.created_by) == str(user.id):
        return
    raise HTTPException(status_code=403, detail=MANAGE_DENIED_DETAIL)


def assert_can_edit_trailer(db: Session, user: User, trailer: Trailer) -> None:
    if user.is_admin:
        return
    if trailer.created_by and str(trailer.created_by) == str(user.id):
        return
    is_editor = db.query(TrailerEditor.id).filter(
        TrailerEditor.trailer_id == trailer.id,
        TrailerEditor.user_id == user.id,
    ).first()
    if is_editor:
        return
    raise HTTPException(status_code=403, detail=EDIT_DENIED_DETAIL)


def assert_can_manage_trailer_editors(user: User, trailer: Trailer) -> None:
    if user.is_admin:
        return
    if trailer.created_by and str(trailer.created_by) == str(user.id):
        return
    raise HTTPException(status_code=403, detail=MANAGE_DENIED_DETAIL)
