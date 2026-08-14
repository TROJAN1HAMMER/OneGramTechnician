from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_technician
from app.schemas.dashboard import DashboardSummaryResponse, DeviceRead
from app.schemas.telemetry import TelemetryRead
from app.schemas.alert import AlertRead, AlertActionResponse
from app.services import dashboard_service, alert_service

router = APIRouter(prefix="/technician", tags=["Technician Operations"])


@router.get(
    "/dashboard",
    response_model=DashboardSummaryResponse,
    summary="Technician Dashboard Summary",
    description="Get aggregated metrics for active alerts, online/offline device counts, and last sync timestamp.",
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return dashboard_service.get_dashboard_summary(db)


@router.get(
    "/devices",
    response_model=List[DeviceRead],
    summary="List Registered Devices",
    description="List all IoT devices registered in the technician operations module.",
)
def get_devices(
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return dashboard_service.get_all_devices(db)


@router.get(
    "/devices/{id}",
    response_model=DeviceRead,
    summary="Get Device Details",
    description="Get detailed metadata for a single IoT device by ID.",
)
def get_device(
    id: int,
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    device = dashboard_service.get_device_by_id(db, device_id=id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {id} not found",
        )
    return device


@router.get(
    "/water/latest",
    response_model=Optional[TelemetryRead],
    summary="Get Latest Water Telemetry",
    description="Get the most recent telemetry reading from water tank sensors.",
)
def get_water_latest(
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    telemetry = dashboard_service.get_latest_telemetry_by_type(db, "water")
    if not telemetry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No water telemetry records found",
        )
    return telemetry


@router.get(
    "/water/history",
    response_model=List[TelemetryRead],
    summary="Get Historical Water Telemetry",
    description="Retrieve historical water telemetry readings with optional device code filter and pagination.",
)
def get_water_history(
    device_code: Optional[str] = Query(None, description="Filter by device code e.g. WATER-001"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return dashboard_service.get_telemetry_history_by_type(
        db, device_type="water", device_code=device_code, limit=limit, offset=offset
    )


@router.get(
    "/bin/latest",
    response_model=Optional[TelemetryRead],
    summary="Get Latest Bin Telemetry",
    description="Get the most recent telemetry reading from smart waste bins.",
)
def get_bin_latest(
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    telemetry = dashboard_service.get_latest_telemetry_by_type(db, "bin")
    if not telemetry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No bin telemetry records found",
        )
    return telemetry


@router.get(
    "/bin/history",
    response_model=List[TelemetryRead],
    summary="Get Historical Bin Telemetry",
    description="Retrieve historical smart bin telemetry readings with optional device code filter and pagination.",
)
def get_bin_history(
    device_code: Optional[str] = Query(None, description="Filter by device code e.g. BIN-001"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return dashboard_service.get_telemetry_history_by_type(
        db, device_type="bin", device_code=device_code, limit=limit, offset=offset
    )


@router.get(
    "/environment/latest",
    response_model=Optional[TelemetryRead],
    summary="Get Latest Environment Telemetry",
    description="Get the most recent telemetry reading from environmental sensors.",
)
def get_environment_latest(
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    telemetry = dashboard_service.get_latest_telemetry_by_type(db, "environment")
    if not telemetry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No environment telemetry records found",
        )
    return telemetry


@router.get(
    "/environment/history",
    response_model=List[TelemetryRead],
    summary="Get Historical Environment Telemetry",
    description="Retrieve historical environmental telemetry readings with optional device code filter and pagination.",
)
def get_environment_history(
    device_code: Optional[str] = Query(None, description="Filter by device code e.g. ENV-001"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return dashboard_service.get_telemetry_history_by_type(
        db, device_type="environment", device_code=device_code, limit=limit, offset=offset
    )


@router.get(
    "/alerts",
    response_model=List[AlertRead],
    summary="List IoT Operations Alerts",
    description="Retrieve system alerts filterable by status (PENDING, ACKNOWLEDGED, RESOLVED), severity, or device ID.",
)
def get_alerts(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PENDING, ACKNOWLEDGED, RESOLVED)"),
    severity_filter: Optional[str] = Query(None, alias="severity", description="Filter by severity (WARNING, CRITICAL)"),
    device_id_filter: Optional[int] = Query(None, alias="device_id", description="Filter by device ID"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    return alert_service.get_alerts(
        db,
        status_filter=status_filter,
        severity_filter=severity_filter,
        device_id_filter=device_id_filter,
        limit=limit,
        offset=offset,
    )


@router.patch(
    "/alerts/{id}/acknowledge",
    response_model=AlertActionResponse,
    summary="Acknowledge Alert",
    description="Update an alert's status to ACKNOWLEDGED.",
)
def acknowledge_alert(
    id: int,
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    updated_alert = alert_service.acknowledge_alert(db, alert_id=id, user_id=current_tech.id)
    return AlertActionResponse(
        status="success",
        message=f"Alert #{id} acknowledged by {current_tech.email}",
        alert=updated_alert,
    )


@router.patch(
    "/alerts/{id}/resolve",
    response_model=AlertActionResponse,
    summary="Resolve Alert",
    description="Update an alert's status to RESOLVED.",
)
def resolve_alert(
    id: int,
    db: Session = Depends(get_db),
    current_tech: User = Depends(get_current_technician),
) -> Any:
    updated_alert = alert_service.resolve_alert(db, alert_id=id, user_id=current_tech.id)
    return AlertActionResponse(
        status="success",
        message=f"Alert #{id} resolved by {current_tech.email}",
        alert=updated_alert,
    )
