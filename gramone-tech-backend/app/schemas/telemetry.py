from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class WaterTelemetryCreate(BaseModel):
    device_code: str = Field(..., json_schema_extra={"example": "WATER-001"})
    water_level: float = Field(..., ge=0, le=100, json_schema_extra={"example": 18.5})
    battery_level: Optional[float] = Field(default=None, ge=0, le=100, json_schema_extra={"example": 95.0})


class BinTelemetryCreate(BaseModel):
    device_code: str = Field(..., json_schema_extra={"example": "BIN-001"})
    fill_level: float = Field(..., ge=0, le=100, json_schema_extra={"example": 92.0})
    battery_level: Optional[float] = Field(default=None, ge=0, le=100, json_schema_extra={"example": 88.0})


class EnvironmentTelemetryCreate(BaseModel):
    device_code: str = Field(..., json_schema_extra={"example": "ENV-001"})
    temperature: float = Field(..., ge=-20, le=80, json_schema_extra={"example": 42.0})
    humidity: float = Field(..., ge=0, le=100, json_schema_extra={"example": 88.0})
    battery_level: Optional[float] = Field(default=None, ge=0, le=100, json_schema_extra={"example": 90.0})


class TelemetryRead(BaseModel):
    id: int
    device_id: int
    device_code: Optional[str] = None
    water_level: Optional[float] = None
    fill_level: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    battery_level: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class TelemetryIngestResponse(BaseModel):
    status: str = "success"
    message: str
    telemetry_id: int
    alerts_generated: int = 0
