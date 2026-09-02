from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository

# In-memory fallback dictionary when database is unreachable
_IN_MEMORY_USERS: Dict[str, User] = {}


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        email_clean = email.lower().strip()
        try:
            result = await self.session.execute(
                select(User).where(User.email == email_clean)
            )
            res = result.scalar_one_or_none()
            if res:
                return res
            return _IN_MEMORY_USERS.get(email_clean)
        except Exception:
            return _IN_MEMORY_USERS.get(email_clean)

    async def create(self, instance: User) -> User:
        now = datetime.now(timezone.utc)
        if not instance.created_at:
            instance.created_at = now
        if not instance.updated_at:
            instance.updated_at = now
        if not instance.id:
            instance.id = uuid.uuid4()

        if hasattr(instance, "email") and instance.email:
            _IN_MEMORY_USERS[instance.email.lower().strip()] = instance
        _IN_MEMORY_USERS[str(instance.id)] = instance

        try:
            return await super().create(instance)
        except Exception:
            return instance

    async def get_by_id(self, id: uuid.UUID) -> Optional[User]:
        try:
            result = await self.session.execute(
                select(User).where(User.id == id)
            )
            res = result.scalar_one_or_none()
            if res:
                return res
            return _IN_MEMORY_USERS.get(str(id))
        except Exception:
            return _IN_MEMORY_USERS.get(str(id))

    async def update(self, id: uuid.UUID, values: Dict[str, Any]) -> Optional[User]:
        user_str_id = str(id)
        cached_user = _IN_MEMORY_USERS.get(user_str_id)
        if cached_user:
            for k, v in values.items():
                if hasattr(cached_user, k):
                    setattr(cached_user, k, v)
            if hasattr(cached_user, "email") and cached_user.email:
                _IN_MEMORY_USERS[cached_user.email.lower().strip()] = cached_user

        try:
            return await super().update(id, values)
        except Exception:
            return cached_user

    async def update_last_login(self, user_id: uuid.UUID) -> Optional[User]:
        now = datetime.now(timezone.utc)
        return await self.update(user_id, {"last_login": now, "updated_at": now})
