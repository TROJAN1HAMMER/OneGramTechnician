from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Float, DateTime, ForeignKey, JSON, Index, func, desc
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    water_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fill_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temperature: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    humidity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    battery_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    raw_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    device: Mapped["Device"] = relationship("Device", back_populates="telemetry_records")

    __table_args__ = (
        Index("ix_telemetry_device_id_timestamp", "device_id", desc("timestamp")),
    )
