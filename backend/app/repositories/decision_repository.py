from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.decision import Decision
from app.repositories.base import BaseRepository
from app.db.base import get_mongo_db

_IN_MEMORY_DECISIONS: Dict[str, Decision] = {}


class DecisionRepository(BaseRepository[Decision]):
    def __init__(self, session: AsyncSession):
        super().__init__(Decision, session)

    async def create(self, entity: Decision) -> Decision:
        if not entity.id:
            entity.id = uuid.uuid4()
        if not entity.created_at:
            entity.created_at = datetime.now(timezone.utc)
        if not entity.updated_at:
            entity.updated_at = datetime.now(timezone.utc)
        if entity.decision_id:
            _IN_MEMORY_DECISIONS[entity.decision_id] = entity

        # Asynchronously sync to MongoDB Atlas
        try:
            mongo_db = get_mongo_db()
            if mongo_db is not None:
                await mongo_db["decisions"].insert_one({
                    "decision_id": entity.decision_id,
                    "transaction_id": entity.transaction_id,
                    "composite_prediction_id": entity.composite_prediction_id,
                    "decision": entity.decision,
                    "decision_status": entity.decision_status,
                    "decision_confidence": float(entity.decision_confidence or 0.0),
                    "composite_risk_score": float(entity.composite_risk_score or 0.0),
                    "decision_reason": entity.decision_reason,
                    "triggered_rules": entity.triggered_rules or [],
                    "triggered_policies": entity.triggered_policies or [],
                    "execution_time_ms": float(entity.execution_time_ms or 0.0),
                    "created_at": entity.created_at.isoformat() if entity.created_at else None,
                })
        except Exception:
            pass

        try:
            return await super().create(entity)
        except Exception:
            return entity

    async def get_by_decision_id(self, decision_id: str) -> Optional[Decision]:
        try:
            result = await self.session.execute(
                select(Decision).where(
                    Decision.decision_id == decision_id.strip(),
                    Decision.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return _IN_MEMORY_DECISIONS.get(decision_id.strip())

    async def get_by_transaction_id(self, transaction_id: str) -> Optional[Decision]:
        try:
            result = await self.session.execute(
                select(Decision)
                .where(
                    Decision.transaction_id == transaction_id.strip(),
                    Decision.is_deleted == False,
                )
                .order_by(Decision.created_at.desc())
            )
            val = result.scalars().first()
            if val:
                return val
        except Exception:
            pass
        for dec in _IN_MEMORY_DECISIONS.values():
            if dec.transaction_id and dec.transaction_id.strip() == transaction_id.strip():
                return dec
        return None

    async def get_by_id_or_decision_id(self, identifier: str) -> Optional[Decision]:
        clean_id = identifier.strip() if isinstance(identifier, str) else str(identifier)
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Decision).where(
                    (Decision.id == parsed_uuid) | (Decision.decision_id == clean_id),
                    Decision.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return await self.get_by_decision_id(clean_id)

    async def filter_and_paginate(
        self,
        transaction_id: Optional[str] = None,
        decision_action: Optional[str] = None,
        review_status: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[Decision], int]:
        try:
            query = select(Decision).where(Decision.is_deleted == False)

            if transaction_id:
                query = query.where(Decision.transaction_id.ilike(f"%{transaction_id.strip()}%"))
            if decision_action:
                query = query.where(Decision.decision.ilike(f"%{decision_action.strip()}%"))
            if review_status:
                query = query.where(Decision.review_status == review_status.strip())

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Decision, sort_by, Decision.created_at)
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
            decisions = list(_IN_MEMORY_DECISIONS.values())
            if transaction_id:
                t = transaction_id.lower()
                decisions = [d for d in decisions if d.transaction_id and t in d.transaction_id.lower()]
            if decision_action:
                a = decision_action.lower()
                decisions = [d for d in decisions if d.decision and a in d.decision.lower()]
            if review_status:
                decisions = [d for d in decisions if d.review_status == review_status]
            total = len(decisions)
            decisions.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
            offset = (page - 1) * size
            return decisions[offset : offset + size], total
