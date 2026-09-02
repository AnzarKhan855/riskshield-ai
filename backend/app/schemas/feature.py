import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FeatureGenerateRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D", description="Target Transaction ID")


class FeatureRecomputeRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D")


class FeatureStoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    feature_vector_id: str
    transaction_id: str
    merchant_id: Optional[uuid.UUID] = None
    customer_id: Optional[str] = None
    device_id: Optional[str] = None
    feature_version: str
    feature_group: str
    feature_count: int
    feature_payload: Dict[str, Any]
    prediction_ready: bool
    created_at: datetime
    updated_at: datetime


class PaginatedFeatureStoreResponse(BaseModel):
    items: List[FeatureStoreResponse]
    total: int
    page: int
    size: int
    pages: int
