from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import uuid
from app.core.config import settings
from app.core.exceptions import (
    AuthenticationException,
    ConflictException,
    NotFoundException,
    ValidationException,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserRole, UserStatus
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserResponse


class AuthenticationService:
    def __init__(
        self,
        user_repo: UserRepository,
        token_repo: TokenRepository,
        audit_repo: AuditLogRepository,
    ):
        self.user_repo = user_repo
        self.token_repo = token_repo
        self.audit_repo = audit_repo

    async def _issue_tokens(self, user: User) -> Tuple[str, str]:
        """Generate Access Token & Refresh Token pair and store refresh token in database."""
        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(subject=str(user.id))

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        await self.token_repo.create_refresh_token(
            user_id=user.id, raw_token=refresh_token, expires_at=expires_at
        )

        return access_token, refresh_token

    async def signup(
        self,
        signup_data: UserCreate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """Register a new user and return tokens."""
        existing_user = await self.user_repo.get_by_email(signup_data.email)
        if existing_user:
            raise ConflictException("A user with this email address already exists.")

        user = User(
            first_name=signup_data.first_name,
            last_name=signup_data.last_name,
            email=signup_data.email.lower().strip(),
            phone=signup_data.phone,
            password_hash=get_password_hash(signup_data.password),
            role=signup_data.role,
            status=UserStatus.ACTIVE,
            email_verified=False,
        )
        created_user = await self.user_repo.create(user)

        await self.audit_repo.log_action(
            action="AUTH_SIGNUP",
            user_id=created_user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": created_user.email, "role": created_user.role.value},
        )

        access_token, refresh_token = await self._issue_tokens(created_user)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(created_user),
        )

    async def login(
        self,
        login_data: LoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """Authenticate user with email and password."""
        user = await self.user_repo.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.password_hash):
            await self.audit_repo.log_action(
                action="AUTH_LOGIN_FAILED",
                ip_address=ip_address,
                user_agent=user_agent,
                details={"email": login_data.email},
            )
            raise AuthenticationException("Invalid email address or password.")

        if user.status != UserStatus.ACTIVE:
            raise AuthenticationException("User account is inactive or suspended.")

        updated_user = await self.user_repo.update_last_login(user.id)
        if updated_user:
            user = updated_user
        access_token, refresh_token = await self._issue_tokens(user)

        await self.audit_repo.log_action(
            action="AUTH_LOGIN_SUCCESS",
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    async def logout(self, refresh_token: str, user_id: Optional[uuid.UUID] = None) -> None:
        """Revoke refresh token on logout."""
        await self.token_repo.revoke_refresh_token(refresh_token)
        if user_id:
            await self.audit_repo.log_action(action="AUTH_LOGOUT", user_id=user_id)

    async def refresh_tokens(
        self,
        raw_refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """Rotate refresh token and issue new token pair."""
        try:
            payload = decode_token(raw_refresh_token)
            if payload.get("type") != "refresh":
                raise AuthenticationException("Invalid token type.")
            user_id = uuid.UUID(payload["sub"])
        except Exception:
            raise AuthenticationException("Invalid or expired refresh token.")

        db_token = await self.token_repo.get_valid_refresh_token(raw_refresh_token)
        if not db_token:
            # Possible token reuse attack - revoke all user tokens
            await self.token_repo.revoke_all_user_tokens(user_id)
            await self.audit_repo.log_action(
                action="AUTH_REFRESH_TOKEN_REUSE_DETECTED",
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationException("Refresh token is invalid or revoked.")

        user = await self.user_repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise AuthenticationException("User not found or inactive.")

        # Rotate tokens: Issue new pair and revoke old refresh token
        new_access_token = create_access_token(subject=str(user.id), role=user.role.value)
        new_refresh_token = create_refresh_token(subject=str(user.id))

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        await self.token_repo.create_refresh_token(
            user_id=user.id, raw_token=new_refresh_token, expires_at=expires_at
        )

        await self.token_repo.revoke_refresh_token(
            raw_refresh_token, replaced_by=new_refresh_token
        )

        await self.audit_repo.log_action(
            action="AUTH_TOKEN_REFRESH",
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user=UserResponse.model_validate(user),
        )

    async def forgot_password(self, email: str) -> str:
        """Generate a password reset token for the given email."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Silent return to prevent user enumeration
            return "If an account exists for this email, a reset token has been generated."

        reset_jwt = create_password_reset_token(user.email)
        expires_at = datetime.now(timezone.utc) + timedelta(
            hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS
        )
        await self.token_repo.create_reset_token(
            user_id=user.id, raw_token=reset_jwt, expires_at=expires_at
        )

        await self.audit_repo.log_action(
            action="AUTH_FORGOT_PASSWORD_REQUESTED", user_id=user.id
        )

        return reset_jwt

    async def reset_password(self, req: ResetPasswordRequest) -> None:
        """Reset password using a valid reset token."""
        try:
            payload = decode_token(req.token)
            if payload.get("type") != "reset":
                raise ValidationException("Invalid token type for password reset.")
        except Exception:
            raise ValidationException("Invalid or expired password reset token.")

        db_token = await self.token_repo.get_valid_reset_token(req.token)
        if not db_token:
            raise ValidationException("Password reset token is invalid, expired, or already used.")

        user = await self.user_repo.get_by_id(db_token.user_id)
        if not user:
            raise NotFoundException("User not found.")

        new_hash = get_password_hash(req.new_password)
        await self.user_repo.update(user.id, {"password_hash": new_hash})
        await self.token_repo.mark_reset_token_used(db_token.id)

        # Revoke active refresh tokens for security
        await self.token_repo.revoke_all_user_tokens(user.id)

        await self.audit_repo.log_action(
            action="AUTH_PASSWORD_RESET_SUCCESS", user_id=user.id
        )

    async def change_password(
        self, user_id: uuid.UUID, req: ChangePasswordRequest
    ) -> None:
        """Allow an authenticated user to change their password."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")

        if not verify_password(req.old_password, user.password_hash):
            raise AuthenticationException("Current password matches incorrectly.")

        new_hash = get_password_hash(req.new_password)
        await self.user_repo.update(user.id, {"password_hash": new_hash})
        await self.token_repo.revoke_all_user_tokens(user.id)

        await self.audit_repo.log_action(
            action="AUTH_PASSWORD_CHANGE_SUCCESS", user_id=user.id
        )

    async def delete_account(self, user_id: uuid.UUID) -> None:
        """Deactivate and delete user account."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")

        await self.token_repo.revoke_all_user_tokens(user.id)
        await self.user_repo.update(user.id, {"status": UserStatus.SUSPENDED, "is_deleted": True})
        await self.audit_repo.log_action(
            action="AUTH_ACCOUNT_DELETED", user_id=user.id
        )
