import uuid
from typing import Any, Dict
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class DecisionExecution(Base, TimestampMixin):
    __tablename__ = "decision_executions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    execution_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    decision_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("decision_rules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    execution_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    execution_result: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    evaluation_details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    decision_record = relationship("Decision", back_populates="executions")
    rule = relationship("DecisionRule", back_populates="executions")
