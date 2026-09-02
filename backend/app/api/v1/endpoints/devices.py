from typing import Any, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_device_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.device import (
    DeviceCreate,
    DeviceResponse,
    DeviceUpdate,
    PaginatedDeviceResponse,
)
from app.schemas.transaction import TransactionResponse
from app.services.device_service import DeviceService

router = APIRouter()


@router.get(
    "",
    response_model=APIResponse[PaginatedDeviceResponse],
    summary="List device profiles with search, VPN/Rooted filters, and pagination",
)
async def list_devices(
    search: Optional[str] = Query(None, description="Search term across fingerprint, IP, OS, browser"),
    vpn_detected: Optional[bool] = Query(None, description="Filter by VPN detection"),
    rooted_device: Optional[bool] = Query(None, description="Filter by Rooted status"),
    jailbroken: Optional[bool] = Query(None, description="Filter by Jailbroken status"),
    emulator: Optional[bool] = Query(None, description="Filter by Emulator detection"),
    device_type: Optional[str] = Query(None, description="Filter by device type"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("last_seen", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc/desc)"),
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    result = await device_service.list_devices(
        search=search,
        vpn_detected=vpn_detected,
        rooted_device=rooted_device,
        jailbroken=jailbroken,
        emulator=emulator,
        device_type=device_type,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Device profiles retrieved successfully",
    )


@router.get(
    "/search",
    response_model=APIResponse[PaginatedDeviceResponse],
    summary="Search devices explicitly",
)
async def search_devices(
    q: str = Query(..., min_length=1, description="Search query string"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    result = await device_service.list_devices(
        search=q,
        page=page,
        size=size,
    )
    return success_response(
        data=result,
        message="Device search results retrieved",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[DeviceResponse],
    summary="Get device profile details by UUID or fingerprint",
)
async def get_device(
    id: str,
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    device = await device_service.get_device(id)
    return success_response(
        data=device,
        message="Device details retrieved",
    )


@router.get(
    "/{id}/transactions",
    response_model=APIResponse[List[TransactionResponse]],
    summary="Get device transaction timeline",
)
async def get_device_timeline(
    id: str,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    timeline = await device_service.get_device_timeline(id, limit=limit)
    return success_response(
        data=timeline,
        message="Device transaction timeline retrieved",
    )


@router.post(
    "",
    response_model=APIResponse[DeviceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new device profile",
)
async def create_device(
    data: DeviceCreate,
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    device = await device_service.create_device(
        data=data,
        creator_user_id=current_user.id,
    )
    return success_response(
        data=device,
        message="Device registered successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[DeviceResponse],
    summary="Update device profile details",
)
async def update_device(
    id: str,
    data: DeviceUpdate,
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    updated_device = await device_service.update_device(
        id=id,
        data=data,
        updater_user_id=current_user.id,
    )
    return success_response(
        data=updated_device,
        message="Device updated successfully",
    )


@router.delete(
    "/{id}",
    response_model=APIResponse[None],
    summary="Soft-delete a device record",
)
async def delete_device(
    id: str,
    current_user: User = Depends(get_current_active_user),
    device_service: DeviceService = Depends(get_device_service),
) -> Any:
    await device_service.soft_delete_device(
        id=id,
        deleter_user_id=current_user.id,
    )
    return success_response(message="Device soft-deleted successfully")
