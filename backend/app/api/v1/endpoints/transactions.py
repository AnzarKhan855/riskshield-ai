from datetime import datetime
from typing import Any, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_transaction_service
from app.core.response import APIResponse, success_response
from app.models.transaction import PaymentMethod, TransactionStatus, TransactionType
from app.models.user import User
from app.schemas.transaction import (
    PaginatedTransactionResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)
from app.services.transaction_service import TransactionService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedTransactionResponse],
    summary="List transactions with advanced filtering, date/amount range, and pagination",
)
async def list_transactions(
    search: Optional[str] = Query(None, description="Search transaction_id, customer_id, or reference_number"),
    status: Optional[TransactionStatus] = Query(None, description="Filter by transaction status"),
    merchant_id: Optional[uuid.UUID] = Query(None, description="Filter by merchant UUID"),
    payment_method: Optional[PaymentMethod] = Query(None, description="Filter by payment method"),
    country: Optional[str] = Query(None, description="Filter by country"),
    transaction_type: Optional[TransactionType] = Query(None, description="Filter by transaction type"),
    min_amount: Optional[float] = Query(None, ge=0, description="Minimum amount filter"),
    max_amount: Optional[float] = Query(None, ge=0, description="Maximum amount filter"),
    start_date: Optional[datetime] = Query(None, description="Start timestamp filter"),
    end_date: Optional[datetime] = Query(None, description="End timestamp filter"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("timestamp", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc/desc)"),
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    result = await transaction_service.list_transactions(
        search=search,
        status=status,
        merchant_id=merchant_id,
        payment_method=payment_method,
        country=country,
        transaction_type=transaction_type,
        min_amount=min_amount,
        max_amount=max_amount,
        start_date=start_date,
        end_date=end_date,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Transactions retrieved successfully",
    )


@router.get(
    "/search",
    response_model=APIResponse[PaginatedTransactionResponse],
    summary="Search transactions explicitly",
)
async def search_transactions(
    q: str = Query(..., min_length=1, description="Search term for transaction ID or reference"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    result = await transaction_service.list_transactions(
        search=q,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Transaction search results retrieved",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[TransactionResponse],
    summary="Get transaction details by UUID or transaction_id",
)
async def get_transaction(
    id: str,
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    txn = await transaction_service.get_transaction(id)
    return success_response(
        data=txn,
        message="Transaction details retrieved",
    )


@router.post(
    "",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transaction record",
)
async def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    txn = await transaction_service.create_transaction(
        data=data,
        creator_user_id=current_user.id,
    )
    return success_response(
        data=txn,
        message="Transaction created successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[TransactionResponse],
    summary="Update transaction details",
)
async def update_transaction(
    id: str,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    updated_txn = await transaction_service.update_transaction(
        id=id,
        data=data,
        updater_user_id=current_user.id,
    )
    return success_response(
        data=updated_txn,
        message="Transaction updated successfully",
    )


@router.delete(
    "/{id}",
    response_model=APIResponse[None],
    summary="Soft-delete a transaction record",
)
async def delete_transaction(
    id: str,
    current_user: User = Depends(get_current_active_user),
    transaction_service: TransactionService = Depends(get_transaction_service),
) -> Any:
    await transaction_service.soft_delete_transaction(
        id=id,
        deleter_user_id=current_user.id,
    )
    return success_response(message="Transaction soft-deleted successfully")
