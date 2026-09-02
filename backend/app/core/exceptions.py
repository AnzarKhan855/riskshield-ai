from typing import Any, Dict, Optional


class BaseAPIException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class AuthenticationException(BaseAPIException):
    def __init__(self, message: str = "Invalid credentials or unauthenticated", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=401, details=details)


class AuthorizationException(BaseAPIException):
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=403, details=details)


class NotFoundException(BaseAPIException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=404, details=details)


class ConflictException(BaseAPIException):
    def __init__(self, message: str = "Resource conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=409, details=details)


class ValidationException(BaseAPIException):
    def __init__(self, message: str = "Validation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=422, details=details)


class RateLimitException(BaseAPIException):
    def __init__(self, message: str = "Too many requests. Please try again later.", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=429, details=details)
