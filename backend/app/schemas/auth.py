from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., min_length=1, example="SecurePassword123!")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT Refresh Token")


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT Refresh Token to revoke")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password Reset Token")
    new_password: str = Field(..., min_length=8, max_length=100, example="NewSecurePassword123!")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
