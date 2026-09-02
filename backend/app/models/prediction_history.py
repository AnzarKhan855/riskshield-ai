import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class PredictionHistory(Base, TimestampMixin):
    __tablename__ = "prediction_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    prediction_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    model_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("model_registries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    feature_vector_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)

    prediction_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    inference_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    prediction_result: Mapped[str] = mapped_column(String(50), nullable=False)  # ALLOW, FLAG, BLOCK
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    decision_status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False)

    feature_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    model_version: Mapped[str] = mapped_column(String(20), default="v1.0.0", nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    raw_output_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    audit_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    model = relationship("ModelRegistry", back_populates="predictions")
