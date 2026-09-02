from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.repositories.composite_repository import CompositePredictionRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.explanation_repository import ExplanationRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.investigation_repository import InvestigationRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.model_repository import ModelRegistryRepository
from app.repositories.rule_repository import DecisionRuleRepository
from app.repositories.transaction_repository import TransactionRepository
from app.services.ai_intelligence_service import AIIntelligenceService

router = APIRouter()


# --- Request DTOs ---

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language risk intelligence inquiry")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional entity context (e.g. {'entity_type': 'TRANSACTION', 'entity_id': 'TXN-001'})")


class ChatQueryRequest(BaseModel):
    query: Optional[str] = Field(default=None, description="Natural language inquiry")
    message: Optional[str] = Field(default=None, description="Natural language message")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context")


class CounterfactualRequest(BaseModel):
    transaction_id: str = Field(..., description="Target transaction ID")
    modifications: Dict[str, Any] = Field(..., description="Map of feature perturbations (e.g. {'amount': 150.0, 'is_3ds_verified': True})")


class NLSearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query across transactions, cases, rules, merchants, and customers")


class ScenarioTestRequest(BaseModel):
    scenario_type: str = Field(..., description="Scenario identifier, e.g. HOLIDAY_VELOCITY_SURGE, BOTNET_CARD_TESTING, CROSS_BORDER_BIN_ATTACK, SYNTHETIC_IDENTITY_WAVE")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Scenario modification parameters")


class RiskSimulationRequest(BaseModel):
    scenario_type: Optional[str] = Field(default="HOLIDAY_VELOCITY_SURGE", description="Target scenario")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Simulation parameters")


class RuleSuggestionGenerateRequest(BaseModel):
    cluster_id: Optional[str] = Field(default=None, description="Target fraud cluster ID")
    target_action: Optional[str] = Field(default="BLOCK", description="Recommended action: BLOCK, REVIEW, CHALLENGE_3DS")


def get_ai_service(session: AsyncSession = Depends(get_db)) -> AIIntelligenceService:
    return AIIntelligenceService(
        transaction_repo=TransactionRepository(session),
        decision_repo=DecisionRepository(session),
        feature_repo=FeatureStoreRepository(session),
        rule_repo=DecisionRuleRepository(session),
        case_repo=InvestigationRepository(session),
        composite_repo=CompositePredictionRepository(session),
        customer_repo=CustomerRepository(session),
        merchant_repo=MerchantRepository(session),
        device_repo=DeviceRepository(session),
        model_repo=ModelRegistryRepository(session),
        explanation_repo=ExplanationRepository(session),
    )


# --- Endpoints ---

@router.post("/copilot/query", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def query_copilot(
    payload: CopilotQueryRequest,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Query Grounded Enterprise AI Copilot for real-time risk intelligence, forensic insights, and recommendations."""
    result = await service.ask_copilot(payload.query, payload.context)
    return success_response(data=result, message="AI Copilot intelligence retrieved successfully")


@router.post("/chat", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def chat_copilot(
    payload: ChatQueryRequest,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Chat endpoint for interactive AI Copilot dialogue."""
    msg = payload.query or payload.message or "Analyze current risk posture"
    result = await service.ask_copilot(msg, payload.context)
    return success_response(data=result, message="AI Copilot response generated successfully")


@router.post("/nl-search", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def parse_natural_language_search(
    payload: NLSearchRequest,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Convert natural language queries into structured database queries and return matching records."""
    result = await service.parse_nl_search_and_execute(payload.query)
    return success_response(data=result, message="Natural language query executed successfully")


@router.get("/root-cause/{transaction_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_root_cause_analysis(
    transaction_id: str,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Run automated Root Cause Analysis (RCA) with feature z-scores and causal attributions."""
    result = await service.root_cause_analysis(transaction_id)
    return success_response(data=result, message="Root Cause Analysis generated successfully")


@router.get("/case-summary/{case_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
@router.post("/case-summary/{case_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_case_summary(
    case_id: str,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Generate executive AI Investigation Summary, risk factors, and SAR recommendations for a case."""
    result = await service.generate_case_summary(case_id)
    return success_response(data=result, message="Case Investigation Summary synthesized successfully")


@router.get("/fraud-patterns", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
@router.post("/fraud-patterns/discover", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_fraud_patterns(
    lookback: int = Query(50, ge=10, le=200),
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Discover emerging fraud attack clusters and automated defense rule candidates."""
    result = await service.discover_fraud_patterns(lookback_limit=lookback)
    return success_response(data=result, message="Fraud patterns discovered successfully")


@router.get("/similar-fraud/{transaction_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_similar_fraud_patterns(
    transaction_id: str,
    top_k: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Vector and topological feature similarity search to discover identical historical fraud cases."""
    result = await service.similar_fraud_search(transaction_id, top_k)
    return success_response(data=result, message="Similar fraud patterns identified successfully")


@router.get("/merchant-intelligence/{merchant_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_merchant_intelligence(
    merchant_id: str,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve 360-degree Merchant Intelligence dossier with chargeback ratios, velocity anomalies, and risk tier."""
    result = await service.get_merchant_intelligence(merchant_id)
    return success_response(data=result, message="Merchant intelligence retrieved successfully")


@router.get("/customer-intelligence/{customer_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_customer_intelligence(
    customer_id: str,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve Customer 360 AI behavioral profile, trust score, and synthetic identity risk index."""
    result = await service.get_customer_intelligence(customer_id)
    return success_response(data=result, message="Customer intelligence retrieved successfully")


@router.get("/device-intelligence/{device_id}", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_device_intelligence(
    device_id: str,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve Device Hardware & Network Intelligence, trust score, and proxy/VPN risk status."""
    result = await service.get_device_intelligence(device_id)
    return success_response(data=result, message="Device intelligence retrieved successfully")


@router.get("/risk-recommendations", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_risk_recommendations(
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve proactive system-wide risk recommendations, policy suggestions, and MCC threshold adjustments."""
    result = await service.get_risk_recommendations()
    return success_response(data=result, message="Risk recommendations retrieved successfully")


@router.get("/rule-suggestions", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
@router.post("/rule-suggestions/generate", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_rule_suggestions(
    payload: Optional[RuleSuggestionGenerateRequest] = None,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Synthesize candidate AST policy rules based on detected fraud clusters with backtest metrics."""
    result = await service.suggest_rules()
    return success_response(data=result, message="Rule suggestions generated successfully")


@router.get("/model-recommendations", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_model_recommendations(
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve AI ensemble governance recommendations, weight adjustments, and retraining triggers."""
    result = await service.get_model_recommendations()
    return success_response(data=result, message="Model recommendations retrieved successfully")


@router.get("/drift-detection", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
@router.post("/drift-detection/calculate", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_drift_detection(
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Compute Population Stability Index (PSI) and Kolmogorov-Smirnov drift across live feature distributions."""
    result = await service.detect_drift()
    return success_response(data=result, message="Drift detection calculated successfully")


@router.get("/feature-importance", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_feature_importance(
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Retrieve Global Ensemble Feature Importance rankings (KernelSHAP & Permutation Importance)."""
    result = await service.get_feature_importance()
    return success_response(data=result, message="Feature importance retrieved successfully")


@router.post("/counterfactual", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def run_counterfactual_simulation(
    payload: CounterfactualRequest,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Perform real-time counterfactual scenario simulation to test what-if risk transitions."""
    result = await service.counterfactual_simulation(payload.transaction_id, payload.modifications)
    return success_response(data=result, message="Counterfactual scenario simulated successfully")


@router.post("/scenario-testing", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
@router.post("/risk-simulation", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def run_scenario_testing(
    payload: ScenarioTestRequest,
    current_user: User = Depends(get_current_active_user),
    service: AIIntelligenceService = Depends(get_ai_service),
):
    """Execute macro risk stress-testing simulation across attack scenarios and traffic surges."""
    result = await service.scenario_testing(payload.scenario_type, payload.parameters)
    return success_response(data=result, message="Scenario simulation executed successfully")
