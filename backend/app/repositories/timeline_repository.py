from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.case_timeline import CaseTimeline
from app.repositories.base import BaseRepository


class TimelineRepository(BaseRepository[CaseTimeline]):
    def __init__(self, session: AsyncSession):
        super().__init__(CaseTimeline, session)

    async def get_by_case_id(self, case_id: uuid.UUID) -> List[CaseTimeline]:
        result = await self.session.execute(
            select(CaseTimeline).where(CaseTimeline.case_id == case_id).order_by(CaseTimeline.created_at.asc())
        )
        return list(result.scalars().all())
