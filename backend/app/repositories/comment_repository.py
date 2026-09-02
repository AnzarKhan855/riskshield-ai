from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.case_comment import CaseComment
from app.repositories.base import BaseRepository


class CommentRepository(BaseRepository[CaseComment]):
    def __init__(self, session: AsyncSession):
        super().__init__(CaseComment, session)

    async def get_by_case_id(self, case_id: uuid.UUID) -> List[CaseComment]:
        result = await self.session.execute(
            select(CaseComment).where(CaseComment.case_id == case_id).order_by(CaseComment.created_at.asc())
        )
        return list(result.scalars().all())
