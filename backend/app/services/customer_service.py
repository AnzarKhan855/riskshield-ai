import math
import secrets
from typing import Any, List, Optional, Union
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.models.customer import Customer
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.merchant_repository import MerchantRepository
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    PaginatedCustomerResponse,
)
from app.schemas.transaction import TransactionResponse


class CustomerService:
    def __init__(
        self,
        customer_repo: CustomerRepository,
        merchant_repo: MerchantRepository,
        audit_repo: AuditLogRepository,
    ):
        self.customer_repo = customer_repo
        self.merchant_repo = merchant_repo
        self.audit_repo = audit_repo

    async def _generate_unique_customer_id(self) -> str:
        """Generate unique customer code CUST-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            cust_id = f"CUST-{hex_suffix}"
            existing = await self.customer_repo.get_by_customer_id(cust_id)
            if not existing:
                return cust_id
        raise ValidationException("Failed to generate unique customer ID.")

    async def create_customer(
        self,
        data: CustomerCreate,
        creator_user_id: uuid.UUID,
    ) -> CustomerResponse:
        """Create a new customer profile."""
        merchant = await self.merchant_repo.get_active_by_id(data.merchant_id)
        if not merchant:
            raise NotFoundException(f"Merchant with ID '{data.merchant_id}' not found.")

        cust_id = await self._generate_unique_customer_id()

        customer = Customer(
            customer_id=cust_id,
            merchant_id=data.merchant_id,
            full_name=data.full_name,
            email=data.email.lower().strip(),
            phone=data.phone,
            country=data.country,
            state=data.state,
            city=data.city,
            preferred_payment_method=data.preferred_payment_method,
            risk_flags=data.risk_flags,
            is_deleted=False,
        )

        created_customer = await self.customer_repo.create(customer)

        await self.audit_repo.log_action(
            action="CUSTOMER_CREATED",
            user_id=creator_user_id,
            details={
                "customer_id": created_customer.customer_id,
                "full_name": created_customer.full_name,
                "email": created_customer.email,
            },
        )

        return CustomerResponse.model_validate(created_customer)

    async def get_customer(self, id: Any) -> CustomerResponse:
        """Retrieve active customer profile by ID or customer_id."""
        customer = await self.customer_repo.get_active_by_id(id)
        if not customer:
            raise NotFoundException(f"Customer with ID '{id}' not found.")
        return CustomerResponse.model_validate(customer)

    async def update_customer(
        self,
        id: Any,
        data: CustomerUpdate,
        updater_user_id: uuid.UUID,
    ) -> CustomerResponse:
        """Update customer details."""
        customer = await self.customer_repo.get_active_by_id(id)
        if not customer:
            raise NotFoundException(f"Customer with ID '{id}' not found.")

        update_values = data.model_dump(exclude_unset=True)
        if not update_values:
            return CustomerResponse.model_validate(customer)

        updated_customer = await self.customer_repo.update(customer.id, update_values)

        await self.audit_repo.log_action(
            action="CUSTOMER_UPDATED",
            user_id=updater_user_id,
            details={"customer_id": customer.customer_id, "updates": list(update_values.keys())},
        )

        return CustomerResponse.model_validate(updated_customer or customer)

    async def soft_delete_customer(
        self, id: Any, deleter_user_id: uuid.UUID
    ) -> None:
        """Soft delete customer profile."""
        customer = await self.customer_repo.get_active_by_id(id)
        if not customer:
            raise NotFoundException(f"Customer with ID '{id}' not found.")

        await self.customer_repo.soft_delete(customer.id)

        await self.audit_repo.log_action(
            action="CUSTOMER_DELETED",
            user_id=deleter_user_id,
            details={"customer_id": customer.customer_id},
        )

    async def list_customers(
        self,
        search: Optional[str] = None,
        merchant_id: Optional[uuid.UUID] = None,
        min_ltv: Optional[float] = None,
        max_ltv: Optional[float] = None,
        country: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedCustomerResponse:
        """List paginated customer profiles."""
        items, total = await self.customer_repo.filter_and_paginate(
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

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedCustomerResponse(
            items=[CustomerResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def get_customer_timeline(
        self, id: Any, limit: int = 20
    ) -> List[TransactionResponse]:
        """Fetch transaction timeline for customer profile."""
        customer = await self.customer_repo.get_active_by_id(id)
        if not customer:
            raise NotFoundException(f"Customer with ID '{id}' not found.")

        txns = await self.customer_repo.get_customer_transactions(customer.id, limit=limit)
        return [TransactionResponse.model_validate(t) for t in txns]
