import math
import secrets
from typing import Any, List, Optional, Union
import uuid
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    ValidationException,
)
from app.models.merchant import (
    Merchant,
    MerchantStatus,
    RiskLevel,
    VerificationStatus,
)
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditLogRepository
from app.schemas.merchant import (
    MerchantCreate,
    MerchantResponse,
    MerchantUpdate,
    PaginatedMerchantResponse,
)


class MerchantService:
    def __init__(
        self,
        merchant_repo: MerchantRepository,
        user_repo: UserRepository,
        audit_repo: AuditLogRepository,
    ):
        self.merchant_repo = merchant_repo
        self.user_repo = user_repo
        self.audit_repo = audit_repo

    async def _generate_unique_merchant_code(self) -> str:
        """Generate unique merchant code formatted as MRC-XXXXXX."""
        for _ in range(10):
            random_hex = secrets.token_hex(3).upper()
            code = f"MRC-{random_hex}"
            existing = await self.merchant_repo.get_by_code(code)
            if not existing:
                return code
        raise ValidationException("Failed to generate unique merchant code.")

    async def create_merchant(
        self,
        data: MerchantCreate,
        creator_user_id: uuid.UUID,
    ) -> MerchantResponse:
        """Create a new merchant profile with auto-generated code."""
        owner_id = data.owner_user_id or creator_user_id
        owner = await self.user_repo.get_by_id(owner_id)
        if not owner:
            raise NotFoundException(f"Owner user with ID {owner_id} does not exist.")

        merchant_code = await self._generate_unique_merchant_code()

        merchant = Merchant(
            business_name=data.business_name,
            legal_business_name=data.legal_business_name,
            merchant_code=merchant_code,
            owner_user_id=owner_id,
            business_type=data.business_type,
            industry=data.industry,
            gst_number=data.gst_number,
            pan_number=data.pan_number,
            business_email=data.business_email.lower().strip(),
            business_phone=data.business_phone,
            website=data.website,
            country=data.country,
            state=data.state,
            city=data.city,
            address=data.address,
            pincode=data.pincode,
            status=data.status,
            risk_level=data.risk_level,
            verification_status=data.verification_status,
            kyc_status=data.kyc_status,
            is_deleted=False,
        )

        created_merchant = await self.merchant_repo.create(merchant)

        await self.audit_repo.log_action(
            action="MERCHANT_CREATED",
            user_id=creator_user_id,
            details={
                "merchant_id": str(created_merchant.id),
                "merchant_code": created_merchant.merchant_code,
                "business_name": created_merchant.business_name,
            },
        )

        return MerchantResponse.model_validate(created_merchant)

    async def get_merchant(self, id: Any) -> MerchantResponse:
        """Retrieve active merchant profile by ID or merchant_code."""
        merchant = await self.merchant_repo.get_active_by_id(id)
        if not merchant:
            raise NotFoundException(f"Merchant with ID '{id}' not found.")
        return MerchantResponse.model_validate(merchant)

    async def update_merchant(
        self,
        id: Any,
        data: MerchantUpdate,
        updater_user_id: uuid.UUID,
    ) -> MerchantResponse:
        """Update existing merchant profile details."""
        merchant = await self.merchant_repo.get_active_by_id(id)
        if not merchant:
            raise NotFoundException(f"Merchant with ID '{id}' not found.")

        update_values = data.model_dump(exclude_unset=True)
        if not update_values:
            return MerchantResponse.model_validate(merchant)

        updated_merchant = await self.merchant_repo.update(merchant.id, update_values)

        await self.audit_repo.log_action(
            action="MERCHANT_UPDATED",
            user_id=updater_user_id,
            details={"merchant_id": str(merchant.id), "updated_fields": list(update_values.keys())},
        )

        return MerchantResponse.model_validate(updated_merchant or merchant)

    async def soft_delete_merchant(
        self, id: Any, deleter_user_id: uuid.UUID
    ) -> None:
        """Soft delete a merchant record."""
        merchant = await self.merchant_repo.get_active_by_id(id)
        if not merchant:
            raise NotFoundException(f"Merchant with ID '{id}' not found.")

        await self.merchant_repo.soft_delete(merchant.id)

        await self.audit_repo.log_action(
            action="MERCHANT_DELETED",
            user_id=deleter_user_id,
            details={"merchant_id": str(merchant.id), "merchant_code": merchant.merchant_code},
        )

    async def list_merchants(
        self,
        search: Optional[str] = None,
        status: Optional[MerchantStatus] = None,
        risk_level: Optional[RiskLevel] = None,
        verification_status: Optional[VerificationStatus] = None,
        industry: Optional[str] = None,
        owner_user_id: Optional[uuid.UUID] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedMerchantResponse:
        """Retrieve paginated and filtered list of merchants."""
        items, total = await self.merchant_repo.filter_and_paginate(
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

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedMerchantResponse(
            items=[MerchantResponse.model_validate(m) for m in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
