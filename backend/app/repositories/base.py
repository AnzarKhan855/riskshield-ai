from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
import uuid
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: uuid.UUID) -> Optional[ModelType]:
        try:
            result = await self.session.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none()
        except Exception:
            return None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        try:
            result = await self.session.execute(
                select(self.model).offset(skip).limit(limit)
            )
            return list(result.scalars().all())
        except Exception:
            return []

    async def create(self, instance: ModelType) -> ModelType:
        try:
            self.session.add(instance)
            await self.session.commit()
            await self.session.refresh(instance)
            return instance
        except Exception:
            if not getattr(instance, "id", None):
                setattr(instance, "id", uuid.uuid4())
            return instance

    async def update(self, id: uuid.UUID, values: Dict[str, Any]) -> Optional[ModelType]:
        try:
            stmt = (
                update(self.model)
                .where(self.model.id == id)
                .values(**values)
                .execution_options(synchronize_session="fetch")
            )
            await self.session.execute(stmt)
            await self.session.commit()
            return await self.get_by_id(id)
        except Exception:
            return None

    async def delete(self, id: uuid.UUID) -> bool:
        try:
            stmt = delete(self.model).where(self.model.id == id)
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount > 0
        except Exception:
            return False
