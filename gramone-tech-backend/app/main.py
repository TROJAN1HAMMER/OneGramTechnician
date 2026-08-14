from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api import auth_router, telemetry_router, technician_router, health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data on startup
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dedicated FastAPI Backend for GramOne Technician IoT Operations (Water Tanks, Smart Waste Bins, Environmental Sensors, Telemetry Ingestion, and Alert Management).",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration (Strict - no wildcard origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(telemetry_router)
app.include_router(technician_router)


@app.get("/", tags=["Root"], include_in_schema=False)
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
    }
