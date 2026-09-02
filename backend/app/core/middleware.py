import logging
import time
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import BaseAPIException
from app.core.response import error_response

logger = logging.getLogger("riskshield.access")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware logging request method, URL path, response status, and latency.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        response = await call_next(request)

        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"Method={request.method} Path={request.url.path} Status={response.status_code} Duration={process_time_ms}ms IP={client_ip}"
        )
        response.headers["X-Process-Time"] = f"{process_time_ms}ms"
        return response


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler mapping all exceptions to standardized APIResponse format.
    """
    if isinstance(exc, BaseAPIException):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(
                message=exc.message,
                error_details=exc.details,
            ).model_dump(mode="json"),
        )

    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=error_response(
            message="Internal server error",
            error_details={"type": exc.__class__.__name__},
        ).model_dump(mode="json"),
    )


class RateLimiterHook:
    """
    Rate limiting hook interface for auth routes.
    """

    @staticmethod
    async def check_rate_limit(request: Request, key_prefix: str, limit: int = 100, window_seconds: int = 60):
        # Redis-backed rate limiter hook placeholder
        pass
