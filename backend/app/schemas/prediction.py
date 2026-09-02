import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.model_registry import ModelType


class PredictionRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D")
    model_type: ModelType = Field(ModelType.FRAUD_DETECTION, example=ModelType.FRAUD_DETECTION)
    feature_vector_id: Optional[str] = Field(None, example="FV-99B123A4")


class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    prediction_id: str
    model_id: uuid.UUID
    transaction_id: str
    feature_vector_id: Optional[str] = None
    prediction_timestamp: datetime
    inference_time_ms: float
    prediction_result: str
    confidence_score: float
    decision_status: str
    feature_version: str
    model_version: str
    latency_ms: float
    raw_output_json: Dict[str, Any]
    audit_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedPredictionResponse(BaseModel):
    items: List[PredictionResponse]
    total: int
    page: int
    size: int
    pages: int
