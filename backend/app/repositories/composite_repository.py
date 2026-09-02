from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.composite_prediction import CompositePrediction
from app.repositories.base import BaseRepository


class CompositePredictionRepository(BaseRepository[CompositePrediction]):
    def __init__(self, session: AsyncSession):
        super().__init__(CompositePrediction, session)

    async def get_by_prediction_id(self, prediction_id: str) -> Optional[CompositePrediction]:
        return await self.get_by_id_or_prediction_id(prediction_id)

    async def get_by_id_or_prediction_id(self, identifier: Any) -> Optional[CompositePrediction]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(CompositePrediction).where(
                    (CompositePrediction.id == parsed_uuid) | (CompositePrediction.prediction_id == clean_id),
                    CompositePrediction.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(CompositePrediction).where(
                    CompositePrediction.prediction_id == clean_id,
                    CompositePrediction.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def filter_and_paginate(
        self,
        transaction_id: Optional[str] = None,
        composite_risk_level: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[CompositePrediction], int]:
        try:
            query = select(CompositePrediction).where(CompositePrediction.is_deleted == False)

            if transaction_id:
                query = query.where(CompositePrediction.transaction_id.ilike(f"%{transaction_id.strip()}%"))
            if composite_risk_level:
                query = query.where(CompositePrediction.composite_risk_level.ilike(f"%{composite_risk_level.strip()}%"))

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(CompositePrediction, sort_by, CompositePrediction.created_at)
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
