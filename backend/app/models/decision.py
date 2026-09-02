import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Decision(Base, TimestampMixin):
    __tablename__ = "decisions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    decision_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    composite_prediction_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    transaction_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    merchant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    customer_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)

    decision: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # APPROVE, REVIEW, BLOCK, ESCALATE
    decision_status: Mapped[str] = mapped_column(String(50), default="FINAL", nullable=False)
    decision_confidence: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    composite_risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    decision_reason: Mapped[str] = mapped_column(String(255), nullable=False)

    triggered_rules: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    triggered_policies: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    decision_source: Mapped[str] = mapped_column(String(50), default="AUTOMATED_RULE_ENGINE", nullable=False)
    reviewer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    review_status: Mapped[str] = mapped_column(String(50), default="NONE", nullable=False)

    decision_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    executions = relationship("DecisionExecution", back_populates="decision_record")
