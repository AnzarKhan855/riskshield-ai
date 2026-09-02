import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.model_registry import ModelFramework, ModelStatus, ModelType


class ModelRegisterRequest(BaseModel):
    model_name: str = Field(..., min_length=2, max_length=100, example="XGBoost Fraud Classifier v2")
    model_type: ModelType = Field(..., example=ModelType.FRAUD_DETECTION)
    business_domain: str = Field("Fraud & Risk", max_length=100)
    version: str = Field("v1.0.0", example="v1.0.0")
    framework: ModelFramework = Field(ModelFramework.XGBOOST, example=ModelFramework.XGBOOST)
    algorithm: str = Field("XGBoost Classifier", max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    training_dataset_version: str = Field("ds_v1.0", max_length=50)
    feature_version: str = Field("v1.0", max_length=20)
    input_schema_version: str = Field("v1.0", max_length=20)
    output_schema_version: str = Field("v1.0", max_length=20)

    # Metrics
    accuracy: float = Field(0.95, ge=0.0, le=1.0)
    precision: float = Field(0.94, ge=0.0, le=1.0)
    recall: float = Field(0.92, ge=0.0, le=1.0)
    f1_score: float = Field(0.93, ge=0.0, le=1.0)
    roc_auc: float = Field(0.97, ge=0.0, le=1.0)
    latency_ms: float = Field(12.5, ge=0.0)

    owner: str = Field("ML Ops Team", max_length=100)
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ModelUpdateRequest(BaseModel):
    model_name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    model_status: Optional[ModelStatus] = None
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    roc_auc: Optional[float] = Field(None, ge=0.0, le=1.0)
    latency_ms: Optional[float] = Field(None, ge=0.0)
    metadata_json: Optional[Dict[str, Any]] = None


class ModelPromoteRequest(BaseModel):
    model_id: str = Field(..., example="MODEL-8F92A101", description="Model ID to promote to Production")


class ModelRollbackRequest(BaseModel):
    model_type: ModelType = Field(..., example=ModelType.FRAUD_DETECTION)
    target_version: str = Field(..., example="v1.0.0")


class ModelRegistryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    model_id: str
    model_name: str
    model_type: ModelType
    business_domain: str
    version: str
    framework: ModelFramework
    algorithm: str
    description: Optional[str] = None
    model_status: ModelStatus
    production_flag: bool
    training_dataset_version: str
    feature_version: str
    input_schema_version: str
    output_schema_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    latency_ms: float
    owner: str
    metadata_json: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedModelRegistryResponse(BaseModel):
    items: List[ModelRegistryResponse]
    total: int
    page: int
    size: int
    pages: int
