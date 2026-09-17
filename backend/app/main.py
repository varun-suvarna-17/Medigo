from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models.facility import Facility
from app.models.medicine import Medicine
from app.models.request import Request
from app.api import routes_facility, routes_supplier, routes_shortage

# Create database tables on startup
Base.metadata.create_all(bind=engine)

# Ensure columns added after initial table creation exist in SQLite
with engine.connect() as conn:
    try:
        from sqlalchemy import text
        conn.execute(text("ALTER TABLE requests ADD COLUMN current_stock FLOAT DEFAULT 0.0"))
        conn.commit()
    except Exception:
        pass  # Column already exists
    try:
        from sqlalchemy import text
        conn.execute(text("ALTER TABLE requests ADD COLUMN reason TEXT"))
        conn.commit()
    except Exception:
        pass  # Column already exists

app = FastAPI(title="Medicine Shortage Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_facility.router, prefix="/facility", tags=["Facility"])
app.include_router(routes_supplier.router, prefix="/supplier", tags=["Supplier"])
app.include_router(routes_shortage.router, prefix="/shortage", tags=["Shortage"])


@app.get("/")
def health_check():
    return {"status": "ok"}
