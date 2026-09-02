from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction_history import PredictionHistory
from app.repositories.base import BaseRepository


class PredictionHistoryRepository(BaseRepository[PredictionHistory]):
    def __init__(self, session: AsyncSession):
        super().__init__(PredictionHistory, session)

    async def get_by_prediction_id(self, prediction_id: str) -> Optional[PredictionHistory]:
        return await self.get_by_id_or_pred_id(prediction_id)

    async def get_by_id_or_pred_id(self, identifier: Any) -> Optional[PredictionHistory]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(PredictionHistory).where(
                    (PredictionHistory.id == parsed_uuid) | (PredictionHistory.prediction_id == clean_id),
                    PredictionHistory.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(PredictionHistory).where(
                    PredictionHistory.prediction_id == clean_id,
                    PredictionHistory.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def filter_and_paginate(
        self,
        transaction_id: Optional[str] = None,
        model_id: Optional[uuid.UUID] = None,
        prediction_result: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[PredictionHistory], int]:
        try:
            query = select(PredictionHistory).where(PredictionHistory.is_deleted == False)

            if transaction_id:
                query = query.where(PredictionHistory.transaction_id.ilike(f"%{transaction_id.strip()}%"))
            if model_id:
                query = query.where(PredictionHistory.model_id == model_id)
            if prediction_result:
                query = query.where(PredictionHistory.prediction_result.ilike(f"%{prediction_result.strip()}%"))

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(PredictionHistory, sort_by, PredictionHistory.created_at)
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
