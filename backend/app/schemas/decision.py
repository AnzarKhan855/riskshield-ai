import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DecisionEvaluateRequest(BaseModel):
    transaction_id: str = Field(..., example="TXN-8D93240D", description="Target Transaction ID")
    composite_prediction_id: Optional[str] = Field(None, example="ORCH-9780E1FB", description="Optional Composite Prediction ID")


class DecisionOverrideRequest(BaseModel):
    decision: str = Field(..., example="APPROVE", description="New override decision (APPROVE, BLOCK, REVIEW, ESCALATE)")
    justification: str = Field(..., min_length=3, example="Verified with cardholder over phone", description="Reason for override")
    notes: Optional[str] = Field(None, description="Optional extra analyst notes")


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    decision_id: str
    composite_prediction_id: Optional[str] = None
    transaction_id: str
    merchant_id: Optional[uuid.UUID] = None
    customer_id: Optional[str] = None

    decision: str  # APPROVE, REVIEW, BLOCK, ESCALATE
    decision_status: str
    decision_confidence: float
    composite_risk_score: float
    decision_reason: str

    triggered_rules: List[Dict[str, Any]]
    triggered_policies: List[str]
    execution_time_ms: float

    decision_source: str
    reviewer_id: Optional[uuid.UUID] = None
    review_status: str

    decision_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedDecisionResponse(BaseModel):
    items: List[DecisionResponse]
    total: int
    page: int
    size: int
    pages: int
