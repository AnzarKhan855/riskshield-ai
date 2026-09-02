import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FeatureContributionSchema(BaseModel):
    feature_name: str
    feature_value: Any
    importance_score: float
    shap_value: float
    direction: str
    description: str


class ModelContributionSchema(BaseModel):
    model_id: str
    model_name: str
    model_type: str
    weight: float
    risk_score: float
    contribution_score: float
    status: str


class BusinessRuleContributionSchema(BaseModel):
    rule_id: str
    rule_name: str
    rule_category: str
    severity: str
    action: str
    impact_score: float
    description: str


class RecommendationSchema(BaseModel):
    action_type: str
    title: str
    rationale: str
    priority: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExplanationGenerateRequest(BaseModel):
    decision_id: str = Field(..., example="DEC-8B13D12B", description="Target Decision ID to explain")


class ExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    explanation_id: str
    decision_id: str
    transaction_id: str
    merchant_id: Optional[uuid.UUID] = None
    customer_id: Optional[str] = None
    composite_risk_score: float
    confidence_score: float
    primary_reason: str
    feature_contributions: List[FeatureContributionSchema]
    model_contributions: List[ModelContributionSchema]
    rule_contributions: List[BusinessRuleContributionSchema]
    recommendations: List[RecommendationSchema]
    audit_info: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedExplanationsResponse(BaseModel):
    items: List[ExplanationResponse]
    total: int
    page: int
    size: int
    pages: int
