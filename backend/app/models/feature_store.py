import uuid
from typing import Any, Dict
from sqlalchemy import Boolean, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class FeatureStore(Base, TimestampMixin):
    __tablename__ = "feature_stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    feature_vector_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    transaction_id: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), index=True, nullable=True
    )
    customer_id: Mapped[str] = mapped_column(
        String(100), index=True, nullable=True
    )
    device_id: Mapped[str] = mapped_column(
        String(100), index=True, nullable=True
    )

    feature_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    feature_group: Mapped[str] = mapped_column(String(50), default="ALL", nullable=False)
    feature_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    feature_payload: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    prediction_ready: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
