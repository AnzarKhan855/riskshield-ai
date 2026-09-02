from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class InvestigationCase(Base, TimestampMixin):
    __tablename__ = "investigation_cases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    decision_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    transaction_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    merchant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), index=True, nullable=True)
    customer_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)

    assigned_analyst_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    assigned_analyst_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    priority: Mapped[str] = mapped_column(String(20), default="HIGH", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String(30), default="OPEN", nullable=False, index=True)  # OPEN, ASSIGNED, UNDER_INVESTIGATION, PENDING_REVIEW, RESOLVED, CLOSED
    category: Mapped[str] = mapped_column(String(30), default="Fraud", nullable=False, index=True)  # Fraud, Chargeback, AML, Compliance, Identity, Merchant Abuse, Promotion Abuse
    severity: Mapped[str] = mapped_column(String(20), default="HIGH", nullable=False)

    case_title: Mapped[str] = mapped_column(String(255), nullable=False)
    case_description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    resolution: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # APPROVE, REJECT, ESCALATE, CLOSE
    resolution_notes: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    opened_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    assigned_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    case_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    evidence_items = relationship("Evidence", back_populates="case_record", cascade="all, delete-orphan")
    comments = relationship("CaseComment", back_populates="case_record", cascade="all, delete-orphan")
    timeline_activities = relationship("CaseTimeline", back_populates="case_record", cascade="all, delete-orphan")
