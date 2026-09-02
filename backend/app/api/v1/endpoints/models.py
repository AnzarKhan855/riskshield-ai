from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_model_registry_service
from app.core.response import APIResponse, success_response
from app.models.model_registry import ModelFramework, ModelStatus, ModelType
from app.models.user import User
from app.schemas.model_registry import (
    ModelPromoteRequest,
    ModelRegisterRequest,
    ModelRegistryResponse,
    ModelRollbackRequest,
    ModelUpdateRequest,
    PaginatedModelRegistryResponse,
)
from app.services.model_registry_service import ModelRegistryService

router = APIRouter()


@router.post(
    "/register",
    response_model=APIResponse[ModelRegistryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new ML model in ModelRegistry",
)
async def register_model(
    body: ModelRegisterRequest,
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.register_model(body, creator_user_id=current_user.id)
    return success_response(
        data=result,
        message="Model registered successfully in ModelRegistry",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedModelRegistryResponse],
    summary="List model registry entries with filters and pagination",
)
async def list_models(
    search: Optional[str] = Query(None, description="Search model name, ID, or algorithm"),
    model_type: Optional[ModelType] = Query(None, description="Filter by model type"),
    framework: Optional[ModelFramework] = Query(None, description="Filter by framework"),
    model_status: Optional[ModelStatus] = Query(None, description="Filter by status"),
    production_flag: Optional[bool] = Query(None, description="Filter by production flag"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.list_models(
        search=search,
        model_type=model_type,
        framework=framework,
        model_status=model_status,
        production_flag=production_flag,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Model registry list retrieved successfully",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[ModelRegistryResponse],
    summary="Get model details by model ID or UUID",
)
async def get_model(
    id: str,
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.get_model(id)
    return success_response(
        data=result,
        message="Model profile retrieved successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[ModelRegistryResponse],
    summary="Update model profile and performance metrics",
)
async def update_model(
    id: str,
    body: ModelUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.update_model(id, body, updater_user_id=current_user.id)
    return success_response(
        data=result,
        message="Model profile updated successfully",
    )


@router.post(
    "/promote",
    response_model=APIResponse[ModelRegistryResponse],
    summary="Promote model to Production (demotes existing production model for model type)",
)
async def promote_model(
    body: ModelPromoteRequest,
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.promote_to_production(body.model_id, promoter_user_id=current_user.id)
    return success_response(
        data=result,
        message="Model promoted to Production successfully",
    )


@router.post(
    "/rollback",
    response_model=APIResponse[ModelRegistryResponse],
    summary="Rollback Production model to a previous version",
)
async def rollback_model(
    body: ModelRollbackRequest,
    current_user: User = Depends(get_current_active_user),
    model_service: ModelRegistryService = Depends(get_model_registry_service),
) -> Any:
    result = await model_service.rollback_production_model(
        model_type=body.model_type,
        target_version=body.target_version,
        rollback_user_id=current_user.id,
    )
    return success_response(
        data=result,
        message="Production model rolled back successfully",
    )
