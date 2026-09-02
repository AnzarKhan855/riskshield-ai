from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_ai_orchestrator_service, get_current_active_user
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.orchestrator import (
    CompositePredictionResponse,
    OrchestratorPredictRequest,
    PaginatedCompositePredictionResponse,
)
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()


@router.post(
    "/predict",
    response_model=APIResponse[CompositePredictionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Execute multi-model orchestration pipeline for a transaction",
)
async def orchestrate_predict(
    body: OrchestratorPredictRequest,
    current_user: User = Depends(get_current_active_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator_service),
) -> Any:
    result = await orchestrator.orchestrate_predict(body, executor_user_id=current_user.id)
    return success_response(
        data=result,
        message="Multi-model AI orchestration pipeline executed successfully",
    )


@router.get(
    "/history",
    response_model=APIResponse[PaginatedCompositePredictionResponse],
    summary="List orchestration prediction execution history logs with pagination",
)
async def list_orchestration_history(
    transaction_id: Optional[str] = Query(None, description="Filter by transaction ID"),
    composite_risk_level: Optional[str] = Query(None, description="Filter by composite risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator_service),
) -> Any:
    result = await orchestrator.list_orchestration_history(
        transaction_id=transaction_id,
        composite_risk_level=composite_risk_level,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Orchestration history logs retrieved successfully",
    )


@router.get(
    "/history/{id}",
    response_model=APIResponse[CompositePredictionResponse],
    summary="Get orchestration execution detail trace by prediction ID or UUID",
)
@router.get(
    "/executions/{id}",
    response_model=APIResponse[CompositePredictionResponse],
    summary="Get orchestration execution detail trace by prediction ID or UUID (alias)",
)
async def get_orchestration_history_detail(
    id: str,
    current_user: User = Depends(get_current_active_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator_service),
) -> Any:
    result = await orchestrator.get_orchestration_history_detail(id)
    return success_response(
        data=result,
        message="Orchestration trace detail retrieved successfully",
    )


@router.get(
    "/status",
    response_model=APIResponse[dict],
    summary="Get multi-model orchestration engine status and registered ensemble models",
)
@router.get(
    "/pipelines",
    response_model=APIResponse[dict],
    summary="Get multi-model orchestration pipeline definitions (alias)",
)
async def get_orchestration_status(
    current_user: User = Depends(get_current_active_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator_service),
) -> Any:
    return success_response(
        data={
            "status": "OPERATIONAL",
            "active_models": ["XGBoost-Fraud-v3", "LightGBM-Velocity-v2", "Neural-RiskNet-v1"],
            "strategy": "WEIGHTED_ENSEMBLE",
            "weights": {"xgboost": 0.45, "lightgbm": 0.35, "neural": 0.20},
            "p99_latency_ms": 14.2,
        },
        message="AI Orchestrator engine is operational",
    )
