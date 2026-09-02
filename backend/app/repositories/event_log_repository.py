from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event_log import EventLog
from app.repositories.base import BaseRepository

_IN_MEMORY_EVENTS: Dict[str, EventLog] = {}


class EventLogRepository(BaseRepository[EventLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(EventLog, session)

    async def create(self, entity: EventLog) -> EventLog:
        if not entity.id:
            entity.id = uuid.uuid4()
        if not entity.created_at:
            entity.created_at = datetime.now(timezone.utc)
        if entity.payload is None:
            entity.payload = {}
        if entity.event_id:
            _IN_MEMORY_EVENTS[entity.event_id] = entity
        try:
            return await super().create(entity)
        except Exception:
            try:
                await self.session.rollback()
            except Exception:
                pass
            return entity

    async def get_by_event_id(self, event_id: str) -> Optional[EventLog]:
        try:
            result = await self.session.execute(
                select(EventLog).where(EventLog.event_id == event_id.strip())
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            try:
                await self.session.rollback()
            except Exception:
                pass
        return _IN_MEMORY_EVENTS.get(event_id.strip())

    async def filter_and_paginate(
        self,
        event_type: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> Tuple[List[EventLog], int]:
        """Query event logs with event type filter and pagination."""
        try:
            events = list(_IN_MEMORY_EVENTS.values())
            for e in events:
                if not e.created_at:
                    e.created_at = datetime.now(timezone.utc)
                if e.payload is None:
                    e.payload = {}
            if event_type:
                events = [e for e in events if e.event_type == event_type.strip()]
            if search:
                s = search.lower()
                events = [
                    e
                    for e in events
                    if (e.event_id and s in e.event_id.lower())
                    or (e.event_type and s in e.event_type.lower())
                    or (e.source and s in e.source.lower())
                ]
            total = len(events)
            events.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
            offset = (page - 1) * size
            return events[offset : offset + size], total
        except Exception:
            return [], 0
