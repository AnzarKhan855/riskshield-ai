import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that ensures every HTTP request has a unique Correlation ID.
    Reads X-Correlation-ID header if present; otherwise generates a unique UUID4.
    Injects X-Correlation-ID into the response headers.
    """

    HEADER_NAME = "X-Correlation-ID"

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.scope.get("type") == "websocket" or request.headers.get("upgrade", "").lower() == "websocket":
            return await call_next(request)
        correlation_id = request.headers.get(self.HEADER_NAME)
        if not correlation_id:
            correlation_id = f"corr-{uuid.uuid4()}"

        request.state.correlation_id = correlation_id
        response: Response = await call_next(request)
        response.headers[self.HEADER_NAME] = correlation_id
        return response
