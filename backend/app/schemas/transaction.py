import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.transaction import PaymentMethod, TransactionStatus, TransactionType


class TransactionBase(BaseModel):
    merchant_id: uuid.UUID = Field(..., description="Target Merchant UUID")
    customer_id: Optional[str] = Field(None, max_length=100, example="CUST-99210")
    payment_method: PaymentMethod = Field(..., example=PaymentMethod.CREDIT_CARD)
    card_network: Optional[str] = Field(None, max_length=50, example="Visa")
    card_bin: Optional[str] = Field(None, max_length=20, example="411111******1111")
    currency: str = Field(default="USD", max_length=10, example="USD")
    amount: float = Field(..., gt=0, example=250.00)
    fee: float = Field(default=0.00, ge=0, example=5.00)
    tax: float = Field(default=0.00, ge=0, example=2.50)
    status: TransactionStatus = Field(default=TransactionStatus.PENDING)
    transaction_type: TransactionType = Field(default=TransactionType.PAYMENT)
    country: str = Field(default="United States", max_length=100)
    state: Optional[str] = Field(None, max_length=100, example="California")
    city: Optional[str] = Field(None, max_length=100, example="San Francisco")
    ip_address: Optional[str] = Field(None, max_length=50, example="192.168.1.1")
    device_id: Optional[str] = Field(None, max_length=100, example="DEV-IPHONE-15")
    device_type: Optional[str] = Field(None, max_length=50, example="Mobile")
    operating_system: Optional[str] = Field(None, max_length=50, example="iOS 17")
    browser: Optional[str] = Field(None, max_length=50, example="Safari")
    latitude: Optional[float] = Field(None, example=37.7749)
    longitude: Optional[float] = Field(None, example=-122.4194)
    reference_number: Optional[str] = Field(None, max_length=100, example="REF-8839210")
    gateway_response: Optional[str] = Field(None, max_length=255, example="Approved")
    failure_reason: Optional[str] = Field(None, max_length=255)

    @field_validator("payment_method", mode="before")
    @classmethod
    def normalize_payment_method(cls, v):
        if isinstance(v, str):
            v_norm = v.strip().replace("_", " ").upper()
            for m in PaymentMethod:
                if m.name == v.strip().upper() or m.value.upper() == v_norm:
                    return m
        return v

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        if isinstance(v, str):
            v_upper = v.strip().upper()
            for s in TransactionStatus:
                if s.name == v_upper or s.value.upper() == v_upper:
                    return s
        return v

    @field_validator("transaction_type", mode="before")
    @classmethod
    def normalize_txn_type(cls, v):
        if isinstance(v, str):
            v_upper = v.strip().upper()
            for t in TransactionType:
                if t.name == v_upper or t.value.upper() == v_upper:
                    return t
        return v


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    gateway_response: Optional[str] = Field(None, max_length=255)
    failure_reason: Optional[str] = Field(None, max_length=255)
    reference_number: Optional[str] = Field(None, max_length=100)


class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    transaction_id: str
    net_amount: float
    timestamp: datetime
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class PaginatedTransactionResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    size: int
    pages: int
