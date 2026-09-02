# RiskShield AI Enterprise Decision Platform Server
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import BaseAPIException
from app.core.logging import setup_logging
from app.middleware.correlation import CorrelationIdMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security import SecurityHeadersMiddleware

# 1. Setup Structured JSON Logging
setup_logging(log_level="INFO")
logger = logging.getLogger("riskshield.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Production application lifecycle manager."""
    logger.info("Initializing RiskShield AI Production Platform...")
    try:
        from app.models import Base
        from app.core.database import engine
        if engine:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema synchronized successfully.")
            from app.db.init_seed import seed_database_if_empty
            await seed_database_if_empty()
    except Exception as e:
        logger.warning(f"Database schema auto-sync / seed warning: {e}")
    yield
    logger.info("Graceful shutdown completed for RiskShield AI Platform.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# 2. Register Middleware Stack
# Note: FastAPI executes middlewares in REVERSE order of app.add_middleware()
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=500, window_seconds=60)

# CORS middleware is added so it executes outer-most for browser preflights
cors_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "Authorization"],
)


# 3. Global Exception Handlers
@app.exception_handler(BaseAPIException)
async def api_exception_handler(request: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "InternalServerError",
                "message": "An unexpected internal server error occurred.",
                "details": str(exc) if settings.ENVIRONMENT != "production" else None,
            },
        },
    )


# 4. Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, workers=4)
