import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DeviceBase(BaseModel):
    device_type: str = Field(default="Desktop", max_length=50, example="Mobile")
    operating_system: str = Field(default="Windows", max_length=50, example="iOS 17.4")
    browser: str = Field(default="Chrome", max_length=50, example="Safari")
    ip_address: str = Field(..., max_length=50, example="192.168.1.100")
    country: str = Field(default="United States", max_length=100)
    state: Optional[str] = Field(None, max_length=100, example="New York")
    city: Optional[str] = Field(None, max_length=100, example="New York")
    timezone: Optional[str] = Field(None, max_length=50, example="America/New_York")
    latitude: Optional[float] = Field(None, example=40.7128)
    longitude: Optional[float] = Field(None, example=-74.0060)
    vpn_detected: bool = Field(default=False)
    rooted_device: bool = Field(default=False)
    jailbroken: bool = Field(default=False)
    emulator: bool = Field(default=False)
    risk_flags: List[str] = Field(default_factory=list, example=["VPN_ACTIVE", "SUSPICIOUS_IP"])


class DeviceCreate(DeviceBase):
    device_fingerprint: Optional[str] = Field(
        None, description="Optional fingerprint override. Generated automatically if omitted."
    )


class DeviceUpdate(BaseModel):
    device_type: Optional[str] = Field(None, max_length=50)
    operating_system: Optional[str] = Field(None, max_length=50)
    browser: Optional[str] = Field(None, max_length=50)
    ip_address: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    vpn_detected: Optional[bool] = None
    rooted_device: Optional[bool] = None
    jailbroken: Optional[bool] = None
    emulator: Optional[bool] = None
    risk_flags: Optional[List[str]] = None


class DeviceResponse(DeviceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    device_fingerprint: str
    first_seen: datetime
    last_seen: datetime
    transaction_count: int
    failed_attempts: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class PaginatedDeviceResponse(BaseModel):
    items: List[DeviceResponse]
    total: int
    page: int
    size: int
    pages: int
