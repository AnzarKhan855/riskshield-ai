from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field
from app.domain.notifications.types import EventType, NotificationPriority


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    notification_id: str
    user_id: uuid.UUID
    title: str
    message: str
    type: str
    priority: str
    is_read: bool
    read_at: Optional[datetime] = None
    payload: Dict[str, Any]
    created_at: datetime


class PaginatedNotificationsResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int
    total: int
    page: int
    size: int
    pages: int


class EventLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: str
    event_type: str
    source: str
    payload: Dict[str, Any]
    created_at: datetime


class PaginatedEventLogsResponse(BaseModel):
    items: List[EventLogResponse]
    total: int
    page: int
    size: int
    pages: int


class MarkReadRequest(BaseModel):
    notification_ids: List[str] = Field(..., description="List of Notification IDs to mark as read")


class EventPublishRequest(BaseModel):
    event_type: EventType = Field(..., description="System Event Type enum")
    source: str = Field("API", description="Event source component")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Custom event metadata payload")
