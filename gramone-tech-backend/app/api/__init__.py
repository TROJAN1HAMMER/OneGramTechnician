from app.api.auth import router as auth_router
from app.api.telemetry import router as telemetry_router
from app.api.technician import router as technician_router
from app.api.health import router as health_router

__all__ = [
    "auth_router",
    "telemetry_router",
    "technician_router",
    "health_router",
]
