from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    device_code: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    device_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'water', 'bin', 'environment'
    location_name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="offline", nullable=False)  # 'online', 'offline'
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    telemetry_records: Mapped[List["Telemetry"]] = relationship(
        "Telemetry", back_populates="device", cascade="all, delete-orphan"
    )
    alerts: Mapped[List["Alert"]] = relationship(
        "Alert", back_populates="device", cascade="all, delete-orphan"
    )
