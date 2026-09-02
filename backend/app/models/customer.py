import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    customer_since: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    total_transactions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    successful_transactions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_transactions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chargebacks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    refunds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    lifetime_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    average_transaction_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    highest_transaction_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)

    last_transaction_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    preferred_payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    country: Mapped[str] = mapped_column(String(100), default="United States", nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    risk_flags: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    merchant = relationship("Merchant", back_populates="customers")
    transactions = relationship("Transaction", back_populates="customer_profile")
