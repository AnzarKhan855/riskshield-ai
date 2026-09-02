from typing import Any, List, Optional, Tuple
import uuid
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.customer import Customer
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, session: AsyncSession):
        super().__init__(Customer, session)

    async def get_active_by_id(self, id: Any) -> Optional[Customer]:
        return await self.get_by_id_or_customer_id(id)

    async def get_by_customer_id(self, customer_id: str) -> Optional[Customer]:
        try:
            result = await self.session.execute(
                select(Customer).where(
                    Customer.customer_id == str(customer_id).strip(),
                    Customer.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_id_or_customer_id(self, identifier: Any) -> Optional[Customer]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Customer).where(
                    (Customer.id == parsed_uuid) | (Customer.customer_id == clean_id),
                    Customer.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return await self.get_by_customer_id(clean_id)

    async def soft_delete(self, id: Any) -> bool:
        try:
            customer = await self.get_by_id_or_customer_id(id)
            if not customer:
                return False
            stmt = (
                update(Customer)
                .where(Customer.id == customer.id, Customer.is_deleted == False)
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
        merchant_id: Optional[uuid.UUID] = None,
        min_ltv: Optional[float] = None,
        max_ltv: Optional[float] = None,
        country: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Tuple[List[Customer], int]:
        try:
            query = select(Customer).where(Customer.is_deleted == False)

            if merchant_id:
                query = query.where(Customer.merchant_id == merchant_id)
            if country:
                query = query.where(Customer.country.ilike(f"%{country.strip()}%"))
            if min_ltv is not None:
                query = query.where(Customer.lifetime_value >= min_ltv)
            if max_ltv is not None:
                query = query.where(Customer.lifetime_value <= max_ltv)

            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        Customer.customer_id.ilike(term),
                        Customer.email.ilike(term),
                        Customer.first_name.ilike(term),
                        Customer.last_name.ilike(term),
                        Customer.phone.ilike(term),
                    )
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Customer, sort_by, Customer.created_at)
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

    async def get_customer_transactions(self, identifier: Any, limit: int = 25) -> List[Any]:
        try:
            from app.models.transaction import Transaction
            customer = await self.get_by_id_or_customer_id(identifier)
            if not customer:
                return []
            result = await self.session.execute(
                select(Transaction)
                .where(
                    (Transaction.customer_profile_id == customer.id) | (Transaction.customer_id == customer.customer_id),
                    Transaction.is_deleted == False
                )
                .order_by(Transaction.timestamp.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception:
            return []
