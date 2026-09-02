from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant import (
    Merchant,
    MerchantStatus,
    RiskLevel,
    VerificationStatus,
)
from app.repositories.base import BaseRepository


class MerchantRepository(BaseRepository[Merchant]):
    def __init__(self, session: AsyncSession):
        super().__init__(Merchant, session)

    async def get_active_by_id(self, id: Any) -> Optional[Merchant]:
        return await self.get_by_id_or_code(id)

    async def get_by_code(self, merchant_code: str) -> Optional[Merchant]:
        try:
            result = await self.session.execute(
                select(Merchant).where(
                    Merchant.merchant_code == str(merchant_code).strip(),
                    Merchant.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_id_or_code(self, identifier: Any) -> Optional[Merchant]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Merchant).where(
                    (Merchant.id == parsed_uuid) | (Merchant.merchant_code == clean_id),
                    Merchant.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return await self.get_by_code(clean_id)

    async def soft_delete(self, id: Any) -> bool:
        try:
            merchant = await self.get_by_id_or_code(id)
            if not merchant:
                return False
            stmt = (
                update(Merchant)
                .where(Merchant.id == merchant.id, Merchant.is_deleted == False)
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
        status: Optional[MerchantStatus] = None,
        risk_level: Optional[RiskLevel] = None,
        verification_status: Optional[VerificationStatus] = None,
        industry: Optional[str] = None,
        owner_user_id: Optional[uuid.UUID] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[Merchant], int]:
        try:
            query = select(Merchant).where(Merchant.is_deleted == False)

            if status:
                query = query.where(Merchant.status == status)
            if risk_level:
                query = query.where(Merchant.risk_level == risk_level)
            if verification_status:
                query = query.where(Merchant.verification_status == verification_status)
            if industry:
                query = query.where(Merchant.industry.ilike(f"%{industry.strip()}%"))
            if owner_user_id:
                query = query.where(Merchant.owner_user_id == owner_user_id)

            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        Merchant.business_name.ilike(term),
                        Merchant.legal_business_name.ilike(term),
                        Merchant.merchant_code.ilike(term),
                        Merchant.business_email.ilike(term),
                        Merchant.gst_number.ilike(term),
                        Merchant.pan_number.ilike(term),
                    )
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Merchant, sort_by, Merchant.created_at)
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
