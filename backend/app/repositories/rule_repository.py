from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.decision_rule import DecisionRule
from app.repositories.base import BaseRepository


class DecisionRuleRepository(BaseRepository[DecisionRule]):
    def __init__(self, session: AsyncSession):
        super().__init__(DecisionRule, session)

    async def get_by_rule_id(self, rule_id: str) -> Optional[DecisionRule]:
        return await self.get_by_id_or_rule_id(rule_id)

    async def get_by_id_or_rule_id(self, identifier: Any) -> Optional[DecisionRule]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(DecisionRule).where(
                    (DecisionRule.id == parsed_uuid) | (DecisionRule.rule_id == clean_id),
                    DecisionRule.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        try:
            result = await self.session.execute(
                select(DecisionRule).where(
                    DecisionRule.rule_id == clean_id,
                    DecisionRule.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_active_published_rules(self) -> List[DecisionRule]:
        try:
            result = await self.session.execute(
                select(DecisionRule)
                .where(
                    DecisionRule.enabled == True,
                    DecisionRule.status == "PUBLISHED",
                    DecisionRule.is_deleted == False,
                )
                .order_by(DecisionRule.priority.asc())
            )
            return list(result.scalars().all())
        except Exception:
            return []

    async def filter_and_paginate(
        self,
        search: Optional[str] = None,
        rule_category: Optional[str] = None,
        status: Optional[str] = None,
        enabled: Optional[bool] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "priority",
        sort_dir: str = "asc",
    ) -> Tuple[List[DecisionRule], int]:
        try:
            query = select(DecisionRule).where(DecisionRule.is_deleted == False)

            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    (DecisionRule.rule_name.ilike(pattern))
                    | (DecisionRule.rule_id.ilike(pattern))
                    | (DecisionRule.description.ilike(pattern))
                )
            if rule_category:
                query = query.where(DecisionRule.rule_category == rule_category.strip())
            if status:
                query = query.where(DecisionRule.status == status.strip())
            if enabled is not None:
                query = query.where(DecisionRule.enabled == enabled)

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(DecisionRule, sort_by, DecisionRule.priority)
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
