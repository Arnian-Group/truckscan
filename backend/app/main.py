import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import engine, SessionLocal, Base
from .models import (
    User, Trailer, Section, UserRole, TrailerStatus, SectionStatus, SharedLink,
    ChecklistAssetTypeGrant,
)
from .auth import hash_password
from .config import settings
from .routers import auth, trailers, sections, users, audit, vehicles, uploads, shared, checklists
from .routers.vehicles import _prefetch_logo
from .routers.checklists import seed_checklist_templates


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
            "can_checklists": True,
            "checklist_asset_types": [],  # admins bypass per-type grants entirely
        },
        {
            "name": "Operator",
            "email": "ops@arnian.com",
            "password": "Ops1234!",
            "role": UserRole.operator,
            "is_admin": False,
            "can_trailers": True,
            "can_vehicles": False,
            "can_checklists": False,
            "checklist_asset_types": [],
        },
        {
            "name": "Vehicles Agent",
            "email": "vehicles@arnian.com",
            "password": "Vehicles1234!",
            "role": UserRole.operator,
            "is_admin": False,
            "can_trailers": False,
            "can_vehicles": True,
            "can_checklists": False,
            "checklist_asset_types": [],
        },
        {
            "name": "Checklists Agent",
            "email": "checklists@arnian.com",
            "password": "Checklists1234!",
            "role": UserRole.operator,
            "is_admin": False,
            "can_trailers": False,
            "can_vehicles": False,
            "can_checklists": True,
            "checklist_asset_types": ["forklift", "utility_vehicle"],
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
                can_checklists=s["can_checklists"],
                is_active=True,
            )
            db.add(user)
            db.flush()
            for asset_type in s["checklist_asset_types"]:
                db.add(ChecklistAssetTypeGrant(id=uuid.uuid4(), user_id=user.id, asset_type=asset_type))
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
        # Checklist module: module-level gate flag. Per-asset-type access is a dynamic
        # grant (checklist_asset_type_grants table, created by create_all() below), not
        # a fixed column, so a new checklist type never needs an ALTER TABLE here.
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS can_checklists BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        # Admin invariant — always safe to re-run (an admin always has every module
        # flag set, regardless of how they were promoted). NOT a one-time backfill.
        conn.execute(text(
            "UPDATE users SET is_admin=TRUE, can_trailers=TRUE, can_vehicles=TRUE, can_checklists=TRUE "
            "WHERE role='admin' AND is_admin=FALSE"
        ))
        # NOTE: a one-time "UPDATE users SET can_trailers=TRUE WHERE role='operator'
        # AND can_trailers=FALSE" backfill used to live here, for pre-v2 users whose
        # legacy `role` column was 'operator'. It shipped as an unconditional startup
        # statement instead of a true one-time migration, so it kept re-running on
        # every restart — silently re-granting can_trailers to any later-created
        # vehicle-only or checklist-only user too, since routers/users.py always
        # stores legacy role='operator' for every non-admin user regardless of which
        # module flags they actually have. Removed: the original backfill already
        # took effect during the many restarts since v2 shipped, and leaving it in
        # only kept breaking new non-trailers operator-role users going forward.
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS "
            "is_deleted BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS firma_hash_origen VARCHAR(64)"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS firma_hash_destino VARCHAR(64)"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS notas_finales TEXT"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS folio VARCHAR(20)"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS mercancias_descripcion TEXT"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS nombre_entrega VARCHAR(255)"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS mercancias_fotos JSON"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS entry_number VARCHAR(10)"
        ))
        conn.execute(text(
            "ALTER TYPE vehicletype ADD VALUE IF NOT EXISTS 'mercancias'"
        ))
        # Signer role (transportista / cliente_final) for the origin signature
        conn.execute(text(
            "DO $$ BEGIN "
            "CREATE TYPE signerrole AS ENUM ('transportista', 'cliente_final'); "
            "EXCEPTION WHEN duplicate_object THEN null; END $$;"
        ))
        conn.execute(text(
            "ALTER TABLE vehicle_inspections ADD COLUMN IF NOT EXISTS rol_firma_origen signerrole"
        ))
        conn.commit()
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOADS_DIR, "pdfs"), exist_ok=True)
    _prefetch_logo()
    db = SessionLocal()
    try:
        seed_db(db)
        seed_checklist_templates(db)
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
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(shared.router, prefix="/shared", tags=["shared"])
app.include_router(checklists.router, prefix="/checklists", tags=["checklists"])


@app.get("/health")
def health():
    return {"status": "ok"}
