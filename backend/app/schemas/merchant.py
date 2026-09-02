import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.merchant import (
    BusinessType,
    KYCStatus,
    MerchantStatus,
    RiskLevel,
    VerificationStatus,
)


class MerchantBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255, example="Acme Retail Solutions")
    legal_business_name: str = Field(..., min_length=2, max_length=255, example="Acme Retail Solutions Private Limited")
    business_type: BusinessType = Field(default=BusinessType.PRIVATE_LIMITED)
    industry: str = Field(..., min_length=2, max_length=100, example="E-Commerce & Retail")
    gst_number: Optional[str] = Field(None, max_length=50, example="27AAAAA0000A1Z5")
    pan_number: Optional[str] = Field(None, max_length=50, example="AAAAA0000A")
    business_email: EmailStr = Field(..., example="support@acmeretail.com")
    business_phone: str = Field(..., max_length=50, example="+18005550199")
    website: Optional[str] = Field(None, max_length=255, example="https://acmeretail.com")
    country: str = Field(default="India", max_length=100)
    state: str = Field(..., max_length=100, example="Maharashtra")
    city: str = Field(..., max_length=100, example="Mumbai")
    address: str = Field(..., max_length=255, example="101 Business Hub, BKC")
    pincode: str = Field(..., max_length=20, example="400051")


class MerchantCreate(MerchantBase):
    owner_user_id: Optional[uuid.UUID] = Field(
        None, description="Optional owner user ID. Defaults to current authenticated user if omitted."
    )
    status: MerchantStatus = Field(default=MerchantStatus.PENDING_APPROVAL)
    risk_level: RiskLevel = Field(default=RiskLevel.MEDIUM)
    verification_status: VerificationStatus = Field(default=VerificationStatus.PENDING)
    kyc_status: KYCStatus = Field(default=KYCStatus.NOT_SUBMITTED)


class MerchantUpdate(BaseModel):
    business_name: Optional[str] = Field(None, min_length=2, max_length=255)
    legal_business_name: Optional[str] = Field(None, min_length=2, max_length=255)
    business_type: Optional[BusinessType] = None
    industry: Optional[str] = Field(None, min_length=2, max_length=100)
    gst_number: Optional[str] = Field(None, max_length=50)
    pan_number: Optional[str] = Field(None, max_length=50)
    business_email: Optional[EmailStr] = None
    business_phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    pincode: Optional[str] = Field(None, max_length=20)
    status: Optional[MerchantStatus] = None
    risk_level: Optional[RiskLevel] = None
    verification_status: Optional[VerificationStatus] = None
    kyc_status: Optional[KYCStatus] = None


class MerchantResponse(MerchantBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    merchant_code: str
    owner_user_id: uuid.UUID
    status: MerchantStatus
    risk_level: RiskLevel
    verification_status: VerificationStatus
    kyc_status: KYCStatus
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class PaginatedMerchantResponse(BaseModel):
    items: List[MerchantResponse]
    total: int
    page: int
    size: int
    pages: int
