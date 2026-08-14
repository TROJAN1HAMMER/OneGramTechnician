from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Index, func, desc
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)  # 'WARNING', 'CRITICAL'
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    acknowledged_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    device: Mapped["Device"] = relationship("Device", back_populates="alerts")
    acknowledged_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[acknowledged_by]
    )
    resolved_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[resolved_by]
    )

    __table_args__ = (
        Index("ix_alerts_status_created_at", "status", desc("created_at")),
    )
