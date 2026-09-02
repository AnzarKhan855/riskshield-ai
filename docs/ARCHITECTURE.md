# RiskShield AI Architecture Overview

RiskShield AI is an enterprise AI platform designed following Clean Architecture and Domain-Driven Design (DDD) principles.

## Core Layers

1. **Presentation Layer (`frontend/`)**: Next.js App Router, React Query for server state management, Zustand for client state, Tailwind CSS for design system.
2. **API Layer (`backend/app/api/`)**: FastAPI endpoints structured with versioning (`/api/v1/`), Request/Response validation using Pydantic schemas.
3. **Core Layer (`backend/app/core/`)**: Cross-cutting concerns including configurations, database engine, Redis connection pool, security helpers, and Celery setup.
4. **Data & Persistence Layer (`backend/app/db/`, `backend/app/models/`)**: Async SQLAlchemy 2.0 models and Alembic migration scripts.
5. **Asynchronous Execution (`backend/app/worker/`)**: Celery tasks powered by Redis for distributed task queues.
