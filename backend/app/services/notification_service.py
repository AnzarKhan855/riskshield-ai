import math
import secrets
from typing import Any, Dict, List, Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.notifications.event_bus import EventBus
from app.domain.notifications.template_engine import TemplateEngine
from app.domain.notifications.types import EventType, NotificationPriority
from app.models.event_log import EventLog
from app.models.notification import Notification
from app.repositories.event_log_repository import EventLogRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.notification import (
    EventLogResponse,
    NotificationResponse,
    PaginatedEventLogsResponse,
    PaginatedNotificationsResponse,
)
from app.services.notification_dispatcher import NotificationDispatcher


class NotificationService:
    def __init__(
        self,
        notification_repo: NotificationRepository,
        event_log_repo: EventLogRepository,
        user_repo: UserRepository,
    ):
        self.notification_repo = notification_repo
        self.event_log_repo = event_log_repo
        self.user_repo = user_repo
        self.event_bus = EventBus()
        self.dispatcher = NotificationDispatcher()
        self.template_engine = TemplateEngine()

    async def _generate_unique_notification_id(self) -> str:
        """Generate unique Notification ID formatted as NTF-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            ntf_id = f"NTF-{hex_suffix}"
            existing = await self.notification_repo.get_by_notification_id(ntf_id)
            if not existing:
                return ntf_id
        raise ValidationException("Failed to generate unique Notification ID.")

    async def _generate_unique_event_id(self) -> str:
        """Generate unique Event ID formatted as EVT-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            evt_id = f"EVT-{hex_suffix}"
            existing = await self.event_log_repo.get_by_event_id(evt_id)
            if not existing:
                return evt_id
        raise ValidationException("Failed to generate unique Event ID.")

    async def publish_event(
        self,
        event_type: EventType,
        source: str = "System",
        payload: Optional[Dict[str, Any]] = None,
        target_user_id: Optional[uuid.UUID] = None,
    ) -> EventLogResponse:
        """
        Publishes a system event:
        1. Persists EventLog (EVT-XXXXXXXX).
        2. Renders title, message, and priority using TemplateEngine.
        3. Creates Notification (NTF-XXXXXXXX) for target user (or primary admin).
        4. Broadcasts live payload over WebSocket via DeliveryService.
        5. Triggers EventBus subscribers.
        """
        payload = payload or {}
        evt_code = await self._generate_unique_event_id()

        event_record = EventLog(
            event_id=evt_code,
            event_type=event_type.value,
            source=source,
            payload=payload,
        )
        created_evt = await self.event_log_repo.create(event_record)

        # Build & Persist Notification if target_user_id exists
        user_to_notify = target_user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
        title, message, priority = self.template_engine.render(event_type, payload)
        ntf_code = await self._generate_unique_notification_id()

        ntf_record = Notification(
            notification_id=ntf_code,
            user_id=user_to_notify,
            title=title,
            message=message,
            type=event_type.value,
            priority=priority.value,
            is_read=False,
            payload=payload,
            is_deleted=False,
        )
        await self.notification_repo.create(ntf_record)

        # Broadcast live over WebSocket
        await self.dispatcher.dispatch_event_broadcast(event_type, payload, evt_code)

        # Publish to EventBus observers
        await self.event_bus.publish(event_type, payload)

        return EventLogResponse.model_validate(created_evt)

    async def list_notifications(
        self,
        user_id: uuid.UUID,
        is_read: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 10,
    ) -> PaginatedNotificationsResponse:
        """List user notifications with search and pagination."""
        items, total = await self.notification_repo.filter_and_paginate(
            user_id=user_id,
            is_read=is_read,
            search=search,
            page=page,
            size=size,
        )
        unread_count = await self.notification_repo.get_unread_count_for_user(user_id)
        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedNotificationsResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            unread_count=unread_count,
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def list_event_logs(
        self,
        event_type: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> PaginatedEventLogsResponse:
        """List platform event logs."""
        items, total = await self.event_log_repo.filter_and_paginate(
            event_type=event_type,
            search=search,
            page=page,
            size=size,
        )
        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedEventLogsResponse(
            items=[EventLogResponse.model_validate(e) for e in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def mark_as_read(
        self, notification_ids: List[str], user_id: uuid.UUID
    ) -> int:
        """Mark list of notification IDs as read for user."""
        return await self.notification_repo.mark_as_read(notification_ids, user_id)
