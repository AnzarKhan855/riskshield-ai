import math
import secrets
import time
from typing import Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.orchestrator.aggregator import CompositeRiskCalculator
from app.domain.orchestrator.engine import ExecutionEngine
from app.domain.orchestrator.planner import ExecutionPlanner
from app.domain.orchestrator.selector import ModelSelector
from app.domain.orchestrator.types import ExecutionContext
from app.models.composite_prediction import CompositePrediction
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.composite_repository import CompositePredictionRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.model_repository import ModelRegistryRepository
from app.schemas.orchestrator import (
    CompositePredictionResponse,
    OrchestratorPredictRequest,
    PaginatedCompositePredictionResponse,
)
from app.services.feature_engineering_service import FeatureEngineeringService


class AIOrchestrator:
    def __init__(
        self,
        composite_repo: CompositePredictionRepository,
        model_repo: ModelRegistryRepository,
        feature_repo: FeatureStoreRepository,
        feature_service: FeatureEngineeringService,
        audit_repo: AuditLogRepository,
    ):
        self.composite_repo = composite_repo
        self.model_repo = model_repo
        self.feature_repo = feature_repo
        self.feature_service = feature_service
        self.audit_repo = audit_repo
        self.selector = ModelSelector(model_repo)
        self.planner = ExecutionPlanner()
        self.engine = ExecutionEngine()
        self.aggregator = CompositeRiskCalculator()

    async def _generate_unique_pred_id(self) -> str:
        """Generate unique prediction ID formatted as ORCH-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            p_id = f"ORCH-{hex_suffix}"
            existing = await self.composite_repo.get_by_prediction_id(p_id)
            if not existing:
                return p_id
        raise ValidationException("Failed to generate unique Orchestration Prediction ID.")

    async def orchestrate_predict(
        self,
        dto: OrchestratorPredictRequest,
        executor_user_id: uuid.UUID,
    ) -> CompositePredictionResponse:
        """
        Executes end-to-end multi-model orchestration pipeline:
        1. Feature Resolution (Fetch or Generate on the fly).
        2. Model Selection (Resolve active models per ModelType).
        3. Execution Plan Generation.
        4. Parallel Execution Engine execution.
        5. Composite Risk Calculation & Aggregation.
        6. Persist CompositePrediction Record & Audit Logging.
        """
        pipeline_start = time.perf_counter()

        # 1. Feature Resolution
        feature_record = await self.feature_repo.get_by_txn_id(dto.transaction_id)
        if not feature_record:
            feature_resp = await self.feature_service.generate_features(
                dto.transaction_id, executor_user_id
            )
            feature_payload = feature_resp.feature_payload
            vec_id = feature_resp.feature_vector_id
            feature_ver = feature_resp.feature_version
        else:
            feature_payload = feature_record.feature_payload
            vec_id = feature_record.feature_vector_id
            feature_ver = feature_record.feature_version

        context = ExecutionContext(
            transaction_id=dto.transaction_id,
            executor_user_id=str(executor_user_id),
            feature_payload=feature_payload,
            feature_vector_id=vec_id,
            feature_version=feature_ver,
        )

        # 2. Model Selection
        selected_models = await self.selector.select_active_models(dto.requested_model_types)

        # 3. Execution Plan Construction
        plan = self.planner.create_plan(selected_models)

        # 4. Asynchronous Execution Engine Execution
        step_results = await self.engine.execute_plan(plan, context)

        total_latency_ms = round((time.perf_counter() - pipeline_start) * 1000.0, 2)

        # 5. Composite Risk Aggregation
        overall_score, overall_conf, risk_level = self.aggregator.calculate_composite_risk(step_results)

        executed_model_ids = [r.model_id for r in step_results]
        model_versions = {r.model_type: r.model_version for r in step_results}

        indiv_results_dict = {
            r.model_type: {
                "model_id": r.model_id,
                "model_name": r.model_name,
                "framework": r.framework,
                "raw_result": r.raw_result,
                "score": r.score,
                "confidence": r.confidence,
                "latency_ms": r.latency_ms,
                "status": r.status.value,
                "error_message": r.error_message,
            }
            for r in step_results
        }

        orch_pred_id = await self._generate_unique_pred_id()

        # 6. Persist Composite Prediction Record
        record = CompositePrediction(
            prediction_id=orch_pred_id,
            transaction_id=dto.transaction_id,
            feature_vector_id=vec_id,
            overall_risk_score=overall_score,
            confidence=overall_conf,
            composite_risk_level=risk_level,
            executed_models=executed_model_ids,
            execution_time_ms=total_latency_ms,
            individual_results=indiv_results_dict,
            feature_version=feature_ver,
            model_versions=model_versions,
            metadata_json={
                "executor_user_id": str(executor_user_id),
                "plan_id": plan.plan_id,
                "executed_steps_count": len(step_results),
            },
            is_deleted=False,
        )

        created_record = await self.composite_repo.create(record)

        await self.audit_repo.log_action(
            action="AI_ORCHESTRATION_EXECUTED",
            user_id=executor_user_id,
            details={
                "prediction_id": created_record.prediction_id,
                "transaction_id": dto.transaction_id,
                "overall_risk_score": overall_score,
                "risk_level": risk_level,
                "models_count": len(executed_model_ids),
            },
        )

        return CompositePredictionResponse.model_validate(created_record)

    async def get_orchestration_history_detail(
        self, prediction_id_str: str
    ) -> CompositePredictionResponse:
        """Retrieve composite prediction record by ID or prediction_id."""
        record = await self.composite_repo.get_by_prediction_id(prediction_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(prediction_id_str)
                record = await self.composite_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Orchestration prediction record '{prediction_id_str}' not found.")

        return CompositePredictionResponse.model_validate(record)

    async def list_orchestration_history(
        self,
        transaction_id: Optional[str] = None,
        composite_risk_level: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedCompositePredictionResponse:
        """Retrieve paginated orchestrator prediction logs."""
        items, total = await self.composite_repo.filter_and_paginate(
            transaction_id=transaction_id,
            composite_risk_level=composite_risk_level,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedCompositePredictionResponse(
            items=[CompositePredictionResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
