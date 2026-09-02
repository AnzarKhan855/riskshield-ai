import math
import secrets
import time
from typing import Any, Dict, List, Optional, Tuple
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.decision.compiler import RuleEvaluator
from app.domain.decision.conflict import ConflictResolutionService
from app.domain.decision.policy import PolicyEvaluationService
from app.models.decision import Decision
from app.models.decision_execution import DecisionExecution
from app.models.decision_rule import DecisionRule
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.composite_repository import CompositePredictionRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.execution_repository import DecisionExecutionRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.rule_repository import DecisionRuleRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.decision import (
    DecisionEvaluateRequest,
    DecisionOverrideRequest,
    DecisionResponse,
    PaginatedDecisionResponse,
)
from app.services.ai_orchestrator import AIOrchestrator
from app.services.rule_service import DecisionRuleService


class DecisionEngine:
    def __init__(
        self,
        decision_repo: DecisionRepository,
        rule_repo: DecisionRuleRepository,
        execution_repo: DecisionExecutionRepository,
        composite_repo: CompositePredictionRepository,
        transaction_repo: TransactionRepository,
        feature_repo: FeatureStoreRepository,
        orchestrator: AIOrchestrator,
        rule_service: DecisionRuleService,
        audit_repo: AuditLogRepository,
    ):
        self.decision_repo = decision_repo
        self.rule_repo = rule_repo
        self.execution_repo = execution_repo
        self.composite_repo = composite_repo
        self.transaction_repo = transaction_repo
        self.feature_repo = feature_repo
        self.orchestrator = orchestrator
        self.rule_service = rule_service
        self.audit_repo = audit_repo
        self.evaluator = RuleEvaluator()
        self.conflict_resolver = ConflictResolutionService()
        self.policy_evaluator = PolicyEvaluationService()

    async def _generate_unique_decision_id(self) -> str:
        """Generate unique decision ID formatted as DEC-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            d_id = f"DEC-{hex_suffix}"
            existing = await self.decision_repo.get_by_decision_id(d_id)
            if not existing:
                return d_id
        raise ValidationException("Failed to generate unique Decision ID.")

    async def evaluate_decision(
        self,
        dto: DecisionEvaluateRequest,
        evaluator_user_id: uuid.UUID,
    ) -> DecisionResponse:
        """
        Executes end-to-end Decision Intelligence Flow:
        1. Resolve Composite Prediction (or run AI Orchestration pipeline on the fly).
        2. Resolve Feature Context & Transaction Context.
        3. Rule Discovery (Fetch active published rules).
        4. Policy Evaluation.
        5. Rule Evaluation (Evaluate boolean expressions).
        6. Priority & Conflict Resolution.
        7. Decision Record & Rule Execution Logging.
        8. Audit Event Generation.
        """
        start_time = time.perf_counter()

        # Seed default rules if registry is empty
        await self.rule_service.seed_default_rules(evaluator_user_id)

        # 1. Resolve Composite Prediction
        comp_pred = None
        if dto.composite_prediction_id:
            comp_pred = await self.composite_repo.get_by_prediction_id(dto.composite_prediction_id)

        if not comp_pred:
            # Run AI Orchestrator on the fly
            from app.schemas.orchestrator import OrchestratorPredictRequest
            orch_resp = await self.orchestrator.orchestrate_predict(
                OrchestratorPredictRequest(transaction_id=dto.transaction_id),
                evaluator_user_id,
            )
            comp_pred = await self.composite_repo.get_by_prediction_id(orch_resp.prediction_id)

        # 2. Resolve Context Variables
        feature_record = await self.feature_repo.get_by_txn_id(dto.transaction_id)
        feature_payload = feature_record.feature_payload if feature_record else {}

        txn_record = await self.transaction_repo.get_by_txn_id(dto.transaction_id)

        context_vars: Dict[str, Any] = {
            "txn_amount": float(txn_record.amount) if txn_record else 0.0,
            "composite_risk_score": float(comp_pred.overall_risk_score) if comp_pred else 0.0,
        }
        context_vars.update(feature_payload)

        # 3. Policy Evaluation
        triggered_policies = self.policy_evaluator.evaluate_policies(context_vars)

        # 4. Rule Discovery & Evaluation
        active_rules = await self.rule_repo.get_active_published_rules()

        matched_rules: List[Tuple[DecisionRule, Dict[str, Any]]] = []
        execution_logs: List[Dict[str, Any]] = []

        for idx, rule in enumerate(active_rules, start=1):
            t0 = time.perf_counter()
            matched, detail = self.evaluator.evaluate_expression(rule.expression, context_vars)
            t_elapsed = round((time.perf_counter() - t0) * 1000.0, 2)

            log_item = {
                "rule": rule,
                "execution_order": idx,
                "matched": matched,
                "time_ms": t_elapsed,
                "detail": detail,
            }
            execution_logs.append(log_item)

            if matched:
                matched_rules.append((rule, log_item))

        # 5. Priority & Conflict Resolution
        final_action, confidence, primary_reason = self.conflict_resolver.resolve_winning_decision(matched_rules)

        total_latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        dec_code = await self._generate_unique_decision_id()

        # 6. Persist Decision Record
        triggered_rules_payload = [
            {
                "rule_id": r[0].rule_id,
                "rule_name": r[0].rule_name,
                "category": r[0].rule_category,
                "action": r[0].action,
                "severity": r[0].severity,
                "priority": r[0].priority,
            }
            for r in matched_rules
        ]

        dec_record = Decision(
            decision_id=dec_code,
            composite_prediction_id=comp_pred.prediction_id if comp_pred else None,
            transaction_id=dto.transaction_id,
            merchant_id=txn_record.merchant_id if txn_record else None,
            customer_id=feature_record.customer_id if feature_record else None,
            decision=final_action,
            decision_status="FINAL",
            decision_confidence=confidence,
            composite_risk_score=comp_pred.overall_risk_score if comp_pred else 0.0,
            decision_reason=primary_reason,
            triggered_rules=triggered_rules_payload,
            triggered_policies=triggered_policies,
            execution_time_ms=total_latency_ms,
            decision_source="AUTOMATED_RULE_ENGINE",
            reviewer_id=None,
            review_status="NONE",
            decision_metadata={
                "evaluator_user_id": str(evaluator_user_id),
                "total_rules_evaluated": len(active_rules),
                "matched_rules_count": len(matched_rules),
            },
            is_deleted=False,
        )

        created_decision = await self.decision_repo.create(dec_record)

        # 7. Persist Individual Rule Execution Traces
        for log in execution_logs:
            rule_obj: DecisionRule = log["rule"]
            exec_code = f"EXEC-{secrets.token_hex(4).upper()}"

            exec_record = DecisionExecution(
                execution_id=exec_code,
                decision_id=created_decision.id,
                rule_id=rule_obj.id,
                execution_order=log["execution_order"],
                execution_result=log["matched"],
                execution_time_ms=log["time_ms"],
                evaluation_details={"expression": rule_obj.expression, "detail": log["detail"]},
            )
            await self.execution_repo.create(exec_record)

        # 8. Audit Logging with Cryptographic Verification
        await self.audit_repo.log_action(
            action="DECISION_EVALUATED",
            user_id=evaluator_user_id,
            details={
                "decision_id": created_decision.decision_id,
                "transaction_id": dto.transaction_id,
                "decision": final_action,
                "triggered_rules_count": len(matched_rules),
                "composite_risk_score": comp_pred.overall_risk_score if comp_pred else 0.0,
                "execution_latency_ms": total_latency_ms,
            },
        )

        # 9. Auto-Generate & Persist SHAP Feature Importance (TreeSHAP & LLM Rationale)
        try:
            from app.repositories.explanation_repository import ExplanationRepository
            from app.services.explanation_service import ExplanationService
            exp_repo = ExplanationRepository(self.decision_repo.session)
            exp_service = ExplanationService(
                explanation_repo=exp_repo,
                decision_repo=self.decision_repo,
                feature_repo=self.feature_repo,
                composite_repo=self.composite_repo,
                rule_repo=self.rule_repo,
                audit_repo=self.audit_repo,
            )
            await exp_service.generate_explanation(created_decision.decision_id)
        except Exception as exp_err:
            pass

        # 10. Auto-Create Investigation Case for Elevated Risk Decisions
        risk_val = float(comp_pred.overall_risk_score) if comp_pred else 0.0
        if final_action in ["BLOCK", "REVIEW", "ESCALATE"] or risk_val >= 50.0:
            try:
                from app.repositories.investigation_repository import InvestigationRepository
                from app.repositories.evidence_repository import EvidenceRepository
                from app.repositories.timeline_repository import TimelineRepository, CommentRepository
                from app.services.evidence_service import EvidenceService
                from app.services.timeline_service import TimelineService, CommentService
                from app.services.investigation_service import InvestigationService
                from app.schemas.investigation import CaseCreateRequest

                session = self.decision_repo.session
                case_repo = InvestigationRepository(session)
                evidence_repo = EvidenceRepository(session)
                timeline_repo = TimelineRepository(session)
                comment_repo = CommentRepository(session)

                evidence_service = EvidenceService(evidence_repo, case_repo, self.audit_repo)
                timeline_service = TimelineService(timeline_repo, case_repo, self.audit_repo)
                comment_service = CommentService(comment_repo, case_repo, self.audit_repo)

                inv_service = InvestigationService(
                    case_repo=case_repo,
                    evidence_service=evidence_service,
                    timeline_service=timeline_service,
                    comment_service=comment_service,
                    transaction_repo=self.transaction_repo,
                    decision_repo=self.decision_repo,
                    audit_repo=self.audit_repo,
                )
                case_dto = CaseCreateRequest(
                    case_title=f"Auto-Flagged: {final_action} on {dto.transaction_id}",
                    case_description=f"Transaction flagged with composite risk score {risk_val}. Rationale: {primary_reason}",
                    case_priority="CRITICAL" if final_action == "BLOCK" else "HIGH" if risk_val >= 70.0 else "MEDIUM",
                    transaction_id=dto.transaction_id,
                    decision_id=created_decision.decision_id,
                    customer_id=feature_record.customer_id if feature_record else None,
                    merchant_id=txn_record.merchant_id if txn_record else None,
                    device_id=None,
                    assigned_to_user_id=None,
                )
                await inv_service.create_case(
                    case_dto,
                    creator_user_id=evaluator_user_id,
                    creator_name="AI Decision Arbiter",
                )
            except Exception as case_err:
                pass

        # 11. Multi-Channel Notification & WebSocket Broadcast
        try:
            from app.domain.notifications.types import EventType
            from app.services.notification_dispatcher import NotificationDispatcher
            dispatcher = NotificationDispatcher()
            await dispatcher.dispatch_event_broadcast(
                event_type=EventType.DECISION_GENERATED,
                payload={
                    "decision_id": created_decision.decision_id,
                    "transaction_id": dto.transaction_id,
                    "action": final_action,
                    "risk_score": risk_val,
                    "reason": primary_reason,
                    "latency_ms": total_latency_ms,
                },
                event_id=f"EVT-{secrets.token_hex(4).upper()}",
            )
        except Exception as notif_err:
            pass

        # 12. Persist Graph Relationships & Node Links
        try:
            from app.repositories.graph_repository import GraphRepository
            graph_repo = GraphRepository(self.decision_repo.session)
            await graph_repo.build_full_graph(limit_txns=50)
        except Exception as graph_err:
            pass

        # 13. Dual-Sync Complete Decision Dossier to Cloud MongoDB Atlas
        try:
            from app.db.mongodb import get_mongo_db
            mongo_db = get_mongo_db()
            if mongo_db is not None:
                await mongo_db["decisions"].insert_one({
                    "decision_id": created_decision.decision_id,
                    "transaction_id": dto.transaction_id,
                    "decision": final_action,
                    "composite_risk_score": risk_val,
                    "decision_confidence": confidence,
                    "decision_reason": primary_reason,
                    "execution_time_ms": total_latency_ms,
                    "triggered_rules": triggered_rules_payload,
                    "triggered_policies": triggered_policies,
                    "timestamp": time.time(),
                })
                await mongo_db["analytics_events"].insert_one({
                    "event_type": "TRANSACTION_EVALUATION_COMPLETED",
                    "decision_id": created_decision.decision_id,
                    "transaction_id": dto.transaction_id,
                    "action": final_action,
                    "risk_score": risk_val,
                    "latency_ms": total_latency_ms,
                    "timestamp": time.time(),
                })
                await mongo_db["audit_logs"].insert_one({
                    "action": "DECISION_EVALUATED",
                    "decision_id": created_decision.decision_id,
                    "transaction_id": dto.transaction_id,
                    "user_id": str(evaluator_user_id),
                    "timestamp": time.time(),
                })
        except Exception as mongo_err:
            pass

        return DecisionResponse.model_validate(created_decision)

    async def get_decision(self, decision_id_str: str) -> DecisionResponse:
        """Retrieve decision record by decision_id or UUID."""
        record = await self.decision_repo.get_by_decision_id(decision_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(decision_id_str)
                record = await self.decision_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Decision record '{decision_id_str}' not found.")

        return DecisionResponse.model_validate(record)

    async def list_decisions(
        self,
        transaction_id: Optional[str] = None,
        decision_action: Optional[str] = None,
        review_status: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedDecisionResponse:
        """List decisions with pagination and filters."""
        items, total = await self.decision_repo.filter_and_paginate(
            transaction_id=transaction_id,
            decision_action=decision_action,
            review_status=review_status,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedDecisionResponse(
            items=[DecisionResponse.model_validate(d) for d in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    async def override_decision(
        self,
        decision_id_str: str,
        dto: DecisionOverrideRequest,
        reviewer_user_id: uuid.UUID,
    ) -> DecisionResponse:
        """Manual decision override by a compliance or risk analyst."""
        record = await self.decision_repo.get_by_decision_id(decision_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(decision_id_str)
                record = await self.decision_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Decision record '{decision_id_str}' not found.")

        updated = await self.decision_repo.update(
            record.id,
            {
                "decision": dto.decision.upper(),
                "review_status": "MANUAL_OVERRIDE",
                "reviewer_id": reviewer_user_id,
                "decision_reason": f"MANUAL OVERRIDE: {dto.justification.strip()}",
            },
        )

        await self.audit_repo.log_action(
            action="DECISION_OVERRIDDEN",
            user_id=reviewer_user_id,
            details={
                "decision_id": record.decision_id,
                "previous_decision": record.decision,
                "new_decision": dto.decision.upper(),
                "justification": dto.justification,
            },
        )

        return DecisionResponse.model_validate(updated or record)
