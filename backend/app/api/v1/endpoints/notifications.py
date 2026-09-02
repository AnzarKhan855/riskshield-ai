from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from app.core.deps import (
    get_current_active_user,
    get_delivery_service,
    get_notification_service,
)
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.notification import (
    EventLogResponse,
    EventPublishRequest,
    MarkReadRequest,
    PaginatedEventLogsResponse,
    PaginatedNotificationsResponse,
)
from app.services.delivery_service import DeliveryService
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedNotificationsResponse],
    summary="List notifications for authenticated user",
)
async def list_notifications(
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    search: Optional[str] = Query(None, description="Search notification title or message"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    service: NotificationService = Depends(get_notification_service),
) -> Any:
    result = await service.list_notifications(
        user_id=current_user.id,
        is_read=is_read,
        search=search,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Notifications retrieved successfully",
    )


@router.get(
    "/events",
    response_model=APIResponse[PaginatedEventLogsResponse],
    summary="List platform event logs",
)
async def list_event_logs(
    event_type: Optional[str] = Query(None, description="Filter by Event Type"),
    search: Optional[str] = Query(None, description="Search event logs"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    service: NotificationService = Depends(get_notification_service),
) -> Any:
    result = await service.list_event_logs(
        event_type=event_type,
        search=search,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Event logs retrieved successfully",
    )


@router.post(
    "/read",
    response_model=APIResponse[dict],
    summary="Mark notifications as read",
)
async def mark_notifications_read(
    body: MarkReadRequest,
    current_user: User = Depends(get_current_active_user),
    service: NotificationService = Depends(get_notification_service),
) -> Any:
    count = await service.mark_as_read(body.notification_ids, current_user.id)
    return success_response(
        data={"updated_count": count},
        message=f"Marked {count} notifications as read",
    )


@router.post(
    "/read-all",
    response_model=APIResponse[dict],
    summary="Mark all notifications as read",
)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    service: NotificationService = Depends(get_notification_service),
) -> Any:
    res = await service.list_notifications(user_id=current_user.id, is_read=False, size=100)
    ids = [n.id for n in res.items]
    count = await service.mark_as_read(ids, current_user.id) if ids else 0
    return success_response(
        data={"updated_count": count},
        message=f"Marked {count} notifications as read",
    )


@router.post(
    "/events/publish",
    response_model=APIResponse[EventLogResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Publish a custom platform event",
)
async def publish_event(
    body: EventPublishRequest,
    current_user: User = Depends(get_current_active_user),
    service: NotificationService = Depends(get_notification_service),
) -> Any:
    result = await service.publish_event(
        event_type=body.event_type,
        source=body.source,
        payload=body.payload,
        target_user_id=current_user.id,
    )
    return success_response(
        data=result,
        message="Event published and broadcasted successfully",
    )


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    delivery_service: DeliveryService = Depends(get_delivery_service),
):
    """Real-time WebSocket event notification feed."""
    await delivery_service.connect(websocket)
    try:
        while True:
            # Keep connection alive & receive optional client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except (WebSocketDisconnect, Exception):
        delivery_service.disconnect(websocket)
