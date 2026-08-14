from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DeviceRead(BaseModel):
    id: int
    device_code: str
    device_type: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummaryResponse(BaseModel):
    online_devices: int
    offline_devices: int
    active_alerts: int
    last_sync: Optional[datetime] = None
