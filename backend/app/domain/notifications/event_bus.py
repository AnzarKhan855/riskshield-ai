import asyncio
from typing import Any, Callable, Dict, List
from app.domain.notifications.types import EventType


class EventBus:
    """Async Pub-Sub EventBus engine for system event distribution."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBus, cls).__new__(cls)
            cls._instance._subscribers: Dict[str, List[Callable]] = {}
        return cls._instance

    def subscribe(self, event_type: EventType, handler: Callable) -> None:
        """Register a subscriber callback handler for an event type."""
        key = event_type.value
        if key not in self._subscribers:
            self._subscribers[key] = []
        if handler not in self._subscribers[key]:
            self._subscribers[key].append(handler)

    def unsubscribe(self, event_type: EventType, handler: Callable) -> None:
        """Remove a subscriber callback handler."""
        key = event_type.value
        if key in self._subscribers and handler in self._subscribers[key]:
            self._subscribers[key].remove(handler)

    async def publish(self, event_type: EventType, payload: Dict[str, Any]) -> None:
        """Publish event to all registered subscriber callbacks asynchronously."""
        key = event_type.value
        handlers = self._subscribers.get(key, [])
        if handlers:
            tasks = [asyncio.create_task(h(event_type, payload)) for h in handlers]
            await asyncio.gather(*tasks, return_exceptions=True)
