import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Device(Base, TimestampMixin):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    device_fingerprint: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    device_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Desktop")
    operating_system: Mapped[str] = mapped_column(String(50), nullable=False, default="Windows")
    browser: Mapped[str] = mapped_column(String(50), nullable=False, default="Chrome")
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    country: Mapped[str] = mapped_column(String(100), default="United States", nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    vpn_detected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    rooted_device: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    jailbroken: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    emulator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    transaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    risk_flags: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    transactions = relationship("Transaction", back_populates="device_profile")
