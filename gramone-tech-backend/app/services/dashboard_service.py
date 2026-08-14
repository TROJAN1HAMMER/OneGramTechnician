from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, select

from app.models.device import Device
from app.models.telemetry import Telemetry
from app.models.alert import Alert
from app.schemas.dashboard import DashboardSummaryResponse, DeviceRead
from app.schemas.telemetry import TelemetryRead


def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
    online_count = db.query(Device).filter(Device.status == "online").count()
    offline_count = db.query(Device).filter(Device.status == "offline").count()

    # Active alerts are PENDING or ACKNOWLEDGED
    active_alerts_count = (
        db.query(Alert).filter(Alert.status.in_(["PENDING", "ACKNOWLEDGED"])).count()
    )

    # Last sync time is the latest timestamp in Telemetry
    latest_telemetry = (
        db.query(Telemetry.timestamp).order_by(Telemetry.timestamp.desc()).first()
    )
    last_sync = latest_telemetry[0] if latest_telemetry else None

    return DashboardSummaryResponse(
        online_devices=online_count,
        offline_devices=offline_count,
        active_alerts=active_alerts_count,
        last_sync=last_sync,
    )


def get_all_devices(db: Session) -> List[DeviceRead]:
    devices = db.query(Device).order_by(Device.device_code.asc()).all()
    return [DeviceRead.model_validate(d) for d in devices]


def get_device_by_id(db: Session, device_id: int) -> Optional[DeviceRead]:
    device = db.query(Device).filter(Device.id == device_id).first()
    return DeviceRead.model_validate(device) if device else None


def get_latest_telemetry_by_type(
    db: Session, device_type: str
) -> Optional[TelemetryRead]:
    query = (
        db.query(Telemetry, Device.device_code)
        .join(Device, Telemetry.device_id == Device.id)
        .filter(Device.device_type == device_type)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not query:
        return None

    telemetry, device_code = query
    t_read = TelemetryRead.model_validate(telemetry)
    t_read.device_code = device_code
    return t_read


def get_telemetry_history_by_type(
    db: Session,
    device_type: str,
    device_code: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[TelemetryRead]:
    query = (
        db.query(Telemetry, Device.device_code)
        .join(Device, Telemetry.device_id == Device.id)
        .filter(Device.device_type == device_type)
    )

    if device_code:
        query = query.filter(Device.device_code == device_code)

    results = (
        query.order_by(Telemetry.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    history = []
    for telemetry, d_code in results:
        t_read = TelemetryRead.model_validate(telemetry)
        t_read.device_code = d_code
        history.append(t_read)

    return history


def get_rfid_history(
    db: Session,
    device_code: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Any]: # Returning Any here and casting to schema later or import schema
    from app.models.attendance_event import AttendanceEvent
    from app.schemas.attendance import AttendanceEventRead

    query = (
        db.query(AttendanceEvent, Device.device_code)
        .join(Device, AttendanceEvent.device_id == Device.id)
    )

    if device_code:
        query = query.filter(Device.device_code == device_code)

    results = (
        query.order_by(AttendanceEvent.scanned_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    history = []
    for event, d_code in results:
        e_read = AttendanceEventRead.model_validate(event)
        e_read.device_code = d_code
        history.append(e_read)

    return history
