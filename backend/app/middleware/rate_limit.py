import time
from typing import Dict, List
from fastapi import status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding window rate limiter to protect backend APIs.
    Limits requests per client IP within a configurable time window.
    Exempts health check endpoints and CORS preflight OPTIONS requests.
    """

    def __init__(self, app, max_requests: int = 300, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests_map: Dict[str, List[float]] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.scope.get("type") == "websocket" or request.headers.get("upgrade", "").lower() == "websocket":
            return await call_next(request)

        # Exempt CORS preflight OPTIONS requests, docs, and health checks
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        if path.startswith("/api/v1/health") or path.startswith("/docs") or path.startswith("/openapi"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Clean old requests
        timestamps = self.requests_map.get(client_ip, [])
        cutoff = now - self.window_seconds
        valid_timestamps = [t for t in timestamps if t > cutoff]

        if len(valid_timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please try again later.",
                    },
                },
                headers={"Retry-After": str(self.window_seconds)},
            )

        valid_timestamps.append(now)
        self.requests_map[client_ip] = valid_timestamps
        return await call_next(request)
