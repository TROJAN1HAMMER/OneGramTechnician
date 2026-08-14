from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertRead(BaseModel):
    id: int
    device_id: int
    device_code: Optional[str] = None
    location_name: Optional[str] = None
    alert_type: str
    severity: str
    message: str
    status: str
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    acknowledged_by: Optional[int] = None
    resolved_by: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertActionResponse(BaseModel):
    status: str = "success"
    message: str
    alert: AlertRead
