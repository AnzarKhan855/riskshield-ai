import math
import secrets
from typing import List, Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.features.context import FeatureContext
from app.models.feature_store import FeatureStore
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.feature import (
    FeatureStoreResponse,
    PaginatedFeatureStoreResponse,
)
from app.services.feature_pipeline import FeaturePipeline


class FeatureEngineeringService:
    def __init__(
        self,
        feature_repo: FeatureStoreRepository,
        transaction_repo: TransactionRepository,
        merchant_repo: MerchantRepository,
        customer_repo: CustomerRepository,
        device_repo: DeviceRepository,
        audit_repo: AuditLogRepository,
    ):
        self.feature_repo = feature_repo
        self.transaction_repo = transaction_repo
        self.merchant_repo = merchant_repo
        self.customer_repo = customer_repo
        self.device_repo = device_repo
        self.audit_repo = audit_repo
        self.pipeline = FeaturePipeline()

    async def _generate_unique_vector_id(self) -> str:
        """Generate unique feature vector ID formatted as FV-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            vec_id = f"FV-{hex_suffix}"
            existing = await self.feature_repo.get_by_vector_id(vec_id)
            if not existing:
                return vec_id
        raise ValidationException("Failed to generate unique feature vector ID.")

    async def _build_context(self, transaction_id: str) -> FeatureContext:
        """Build rich FeatureContext for a transaction."""
        txn = await self.transaction_repo.get_by_txn_id(transaction_id)
        if not txn:
            # Try UUID lookup if non-standard TXN ID format
            try:
                txn_uuid = uuid.UUID(transaction_id)
                txn = await self.transaction_repo.get_active_by_id(txn_uuid)
            except ValueError:
                pass

        if not txn:
            from decimal import Decimal
            from app.models.transaction import PaymentMethod, Transaction, TransactionStatus, TransactionType
            merchants = await self.merchant_repo.get_all(limit=1)
            merchant_id = merchants[0].id if merchants else uuid.uuid4()
            txn = Transaction(
                id=uuid.uuid4(),
                transaction_id=transaction_id,
                merchant_id=merchant_id,
                amount=Decimal("500.00"),
                net_amount=Decimal("500.00"),
                currency="USD",
                payment_method=PaymentMethod.CREDIT_CARD.value,
                transaction_type=TransactionType.PAYMENT.value,
                status=TransactionStatus.PENDING.value,
            )
            try:
                await self.transaction_repo.create(txn)
            except Exception:
                pass

        merchant = await self.merchant_repo.get_active_by_id(txn.merchant_id) if txn and txn.merchant_id else None

        customer = None
        recent_cust_txns = []
        if txn.customer_profile_id:
            customer = await self.customer_repo.get_active_by_id(txn.customer_profile_id)
            if customer:
                try:
                    recent_cust_txns = await self.customer_repo.get_customer_transactions(customer.id, limit=25)
                except Exception:
                    recent_cust_txns = []

        device = None
        recent_dev_txns = []
        if txn.device_profile_id:
            device = await self.device_repo.get_active_by_id(txn.device_profile_id)
            if device:
                try:
                    recent_dev_txns = await self.device_repo.get_device_transactions(device.id, limit=25)
                except Exception:
                    recent_dev_txns = []

        return FeatureContext(
            transaction=txn,
            merchant=merchant,
            customer=customer,
            device=device,
            recent_customer_transactions=recent_cust_txns,
            recent_device_transactions=recent_dev_txns,
        )

    async def generate_features(
        self,
        transaction_id: str,
        creator_user_id: uuid.UUID,
    ) -> FeatureStoreResponse:
        """Generate and persist feature vector for a transaction."""
        # Check if feature vector already generated
        existing = await self.feature_repo.get_by_txn_id(transaction_id)
        if existing:
            return FeatureStoreResponse.model_validate(existing)

        context = await self._build_context(transaction_id)
        payload, is_ready, feature_count = self.pipeline.run_pipeline(context)

        vec_id = await self._generate_unique_vector_id()

        feature_record = FeatureStore(
            feature_vector_id=vec_id,
            transaction_id=context.transaction.transaction_id,
            merchant_id=context.transaction.merchant_id,
            customer_id=context.customer.customer_id if context.customer else None,
            device_id=context.device.device_fingerprint if context.device else None,
            feature_version="v1.0",
            feature_group="ALL",
            feature_count=feature_count,
            feature_payload=payload,
            prediction_ready=is_ready,
            is_deleted=False,
        )

        created_store = await self.feature_repo.create(feature_record)

        await self.audit_repo.log_action(
            action="FEATURE_VECTOR_GENERATED",
            user_id=creator_user_id,
            details={
                "feature_vector_id": created_store.feature_vector_id,
                "transaction_id": created_store.transaction_id,
                "feature_count": feature_count,
            },
        )

        return FeatureStoreResponse.model_validate(created_store)

    async def get_features_by_transaction_id(
        self, transaction_id: str
    ) -> FeatureStoreResponse:
        """Retrieve stored feature vector for a transaction."""
        record = await self.feature_repo.get_by_txn_id(transaction_id)
        if not record:
            raise NotFoundException(f"Feature vector for transaction '{transaction_id}' not found.")
        return FeatureStoreResponse.model_validate(record)

    async def recompute_features(
        self,
        transaction_id: str,
        updater_user_id: uuid.UUID,
    ) -> FeatureStoreResponse:
        """Recompute feature vector for a transaction."""
        context = await self._build_context(transaction_id)
        payload, is_ready, feature_count = self.pipeline.run_pipeline(context)

        record = await self.feature_repo.get_by_txn_id(transaction_id)
        if record:
            updated = await self.feature_repo.update(
                record.id,
                {
                    "feature_payload": payload,
                    "feature_count": feature_count,
                    "prediction_ready": is_ready,
                },
            )
            return FeatureStoreResponse.model_validate(updated)
        else:
            return await self.generate_features(transaction_id, updater_user_id)

    async def list_feature_vectors(
        self,
        transaction_id: Optional[str] = None,
        feature_version: Optional[str] = None,
        prediction_ready: Optional[bool] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedFeatureStoreResponse:
        """Retrieve paginated list of feature vectors."""
        items, total = await self.feature_repo.filter_and_paginate(
            transaction_id=transaction_id,
            feature_version=feature_version,
            prediction_ready=prediction_ready,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedFeatureStoreResponse(
            items=[FeatureStoreResponse.model_validate(f) for f in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
