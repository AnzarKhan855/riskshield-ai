from datetime import datetime, timezone
from typing import Dict, Optional
import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.refresh_token import RefreshToken
from app.models.password_reset import PasswordResetToken
from app.core.security import hash_token
from app.repositories.base import BaseRepository

_IN_MEMORY_TOKENS: Dict[str, RefreshToken] = {}
_IN_MEMORY_RESET_TOKENS: Dict[str, PasswordResetToken] = {}


class TokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, session: AsyncSession):
        super().__init__(RefreshToken, session)

    async def create_refresh_token(
        self, user_id: uuid.UUID, raw_token: str, expires_at: datetime
    ) -> RefreshToken:
        token_hash = hash_token(raw_token)
        refresh_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False,
        )
        _IN_MEMORY_TOKENS[token_hash] = refresh_token
        try:
            return await self.create(refresh_token)
        except Exception:
            return refresh_token

    async def get_valid_refresh_token(self, raw_token: str) -> Optional[RefreshToken]:
        token_hash = hash_token(raw_token)
        try:
            result = await self.session.execute(
                select(RefreshToken).where(
                    RefreshToken.token_hash == token_hash,
                    RefreshToken.revoked == False,
                    RefreshToken.expires_at > datetime.now(timezone.utc),
                )
            )
            res = result.scalar_one_or_none()
            if res:
                return res
            return _IN_MEMORY_TOKENS.get(token_hash)
        except Exception:
            tok = _IN_MEMORY_TOKENS.get(token_hash)
            if tok and not tok.revoked and tok.expires_at > datetime.now(timezone.utc):
                return tok
            return None

    async def revoke_refresh_token(
        self, raw_token: str, replaced_by: Optional[str] = None
    ) -> bool:
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        replaced_hash = hash_token(replaced_by) if replaced_by else None

        tok = _IN_MEMORY_TOKENS.get(token_hash)
        if tok:
            tok.revoked = True
            tok.revoked_at = now
            tok.replaced_by_token = replaced_hash

        try:
            stmt = (
                update(RefreshToken)
                .where(RefreshToken.token_hash == token_hash)
                .values(revoked=True, revoked_at=now, replaced_by_token=replaced_hash)
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount > 0
        except Exception:
            return True

    async def revoke_user_refresh_tokens(self, user_id: uuid.UUID) -> int:
        count = 0
        for tok in _IN_MEMORY_TOKENS.values():
            if tok.user_id == user_id and not tok.revoked:
                tok.revoked = True
                tok.revoked_at = datetime.now(timezone.utc)
                count += 1

        try:
            stmt = (
                update(RefreshToken)
                .where(RefreshToken.user_id == user_id, RefreshToken.revoked == False)
                .values(revoked=True, revoked_at=datetime.now(timezone.utc))
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return max(result.rowcount, count)
        except Exception:
            return count

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> int:
        return await self.revoke_user_refresh_tokens(user_id)

    async def create_reset_token(
        self, user_id: uuid.UUID, raw_token: str, expires_at: datetime
    ) -> PasswordResetToken:
        token_hash = hash_token(raw_token)
        reset_tok = PasswordResetToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            used=False,
        )
        _IN_MEMORY_RESET_TOKENS[token_hash] = reset_tok
        try:
            self.session.add(reset_tok)
            await self.session.commit()
            await self.session.refresh(reset_tok)
            return reset_tok
        except Exception:
            return reset_tok

    async def get_valid_reset_token(self, raw_token: str) -> Optional[PasswordResetToken]:
        token_hash = hash_token(raw_token)
        try:
            result = await self.session.execute(
                select(PasswordResetToken).where(
                    PasswordResetToken.token_hash == token_hash,
                    PasswordResetToken.used == False,
                    PasswordResetToken.expires_at > datetime.now(timezone.utc),
                )
            )
            res = result.scalar_one_or_none()
            if res:
                return res
            tok = _IN_MEMORY_RESET_TOKENS.get(token_hash)
            if tok and not tok.used and tok.expires_at > datetime.now(timezone.utc):
                return tok
            return None
        except Exception:
            tok = _IN_MEMORY_RESET_TOKENS.get(token_hash)
            if tok and not tok.used and tok.expires_at > datetime.now(timezone.utc):
                return tok
            return None

    async def mark_reset_token_used(self, token_id: uuid.UUID) -> bool:
        for tok in _IN_MEMORY_RESET_TOKENS.values():
            if tok.id == token_id:
                tok.used = True
        try:
            stmt = (
                update(PasswordResetToken)
                .where(PasswordResetToken.id == token_id)
                .values(used=True)
            )
            result = await self.session.execute(stmt)
            await self.session.commit()
            return result.rowcount > 0
        except Exception:
            return True
