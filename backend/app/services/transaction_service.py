from datetime import datetime
import math
import secrets
from typing import Any, List, Optional, Union
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.models.transaction import (
    PaymentMethod,
    Transaction,
    TransactionStatus,
    TransactionType,
)
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import (
    PaginatedTransactionResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)


class TransactionService:
    def __init__(
        self,
        transaction_repo: TransactionRepository,
        merchant_repo: MerchantRepository,
        audit_repo: AuditLogRepository,
    ):
        self.transaction_repo = transaction_repo
        self.merchant_repo = merchant_repo
        self.audit_repo = audit_repo

    async def _generate_unique_transaction_id(self) -> str:
        """Generate unique transaction ID formatted as TXN-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            txn_id = f"TXN-{hex_suffix}"
            existing = await self.transaction_repo.get_by_txn_id(txn_id)
            if not existing:
                return txn_id
        raise ValidationException("Failed to generate unique transaction ID.")

    async def create_transaction(
        self,
        data: TransactionCreate,
        creator_user_id: uuid.UUID,
    ) -> TransactionResponse:
        """Create a new payment transaction with auto-generated ID and net_amount calculation."""
        merchant = await self.merchant_repo.get_active_by_id(data.merchant_id)
        if not merchant:
            raise NotFoundException(f"Merchant with ID '{data.merchant_id}' not found.")

        txn_id = await self._generate_unique_transaction_id()
        net_amount = round(data.amount - data.fee - data.tax, 2)

        transaction = Transaction(
            transaction_id=txn_id,
            merchant_id=data.merchant_id,
            customer_id=data.customer_id,
            payment_method=data.payment_method,
            card_network=data.card_network,
            card_bin=data.card_bin,
            currency=data.currency,
            amount=data.amount,
            fee=data.fee,
            tax=data.tax,
            net_amount=net_amount,
            status=data.status,
            transaction_type=data.transaction_type,
            country=data.country,
            state=data.state,
            city=data.city,
            ip_address=data.ip_address,
            device_id=data.device_id,
            device_type=data.device_type,
            operating_system=data.operating_system,
            browser=data.browser,
            latitude=data.latitude,
            longitude=data.longitude,
            reference_number=data.reference_number,
            gateway_response=data.gateway_response,
            failure_reason=data.failure_reason,
            is_deleted=False,
        )

        created_txn = await self.transaction_repo.create(transaction)

        await self.audit_repo.log_action(
            action="TRANSACTION_CREATED",
            user_id=creator_user_id,
            details={
                "transaction_id": created_txn.transaction_id,
                "amount": float(created_txn.amount),
                "merchant_id": str(created_txn.merchant_id),
                "status": created_txn.status.value,
            },
        )

        return TransactionResponse.model_validate(created_txn)

    async def get_transaction(self, id: Any) -> TransactionResponse:
        """Retrieve active transaction details by UUID or transaction_id."""
        txn = await self.transaction_repo.get_active_by_id(id)
        if not txn:
            raise NotFoundException(f"Transaction with ID '{id}' not found.")
        return TransactionResponse.model_validate(txn)

    async def update_transaction(
        self,
        id: Any,
        data: TransactionUpdate,
        updater_user_id: uuid.UUID,
    ) -> TransactionResponse:
        """Update transaction status or reference details."""
        txn = await self.transaction_repo.get_active_by_id(id)
        if not txn:
            raise NotFoundException(f"Transaction with ID '{id}' not found.")

        update_values = data.model_dump(exclude_unset=True)
        if not update_values:
            return TransactionResponse.model_validate(txn)

        updated_txn = await self.transaction_repo.update(txn.id, update_values)

        await self.audit_repo.log_action(
            action="TRANSACTION_UPDATED",
            user_id=updater_user_id,
            details={"transaction_id": txn.transaction_id, "updates": update_values},
        )

        return TransactionResponse.model_validate(updated_txn or txn)

    async def soft_delete_transaction(
        self, id: Any, deleter_user_id: uuid.UUID
    ) -> None:
        """Soft delete a transaction record."""
        txn = await self.transaction_repo.get_active_by_id(id)
        if not txn:
            raise NotFoundException(f"Transaction with ID '{id}' not found.")

        await self.transaction_repo.soft_delete(txn.id)

        await self.audit_repo.log_action(
            action="TRANSACTION_DELETED",
            user_id=deleter_user_id,
            details={"transaction_id": txn.transaction_id},
        )

    async def list_transactions(
        self,
        search: Optional[str] = None,
        status: Optional[TransactionStatus] = None,
        merchant_id: Optional[uuid.UUID] = None,
        payment_method: Optional[PaymentMethod] = None,
        country: Optional[str] = None,
        transaction_type: Optional[TransactionType] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "timestamp",
        sort_dir: str = "desc",
    ) -> PaginatedTransactionResponse:
        """Retrieve paginated and filtered list of transactions."""
        items, total = await self.transaction_repo.filter_and_paginate(
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

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedTransactionResponse(
            items=[TransactionResponse.model_validate(t) for t in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
