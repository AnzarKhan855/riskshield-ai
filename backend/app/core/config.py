import json
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "RiskShield AI"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"

    # Direct Database Connection URL (Optional override)
    DATABASE_URL: Optional[str] = None

    # PostgreSQL Parameters
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "riskshield_user"
    POSTGRES_PASSWORD: str = "riskshield_password"
    POSTGRES_DB: str = "riskshield_db"

    # MongoDB Parameters
    MONGODB_URL: str = "mongodb://localhost:27017/riskshield"
    MONGODB_URI: Optional[str] = None

    @property
    def EFFECTIVE_MONGODB_URL(self) -> str:
        return self.MONGODB_URI or self.MONGODB_URL

    # Groq AI Parameters
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # DB Connection Pool Config
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    @property
    def ASYNC_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SYNC_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Parameters
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL_ENV: Optional[str] = None

    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_URL_ENV:
            return self.REDIS_URL_ENV
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # Celery Parameters
    CELERY_BROKER_URL_ENV: Optional[str] = None
    CELERY_RESULT_BACKEND_ENV: Optional[str] = None

    @property
    def CELERY_BROKER_URL(self) -> str:
        if self.CELERY_BROKER_URL_ENV:
            return self.CELERY_BROKER_URL_ENV
        return self.REDIS_URL

    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        if self.CELERY_RESULT_BACKEND_ENV:
            return self.CELERY_RESULT_BACKEND_ENV
        return self.REDIS_URL

    # JWT & Token Parameters
    SECRET_KEY: Optional[str] = None
    JWT_SECRET: str = "super_secret_riskshield_key_change_in_production"
    ALGORITHM: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 2

    @property
    def EFFECTIVE_SECRET_KEY(self) -> str:
        return self.SECRET_KEY or self.JWT_SECRET

    @property
    def EFFECTIVE_ALGORITHM(self) -> str:
        return self.ALGORITHM or self.JWT_ALGORITHM

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            if isinstance(v, str):
                try:
                    return json.loads(v)
                except Exception:
                    return [v]
            return v
        raise ValueError(v)


settings = Settings()
