from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

try:
    if "sqlite" in settings.ASYNC_DATABASE_URI:
        engine: AsyncEngine = create_async_engine(
            settings.ASYNC_DATABASE_URI,
            echo=settings.DB_ECHO,
            future=True,
        )
    else:
        # Production-optimized AsyncEngine with pool pre-ping and recycling
        engine: AsyncEngine = create_async_engine(
            settings.ASYNC_DATABASE_URI,
            echo=settings.DB_ECHO,
            future=True,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_recycle=1800,
            pool_pre_ping=True,
        )
    AsyncSessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
except BaseException:
    try:
        engine: AsyncEngine = create_async_engine(
            "sqlite+aiosqlite:///./riskshield.db",
            echo=False,
            future=True,
        )
        AsyncSessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    except BaseException:
        engine = None  # type: ignore
        AsyncSessionFactory = None  # type: ignore


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection session generator for FastAPI requests."""
    async with AsyncSessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
