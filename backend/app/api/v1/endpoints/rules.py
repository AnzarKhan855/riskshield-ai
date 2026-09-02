from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.deps import get_current_active_user, get_rule_service
from app.core.response import APIResponse, success_response
from app.models.user import User
from app.schemas.decision_rule import (
    PaginatedRuleResponse,
    RuleCreateRequest,
    RuleResponse,
    RuleSimulateRequest,
    RuleSimulateResponse,
    RuleUpdateRequest,
    RuleValidateRequest,
    RuleValidateResponse,
)
from app.services.rule_service import DecisionRuleService

router = APIRouter()


@router.post(
    "/simulate",
    response_model=APIResponse[RuleSimulateResponse],
    summary="Simulate a custom risk rule expression against transaction variables",
)
async def simulate_rule(
    body: RuleSimulateRequest,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    matched, details = rule_service.simulate_expression(body.expression, body.transaction_data or {})
    return success_response(
        data=RuleSimulateResponse(matched=matched, details=details, expression=body.expression),
        message="Rule simulation completed successfully",
    )


@router.post(
    "/validate",
    response_model=APIResponse[RuleValidateResponse],
    summary="Validate AST syntax of a rule expression",
)
async def validate_rule(
    body: RuleValidateRequest,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    is_valid, message = rule_service.validate_expression(body.expression)
    return success_response(
        data=RuleValidateResponse(is_valid=is_valid, message=message),
        message=message,
    )


@router.post(
    "",
    response_model=APIResponse[RuleResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new decision rule in Rule Studio",
)
async def create_rule(
    body: RuleCreateRequest,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    result = await rule_service.create_rule(body, creator_user_id=current_user.id)
    return success_response(
        data=result,
        message="Decision rule created successfully",
    )


@router.get(
    "",
    response_model=APIResponse[PaginatedRuleResponse],
    summary="List decision rules with filtering and pagination",
)
async def list_rules(
    search: Optional[str] = Query(None, description="Search by name, ID, or description"),
    rule_category: Optional[str] = Query(None, description="Filter by category (MERCHANT, CUSTOMER, TRANSACTION, COUNTRY, VELOCITY, etc.)"),
    rule_status: Optional[str] = Query(None, alias="status", description="Filter by status (DRAFT, PUBLISHED, ARCHIVED)"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled flag"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("priority"),
    sort_dir: str = Query("asc"),
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    result = await rule_service.list_rules(
        search=search,
        rule_category=rule_category,
        status=rule_status,
        enabled=enabled,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return success_response(
        data=result,
        message="Decision rules retrieved successfully",
    )


@router.get(
    "/{id}",
    response_model=APIResponse[RuleResponse],
    summary="Get rule details by rule_id or UUID",
)
async def get_rule(
    id: str,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    result = await rule_service.get_rule(id)
    return success_response(
        data=result,
        message="Decision rule details retrieved successfully",
    )


@router.put(
    "/{id}",
    response_model=APIResponse[RuleResponse],
    summary="Update decision rule details",
)
async def update_rule(
    id: str,
    body: RuleUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    result = await rule_service.update_rule(id, body, updater_user_id=current_user.id)
    return success_response(
        data=result,
        message="Decision rule updated successfully",
    )


@router.delete(
    "/{id}",
    response_model=APIResponse[None],
    summary="Soft delete a decision rule",
)
async def delete_rule(
    id: str,
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    await rule_service.soft_delete_rule(id, deleter_user_id=current_user.id)
    return success_response(
        data=None,
        message="Decision rule deleted successfully",
    )


@router.post(
    "/publish",
    response_model=APIResponse[RuleResponse],
    summary="Publish a decision rule to active status",
)
async def publish_rule(
    rule_id: str = Query(..., description="Rule ID to publish"),
    current_user: User = Depends(get_current_active_user),
    rule_service: DecisionRuleService = Depends(get_rule_service),
) -> Any:
    result = await rule_service.publish_rule(rule_id, publisher_user_id=current_user.id)
    return success_response(
        data=result,
        message="Decision rule published successfully",
    )
