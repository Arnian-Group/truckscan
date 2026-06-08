import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole
from ..auth import get_current_user, require_admin, hash_password
from ..schemas import UserCreate, UserOut
from ..audit import log_action

router = APIRouter()


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).filter(User.is_active == True).order_by(User.created_at).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    legacy_role = UserRole.admin if body.is_admin else UserRole.operator
    user = User(
        id=uuid.uuid4(),
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=legacy_role,
        is_admin=body.is_admin,
        can_trailers=body.can_trailers,
        can_vehicles=body.can_vehicles,
        is_active=True,
    )
    db.add(user)
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
