import secrets
from typing import Any, Dict, List
import uuid
from app.models.case_comment import CaseComment
from app.models.case_timeline import CaseTimeline
from app.repositories.comment_repository import CommentRepository
from app.repositories.timeline_repository import TimelineRepository
from app.schemas.investigation import (
    CommentCreateRequest,
    CommentResponse,
    TimelineResponse,
)


class TimelineService:
    def __init__(self, timeline_repo: TimelineRepository):
        self.timeline_repo = timeline_repo

    async def log_activity(
        self,
        case_id: uuid.UUID,
        action: str,
        actor: str,
        details: Dict[str, Any],
    ) -> CaseTimeline:
        """Log chronological activity event into case timeline."""
        tml_code = f"TML-{secrets.token_hex(4).upper()}"
        record = CaseTimeline(
            timeline_id=tml_code,
            case_id=case_id,
            action=action,
            actor=actor,
            details=details,
        )
        return await self.timeline_repo.create(record)

    async def get_case_timeline(self, case_id: uuid.UUID) -> List[TimelineResponse]:
        """Fetch chronological activities for a case."""
        items = await self.timeline_repo.get_by_case_id(case_id)
        return [TimelineResponse.model_validate(t) for t in items]


class CommentService:
    def __init__(self, comment_repo: CommentRepository):
        self.comment_repo = comment_repo

    async def add_comment(
        self,
        case_id: uuid.UUID,
        dto: CommentCreateRequest,
        author_id: uuid.UUID,
        author_name: str,
    ) -> CommentResponse:
        """Add analyst note/comment to investigation case."""
        cmt_code = f"CMT-{secrets.token_hex(4).upper()}"
        record = CaseComment(
            comment_id=cmt_code,
            case_id=case_id,
            author_id=author_id,
            author_name=author_name,
            comment=dto.comment.strip(),
        )
        created = await self.comment_repo.create(record)
        return CommentResponse.model_validate(created)

    async def get_case_comments(self, case_id: uuid.UUID) -> List[CommentResponse]:
        """Fetch analyst comments for a case."""
        items = await self.comment_repo.get_by_case_id(case_id)
        return [CommentResponse.model_validate(c) for c in items]
