import uuid
from typing import Optional
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class DecisionRule(Base, TimestampMixin):
    __tablename__ = "decision_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    rule_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    rule_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    rule_category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(20), default="v1.0.0", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PUBLISHED", nullable=False, index=True)

    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    expression: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # APPROVE, REVIEW, BLOCK, ESCALATE
    severity: Mapped[str] = mapped_column(String(50), default="HIGH", nullable=False)

    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_by: Mapped[str] = mapped_column(String(100), default="Risk Policy Team", nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    executions = relationship("DecisionExecution", back_populates="rule")
