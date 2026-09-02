import enum
import uuid
from typing import Optional
from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class BusinessType(str, enum.Enum):
    SOLE_PROPRIETORSHIP = "Sole Proprietorship"
    PARTNERSHIP = "Partnership"
    PRIVATE_LIMITED = "Private Limited"
    PUBLIC_LIMITED = "Public Limited"
    LLC = "LLC"
    OTHER = "Other"


class MerchantStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"
    PENDING_APPROVAL = "Pending Approval"


class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "Unverified"
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"


class KYCStatus(str, enum.Enum):
    NOT_SUBMITTED = "Not Submitted"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Merchant(Base, TimestampMixin):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    legal_business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    merchant_code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    business_type: Mapped[BusinessType] = mapped_column(
        Enum(BusinessType, name="business_type_enum"), default=BusinessType.PRIVATE_LIMITED, nullable=False
    )
    industry: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    gst_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)

    business_email: Mapped[str] = mapped_column(String(255), nullable=False)
    business_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), nullable=False)

    status: Mapped[MerchantStatus] = mapped_column(
        Enum(MerchantStatus, name="merchant_status_enum"), default=MerchantStatus.PENDING_APPROVAL, nullable=False
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, name="risk_level_enum"), default=RiskLevel.MEDIUM, nullable=False
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status_enum"), default=VerificationStatus.PENDING, nullable=False
    )
    kyc_status: Mapped[KYCStatus] = mapped_column(
        Enum(KYCStatus, name="kyc_status_enum"), default=KYCStatus.NOT_SUBMITTED, nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    owner = relationship("User", back_populates="merchants")
    transactions = relationship("Transaction", back_populates="merchant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="merchant", cascade="all, delete-orphan")
