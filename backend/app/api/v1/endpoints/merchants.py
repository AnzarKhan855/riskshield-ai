from typing import Any, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_merchant_service
from app.core.response import APIResponse, success_response
from app.models.merchant import (
    MerchantStatus,
    RiskLevel,
    VerificationStatus,
)
from app.models.user import User
from app.schemas.merchant import (
    MerchantCreate,
    MerchantResponse,
    MerchantUpdate,
    PaginatedMerchantResponse,
)
from app.services.merchant_service import MerchantService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedMerchantResponse],
    summary="List merchants with pagination, filtering, and sorting",
)
async def list_merchants(
    search: Optional[str] = Query(None, description="Search term across business name, code, email, tax IDs"),
    status: Optional[MerchantStatus] = Query(None, description="Filter by merchant status"),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level"),
    verification_status: Optional[VerificationStatus] = Query(None, description="Filter by verification status"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    owner_user_id: Optional[uuid.UUID] = Query(None, description="Filter by owner user ID"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc/desc)"),
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    result = await merchant_service.list_merchants(
        search=search,
        status=status,
        risk_level=risk_level,
        verification_status=verification_status,
        industry=industry,
        owner_user_id=owner_user_id,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Merchants retrieved successfully",
    )


@router.get(
    "/search",
    response_model=APIResponse[PaginatedMerchantResponse],
    summary="Search merchants explicitly",
)
async def search_merchants(
    q: str = Query(..., min_length=1, description="Search query string"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    result = await merchant_service.list_merchants(
        search=q,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Merchant search results retrieved",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[MerchantResponse],
    summary="Get single merchant by UUID or merchant_code",
)
async def get_merchant(
    id: str,
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    merchant = await merchant_service.get_merchant(id)
    return success_response(
        data=merchant,
        message="Merchant details retrieved",
    )


@router.post(
    "",
    response_model=APIResponse[MerchantResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new merchant profile",
)
async def create_merchant(
    data: MerchantCreate,
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    merchant = await merchant_service.create_merchant(
        data=data,
        creator_user_id=current_user.id,
    )
    return success_response(
        data=merchant,
        message="Merchant created successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[MerchantResponse],
    summary="Update merchant profile",
)
async def update_merchant(
    id: str,
    data: MerchantUpdate,
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    updated_merchant = await merchant_service.update_merchant(
        id=id,
        data=data,
        updater_user_id=current_user.id,
    )
    return success_response(
        data=updated_merchant,
        message="Merchant updated successfully",
    )


@router.delete(
    "/{id}",
    response_model=APIResponse[None],
    summary="Soft-delete a merchant record",
)
async def delete_merchant(
    id: str,
    current_user: User = Depends(get_current_active_user),
    merchant_service: MerchantService = Depends(get_merchant_service),
) -> Any:
    await merchant_service.soft_delete_merchant(
        id=id,
        deleter_user_id=current_user.id,
    )
    return success_response(message="Merchant deleted successfully")
