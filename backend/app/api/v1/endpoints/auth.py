from typing import Any
from fastapi import APIRouter, Depends, Request, status
from app.core.deps import get_auth_service, get_current_active_user
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthenticationService

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _get_user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "unknown")


@router.post(
    "/signup",
    response_model=APIResponse[TokenResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
)
async def signup(
    signup_data: UserCreate,
    request: Request,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    tokens = await auth_service.signup(
        signup_data=signup_data,
        ip_address=_get_client_ip(request),
        user_agent=_get_user_agent(request),
    )
    return success_response(
        data=tokens,
        message="User account created successfully",
    )


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="Authenticate user and obtain JWT tokens",
)
async def login(
    login_data: LoginRequest,
    request: Request,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    tokens = await auth_service.login(
        login_data=login_data,
        ip_address=_get_client_ip(request),
        user_agent=_get_user_agent(request),
    )
    return success_response(
        data=tokens,
        message="Authentication successful",
    )


@router.post(
    "/logout",
    response_model=APIResponse[None],
    summary="Revoke refresh token and logout",
)
async def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    await auth_service.logout(
        refresh_token=logout_data.refresh_token,
        user_id=current_user.id,
    )
    return success_response(message="Logout successful")


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    summary="Rotate refresh token and issue new token pair",
)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    request: Request,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    tokens = await auth_service.refresh_tokens(
        raw_refresh_token=refresh_data.refresh_token,
        ip_address=_get_client_ip(request),
        user_agent=_get_user_agent(request),
    )
    return success_response(
        data=tokens,
        message="Token refreshed successfully",
    )


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Retrieve current authenticated user profile",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return success_response(
        data=UserResponse.model_validate(current_user),
        message="Current user profile retrieved",
    )


@router.post(
    "/forgot-password",
    response_model=APIResponse[dict],
    summary="Request password reset token",
)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    reset_token = await auth_service.forgot_password(email=request_data.email)
    return success_response(
        data={"reset_token": reset_token},
        message="Password reset request processed",
    )


@router.post(
    "/reset-password",
    response_model=APIResponse[None],
    summary="Reset password using reset token",
)
async def reset_password(
    request_data: ResetPasswordRequest,
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    await auth_service.reset_password(req=request_data)
    return success_response(message="Password reset successfully")


@router.post(
    "/change-password",
    response_model=APIResponse[None],
    summary="Change password for current user",
)
async def change_password(
    request_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    await auth_service.change_password(user_id=current_user.id, req=request_data)
    return success_response(message="Password changed successfully")


@router.delete(
    "/account",
    response_model=APIResponse[None],
    summary="Deactivate and delete current user account",
)
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthenticationService = Depends(get_auth_service),
) -> Any:
    await auth_service.delete_account(user_id=current_user.id)
    return success_response(message="User account deleted successfully")
