import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class CompositePrediction(Base, TimestampMixin):
    __tablename__ = "composite_predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    prediction_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    transaction_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    feature_vector_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)

    overall_risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    composite_risk_level: Mapped[str] = mapped_column(String(20), default="LOW", nullable=False)

    executed_models: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    individual_results: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    feature_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    model_versions: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)

    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
