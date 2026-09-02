import enum
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class TransactionStatus(str, enum.Enum):
    PENDING = "Pending"
    PROCESSING = "Processing"
    SUCCESS = "Success"
    FAILED = "Failed"
    CANCELLED = "Cancelled"
    REFUNDED = "Refunded"
    CHARGEBACK = "Chargeback"


class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    CREDIT_CARD = "Credit Card"
    DEBIT_CARD = "Debit Card"
    NET_BANKING = "Net Banking"
    WALLET = "Wallet"
    EMI = "EMI"


class TransactionType(str, enum.Enum):
    PAYMENT = "Payment"
    REFUND = "Refund"
    SETTLEMENT = "Settlement"
    PAYOUT = "Payout"


class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    customer_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    device_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("devices.id", ondelete="SET NULL"), nullable=True, index=True
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method_enum"), nullable=False
    )
    card_network: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    card_bin: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    tax: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    net_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus, name="transaction_status_enum"), default=TransactionStatus.PENDING, nullable=False, index=True
    )
    transaction_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type_enum"), default=TransactionType.PAYMENT, nullable=False
    )

    country: Mapped[str] = mapped_column(String(100), nullable=False, default="United States")
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    device_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    operating_system: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    browser: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    reference_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    gateway_response: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    merchant = relationship("Merchant", back_populates="transactions")
    customer_profile = relationship("Customer", back_populates="transactions")
    device_profile = relationship("Device", back_populates="transactions")
