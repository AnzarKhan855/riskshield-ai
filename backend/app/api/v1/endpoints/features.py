from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_feature_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.feature import (
    FeatureGenerateRequest,
    FeatureRecomputeRequest,
    FeatureStoreResponse,
    PaginatedFeatureStoreResponse,
)
from app.services.feature_engineering_service import FeatureEngineeringService

router = APIRouter()


@router.post(
    "/generate",
    response_model=APIResponse[FeatureStoreResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate ML feature vector for a transaction",
)
async def generate_features(
    body: FeatureGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
) -> Any:
    result = await feature_service.generate_features(
        transaction_id=body.transaction_id,
        creator_user_id=current_user.id,
    )
    return success_response(
        data=result,
        message="Feature vector generated successfully",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedFeatureStoreResponse],
    summary="List feature store history with pagination",
)
@router.get(
    "/history",
    response_model=APIResponse[PaginatedFeatureStoreResponse],
    summary="List feature store history with pagination",
)
async def list_feature_history(
    transaction_id: Optional[str] = Query(None, description="Filter by transaction ID"),
    feature_version: Optional[str] = Query(None, description="Filter by feature version"),
    prediction_ready: Optional[bool] = Query(None, description="Filter by prediction readiness"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
) -> Any:
    result = await feature_service.list_feature_vectors(
        transaction_id=transaction_id,
        feature_version=feature_version,
        prediction_ready=prediction_ready,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Feature store history retrieved successfully",
    )


@router.get(
    "/{transaction_id}",
    response_model=APIResponse[FeatureStoreResponse],
    summary="Get feature vector by transaction ID",
)
async def get_features(
    transaction_id: str,
    current_user: User = Depends(get_current_active_user),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
) -> Any:
    result = await feature_service.get_features_by_transaction_id(transaction_id)
    return success_response(
        data=result,
        message="Feature vector retrieved successfully",
    )


@router.post(
    "/recompute",
    response_model=APIResponse[FeatureStoreResponse],
    summary="Recompute feature vector for a transaction",
)
async def recompute_features(
    body: FeatureRecomputeRequest,
    current_user: User = Depends(get_current_active_user),
    feature_service: FeatureEngineeringService = Depends(get_feature_service),
) -> Any:
    result = await feature_service.recompute_features(
        transaction_id=body.transaction_id,
        updater_user_id=current_user.id,
    )
    return success_response(
        data=result,
        message="Feature vector recomputed successfully",
    )
