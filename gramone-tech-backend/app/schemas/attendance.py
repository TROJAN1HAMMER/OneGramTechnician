from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RfidScanCreate(BaseModel):
    device_code: str = Field(..., json_schema_extra={"example": "RFID-001"})
    card_uid: str = Field(..., json_schema_extra={"example": "AB12CD34"})


class EmergencyButtonCreate(BaseModel):
    device_code: str = Field(..., json_schema_extra={"example": "RFID-001"})
    emergency_pressed: bool = Field(default=True, json_schema_extra={"example": True})


class RfidScanResponse(BaseModel):
    status: str = "success"
    message: str
    event_id: int


class EmergencyButtonResponse(BaseModel):
    status: str = "success"
    message: str
    alert_id: int


class AttendanceEventRead(BaseModel):
    id: int
    device_id: int
    card_uid: str
    scanned_at: datetime
    device_code: Optional[str] = None

    class Config:
        from_attributes = True
