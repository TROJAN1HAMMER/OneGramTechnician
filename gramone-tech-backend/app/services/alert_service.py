from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.alert import Alert
from app.models.device import Device
from app.schemas.alert import AlertRead


def get_alerts(
    db: Session,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    device_id_filter: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[AlertRead]:
    query = db.query(Alert, Device.device_code, Device.location_name).join(
        Device, Alert.device_id == Device.id
    )

    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity_filter:
        query = query.filter(Alert.severity == severity_filter)
    if device_id_filter:
        query = query.filter(Alert.device_id == device_id_filter)

    results = (
        query.order_by(Alert.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    alerts_read = []
    for alert, device_code, location_name in results:
        alert_dict = {
            "id": alert.id,
            "device_id": alert.device_id,
            "device_code": device_code,
            "location_name": location_name,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "message": alert.message,
            "status": alert.status,
            "acknowledged_at": alert.acknowledged_at,
            "resolved_at": alert.resolved_at,
            "acknowledged_by": alert.acknowledged_by,
            "resolved_by": alert.resolved_by,
            "created_at": alert.created_at,
        }
        alerts_read.append(AlertRead(**alert_dict))

    return alerts_read


def acknowledge_alert(db: Session, alert_id: int, user_id: int) -> AlertRead:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found",
        )

    if alert.status == "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot acknowledge a resolved alert",
        )

    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.now(timezone.utc)
    alert.acknowledged_by = user_id
    db.commit()
    db.refresh(alert)

    device = db.query(Device).filter(Device.id == alert.device_id).first()
    alert_dict = {
        "id": alert.id,
        "device_id": alert.device_id,
        "device_code": device.device_code if device else None,
        "location_name": device.location_name if device else None,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "status": alert.status,
        "acknowledged_at": alert.acknowledged_at,
        "resolved_at": alert.resolved_at,
        "acknowledged_by": alert.acknowledged_by,
        "resolved_by": alert.resolved_by,
        "created_at": alert.created_at,
    }
    return AlertRead(**alert_dict)


def resolve_alert(db: Session, alert_id: int, user_id: int) -> AlertRead:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found",
        )

    alert.status = "RESOLVED"
    alert.resolved_at = datetime.now(timezone.utc)
    alert.resolved_by = user_id
    db.commit()
    db.refresh(alert)

    device = db.query(Device).filter(Device.id == alert.device_id).first()
    alert_dict = {
        "id": alert.id,
        "device_id": alert.device_id,
        "device_code": device.device_code if device else None,
        "location_name": device.location_name if device else None,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "status": alert.status,
        "acknowledged_at": alert.acknowledged_at,
        "resolved_at": alert.resolved_at,
        "acknowledged_by": alert.acknowledged_by,
        "resolved_by": alert.resolved_by,
        "created_at": alert.created_at,
    }
    return AlertRead(**alert_dict)
