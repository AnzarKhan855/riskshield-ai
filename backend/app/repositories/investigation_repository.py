from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.investigation_case import InvestigationCase
from app.repositories.base import BaseRepository


class InvestigationRepository(BaseRepository[InvestigationCase]):
    def __init__(self, session: AsyncSession):
        super().__init__(InvestigationCase, session)

    async def get_by_case_id(self, case_id: str) -> Optional[InvestigationCase]:
        return await self.get_by_id_or_case_id(case_id)

    async def get_by_id_or_case_id(self, identifier: Any) -> Optional[InvestigationCase]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(InvestigationCase).where(
                    (InvestigationCase.id == parsed_uuid) | (InvestigationCase.case_id == clean_id),
                    InvestigationCase.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(InvestigationCase).where(
                    InvestigationCase.case_id == clean_id,
                    InvestigationCase.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def filter_and_paginate(
        self,
        search: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        analyst_id: Optional[uuid.UUID] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[InvestigationCase], int]:
        try:
            query = select(InvestigationCase).where(InvestigationCase.is_deleted == False)

            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    (InvestigationCase.case_id.ilike(pattern))
                    | (InvestigationCase.case_title.ilike(pattern))
                    | (InvestigationCase.transaction_id.ilike(pattern))
                )
            if priority:
                query = query.where(InvestigationCase.priority.ilike(f"%{priority.strip()}%"))
            if status:
                query = query.where(InvestigationCase.status.ilike(f"%{status.strip()}%"))
            if category:
                query = query.where(InvestigationCase.category.ilike(f"%{category.strip()}%"))
            if analyst_id:
                query = query.where(InvestigationCase.assigned_analyst_id == analyst_id)

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(InvestigationCase, sort_by, InvestigationCase.created_at)
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
