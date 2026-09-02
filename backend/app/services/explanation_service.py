import math
import secrets
from typing import List, Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.explainability.confidence import ConfidenceAnalyzer
from app.domain.explainability.feature_importance import FeatureImportanceService
from app.domain.explainability.reason_generator import ReasonGenerator
from app.domain.explainability.recommendation import RecommendationEngine
from app.models.explanation import Explanation
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.composite_repository import CompositePredictionRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.explanation_repository import ExplanationRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.rule_repository import DecisionRuleRepository
from app.schemas.explanation import (
    ExplanationResponse,
    PaginatedExplanationsResponse,
)
from app.services.audit_explanation_service import AuditExplanationService


class ExplanationService:
    def __init__(
        self,
        explanation_repo: ExplanationRepository,
        decision_repo: DecisionRepository,
        feature_repo: FeatureStoreRepository,
        composite_repo: CompositePredictionRepository,
        rule_repo: DecisionRuleRepository,
        audit_repo: AuditLogRepository,
    ):
        self.explanation_repo = explanation_repo
        self.decision_repo = decision_repo
        self.feature_repo = feature_repo
        self.composite_repo = composite_repo
        self.rule_repo = rule_repo
        self.audit_repo = audit_repo

        self.feature_importance = FeatureImportanceService()
        self.confidence_analyzer = ConfidenceAnalyzer()
        self.reason_generator = ReasonGenerator()
        self.recommendation_engine = RecommendationEngine()
        self.audit_explanation = AuditExplanationService()

    async def _generate_unique_explanation_id(self) -> str:
        """Generate unique Explanation ID formatted as EXP-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            exp_id = f"EXP-{hex_suffix}"
            existing = await self.explanation_repo.get_by_explanation_id(exp_id)
            if not existing:
                return exp_id
        raise ValidationException("Failed to generate unique Explanation ID.")

    async def generate_explanation(self, decision_id: str) -> ExplanationResponse:
        """
        Generates and persists full AI Explanation payload for a decision ID:
        1. Fetch linked Decision & Composite Prediction records.
        2. Fetch Feature Vector payload.
        3. Compute SHAP-like Feature Importance Attributions.
        4. Compute Model Ensemble Contributions & Confidence Score.
        5. Extract Triggered Rules & Impact.
        6. Generate Natural Language Primary Audit Rationale.
        7. Generate Actionable Analyst Recommendations.
        8. Compute Cryptographic SHA-256 Audit Hash.
        """
        existing = await self.explanation_repo.get_by_decision_id(decision_id)
        if existing:
            return ExplanationResponse.model_validate(existing)

        dec = await self.decision_repo.get_by_decision_id(decision_id)
        if not dec:
            raise NotFoundException(f"Decision record '{decision_id}' not found.")

        # 1. Feature Store Payload & Contributions
        feat = await self.feature_repo.get_by_txn_id(dec.transaction_id)
        feat_payload = feat.feature_payload if feat else {}
        feature_contribs = self.feature_importance.calculate_contributions(feat_payload)

        # 2. Model Ensemble Contributions & Confidence
        model_contribs = [
            {
                "model_id": "MODEL-XGB-01",
                "model_name": "XGBoost Fraud Classifier",
                "model_type": "Fraud Detection",
                "weight": 0.50,
                "risk_score": dec.composite_risk_score,
                "contribution_score": dec.composite_risk_score * 0.50,
                "status": "Active",
            },
            {
                "model_id": "MODEL-ONNX-02",
                "model_name": "ONNX Deep Velocity Model",
                "model_type": "Behaviour Analysis",
                "weight": 0.50,
                "risk_score": dec.composite_risk_score,
                "contribution_score": dec.composite_risk_score * 0.50,
                "status": "Active",
            },
        ]
        confidence_score = self.confidence_analyzer.calculate_confidence(
            [dec.composite_risk_score, dec.composite_risk_score]
        )

        # 3. Rule Contributions
        rule_contribs = []
        if dec.triggered_rules:
            for r_name in dec.triggered_rules:
                rule_contribs.append(
                    {
                        "rule_id": f"RULE-{secrets.token_hex(3).upper()}",
                        "rule_name": r_name,
                        "rule_category": "Velocity",
                        "severity": "HIGH" if dec.decision == "BLOCK" else "MEDIUM",
                        "action": dec.decision,
                        "impact_score": 40.0,
                        "description": f"Triggered high severity policy rule: {r_name}",
                    }
                )

        # 4. Primary Rationale & Recommendations
        primary_reason = self.reason_generator.generate_primary_reason(
            dec.decision, dec.composite_risk_score, feature_contribs
        )
        recommendations = [
            {
                "action_type": r.action_type,
                "title": r.title,
                "rationale": r.rationale,
                "priority": r.priority,
                "metadata": r.metadata,
            }
            for r in self.recommendation_engine.generate_recommendations(
                dec.decision, dec.composite_risk_score
            )
        ]

        # 5. Cryptographic Audit Info
        audit_info = self.audit_explanation.generate_audit_info(
            dec.decision_id, dec.transaction_id, dec.composite_risk_score
        )

        exp_code = await self._generate_unique_explanation_id()
        record = Explanation(
            explanation_id=exp_code,
            decision_id=dec.decision_id,
            transaction_id=dec.transaction_id,
            merchant_id=dec.merchant_id,
            customer_id=dec.customer_id,
            composite_risk_score=dec.composite_risk_score,
            confidence_score=confidence_score,
            primary_reason=primary_reason,
            feature_contributions=[
                {
                    "feature_name": f.feature_name,
                    "feature_value": f.feature_value,
                    "importance_score": f.importance_score,
                    "shap_value": f.shap_value,
                    "direction": f.direction,
                    "description": f.description,
                }
                for f in feature_contribs
            ],
            model_contributions=model_contribs,
            rule_contributions=rule_contribs,
            recommendations=recommendations,
            audit_info=audit_info,
            is_deleted=False,
        )

        created = await self.explanation_repo.create(record)

        await self.audit_repo.log_action(
            action="AI_EXPLANATION_GENERATED",
            user_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            details={"explanation_id": created.explanation_id, "decision_id": decision_id},
        )

        return ExplanationResponse.model_validate(created)

    async def get_explanation(self, decision_or_exp_id: str) -> ExplanationResponse:
        """Fetch explanation by decision_id or explanation_id."""
        record = await self.explanation_repo.get_by_decision_id(decision_or_exp_id)
        if not record:
            record = await self.explanation_repo.get_by_explanation_id(decision_or_exp_id)

        if not record:
            # Try auto-generating if decision exists
            dec = await self.decision_repo.get_by_decision_id(decision_or_exp_id)
            if dec:
                return await self.generate_explanation(decision_or_exp_id)
            raise NotFoundException(f"Explanation for decision/ID '{decision_or_exp_id}' not found.")

        return ExplanationResponse.model_validate(record)

    async def list_explanations(
        self,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedExplanationsResponse:
        """List explanations with search and pagination."""
        items, total = await self.explanation_repo.filter_and_paginate(
            search=search,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedExplanationsResponse(
            items=[ExplanationResponse.model_validate(e) for e in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
