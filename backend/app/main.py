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
from .routers import auth, trailers, sections, users, audit


def seed_db(db: Session):
    if db.query(User).filter(User.email == "admin@arnian.com").first():
        return

    admin = User(
        id=uuid.uuid4(),
        name="Admin",
        email="admin@arnian.com",
        hashed_password=hash_password("Admin1234!"),
        role=UserRole.admin,
        is_active=True,
    )
    operator = User(
        id=uuid.uuid4(),
        name="Operator",
        email="ops@arnian.com",
        hashed_password=hash_password("Ops1234!"),
        role=UserRole.operator,
        is_active=True,
    )
    db.add(admin)
    db.add(operator)
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Add new nullable columns to existing tables without breaking data
    with engine.connect() as conn:
        conn.execute(text(
            "ALTER TABLE trailers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.commit()
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
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

app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
