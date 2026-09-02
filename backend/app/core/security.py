import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
import bcrypt
from app.core.config import settings


def _truncate_password(password: str) -> str:
    """Bcrypt limits raw passwords to 72 bytes maximum."""
    return password.encode("utf-8")[:72].decode("utf-8", errors="ignore")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    try:
        truncated = _truncate_password(plain_password)
        return bcrypt.checkpw(truncated.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate password hash from plain string."""
    truncated = _truncate_password(password)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(truncated.encode("utf-8"), salt).decode("utf-8")


def create_access_token(
    subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT Access Token payload containing subject and role."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.EFFECTIVE_SECRET_KEY, algorithm=settings.EFFECTIVE_ALGORITHM)


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT Refresh Token payload with unique JTI nonce."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.EFFECTIVE_SECRET_KEY, algorithm=settings.EFFECTIVE_ALGORITHM)


def create_password_reset_token(email: str) -> str:
    """Create short-lived token for password reset."""
    expire = datetime.now(timezone.utc) + timedelta(
        hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS
    )
    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": email,
        "type": "reset",
        "jti": str(uuid.uuid4()),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.EFFECTIVE_SECRET_KEY, algorithm=settings.EFFECTIVE_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token signature."""
    try:
        return jwt.decode(
            token, settings.EFFECTIVE_SECRET_KEY, algorithms=[settings.EFFECTIVE_ALGORITHM]
        )
    except jwt.PyJWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")


def hash_token(token: str) -> str:
    """Compute SHA-256 hash of token for secure DB indexing/lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
