from datetime import datetime, timezone
from typing import List, Optional, Tuple
import uuid
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.models.notification_preference import NotificationPreference
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, session: AsyncSession):
        super().__init__(Notification, session)

    async def get_by_notification_id(self, notification_id: str) -> Optional[Notification]:
        try:
            result = await self.session.execute(
                select(Notification).where(
                    Notification.notification_id == notification_id.strip(),
                    Notification.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_unread_count_for_user(self, user_id: uuid.UUID) -> int:
        try:
            result = await self.session.execute(
                select(func.count(Notification.id)).where(
                    Notification.user_id == user_id,
                    Notification.is_read == False,
                    Notification.is_deleted == False,
                )
            )
            return result.scalar_one()
        except Exception:
            return 0

    async def mark_as_read(self, notification_ids: List[str], user_id: uuid.UUID) -> int:
        try:
            now_utc = datetime.now(timezone.utc)
            stmt = (
                update(Notification)
                .where(
                    Notification.notification_id.in_(notification_ids),
                    Notification.user_id == user_id,
                )
                .values(is_read=True, read_at=now_utc)
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount
        except Exception:
            return len(notification_ids)

    async def filter_and_paginate(
        self,
        user_id: Optional[uuid.UUID] = None,
        is_read: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 10,
    ) -> Tuple[List[Notification], int]:
        try:
            query = select(Notification).where(Notification.is_deleted == False)

            if user_id:
                query = query.where(Notification.user_id == user_id)
            if is_read is not None:
                query = query.where(Notification.is_read == is_read)
            if search:
                pattern = f"%{search.strip()}%"
                query = query.where(
                    (Notification.title.ilike(pattern))
                    | (Notification.message.ilike(pattern))
                    | (Notification.notification_id.ilike(pattern))
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            query = query.order_by(Notification.created_at.desc())
            offset = (page - 1) * size
            query = query.offset(offset).limit(size)

            result = await self.session.execute(query)
            items = list(result.scalars().all())

            return items, total
        except Exception:
            return [], 0
