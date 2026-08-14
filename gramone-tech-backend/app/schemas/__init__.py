from app.schemas.user import LoginRequest, UserRead, Token
from app.schemas.telemetry import (
    WaterTelemetryCreate,
    BinTelemetryCreate,
    EnvironmentTelemetryCreate,
    TelemetryRead,
    TelemetryIngestResponse,
)
from app.schemas.alert import AlertRead, AlertActionResponse
from app.schemas.dashboard import DeviceRead, DashboardSummaryResponse
from app.schemas.attendance import (
    RfidScanCreate,
    EmergencyButtonCreate,
    RfidScanResponse,
    EmergencyButtonResponse,
)

__all__ = [
    "LoginRequest",
    "UserRead",
    "Token",
    "WaterTelemetryCreate",
    "BinTelemetryCreate",
    "EnvironmentTelemetryCreate",
    "TelemetryRead",
    "TelemetryIngestResponse",
    "AlertRead",
    "AlertActionResponse",
    "DeviceRead",
    "DashboardSummaryResponse",
    "RfidScanCreate",
    "EmergencyButtonCreate",
    "RfidScanResponse",
    "EmergencyButtonResponse",
]
