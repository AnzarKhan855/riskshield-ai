from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.model_registry import ModelFramework, ModelRegistry, ModelStatus, ModelType
from app.repositories.base import BaseRepository


class ModelRegistryRepository(BaseRepository[ModelRegistry]):
    def __init__(self, session: AsyncSession):
        super().__init__(ModelRegistry, session)

    async def get_by_model_id(self, model_id: str) -> Optional[ModelRegistry]:
        return await self.get_by_id_or_model_id(model_id)

    async def get_by_id_or_model_id(self, identifier: Any) -> Optional[ModelRegistry]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(ModelRegistry).where(
                    (ModelRegistry.id == parsed_uuid) | (ModelRegistry.model_id == clean_id),
                    ModelRegistry.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(ModelRegistry).where(
                    ModelRegistry.model_id == clean_id,
                    ModelRegistry.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_production_model_by_type(self, model_type: ModelType) -> Optional[ModelRegistry]:
        try:
            result = await self.session.execute(
                select(ModelRegistry).where(
                    ModelRegistry.model_type == model_type,
                    ModelRegistry.production_flag == True,
                    ModelRegistry.model_status == ModelStatus.ACTIVE,
                    ModelRegistry.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def demote_existing_production(self, model_type: ModelType) -> int:
        try:
            stmt = (
                update(ModelRegistry)
                .where(
                    ModelRegistry.model_type == model_type,
                    ModelRegistry.production_flag == True,
                    ModelRegistry.is_deleted == False,
                )
                .values(production_flag=False)
            )
            result = await self.session.execute(stmt)
            await self.session.flush()
            return result.rowcount
        except Exception:
            return 0

    async def filter_and_paginate(
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
    ) -> Tuple[List[ModelRegistry], int]:
        try:
            query = select(ModelRegistry).where(ModelRegistry.is_deleted == False)

            if model_type:
                query = query.where(ModelRegistry.model_type == model_type)
            if framework:
                query = query.where(ModelRegistry.framework == framework)
            if model_status:
                query = query.where(ModelRegistry.model_status == model_status)
            if production_flag is not None:
                query = query.where(ModelRegistry.production_flag == production_flag)

            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.where(
                    ModelRegistry.model_name.ilike(term)
                    | ModelRegistry.model_id.ilike(term)
                    | ModelRegistry.version.ilike(term)
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(ModelRegistry, sort_by, ModelRegistry.created_at)
            if sort_dir.lower() == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())

            offset = (page - 1) * size
            query = query.offset(offset).limit(size)

            result = await self.session.execute(query)
            items = list(result.scalars().all())

            return items, total
        except Exception:
            return [], 0
