from datetime import datetime, timezone, timedelta
from typing import Optional, List, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.models.device import Device
from app.models.telemetry import Telemetry
from app.models.alert import Alert
from app.schemas.telemetry import (
    WaterTelemetryCreate,
    BinTelemetryCreate,
    EnvironmentTelemetryCreate,
)


def check_and_create_alert(
    db: Session,
    device: Device,
    alert_type: str,
    severity: str,
    message: str,
) -> Optional[Alert]:
    """
    Evaluates duplicate alert prevention within 30 minutes for unresolved alerts.
    """
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=30)
    
    existing_alert = (
        db.query(Alert)
        .filter(
            Alert.device_id == device.id,
            Alert.alert_type == alert_type,
            Alert.severity == severity,
            Alert.status != "RESOLVED",
            Alert.created_at >= cutoff_time,
        )
        .first()
    )

    if existing_alert:
        return None  # Duplicate suppressed

    new_alert = Alert(
        device_id=device.id,
        alert_type=alert_type,
        severity=severity,
        message=message,
        status="PENDING",
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert


def get_or_create_device(
    db: Session, device_code: str, device_type: str
) -> Device:
    device = db.query(Device).filter(Device.device_code == device_code).first()
    if not device:
        location_map = {
            "WATER-001": "Main Water Tank",
            "BIN-001": "Market Street Bin",
            "ENV-001": "School Campus Sensor",
            "RFID-001": "Coimbatore",
        }
        location_name = location_map.get(device_code, f"Location {device_code}")
        device = Device(
            device_code=device_code,
            device_type=device_type,
            location_name=location_name,
            status="online",
            last_seen_at=datetime.now(timezone.utc),
        )
        db.add(device)
        db.commit()
        db.refresh(device)
    else:
        device.status = "online"
        device.last_seen_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(device)
    return device


def process_water_telemetry(
    db: Session, payload: WaterTelemetryCreate
) -> Tuple[Telemetry, List[Alert]]:
    device = get_or_create_device(db, payload.device_code, "water")
    
    telemetry = Telemetry(
        device_id=device.id,
        water_level=payload.water_level,
        battery_level=payload.battery_level,
        raw_data=payload.model_dump(),
        timestamp=datetime.now(timezone.utc),
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)

    generated_alerts = []
    # Threshold rules for Water
    if payload.water_level < 20.0:
        alert = check_and_create_alert(
            db,
            device=device,
            alert_type="WATER_LEVEL_CRITICAL",
            severity="CRITICAL",
            message=f"Tank level critical ({payload.water_level}%) at {device.location_name}",
        )
        if alert:
            generated_alerts.append(alert)
    elif 20.0 <= payload.water_level <= 40.0:
        alert = check_and_create_alert(
            db,
            device=device,
            alert_type="WATER_LEVEL_WARNING",
            severity="WARNING",
            message=f"Tank level warning ({payload.water_level}%) at {device.location_name}",
        )
        if alert:
            generated_alerts.append(alert)

    return telemetry, generated_alerts


def process_bin_telemetry(
    db: Session, payload: BinTelemetryCreate
) -> Tuple[Telemetry, List[Alert]]:
    device = get_or_create_device(db, payload.device_code, "bin")

    telemetry = Telemetry(
        device_id=device.id,
        fill_level=payload.fill_level,
        battery_level=payload.battery_level,
        raw_data=payload.model_dump(),
        timestamp=datetime.now(timezone.utc),
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)

    generated_alerts = []
    # Threshold rules for Bin
    if payload.fill_level > 85.0:
        alert = check_and_create_alert(
            db,
            device=device,
            alert_type="BIN_OVERFLOW_CRITICAL",
            severity="CRITICAL",
            message=f"Waste bin overflow risk ({payload.fill_level}%) near {device.location_name}",
        )
        if alert:
            generated_alerts.append(alert)

    return telemetry, generated_alerts


def process_environment_telemetry(
    db: Session, payload: EnvironmentTelemetryCreate
) -> Tuple[Telemetry, List[Alert]]:
    device = get_or_create_device(db, payload.device_code, "environment")

    telemetry = Telemetry(
        device_id=device.id,
        temperature=payload.temperature,
        humidity=payload.humidity,
        battery_level=payload.battery_level,
        raw_data=payload.model_dump(),
        timestamp=datetime.now(timezone.utc),
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)

    generated_alerts = []
    # Threshold rules for Temperature
    if payload.temperature > 40.0:
        alert = check_and_create_alert(
            db,
            device=device,
            alert_type="TEMPERATURE_WARNING",
            severity="WARNING",
            message=f"High temperature detected ({payload.temperature}°C) at {device.location_name}",
        )
        if alert:
            generated_alerts.append(alert)

    # Threshold rules for Humidity
    if payload.humidity > 85.0:
        alert = check_and_create_alert(
            db,
            device=device,
            alert_type="HUMIDITY_WARNING",
            severity="WARNING",
            message=f"High humidity detected ({payload.humidity}%) at {device.location_name}",
        )
        if alert:
            generated_alerts.append(alert)

    return telemetry, generated_alerts


def process_rfid_scan(db: Session, payload: Any) -> Any:
    from app.models.attendance_event import AttendanceEvent

    device = get_or_create_device(db, payload.device_code, "rfid_button")

    event = AttendanceEvent(
        device_id=device.id,
        card_uid=payload.card_uid,
        scanned_at=datetime.now(timezone.utc),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def process_emergency_button(db: Session, payload: Any) -> Alert:
    device = get_or_create_device(db, payload.device_code, "rfid_button")

    alert = Alert(
        device_id=device.id,
        alert_type="EMERGENCY_BUTTON",
        severity="CRITICAL",
        message=f"Emergency panic button triggered at {device.location_name}",
        status="PENDING",
        created_at=datetime.now(timezone.utc),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
