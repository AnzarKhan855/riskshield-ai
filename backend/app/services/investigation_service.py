from datetime import datetime, timezone
import math
import secrets
from typing import List, Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.models.investigation_case import InvestigationCase
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.investigation_repository import InvestigationRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.investigation import (
    CaseAssignRequest,
    CaseCreateRequest,
    CaseResolveRequest,
    CaseWorkspaceResponse,
    InvestigationCaseResponse,
    PaginatedCasesResponse,
)
from app.services.evidence_service import EvidenceService
from app.services.timeline_service import CommentService, TimelineService


class InvestigationService:
    def __init__(
        self,
        case_repo: InvestigationRepository,
        evidence_service: EvidenceService,
        timeline_service: TimelineService,
        comment_service: CommentService,
        transaction_repo: TransactionRepository,
        decision_repo: DecisionRepository,
        audit_repo: AuditLogRepository,
    ):
        self.case_repo = case_repo
        self.evidence_service = evidence_service
        self.timeline_service = timeline_service
        self.comment_service = comment_service
        self.transaction_repo = transaction_repo
        self.decision_repo = decision_repo
        self.audit_repo = audit_repo

    async def _generate_unique_case_id(self) -> str:
        """Generate unique Case ID formatted as CASE-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            c_id = f"CASE-{hex_suffix}"
            existing = await self.case_repo.get_by_case_id(c_id)
            if not existing:
                return c_id
        raise ValidationException("Failed to generate unique Case ID.")

    async def create_case(
        self,
        dto: CaseCreateRequest,
        creator_user_id: uuid.UUID,
        creator_name: str = "Risk System",
    ) -> InvestigationCaseResponse:
        """
        Create a new Investigation Case:
        1. Resolve linked Merchant & Customer from Transaction record.
        2. Persist InvestigationCase record (`CASE-XXXXXXXX`).
        3. Trigger Automated Evidence Discovery.
        4. Log Timeline activity event.
        5. Log Audit event.
        """
        c_code = await self._generate_unique_case_id()

        txn = await self.transaction_repo.get_by_txn_id(dto.transaction_id)
        merchant_id = txn.merchant_id if txn else None
        customer_id = txn.customer_id if txn else None

        record = InvestigationCase(
            case_id=c_code,
            decision_id=dto.decision_id,
            transaction_id=dto.transaction_id,
            merchant_id=merchant_id,
            customer_id=customer_id,
            priority=dto.priority.upper(),
            status="OPEN",
            category=dto.category,
            severity=dto.priority.upper(),
            case_title=dto.case_title.strip(),
            case_description=dto.case_description,
            opened_at=datetime.now(timezone.utc),
            case_metadata={
                "creator_user_id": str(creator_user_id),
                "created_via": "INVESTIGATION_WORKSPACE",
            },
            is_deleted=False,
        )

        created = await self.case_repo.create(record)

        # Auto discover evidence items
        await self.evidence_service.auto_discover_and_attach_evidence(
            created.id, dto.transaction_id, dto.decision_id
        )

        # Log timeline event
        await self.timeline_service.log_activity(
            created.id,
            action="CASE_CREATED",
            actor=creator_name,
            details={"case_id": created.case_id, "priority": created.priority, "category": created.category},
        )

        # Log audit action
        await self.audit_repo.log_action(
            action="INVESTIGATION_CASE_CREATED",
            user_id=creator_user_id,
            details={"case_id": created.case_id, "transaction_id": dto.transaction_id},
        )

        return InvestigationCaseResponse.model_validate(created)

    async def get_case(self, case_id_str: str) -> InvestigationCaseResponse:
        """Get case details by case_id string or UUID."""
        record = await self.case_repo.get_by_case_id(case_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(case_id_str)
                record = await self.case_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Investigation case '{case_id_str}' not found.")

        return InvestigationCaseResponse.model_validate(record)

    async def assign_case(
        self,
        case_id_str: str,
        dto: CaseAssignRequest,
        assigner_user_id: uuid.UUID,
        assigner_name: str = "Lead Analyst",
    ) -> InvestigationCaseResponse:
        """Assign case to a specific risk analyst."""
        record = await self.case_repo.get_by_case_id(case_id_str)
        if not record:
            raise NotFoundException(f"Case '{case_id_str}' not found.")

        updated = await self.case_repo.update(
            record.id,
            {
                "assigned_analyst_id": dto.analyst_id,
                "assigned_analyst_name": dto.analyst_name,
                "assigned_at": datetime.now(timezone.utc),
                "status": "ASSIGNED" if record.status == "OPEN" else record.status,
            },
        )

        await self.timeline_service.log_activity(
            record.id,
            action="CASE_ASSIGNED",
            actor=assigner_name,
            details={"assigned_to": dto.analyst_name, "analyst_id": str(dto.analyst_id)},
        )

        await self.audit_repo.log_action(
            action="INVESTIGATION_CASE_ASSIGNED",
            user_id=assigner_user_id,
            details={"case_id": updated.case_id, "assigned_to": dto.analyst_name},
        )

        return InvestigationCaseResponse.model_validate(updated)

    async def resolve_case(
        self,
        case_id_str: str,
        dto: CaseResolveRequest,
        analyst_user_id: uuid.UUID,
        analyst_name: str = "Risk Analyst",
    ) -> InvestigationCaseResponse:
        """Resolve case with decision action (APPROVE, REJECT, ESCALATE, CLOSE)."""
        record = await self.case_repo.get_by_case_id(case_id_str)
        if not record:
            raise NotFoundException(f"Case '{case_id_str}' not found.")

        updated = await self.case_repo.update(
            record.id,
            {
                "resolution": dto.resolution.upper(),
                "resolution_notes": dto.resolution_notes.strip(),
                "resolved_at": datetime.now(timezone.utc),
                "status": "RESOLVED",
            },
        )

        await self.timeline_service.log_activity(
            record.id,
            action="CASE_RESOLVED",
            actor=analyst_name,
            details={"resolution": dto.resolution.upper(), "notes": dto.resolution_notes},
        )

        await self.audit_repo.log_action(
            action="INVESTIGATION_CASE_RESOLVED",
            user_id=analyst_user_id,
            details={"case_id": updated.case_id, "resolution": dto.resolution.upper()},
        )

        return InvestigationCaseResponse.model_validate(updated)

    async def close_case(
        self,
        case_id_str: str,
        closer_user_id: uuid.UUID,
        closer_name: str = "Lead Analyst",
    ) -> InvestigationCaseResponse:
        """Mark case as CLOSED."""
        record = await self.case_repo.get_by_case_id(case_id_str)
        if not record:
            raise NotFoundException(f"Case '{case_id_str}' not found.")

        updated = await self.case_repo.update(
            record.id,
            {
                "status": "CLOSED",
                "closed_at": datetime.now(timezone.utc),
            },
        )

        await self.timeline_service.log_activity(
            record.id,
            action="CASE_CLOSED",
            actor=closer_name,
            details={"case_id": updated.case_id},
        )

        return InvestigationCaseResponse.model_validate(updated)

    async def get_case_workspace(self, case_id_str: str) -> CaseWorkspaceResponse:
        """
        Assembles complete Enterprise Investigation Workspace payload:
        Case details + Evidence list + Comments list + Timeline activities + Linked Decision & Transaction summaries.
        """
        case_dto = await self.get_case(case_id_str)
        rec_uuid = case_dto.id

        evidence_items = await self.evidence_service.get_case_evidence(rec_uuid)
        comments = await self.comment_service.get_case_comments(rec_uuid)
        timeline = await self.timeline_service.get_case_timeline(rec_uuid)

        # Linked Summaries
        dec_summary = None
        if case_dto.decision_id:
            dec = await self.decision_repo.get_by_decision_id(case_dto.decision_id)
            if dec:
                dec_summary = {
                    "decision_id": dec.decision_id,
                    "decision": dec.decision,
                    "composite_risk_score": dec.composite_risk_score,
                    "confidence": dec.decision_confidence,
                    "reason": dec.decision_reason,
                }

        txn_summary = None
        txn = await self.transaction_repo.get_by_txn_id(case_dto.transaction_id)
        if txn:
            txn_summary = {
                "transaction_id": txn.transaction_id,
                "amount": float(txn.amount),
                "currency": txn.currency,
                "payment_method": txn.payment_method,
                "card_network": txn.card_network,
                "status": txn.status,
                "country": txn.country,
            }

        return CaseWorkspaceResponse(
            case_details=case_dto,
            evidence_list=evidence_items,
            comments_list=comments,
            timeline_list=timeline,
            decision_summary=dec_summary,
            transaction_summary=txn_summary,
        )

    async def list_cases(
        self,
        search: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        analyst_id: Optional[uuid.UUID] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedCasesResponse:
        """List investigation cases with filtering and pagination."""
        items, total = await self.case_repo.filter_and_paginate(
            search=search,
            priority=priority,
            status=status,
            category=category,
            analyst_id=analyst_id,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedCasesResponse(
            items=[InvestigationCaseResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
