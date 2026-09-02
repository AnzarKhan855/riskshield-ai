from typing import Dict, List, Optional
from app.models.model_registry import ModelRegistry, ModelType
from app.repositories.model_repository import ModelRegistryRepository


class ModelSelector:
    def __init__(self, model_repo: ModelRegistryRepository):
        self.model_repo = model_repo

    async def select_active_models(
        self, requested_types: Optional[List[ModelType]] = None
    ) -> Dict[ModelType, ModelRegistry]:
        """
        Resolves active production models for requested ModelTypes.
        Returns a dict mapping ModelType -> ModelRegistry record.
        """
        target_types = requested_types or list(ModelType)
        selected: Dict[ModelType, ModelRegistry] = {}

        for m_type in target_types:
            # 1. Try finding explicit Production model
            prod_model = await self.model_repo.get_production_model_by_type(m_type)
            if prod_model:
                selected[m_type] = prod_model
            else:
                # 2. Fallback to latest active model for this model_type
                items, _ = await self.model_repo.filter_and_paginate(
                    model_type=m_type, size=1
                )
                if items:
                    selected[m_type] = items[0]

        return selected
