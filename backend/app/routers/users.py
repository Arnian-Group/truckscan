import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import User, UserRole, ChecklistAssetTypeGrant
from ..auth import get_current_user, require_admin, hash_password
from ..schemas import UserCreate, UserOut, UserUpdate
from ..audit import log_action

router = APIRouter()


def _sync_checklist_grants(db: Session, user: User, asset_types: list, granted_by) -> None:
    """Replaces a user's full set of checklist asset-type grants with `asset_types`."""
    db.query(ChecklistAssetTypeGrant).filter(ChecklistAssetTypeGrant.user_id == user.id).delete()
    for asset_type in dict.fromkeys(asset_types):  # de-dupe, preserve order
        db.add(ChecklistAssetTypeGrant(
            id=uuid.uuid4(), user_id=user.id, asset_type=asset_type, granted_by=granted_by,
        ))


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return (
        db.query(User)
        .options(joinedload(User.checklist_access))
        .filter(User.is_active == True)
        .order_by(User.created_at)
        .all()
    )


@router.post("", response_model=UserOut, status_code=201)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == body.email, User.is_active == True).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    legacy_role = UserRole.admin if body.is_admin else UserRole.operator

    # Reactivate archived user if email already exists (unique constraint)
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        existing.name = body.name
        existing.hashed_password = hash_password(body.password)
        existing.role = legacy_role
        existing.is_admin = body.is_admin
        existing.can_trailers = body.can_trailers
        existing.can_vehicles = body.can_vehicles
        existing.can_checklists = body.can_checklists
        existing.is_active = True
        _sync_checklist_grants(db, existing, body.checklist_asset_types, current_user.id)
        db.commit()
        db.refresh(existing)
        log_action(db, current_user.id, "user_reactivated", "user", str(existing.id),
                   {"email": body.email, "is_admin": body.is_admin})
        return existing

    user = User(
        id=uuid.uuid4(),
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=legacy_role,
        is_admin=body.is_admin,
        can_trailers=body.can_trailers,
        can_vehicles=body.can_vehicles,
        can_checklists=body.can_checklists,
        is_active=True,
    )
    db.add(user)
    db.flush()
    _sync_checklist_grants(db, user, body.checklist_asset_types, current_user.id)
    db.commit()
    db.refresh(user)
    log_action(
        db,
        current_user.id,
        "user_created",
        "user",
        str(user.id),
        {
            "email": body.email,
            "is_admin": body.is_admin,
            "can_trailers": body.can_trailers,
            "can_vehicles": body.can_vehicles,
            "can_checklists": body.can_checklists,
            "checklist_asset_types": body.checklist_asset_types,
        },
    )
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user.is_admin or user.role == UserRole.admin:
        admin_count = db.query(User).filter(
            User.is_admin == True, User.is_active == True
        ).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="No puedes eliminar el único administrador activo")

    user.is_active = False
    db.commit()
    log_action(db, current_user.id, "user_deleted", "user", str(user_id), {"email": user.email})


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes modificar tu propio rol")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Prevent removing last admin
    if body.is_admin is False and user.is_admin:
        admin_count = db.query(User).filter(User.is_admin == True, User.is_active == True).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="No puedes quitar el admin del único administrador activo")

    if body.is_admin is not None:
        user.is_admin = body.is_admin
        user.role = UserRole.admin if body.is_admin else UserRole.operator
        if body.is_admin:
            user.can_trailers = True
            user.can_vehicles = True
            user.can_checklists = True

    if body.can_trailers is not None and not user.is_admin:
        user.can_trailers = body.can_trailers

    if body.can_vehicles is not None and not user.is_admin:
        user.can_vehicles = body.can_vehicles

    if body.can_checklists is not None and not user.is_admin:
        user.can_checklists = body.can_checklists

    if body.checklist_asset_types is not None and not user.is_admin:
        _sync_checklist_grants(db, user, body.checklist_asset_types, current_user.id)

    db.commit()
    db.refresh(user)
    log_action(db, current_user.id, "user_updated", "user", str(user_id), {
        "is_admin": user.is_admin,
        "can_trailers": user.can_trailers,
        "can_vehicles": user.can_vehicles,
        "can_checklists": user.can_checklists,
        "checklist_asset_types": user.checklist_asset_types,
    })
    return user
