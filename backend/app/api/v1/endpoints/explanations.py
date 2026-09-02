from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_explanation_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.explanation import (
    ExplanationGenerateRequest,
    ExplanationResponse,
    PaginatedExplanationsResponse,
)
from app.services.explanation_service import ExplanationService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedExplanationsResponse],
    summary="List AI Explanations with search and pagination",
)
async def list_explanations(
    search: Optional[str] = Query(None, description="Search by explanation ID, decision ID, or transaction ID"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    service: ExplanationService = Depends(get_explanation_service),
) -> Any:
    result = await service.list_explanations(
        search=search,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="AI explanations retrieved successfully",
    )


@router.get(
    "/{decision_id}",
    response_model=APIResponse[ExplanationResponse],
    summary="Fetch explanation payload for a decision ID or explanation ID",
)
async def get_explanation(
    decision_id: str,
    current_user: User = Depends(get_current_active_user),
    service: ExplanationService = Depends(get_explanation_service),
) -> Any:
    result = await service.get_explanation(decision_id)
    return success_response(
        data=result,
        message="AI explanation retrieved successfully",
    )


@router.post(
    "/generate",
    response_model=APIResponse[ExplanationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI explanation payload for a decision ID",
)
async def generate_explanation(
    body: ExplanationGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    service: ExplanationService = Depends(get_explanation_service),
) -> Any:
    result = await service.generate_explanation(body.decision_id)
    return success_response(
        data=result,
        message="AI explanation generated successfully",
    )
