from typing import Any, List, Optional, Tuple
import uuid
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.device import Device
from app.repositories.base import BaseRepository


class DeviceRepository(BaseRepository[Device]):
    def __init__(self, session: AsyncSession):
        super().__init__(Device, session)

    async def get_active_by_id(self, id: Any) -> Optional[Device]:
        return await self.get_by_id_or_fingerprint(id)

    async def get_by_fingerprint(self, fingerprint: str) -> Optional[Device]:
        try:
            result = await self.session.execute(
                select(Device).where(
                    Device.device_fingerprint == str(fingerprint).strip(),
                    Device.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_id_or_fingerprint(self, identifier: Any) -> Optional[Device]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Device).where(
                    (Device.id == parsed_uuid) | (Device.device_fingerprint == clean_id),
                    Device.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return await self.get_by_fingerprint(clean_id)

    async def soft_delete(self, id: Any) -> bool:
        try:
            device = await self.get_by_id_or_fingerprint(id)
            if not device:
                return False
            stmt = (
                update(Device)
                .where(Device.id == device.id, Device.is_deleted == False)
                .values(is_deleted=True)
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount > 0
        except Exception:
            return False

    async def filter_and_paginate(
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
    ) -> Tuple[List[Device], int]:
        try:
            query = select(Device).where(Device.is_deleted == False)

            if vpn_detected is not None:
                query = query.where(Device.vpn_detected == vpn_detected)
            if rooted_device is not None:
                query = query.where(Device.rooted_device == rooted_device)
            if jailbroken is not None:
                query = query.where(Device.jailbroken == jailbroken)
            if emulator is not None:
                query = query.where(Device.emulator == emulator)
            if device_type:
                query = query.where(Device.device_type.ilike(f"%{device_type.strip()}%"))

            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        Device.device_fingerprint.ilike(term),
                        Device.ip_address.ilike(term),
                        Device.os_version.ilike(term),
                        Device.browser.ilike(term),
                        Device.device_model.ilike(term),
                    )
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Device, sort_by, Device.last_seen)
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
            return [], 0

    async def get_device_transactions(self, identifier: Any, limit: int = 25) -> List[Any]:
        try:
            from app.models.transaction import Transaction
            device = await self.get_by_id_or_fingerprint(identifier)
            if not device:
                return []
            result = await self.session.execute(
                select(Transaction)
                .where(
                    (Transaction.device_profile_id == device.id) | (Transaction.device_id == device.device_fingerprint),
                    Transaction.is_deleted == False
                )
                .order_by(Transaction.timestamp.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception:
            return []
