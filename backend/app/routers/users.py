import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user, require_admin, hash_password
from ..schemas import UserCreate, UserOut
from ..audit import log_action

router = APIRouter()


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=uuid.uuid4(),
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role,
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
        {"email": body.email, "role": body.role},
    )
    return user
