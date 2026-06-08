import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import engine, SessionLocal, Base
from .models import User, Trailer, Section, UserRole, TrailerStatus, SectionStatus
from .auth import hash_password
from .config import settings
from .routers import auth, trailers, sections, users, audit, vehicles


def seed_db(db: Session):
    seeds = [
        {
            "name": "Admin",
            "email": "admin@arnian.com",
            "password": "Admin1234!",
            "role": UserRole.admin,
            "is_admin": True,
            "can_trailers": True,
            "can_vehicles": True,
        },
        {
            "name": "Operator",
            "email": "ops@arnian.com",
            "password": "Ops1234!",
            "role": UserRole.operator,
            "is_admin": False,
            "can_trailers": True,
            "can_vehicles": False,
        },
        {
            "name": "Vehicles Agent",
            "email": "vehicles@arnian.com",
            "password": "Vehicles1234!",
            "role": UserRole.operator,
            "is_admin": False,
            "can_trailers": False,
            "can_vehicles": True,
        },
    ]
    for s in seeds:
        if not db.query(User).filter(User.email == s["email"]).first():
            user = User(
                id=uuid.uuid4(),
                name=s["name"],
                email=s["email"],
                hashed_password=hash_password(s["password"]),
                role=s["role"],
                is_admin=s["is_admin"],
                can_trailers=s["can_trailers"],
                can_vehicles=s["can_vehicles"],
                is_active=True,
            )
            db.add(user)
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        # Existing migration
        conn.execute(text(
            "ALTER TABLE trailers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        # User permission flags
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS can_trailers BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS can_vehicles BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        # Migrate existing users
        conn.execute(text(
            "UPDATE users SET is_admin=TRUE, can_trailers=TRUE, can_vehicles=TRUE "
            "WHERE role='admin' AND is_admin=FALSE"
        ))
        conn.execute(text(
            "UPDATE users SET can_trailers=TRUE "
            "WHERE role='operator' AND can_trailers=FALSE"
        ))
        conn.commit()
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOADS_DIR, "pdfs"), exist_ok=True)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield


app = FastAPI(title="TruckScan API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(trailers.router, prefix="/trailers", tags=["trailers"])
app.include_router(sections.router, prefix="/trailers", tags=["sections"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])

app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
