from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Explanation(Base, TimestampMixin):
    __tablename__ = "explanations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    explanation_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    decision_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    merchant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    customer_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)

    composite_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=95.0, nullable=False)
    primary_reason: Mapped[str] = mapped_column(String(500), nullable=False)

    feature_contributions: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    model_contributions: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    rule_contributions: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    recommendations: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    audit_info: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
