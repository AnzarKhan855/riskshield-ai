from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.decision_execution import DecisionExecution
from app.repositories.base import BaseRepository


class DecisionExecutionRepository(BaseRepository[DecisionExecution]):
    def __init__(self, session: AsyncSession):
        super().__init__(DecisionExecution, session)

    async def get_by_decision_id(self, decision_id: uuid.UUID) -> List[DecisionExecution]:
        result = await self.session.execute(
            select(DecisionExecution)
            .where(DecisionExecution.decision_id == decision_id)
            .order_by(DecisionExecution.execution_order.asc())
        )
        return list(result.scalars().all())
