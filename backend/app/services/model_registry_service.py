import math
import secrets
from typing import List, Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.models.model_registry import ModelFramework, ModelRegistry, ModelStatus, ModelType
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.model_repository import ModelRegistryRepository
from app.schemas.model_registry import (
    ModelRegisterRequest,
    ModelRegistryResponse,
    ModelUpdateRequest,
    PaginatedModelRegistryResponse,
)


class ModelRegistryService:
    def __init__(
        self,
        model_repo: ModelRegistryRepository,
        audit_repo: AuditLogRepository,
    ):
        self.model_repo = model_repo
        self.audit_repo = audit_repo

    async def _generate_unique_model_id(self) -> str:
        """Generate unique model ID formatted as MODEL-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            m_id = f"MODEL-{hex_suffix}"
            existing = await self.model_repo.get_by_model_id(m_id)
            if not existing:
                return m_id
        raise ValidationException("Failed to generate unique Model ID.")

    async def register_model(
        self,
        dto: ModelRegisterRequest,
        creator_user_id: uuid.UUID,
    ) -> ModelRegistryResponse:
        """Register a new ML model in ModelRegistry."""
        model_code = await self._generate_unique_model_id()

        record = ModelRegistry(
            model_id=model_code,
            model_name=dto.model_name.strip(),
            model_type=dto.model_type,
            business_domain=dto.business_domain,
            version=dto.version.strip(),
            framework=dto.framework,
            algorithm=dto.algorithm.strip(),
            description=dto.description,
            model_status=ModelStatus.ACTIVE,
            production_flag=False,
            training_dataset_version=dto.training_dataset_version,
            feature_version=dto.feature_version,
            input_schema_version=dto.input_schema_version,
            output_schema_version=dto.output_schema_version,
            accuracy=dto.accuracy,
            precision=dto.precision,
            recall=dto.recall,
            f1_score=dto.f1_score,
            roc_auc=dto.roc_auc,
            latency_ms=dto.latency_ms,
            owner=dto.owner,
            metadata_json=dto.metadata_json or {},
            is_deleted=False,
        )

        created = await self.model_repo.create(record)

        await self.audit_repo.log_action(
            action="MODEL_REGISTERED",
            user_id=creator_user_id,
            details={
                "model_id": created.model_id,
                "model_name": created.model_name,
                "model_type": created.model_type.value,
                "version": created.version,
            },
        )

        return ModelRegistryResponse.model_validate(created)

    async def promote_to_production(
        self,
        model_id_str: str,
        promoter_user_id: uuid.UUID,
    ) -> ModelRegistryResponse:
        """
        Promotes a model to Production.
        Enforces single-active-production-model rule per ModelType. Demotes any existing production model.
        """
        target = await self.model_repo.get_by_model_id(model_id_str)
        if not target:
            try:
                target_uuid = uuid.UUID(model_id_str)
                target = await self.model_repo.get_active_by_id(target_uuid)
            except ValueError:
                pass

        if not target:
            raise NotFoundException(f"Model with ID '{model_id_str}' not found.")

        # Demote existing production model for this model_type
        await self.model_repo.demote_existing_production(target.model_type)

        # Set target model as production
        updated = await self.model_repo.update(
            target.id,
            {
                "production_flag": True,
                "model_status": ModelStatus.ACTIVE,
            },
        )

        await self.audit_repo.log_action(
            action="MODEL_PROMOTED_TO_PRODUCTION",
            user_id=promoter_user_id,
            details={
                "model_id": updated.model_id,
                "model_type": updated.model_type.value,
                "version": updated.version,
            },
        )

        return ModelRegistryResponse.model_validate(updated)

    async def rollback_production_model(
        self,
        model_type: ModelType,
        target_version: str,
        rollback_user_id: uuid.UUID,
    ) -> ModelRegistryResponse:
        """Rollback production model of model_type to a target version."""
        # Find active model of model_type with target_version
        items, _ = await self.model_repo.filter_and_paginate(
            model_type=model_type,
            size=50,
        )

        matching = [m for m in items if m.version.strip() == target_version.strip()]
        if not matching:
            raise NotFoundException(f"No model found for type '{model_type.value}' with version '{target_version}'.")

        target = matching[0]
        return await self.promote_to_production(target.model_id, rollback_user_id)

    async def get_model(self, model_id_str: str) -> ModelRegistryResponse:
        """Retrieve model profile by ID or model_id string."""
        record = await self.model_repo.get_by_model_id(model_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(model_id_str)
                record = await self.model_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Model with ID '{model_id_str}' not found.")

        return ModelRegistryResponse.model_validate(record)

    async def update_model(
        self,
        model_id_str: str,
        dto: ModelUpdateRequest,
        updater_user_id: uuid.UUID,
    ) -> ModelRegistryResponse:
        """Update model profile and metrics."""
        record = await self.model_repo.get_by_model_id(model_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(model_id_str)
                record = await self.model_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Model with ID '{model_id_str}' not found.")

        update_data = dto.model_dump(exclude_unset=True)
        updated = await self.model_repo.update(record.id, update_data)

        await self.audit_repo.log_action(
            action="MODEL_UPDATED",
            user_id=updater_user_id,
            details={"model_id": updated.model_id, "updated_fields": list(update_data.keys())},
        )

        return ModelRegistryResponse.model_validate(updated)

    async def list_models(
        self,
        search: Optional[str] = None,
        model_type: Optional[ModelType] = None,
        framework: Optional[ModelFramework] = None,
        model_status: Optional[ModelStatus] = None,
        production_flag: Optional[bool] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedModelRegistryResponse:
        """List model registry entries with filters and pagination."""
        items, total = await self.model_repo.filter_and_paginate(
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

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedModelRegistryResponse(
            items=[ModelRegistryResponse.model_validate(m) for m in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
