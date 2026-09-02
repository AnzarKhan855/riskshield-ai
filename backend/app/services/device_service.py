import math
import secrets
from typing import Any, List, Optional, Union
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.models.device import Device
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import (
    DeviceCreate,
    DeviceResponse,
    DeviceUpdate,
    PaginatedDeviceResponse,
)
from app.schemas.transaction import TransactionResponse


class DeviceService:
    def __init__(
        self,
        device_repo: DeviceRepository,
        audit_repo: AuditLogRepository,
    ):
        self.device_repo = device_repo
        self.audit_repo = audit_repo

    async def _generate_device_fingerprint(self) -> str:
        """Generate pseudo unique SHA fingerprint token."""
        return f"dev_{secrets.token_hex(16)}"

    async def create_device(
        self,
        data: DeviceCreate,
        creator_user_id: uuid.UUID,
    ) -> DeviceResponse:
        """Register a new device telemetry node."""
        fingerprint = data.device_fingerprint or await self._generate_device_fingerprint()

        existing = await self.device_repo.get_by_fingerprint(fingerprint)
        if existing:
            return DeviceResponse.model_validate(existing)

        device = Device(
            device_fingerprint=fingerprint,
            device_type=data.device_type,
            operating_system=data.operating_system,
            browser=data.browser,
            ip_address=data.ip_address,
            country=data.country,
            state=data.state,
            city=data.city,
            timezone=data.timezone,
            latitude=data.latitude,
            longitude=data.longitude,
            vpn_detected=data.vpn_detected,
            rooted_device=data.rooted_device,
            jailbroken=data.jailbroken,
            emulator=data.emulator,
            risk_flags=data.risk_flags,
            is_deleted=False,
        )

        created_device = await self.device_repo.create(device)

        await self.audit_repo.log_action(
            action="DEVICE_REGISTERED",
            user_id=creator_user_id,
            details={
                "device_id": str(created_device.id),
                "device_fingerprint": created_device.device_fingerprint,
                "ip_address": created_device.ip_address,
            },
        )

        return DeviceResponse.model_validate(created_device)

    async def get_device(self, id: Any) -> DeviceResponse:
        """Retrieve active device telemetry profile by ID or fingerprint."""
        device = await self.device_repo.get_active_by_id(id)
        if not device:
            raise NotFoundException(f"Device with ID '{id}' not found.")
        return DeviceResponse.model_validate(device)

    async def update_device(
        self,
        id: Any,
        data: DeviceUpdate,
        updater_user_id: uuid.UUID,
    ) -> DeviceResponse:
        """Update device telemetry parameters."""
        device = await self.device_repo.get_active_by_id(id)
        if not device:
            raise NotFoundException(f"Device with ID '{id}' not found.")

        update_values = data.model_dump(exclude_unset=True)
        if not update_values:
            return DeviceResponse.model_validate(device)

        updated_device = await self.device_repo.update(device.id, update_values)

        await self.audit_repo.log_action(
            action="DEVICE_UPDATED",
            user_id=updater_user_id,
            details={"device_fingerprint": device.device_fingerprint, "updates": list(update_values.keys())},
        )

        return DeviceResponse.model_validate(updated_device or device)

    async def soft_delete_device(
        self, id: Any, deleter_user_id: uuid.UUID
    ) -> None:
        """Soft delete device telemetry profile."""
        device = await self.device_repo.get_active_by_id(id)
        if not device:
            raise NotFoundException(f"Device with ID '{id}' not found.")

        await self.device_repo.soft_delete(device.id)

        await self.audit_repo.log_action(
            action="DEVICE_DELETED",
            user_id=deleter_user_id,
            details={"device_fingerprint": device.device_fingerprint},
        )

    async def list_devices(
        self,
        search: Optional[str] = None,
        vpn_detected: Optional[bool] = None,
        rooted_device: Optional[bool] = None,
        jailbroken: Optional[bool] = None,
        emulator: Optional[bool] = None,
        device_type: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "last_seen",
        sort_dir: str = "desc",
    ) -> PaginatedDeviceResponse:
        """List paginated device profiles."""
        items, total = await self.device_repo.filter_and_paginate(
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

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedDeviceResponse(
            items=[DeviceResponse.model_validate(d) for d in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def get_device_timeline(
        self, id: Any, limit: int = 20
    ) -> List[TransactionResponse]:
        """Fetch transaction timeline associated with device."""
        device = await self.device_repo.get_active_by_id(id)
        if not device:
            raise NotFoundException(f"Device with ID '{id}' not found.")

        txns = await self.device_repo.get_device_transactions(device.id, limit=limit)
        return [TransactionResponse.model_validate(t) for t in txns]
