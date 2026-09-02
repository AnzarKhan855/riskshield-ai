import enum
import uuid
from typing import Any, Dict, Optional
from sqlalchemy import Boolean, Enum, Float, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class ModelType(str, enum.Enum):
    FRAUD_DETECTION = "Fraud Detection"
    CHARGEBACK_PREDICTION = "Chargeback Prediction"
    MERCHANT_RISK = "Merchant Risk"
    CUSTOMER_RISK = "Customer Risk"
    DEVICE_RISK = "Device Risk"
    BEHAVIOUR_ANALYSIS = "Behaviour Analysis"


class ModelFramework(str, enum.Enum):
    JOBLIB = "Joblib"
    ONNX = "ONNX"
    TENSORFLOW = "TensorFlow"
    PYTORCH = "PyTorch"
    XGBOOST = "XGBoost"
    LIGHTGBM = "LightGBM"


class ModelStatus(str, enum.Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    ARCHIVED = "Archived"


class ModelRegistry(Base, TimestampMixin):
    __tablename__ = "model_registries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    model_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    model_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    model_type: Mapped[ModelType] = mapped_column(
        Enum(ModelType, name="model_type_enum"), nullable=False, index=True
    )
    business_domain: Mapped[str] = mapped_column(String(100), default="Fraud & Risk", nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="v1.0.0", nullable=False)
    framework: Mapped[ModelFramework] = mapped_column(
        Enum(ModelFramework, name="model_framework_enum"), default=ModelFramework.XGBOOST, nullable=False
    )
    algorithm: Mapped[str] = mapped_column(String(100), default="XGBoost Classifier", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    model_status: Mapped[ModelStatus] = mapped_column(
        Enum(ModelStatus, name="model_status_enum"), default=ModelStatus.ACTIVE, nullable=False
    )
    production_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    training_dataset_version: Mapped[str] = mapped_column(String(50), default="ds_v1.0", nullable=False)
    feature_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    input_schema_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    output_schema_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)

    # Metrics
    accuracy: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    precision: Mapped[float] = mapped_column(Float, default=0.94, nullable=False)
    recall: Mapped[float] = mapped_column(Float, default=0.92, nullable=False)
    f1_score: Mapped[float] = mapped_column(Float, default=0.93, nullable=False)
    roc_auc: Mapped[float] = mapped_column(Float, default=0.97, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, default=12.5, nullable=False)

    owner: Mapped[str] = mapped_column(String(100), default="ML Ops Team", nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    predictions = relationship("PredictionHistory", back_populates="model")
