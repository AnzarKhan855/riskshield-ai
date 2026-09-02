from typing import Any, Dict
from app.domain.notifications.template_engine import TemplateEngine
from app.domain.notifications.types import EventType
from app.services.delivery_service import DeliveryService


class NotificationDispatcher:
    def __init__(self):
        self.template_engine = TemplateEngine()
        self.delivery_service = DeliveryService()

    async def dispatch_event_broadcast(
        self, event_type: EventType, payload: Dict[str, Any], event_id: str
    ) -> None:
        """Render event notification and broadcast to all live WebSocket clients."""
        title, message, priority = self.template_engine.render(event_type, payload)

        ws_payload = {
            "event_id": event_id,
            "event_type": event_type.value,
            "title": title,
            "message": message,
            "priority": priority.value,
            "payload": payload,
        }

        await self.delivery_service.broadcast_json(ws_payload)
