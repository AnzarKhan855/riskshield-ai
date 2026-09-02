import math
import secrets
import time
from typing import Optional
import uuid
from app.core.exceptions import NotFoundException, ValidationException
from app.domain.models.loaders.factory import ModelLoaderFactory
from app.models.model_registry import ModelType
from app.models.prediction_history import PredictionHistory
from app.repositories.audit_repository import AuditLogRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.model_repository import ModelRegistryRepository
from app.repositories.prediction_repository import PredictionHistoryRepository
from app.schemas.prediction import (
    PaginatedPredictionResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.services.feature_engineering_service import FeatureEngineeringService


class InferenceService:
    def __init__(
        self,
        prediction_repo: PredictionHistoryRepository,
        model_repo: ModelRegistryRepository,
        feature_repo: FeatureStoreRepository,
        feature_service: FeatureEngineeringService,
        audit_repo: AuditLogRepository,
    ):
        self.prediction_repo = prediction_repo
        self.model_repo = model_repo
        self.feature_repo = feature_repo
        self.feature_service = feature_service
        self.audit_repo = audit_repo
        self.loader_factory = ModelLoaderFactory()

    async def _generate_unique_pred_id(self) -> str:
        """Generate unique prediction ID formatted as PRED-XXXXXXXX."""
        for _ in range(10):
            hex_suffix = secrets.token_hex(4).upper()
            p_id = f"PRED-{hex_suffix}"
            existing = await self.prediction_repo.get_by_prediction_id(p_id)
            if not existing:
                return p_id
        raise ValidationException("Failed to generate unique Prediction ID.")

    async def predict(
        self,
        dto: PredictionRequest,
        executor_user_id: uuid.UUID,
    ) -> PredictionResponse:
        """
        Executes prediction pipeline:
        1. Resolve Feature Vector (or generate on the fly).
        2. Resolve active Production Model for requested model_type.
        3. Load Framework Model artifact via Factory.
        4. Execute inference.
        5. Log prediction history & audit metadata.
        """
        start_time = time.perf_counter()

        # 1. Resolve Feature Vector
        feature_record = await self.feature_repo.get_by_txn_id(dto.transaction_id)
        if not feature_record:
            # Generate feature vector on the fly if not already computed
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

        # 2. Resolve Active Production Model
        model_record = await self.model_repo.get_production_model_by_type(dto.model_type)
        if not model_record:
            # Fallback to any active model of model_type if explicit production flag not set
            items, _ = await self.model_repo.filter_and_paginate(
                model_type=dto.model_type, size=1
            )
            if items:
                model_record = items[0]
            else:
                raise NotFoundException(
                    f"No active ML model found in registry for model type '{dto.model_type.value}'."
                )

        # 3. Resolve Model Loader via Factory & Execute Inference
        loader = self.loader_factory.get_loader(model_record.framework.value)
        artifact = loader.load_model(model_record.model_id, f"/models/{model_record.model_id}")

        inference_output = loader.predict(artifact, feature_payload)

        total_latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        pred_code = await self._generate_unique_pred_id()

        # 4. Persist Prediction History Record
        history_record = PredictionHistory(
            prediction_id=pred_code,
            model_id=model_record.id,
            transaction_id=dto.transaction_id,
            feature_vector_id=vec_id,
            inference_time_ms=inference_output.get("inference_time_ms", total_latency_ms),
            prediction_result=inference_output.get("prediction_result", "ALLOW"),
            confidence_score=float(inference_output.get("confidence_score", 0.95)),
            decision_status="COMPLETED",
            feature_version=feature_ver,
            model_version=model_record.version,
            latency_ms=total_latency_ms,
            raw_output_json=inference_output,
            audit_metadata={
                "executor_user_id": str(executor_user_id),
                "framework_used": model_record.framework.value,
                "model_name": model_record.model_name,
            },
            is_deleted=False,
        )

        created_history = await self.prediction_repo.create(history_record)

        # 5. Audit Logging
        await self.audit_repo.log_action(
            action="PREDICTION_EXECUTED",
            user_id=executor_user_id,
            details={
                "prediction_id": created_history.prediction_id,
                "model_id": model_record.model_id,
                "transaction_id": dto.transaction_id,
                "result": created_history.prediction_result,
                "confidence": created_history.confidence_score,
            },
        )

        return PredictionResponse.model_validate(created_history)

    async def get_prediction(self, prediction_id_str: str) -> PredictionResponse:
        """Retrieve prediction record by prediction_id or UUID."""
        record = await self.prediction_repo.get_by_prediction_id(prediction_id_str)
        if not record:
            try:
                rec_uuid = uuid.UUID(prediction_id_str)
                record = await self.prediction_repo.get_active_by_id(rec_uuid)
            except ValueError:
                pass

        if not record:
            raise NotFoundException(f"Prediction record '{prediction_id_str}' not found.")

        return PredictionResponse.model_validate(record)

    async def list_predictions(
        self,
        transaction_id: Optional[str] = None,
        model_id: Optional[uuid.UUID] = None,
        prediction_result: Optional[str] = None,
        page: int = 1,
        size: int = 10,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> PaginatedPredictionResponse:
        """Retrieve paginated prediction logs."""
        items, total = await self.prediction_repo.filter_and_paginate(
            transaction_id=transaction_id,
            model_id=model_id,
            prediction_result=prediction_result,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

        pages = math.ceil(total / size) if total > 0 else 0

        return PaginatedPredictionResponse(
            items=[PredictionResponse.model_validate(p) for p in items],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )
