from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.evidence import Evidence
from app.repositories.base import BaseRepository


class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self, session: AsyncSession):
        super().__init__(Evidence, session)

    async def get_by_case_id(self, case_id: uuid.UUID) -> List[Evidence]:
        result = await self.session.execute(
            select(Evidence).where(Evidence.case_id == case_id).order_by(Evidence.created_at.asc())
        )
        return list(result.scalars().all())
