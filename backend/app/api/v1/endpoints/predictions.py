import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_inference_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.prediction import (
    PaginatedPredictionResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.services.inference_service import InferenceService

router = APIRouter()


@router.post(
    "",
    response_model=APIResponse[PredictionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Execute ML prediction pipeline for a transaction",
)
async def create_prediction(
    body: PredictionRequest,
    current_user: User = Depends(get_current_active_user),
    inference_service: InferenceService = Depends(get_inference_service),
) -> Any:
    result = await inference_service.predict(body, executor_user_id=current_user.id)
    return success_response(
        data=result,
        message="ML prediction executed successfully",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedPredictionResponse],
    summary="List prediction history logs with pagination",
)
async def list_predictions(
    transaction_id: Optional[str] = Query(None, description="Filter by transaction ID"),
    model_id: Optional[uuid.UUID] = Query(None, description="Filter by model UUID"),
    prediction_result: Optional[str] = Query(None, description="Filter by prediction result (ALLOW, FLAG, BLOCK)"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    inference_service: InferenceService = Depends(get_inference_service),
) -> Any:
    result = await inference_service.list_predictions(
        transaction_id=transaction_id,
        model_id=model_id,
        prediction_result=prediction_result,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Prediction history retrieved successfully",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[PredictionResponse],
    summary="Get prediction detail by ID or prediction_id",
)
async def get_prediction(
    id: str,
    current_user: User = Depends(get_current_active_user),
    inference_service: InferenceService = Depends(get_inference_service),
) -> Any:
    result = await inference_service.get_prediction(id)
    return success_response(
        data=result,
        message="Prediction detail retrieved successfully",
    )
