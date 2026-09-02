from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.explanation import Explanation
from app.repositories.base import BaseRepository


class ExplanationRepository(BaseRepository[Explanation]):
    def __init__(self, session: AsyncSession):
        super().__init__(Explanation, session)

    async def get_by_explanation_id(self, explanation_id: str) -> Optional[Explanation]:
        return await self.get_by_id_or_explanation_id(explanation_id)

    async def get_by_id_or_explanation_id(self, identifier: Any) -> Optional[Explanation]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Explanation).where(
                    (Explanation.id == parsed_uuid) | (Explanation.explanation_id == clean_id) | (Explanation.decision_id == clean_id),
                    Explanation.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(Explanation).where(
                    (Explanation.explanation_id == clean_id) | (Explanation.decision_id == clean_id),
                    Explanation.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_decision_id(self, decision_id: str) -> Optional[Explanation]:
        return await self.get_by_id_or_explanation_id(decision_id)

    async def filter_and_paginate(
        self,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[Explanation], int]:
        try:
            query = select(Explanation).where(Explanation.is_deleted == False)

            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    (Explanation.explanation_id.ilike(pattern))
                    | (Explanation.decision_id.ilike(pattern))
                    | (Explanation.transaction_id.ilike(pattern))
                    | (Explanation.primary_reason.ilike(pattern))
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Explanation, sort_by, Explanation.created_at)
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
