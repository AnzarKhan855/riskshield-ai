from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_decision_engine
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.decision import (
    DecisionEvaluateRequest,
    DecisionOverrideRequest,
    DecisionResponse,
    PaginatedDecisionResponse,
)
from app.services.decision_engine import DecisionEngine

router = APIRouter()


@router.post(
    "/evaluate",
    response_model=APIResponse[DecisionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate Decision Intelligence flow for a transaction",
)
async def evaluate_decision(
    body: DecisionEvaluateRequest,
    current_user: User = Depends(get_current_active_user),
    engine: DecisionEngine = Depends(get_decision_engine),
) -> Any:
    result = await engine.evaluate_decision(body, evaluator_user_id=current_user.id)
    return success_response(
        data=result,
        message="Decision intelligence evaluation completed successfully",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedDecisionResponse],
    summary="List decision history records with pagination",
)
async def list_decisions(
    transaction_id: Optional[str] = Query(None, description="Filter by transaction ID"),
    decision: Optional[str] = Query(None, description="Filter by decision action (APPROVE, REVIEW, BLOCK, ESCALATE)"),
    review_status: Optional[str] = Query(None, description="Filter by review status"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    engine: DecisionEngine = Depends(get_decision_engine),
) -> Any:
    result = await engine.list_decisions(
        transaction_id=transaction_id,
        decision_action=decision,
        review_status=review_status,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Decision history records retrieved successfully",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[DecisionResponse],
    summary="Get decision detail by decision_id or UUID",
)
async def get_decision(
    id: str,
    current_user: User = Depends(get_current_active_user),
    engine: DecisionEngine = Depends(get_decision_engine),
) -> Any:
    result = await engine.get_decision(id)
    return success_response(
        data=result,
        message="Decision detail retrieved successfully",
    )


@router.post(
    "/{id}/override",
    response_model=APIResponse[DecisionResponse],
    summary="Submit manual analyst override for a decision",
)
async def override_decision(
    id: str,
    body: DecisionOverrideRequest,
    current_user: User = Depends(get_current_active_user),
    engine: DecisionEngine = Depends(get_decision_engine),
) -> Any:
    result = await engine.override_decision(id, body, reviewer_user_id=current_user.id)
    return success_response(
        data=result,
        message="Manual decision override recorded successfully",
    )
