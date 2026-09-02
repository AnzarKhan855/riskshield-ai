import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    merchant_id: uuid.UUID = Field(..., description="Target Merchant UUID")
    full_name: str = Field(..., min_length=2, max_length=255, example="Sarah Connor")
    email: EmailStr = Field(..., example="sarah.connor@cyberdyne.com")
    phone: Optional[str] = Field(None, max_length=50, example="+14155550199")
    country: str = Field(default="United States", max_length=100)
    state: Optional[str] = Field(None, max_length=100, example="California")
    city: Optional[str] = Field(None, max_length=100, example="Los Angeles")
    preferred_payment_method: Optional[str] = Field(None, max_length=50, example="Credit Card")
    risk_flags: List[str] = Field(default_factory=list, example=["HIGH_VELOCITY", "MULTIPLE_CARDS"])


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    preferred_payment_method: Optional[str] = Field(None, max_length=50)
    risk_flags: Optional[List[str]] = None


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_id: str
    customer_since: datetime
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    chargebacks: int
    refunds: int
    lifetime_value: float
    average_transaction_value: float
    highest_transaction_value: float
    last_transaction_date: Optional[datetime] = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class PaginatedCustomerResponse(BaseModel):
    items: List[CustomerResponse]
    total: int
    page: int
    size: int
    pages: int
