from datetime import datetime
from typing import Any, List, Optional, Tuple, Union
import uuid
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import (
    PaymentMethod,
    Transaction,
    TransactionStatus,
    TransactionType,
)
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, session: AsyncSession):
        super().__init__(Transaction, session)

    async def get_active_by_id(self, id: Any) -> Optional[Transaction]:
        return await self.get_by_id_or_txn_id(id)

    async def get_by_txn_id(self, transaction_id: str) -> Optional[Transaction]:
        try:
            result = await self.session.execute(
                select(Transaction).where(
                    Transaction.transaction_id == str(transaction_id).strip(),
                    Transaction.is_deleted == False,
                )
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_by_id_or_txn_id(self, identifier: Any) -> Optional[Transaction]:
        if identifier is None:
            return None
        clean_id = str(identifier).strip()
        try:
            parsed_uuid = uuid.UUID(clean_id)
            result = await self.session.execute(
                select(Transaction).where(
                    (Transaction.id == parsed_uuid) | (Transaction.transaction_id == clean_id),
                    Transaction.is_deleted == False,
                )
            )
            val = result.scalar_one_or_none()
            if val:
                return val
        except Exception:
            pass
        return await self.get_by_txn_id(clean_id)

    async def soft_delete(self, id: Any) -> bool:
        try:
            txn = await self.get_by_id_or_txn_id(id)
            if not txn:
                return False
            stmt = (
                update(Transaction)
                .where(Transaction.id == txn.id, Transaction.is_deleted == False)
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
        status: Optional[TransactionStatus] = None,
        merchant_id: Optional[uuid.UUID] = None,
        payment_method: Optional[PaymentMethod] = None,
        country: Optional[str] = None,
        transaction_type: Optional[TransactionType] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "timestamp",
        sort_dir: str = "desc",
    ) -> Tuple[List[Transaction], int]:
        try:
            query = select(Transaction).where(Transaction.is_deleted == False)

            if status:
                query = query.where(Transaction.status == status)
            if merchant_id:
                query = query.where(Transaction.merchant_id == merchant_id)
            if payment_method:
                query = query.where(Transaction.payment_method == payment_method)
            if country:
                query = query.where(Transaction.country.ilike(f"%{country.strip()}%"))
            if transaction_type:
                query = query.where(Transaction.transaction_type == transaction_type)
            if min_amount is not None:
                query = query.where(Transaction.amount >= min_amount)
            if max_amount is not None:
                query = query.where(Transaction.amount <= max_amount)
            if start_date:
                query = query.where(Transaction.timestamp >= start_date)
            if end_date:
                query = query.where(Transaction.timestamp <= end_date)

            if search and search.strip():
                term = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        Transaction.transaction_id.ilike(term),
                        Transaction.customer_id.ilike(term),
                        Transaction.card_bin.ilike(term),
                        Transaction.card_last4.ilike(term),
                        Transaction.ip_address.ilike(term),
                        Transaction.currency.ilike(term),
                    )
                )

            count_query = select(func.count()).select_from(query.subquery())
            total_result = await self.session.execute(count_query)
            total = total_result.scalar_one()

            sort_column = getattr(Transaction, sort_by, Transaction.timestamp)
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
