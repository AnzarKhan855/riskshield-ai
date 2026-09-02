import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, example="John")
    last_name: str = Field(..., min_length=1, max_length=100, example="Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    phone: Optional[str] = Field(None, max_length=50, example="+1234567890")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100, example="SecurePassword123!")
    role: UserRole = Field(default=UserRole.MERCHANT, example=UserRole.MERCHANT)

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v):
        if isinstance(v, str):
            v_upper = v.strip().upper()
            for r in UserRole:
                if r.name == v_upper or r.value.upper() == v_upper:
                    return r
        return v


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: UserRole
    status: UserStatus
    email_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
