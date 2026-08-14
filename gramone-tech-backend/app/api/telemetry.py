from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.telemetry import (
    WaterTelemetryCreate,
    BinTelemetryCreate,
    EnvironmentTelemetryCreate,
    TelemetryIngestResponse,
)
from app.schemas.attendance import (
    RfidScanCreate,
    EmergencyButtonCreate,
    RfidScanResponse,
    EmergencyButtonResponse,
)
from app.services.telemetry_service import (
    process_water_telemetry,
    process_bin_telemetry,
    process_environment_telemetry,
    process_rfid_scan,
    process_emergency_button,
)

router = APIRouter(prefix="/telemetry", tags=["Telemetry Ingestion"])


@router.post(
    "/water",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Water Tank Telemetry",
    description="Ingest telemetry for water tanks. Automatically evaluates alert thresholds (water < 20 -> CRITICAL, 20-40 -> WARNING).",
)
def ingest_water_telemetry(
    payload: WaterTelemetryCreate, db: Session = Depends(get_db)
) -> Any:
    telemetry, alerts = process_water_telemetry(db, payload)
    return TelemetryIngestResponse(
        status="success",
        message=f"Water telemetry ingested successfully for device '{payload.device_code}'",
        telemetry_id=telemetry.id,
        alerts_generated=len(alerts),
    )


@router.post(
    "/bin",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Smart Bin Telemetry",
    description="Ingest telemetry for smart waste bins. Automatically evaluates alert thresholds (fill_level > 85 -> CRITICAL).",
)
def ingest_bin_telemetry(
    payload: BinTelemetryCreate, db: Session = Depends(get_db)
) -> Any:
    telemetry, alerts = process_bin_telemetry(db, payload)
    return TelemetryIngestResponse(
        status="success",
        message=f"Bin telemetry ingested successfully for device '{payload.device_code}'",
        telemetry_id=telemetry.id,
        alerts_generated=len(alerts),
    )


@router.post(
    "/environment",
    response_model=TelemetryIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Environmental Sensor Telemetry",
    description="Ingest telemetry for environmental sensors. Automatically evaluates alert thresholds (temperature > 40 -> WARNING, humidity > 85 -> WARNING).",
)
def ingest_environment_telemetry(
    payload: EnvironmentTelemetryCreate, db: Session = Depends(get_db)
) -> Any:
    telemetry, alerts = process_environment_telemetry(db, payload)
    return TelemetryIngestResponse(
        status="success",
        message=f"Environment telemetry ingested successfully for device '{payload.device_code}'",
        telemetry_id=telemetry.id,
        alerts_generated=len(alerts),
    )


@router.post(
    "/rfid-scan",
    response_model=RfidScanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record RFID Card Scan Event",
    description="Record an RFID attendance scan event from the RFID node.",
)
def record_rfid_scan(
    payload: RfidScanCreate, db: Session = Depends(get_db)
) -> Any:
    event = process_rfid_scan(db, payload)
    return RfidScanResponse(
        status="success",
        message=f"Attendance scan logged for card '{payload.card_uid}'",
        event_id=event.id,
    )


@router.post(
    "/emergency",
    response_model=EmergencyButtonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger Emergency Panic Button Alert",
    description="Trigger an immediate CRITICAL emergency panic button alert from the emergency node.",
)
def trigger_emergency_alert(
    payload: EmergencyButtonCreate, db: Session = Depends(get_db)
) -> Any:
    alert = process_emergency_button(db, payload)
    return EmergencyButtonResponse(
        status="success",
        message=f"Emergency panic button alert created for device '{payload.device_code}'",
        alert_id=alert.id,
    )
