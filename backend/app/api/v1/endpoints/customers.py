from typing import Any, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_customer_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    PaginatedCustomerResponse,
)
from app.schemas.transaction import TransactionResponse
from app.services.customer_service import CustomerService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedCustomerResponse],
    summary="List customers with search, LTV range, and pagination",
)
async def list_customers(
    search: Optional[str] = Query(None, description="Search term across ID, name, email, phone"),
    merchant_id: Optional[uuid.UUID] = Query(None, description="Filter by merchant UUID"),
    min_ltv: Optional[float] = Query(None, ge=0, description="Minimum lifetime value"),
    max_ltv: Optional[float] = Query(None, ge=0, description="Maximum lifetime value"),
    country: Optional[str] = Query(None, description="Filter by country"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc/desc)"),
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    result = await customer_service.list_customers(
        search=search,
        merchant_id=merchant_id,
        min_ltv=min_ltv,
        max_ltv=max_ltv,
        country=country,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Customers retrieved successfully",
    )


@router.get(
    "/search",
    response_model=APIResponse[PaginatedCustomerResponse],
    summary="Search customers explicitly",
)
async def search_customers(
    q: str = Query(..., min_length=1, description="Search query string"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    result = await customer_service.list_customers(
        search=q,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Customer search results retrieved",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[CustomerResponse],
    summary="Get customer profile by UUID or customer_id",
)
async def get_customer(
    id: str,
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    customer = await customer_service.get_customer(id)
    return success_response(
        data=customer,
        message="Customer details retrieved",
    )


@router.get(
    "/{id}/transactions",
    response_model=APIResponse[List[TransactionResponse]],
    summary="Get customer transaction timeline",
)
async def get_customer_timeline(
    id: str,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    timeline = await customer_service.get_customer_timeline(id, limit=limit)
    return success_response(
        data=timeline,
        message="Customer transaction timeline retrieved",
    )


@router.post(
    "",
    response_model=APIResponse[CustomerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer profile",
)
async def create_customer(
    data: CustomerCreate,
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    customer = await customer_service.create_customer(
        data=data,
        creator_user_id=current_user.id,
    )
    return success_response(
        data=customer,
        message="Customer created successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[CustomerResponse],
    summary="Update customer profile",
)
async def update_customer(
    id: str,
    data: CustomerUpdate,
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    updated_customer = await customer_service.update_customer(
        id=id,
        data=data,
        updater_user_id=current_user.id,
    )
    return success_response(
        data=updated_customer,
        message="Customer updated successfully",
    )


@router.delete(
    "/{id}",
    response_model=APIResponse[None],
    summary="Soft-delete a customer record",
)
async def delete_customer(
    id: str,
    current_user: User = Depends(get_current_active_user),
    customer_service: CustomerService = Depends(get_customer_service),
) -> Any:
    await customer_service.soft_delete_customer(
        id=id,
        deleter_user_id=current_user.id,
    )
    return success_response(message="Customer soft-deleted successfully")
