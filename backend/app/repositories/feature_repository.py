from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feature_store import FeatureStore
from app.repositories.base import BaseRepository


class FeatureStoreRepository(BaseRepository[FeatureStore]):
    def __init__(self, session: AsyncSession):
        super().__init__(FeatureStore, session)

    async def get_by_txn_id(self, transaction_id: str) -> Optional[FeatureStore]:
        try:
            result = await self.session.execute(
                select(FeatureStore).where(
                    FeatureStore.transaction_id == str(transaction_id).strip(),
                    FeatureStore.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_vector_id(self, vector_id: str) -> Optional[FeatureStore]:
        return await self.get_by_id_or_vector_id(vector_id)

    async def get_by_id_or_vector_id(self, identifier: Any) -> Optional[FeatureStore]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(FeatureStore).where(
                    (FeatureStore.id == parsed_uuid) | (FeatureStore.feature_vector_id == clean_id) | (FeatureStore.transaction_id == clean_id),
                    FeatureStore.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(FeatureStore).where(
                    (FeatureStore.feature_vector_id == clean_id) | (FeatureStore.transaction_id == clean_id),
                    FeatureStore.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def filter_and_paginate(
        self,
        transaction_id: Optional[str] = None,
        feature_version: Optional[str] = None,
        prediction_ready: Optional[bool] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[FeatureStore], int]:
        try:
            query = select(FeatureStore).where(FeatureStore.is_deleted == False)

            if transaction_id:
                query = query.where(FeatureStore.transaction_id.ilike(f"%{transaction_id.strip()}%"))
            if feature_version:
                query = query.where(FeatureStore.feature_version == feature_version.strip())
            if prediction_ready is not None:
                query = query.where(FeatureStore.prediction_ready == prediction_ready)

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(FeatureStore, sort_by, FeatureStore.created_at)
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
