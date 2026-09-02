import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import (
    get_comment_service,
    get_current_active_user,
    get_evidence_service,
    get_investigation_service,
    get_timeline_service,
)
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.investigation import (
    CaseAssignRequest,
    CaseCreateRequest,
    CaseResolveRequest,
    CaseWorkspaceResponse,
    CommentCreateRequest,
    CommentResponse,
    EvidenceCreateRequest,
    EvidenceResponse,
    InvestigationCaseResponse,
    PaginatedCasesResponse,
    TimelineResponse,
)
from app.services.evidence_service import EvidenceService
from app.services.investigation_service import InvestigationService
from app.services.timeline_service import CommentService, TimelineService

router = APIRouter()


@router.post(
    "",
    response_model=APIResponse[InvestigationCaseResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new investigation case",
)
async def create_case(
    body: CaseCreateRequest,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await service.create_case(body, creator_user_id=current_user.id, creator_name=full_name)
    return success_response(
        data=result,
        message="Investigation case created successfully",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedCasesResponse],
    summary="List investigation cases with filtering and pagination",
)
async def list_cases(
    search: Optional[str] = Query(None, description="Search by case ID, title, or transaction ID"),
    priority: Optional[str] = Query(None, description="Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)"),
    case_status: Optional[str] = Query(None, alias="status", description="Filter by status (OPEN, ASSIGNED, UNDER_INVESTIGATION, RESOLVED, CLOSED)"),
    category: Optional[str] = Query(None, description="Filter by category (Fraud, Chargeback, AML, etc.)"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    result = await service.list_cases(
        search=search,
        priority=priority,
        status=case_status,
        category=category,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Investigation cases retrieved successfully",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[CaseWorkspaceResponse],
    summary="Get complete investigation workspace payload for a case",
)
async def get_case_workspace(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    result = await service.get_case_workspace(id)
    return success_response(
        data=result,
        message="Investigation workspace payload retrieved successfully",
    )


@router.post(
    "/{id}/assign",
    response_model=APIResponse[InvestigationCaseResponse],
    summary="Assign investigation case to an analyst",
)
async def assign_case(
    id: str,
    body: CaseAssignRequest,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await service.assign_case(id, body, assigner_user_id=current_user.id, assigner_name=full_name)
    return success_response(
        data=result,
        message="Investigation case assigned successfully",
    )


@router.post(
    "/{id}/resolve",
    response_model=APIResponse[InvestigationCaseResponse],
    summary="Resolve investigation case with analyst decision",
)
async def resolve_case(
    id: str,
    body: CaseResolveRequest,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await service.resolve_case(id, body, analyst_user_id=current_user.id, analyst_name=full_name)
    return success_response(
        data=result,
        message="Investigation case resolved successfully",
    )


@router.post(
    "/{id}/close",
    response_model=APIResponse[InvestigationCaseResponse],
    summary="Close investigation case",
)
async def close_case(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
) -> Any:
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await service.close_case(id, closer_user_id=current_user.id, closer_name=full_name)
    return success_response(
        data=result,
        message="Investigation case closed successfully",
    )


@router.get(
    "/{id}/timeline",
    response_model=APIResponse[List[TimelineResponse]],
    summary="Get case timeline activity events",
)
async def get_case_timeline(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> Any:
    case_dto = await service.get_case(id)
    result = await timeline_service.get_case_timeline(case_dto.id)
    return success_response(
        data=result,
        message="Case timeline retrieved successfully",
    )


@router.get(
    "/{id}/evidence",
    response_model=APIResponse[List[EvidenceResponse]],
    summary="List attached evidence items for a case",
)
async def list_case_evidence(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
    evidence_service: EvidenceService = Depends(get_evidence_service),
) -> Any:
    case_dto = await service.get_case(id)
    result = await evidence_service.get_case_evidence(case_dto.id)
    return success_response(
        data=result,
        message="Case evidence items retrieved successfully",
    )


@router.post(
    "/{id}/evidence",
    response_model=APIResponse[EvidenceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Attach custom evidence item to case",
)
async def attach_case_evidence(
    id: str,
    body: EvidenceCreateRequest,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
    evidence_service: EvidenceService = Depends(get_evidence_service),
) -> Any:
    case_dto = await service.get_case(id)
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await evidence_service.add_evidence(case_dto.id, body, created_by=full_name)
    return success_response(
        data=result,
        message="Evidence attached successfully",
    )


@router.get(
    "/{id}/comments",
    response_model=APIResponse[List[CommentResponse]],
    summary="List analyst comments/notes for a case",
)
async def list_case_comments(
    id: str,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
    comment_service: CommentService = Depends(get_comment_service),
) -> Any:
    case_dto = await service.get_case(id)
    result = await comment_service.get_case_comments(case_dto.id)
    return success_response(
        data=result,
        message="Case comments retrieved successfully",
    )


@router.post(
    "/{id}/comments",
    response_model=APIResponse[CommentResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add analyst comment/note to case",
)
async def add_case_comment(
    id: str,
    body: CommentCreateRequest,
    current_user: User = Depends(get_current_active_user),
    service: InvestigationService = Depends(get_investigation_service),
    comment_service: CommentService = Depends(get_comment_service),
) -> Any:
    case_dto = await service.get_case(id)
    full_name = f"{current_user.first_name} {current_user.last_name}"
    result = await comment_service.add_comment(case_dto.id, body, author_id=current_user.id, author_name=full_name)
    return success_response(
        data=result,
        message="Analyst comment added successfully",
    )
