import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.model_registry import ModelType


class OrchestratorPredictRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D", description="Target Transaction ID")
    requested_model_types: Optional[List[ModelType]] = Field(
        None, description="Optional subset of model types to orchestrate. If omitted, runs all active models."
    )


class CompositePredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    prediction_id: str
    transaction_id: str
    feature_vector_id: Optional[str] = None
    overall_risk_score: float
    confidence: float
    composite_risk_level: str
    executed_models: List[str]
    execution_time_ms: float
    individual_results: Dict[str, Any]
    feature_version: str
    model_versions: Dict[str, str]
    metadata_json: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedCompositePredictionResponse(BaseModel):
    items: List[CompositePredictionResponse]
    total: int
    page: int
    size: int
    pages: int
