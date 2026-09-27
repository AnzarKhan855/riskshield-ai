import datetime
from typing import Any, Dict, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from app.repositories.base import BaseRepository
from app.db.base import get_mongo_db

_IN_MEMORY_AUDIT_LOGS = []


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(AuditLog, session)

    async def log_action(
        self,
        action: str,
        user_id: Optional[Any] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        safe_user_id = None
        if user_id is not None:
            if isinstance(user_id, uuid.UUID):
                safe_user_id = user_id
            else:
                try:
                    safe_user_id = uuid.UUID(str(user_id))
                except (ValueError, AttributeError):
                    safe_user_id = None

        audit_log = AuditLog(
            id=uuid.uuid4(),
            user_id=safe_user_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )

        # Non-blocking sync to MongoDB Atlas audit_logs
        try:
            mongo_db = get_mongo_db()
            if mongo_db is not None:
                import asyncio
                async def _sync_mongo_audit():
                    try:
                        await mongo_db["audit_logs"].insert_one({
                            "id": str(audit_log.id),
                            "action": action,
                            "user_id": str(user_id) if user_id else None,
                            "ip_address": ip_address,
                            "user_agent": user_agent,
                            "details": details or {},
                            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        })
                    except Exception:
                        pass
                asyncio.create_task(_sync_mongo_audit())
        except Exception:
            pass

        try:
            return await self.create(audit_log)
        except Exception:
            _IN_MEMORY_AUDIT_LOGS.append(audit_log)
            return audit_log
