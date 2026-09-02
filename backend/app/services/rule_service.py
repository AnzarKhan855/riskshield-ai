import math
import secrets
from typing import Any, Dict, List, Optional, Tuple, Union
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.decision.compiler import RuleCompiler, RuleEvaluator
from app.models.decision_rule import DecisionRule
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.rule_repository import DecisionRuleRepository
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


class DecisionRuleService:
    def __init__(
        self,
        rule_repo: DecisionRuleRepository,
        audit_repo: AuditLogRepository,
    ):
        self.rule_repo = rule_repo
        self.audit_repo = audit_repo
        self.evaluator = RuleEvaluator()
        self.compiler = RuleCompiler()

    def validate_expression(self, expression: str) -> Tuple[bool, str]:
        is_valid = self.compiler.validate_expression(expression)
        msg = "Rule expression syntax is valid" if is_valid else "Rule expression contains prohibited or invalid syntax"
        return is_valid, msg

    def simulate_expression(self, expression: str, context: Dict[str, Any]) -> Tuple[bool, str]:
        return self.evaluator.evaluate_expression(expression, context)

    async def _generate_unique_rule_id(self) -> str:
        """Generate unique Rule ID formatted as RULE-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            r_id = f"RULE-{hex_suffix}"
            existing = await self.rule_repo.get_by_rule_id(r_id)
            if not existing:
                return r_id
        raise ValidationException("Failed to generate unique Rule ID.")

    async def create_rule(
        self,
        dto: RuleCreateRequest,
        creator_user_id: uuid.UUID,
    ) -> RuleResponse:
        """Create a new decision rule."""
        rule_code = await self._generate_unique_rule_id()

        record = DecisionRule(
            rule_id=rule_code,
            rule_name=dto.rule_name.strip(),
            rule_category=dto.rule_category.upper(),
            priority=dto.priority,
            version=dto.version,
            status=dto.status.upper(),
            description=dto.description,
            expression=dto.expression.strip(),
            action=dto.action.upper(),
            severity=dto.severity.upper(),
            enabled=dto.enabled,
            created_by=dto.created_by,
            is_deleted=False,
        )

        created = await self.rule_repo.create(record)

        await self.audit_repo.log_action(
            action="DECISION_RULE_CREATED",
            user_id=creator_user_id,
            details={"rule_id": created.rule_id, "rule_name": created.rule_name, "action": created.action},
        )

        return RuleResponse.model_validate(created)

    async def get_rule(self, rule_id_str: str) -> RuleResponse:
        """Retrieve rule by rule_id string or UUID."""
        record = await self.rule_repo.get_by_rule_id(rule_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(rule_id_str)
                record = await self.rule_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Decision Rule '{rule_id_str}' not found.")

        return RuleResponse.model_validate(record)

    async def update_rule(
        self,
        rule_id_str: str,
        dto: RuleUpdateRequest,
        updater_user_id: uuid.UUID,
    ) -> RuleResponse:
        """Update decision rule details."""
        record = await self.rule_repo.get_by_rule_id(rule_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(rule_id_str)
                record = await self.rule_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Decision Rule '{rule_id_str}' not found.")

        update_data = dto.model_dump(exclude_unset=True)
        updated = await self.rule_repo.update(record.id, update_data)

        await self.audit_repo.log_action(
            action="DECISION_RULE_UPDATED",
            user_id=updater_user_id,
            details={"rule_id": updated.rule_id, "updated_fields": list(update_data.keys())},
        )

        return RuleResponse.model_validate(updated)

    async def soft_delete_rule(
        self, rule_id_str: str, deleter_user_id: uuid.UUID
    ) -> None:
        """Soft delete a decision rule."""
        record = await self.rule_repo.get_by_rule_id(rule_id_str)
        if record:
            await self.rule_repo.soft_delete(record.id)
            await self.audit_repo.log_action(
                action="DECISION_RULE_DELETED",
                user_id=deleter_user_id,
                details={"rule_id": record.rule_id},
            )

    async def publish_rule(
        self, rule_id_str: str, publisher_user_id: uuid.UUID
    ) -> RuleResponse:
        """Publish a rule to PUBLISHED status."""
        record = await self.rule_repo.get_by_rule_id(rule_id_str)
        if not record:
            raise NotFoundException(f"Rule '{rule_id_str}' not found.")

        updated = await self.rule_repo.update(
            record.id, {"status": "PUBLISHED", "enabled": True}
        )

        await self.audit_repo.log_action(
            action="DECISION_RULE_PUBLISHED",
            user_id=publisher_user_id,
            details={"rule_id": updated.rule_id},
        )

        return RuleResponse.model_validate(updated)

    async def list_rules(
        self,
        search: Optional[str] = None,
        rule_category: Optional[str] = None,
        status: Optional[str] = None,
        enabled: Optional[bool] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "priority",
        sort_dir: str = "asc",
    ) -> PaginatedRuleResponse:
        """List decision rules with pagination and filters."""
        items, total = await self.rule_repo.filter_and_paginate(
            search=search,
            rule_category=rule_category,
            status=status,
            enabled=enabled,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedRuleResponse(
            items=[RuleResponse.model_validate(r) for r in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def seed_default_rules(self, system_user_id: uuid.UUID) -> None:
        """Seeds standard enterprise risk & compliance rules if table is empty."""
        existing, total = await self.rule_repo.filter_and_paginate(size=1)
        if total > 0:
            return

        default_rules = [
            RuleCreateRequest(
                rule_name="High Composite Risk Score Block Rule",
                rule_category="REGULATORY",
                priority=10,
                expression="composite_risk_score >= 80.0",
                action="BLOCK",
                severity="CRITICAL",
                description="Automatically blocks transactions with composite risk score >= 80",
            ),
            RuleCreateRequest(
                rule_name="Sanctioned High Risk Country Block Rule",
                rule_category="COUNTRY",
                priority=20,
                expression="loc_is_high_risk_country == True",
                action="BLOCK",
                severity="CRITICAL",
                description="Blocks transactions originating from sanctioned/high-risk countries",
            ),
            RuleCreateRequest(
                rule_name="Unusual Amount & Night Transaction Escalate",
                rule_category="BEHAVIOUR",
                priority=30,
                expression="beh_unusual_amount == True and beh_is_night_txn == True",
                action="ESCALATE",
                severity="HIGH",
                description="Escalates unusual amounts processed during night hours",
            ),
            RuleCreateRequest(
                rule_name="Elevated Composite Risk Review Rule",
                rule_category="TRANSACTION",
                priority=50,
                expression="composite_risk_score >= 50.0 and composite_risk_score < 80.0",
                action="REVIEW",
                severity="MEDIUM",
                description="Sends medium risk transactions for analyst manual review",
            ),
        ]

        for r_dto in default_rules:
            await self.create_rule(r_dto, system_user_id)
