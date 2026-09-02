from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class FeatureContribution:
    feature_name: str
    feature_value: Any
    importance_score: float  # Absolute importance (0.0 to 1.0)
    shap_value: float        # Positive increases risk, negative decreases risk
    direction: str           # "INCREASES_RISK" | "DECREASES_RISK" | "NEUTRAL"
    description: str


@dataclass
class ModelContribution:
    model_id: str
    model_name: str
    model_type: str
    weight: float
    risk_score: float
    contribution_score: float
    status: str


@dataclass
class BusinessRuleContribution:
    rule_id: str
    rule_name: str
    rule_category: str
    severity: str
    action: str
    impact_score: float
    description: str


@dataclass
class Recommendation:
    action_type: str        # "BLOCK_CARD" | "VERIFY_IDENTITY" | "REQUEST_3DS" | "APPROVE" | "ESCALATE"
    title: str
    rationale: str
    priority: str           # "HIGH" | "MEDIUM" | "LOW"
    metadata: Dict[str, Any] = field(default_factory=dict)
