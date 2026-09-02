import asyncio
import time
from typing import Dict, List
from app.domain.models.loaders.factory import ModelLoaderFactory
from app.domain.orchestrator.types import (
    ExecutionContext,
    ExecutionMode,
    ExecutionPlan,
    ExecutionStep,
    ModelExecutionResult,
    StepStatus,
)


class ExecutionEngine:
    def __init__(self):
        self.loader_factory = ModelLoaderFactory()

    async def _execute_single_step(
        self, step: ExecutionStep, context: ExecutionContext
    ) -> ModelExecutionResult:
        start_time = time.perf_counter()
        model = step.target_model

        if not model:
            return ModelExecutionResult(
                model_id="UNKNOWN",
                model_name=step.model_type.value,
                model_type=step.model_type.value,
                model_version="v1.0.0",
                framework="RuleEngine",
                raw_result="ALLOW",
                score=0.0,
                confidence=0.5,
                latency_ms=0.5,
                status=StepStatus.SKIPPED,
                error_message="No active model registered for this model type.",
            )

        try:
            # Resolve Loader via Factory
            loader = self.loader_factory.get_loader(model.framework.value)
            artifact = loader.load_model(model.model_id, f"/models/{model.model_id}")

            # Run prediction with timeout
            loop = asyncio.get_event_loop()
            prediction_output = await asyncio.wait_for(
                loop.run_in_executor(None, loader.predict, artifact, context.feature_payload),
                timeout=step.timeout_ms / 1000.0,
            )

            latency = round((time.perf_counter() - start_time) * 1000.0, 2)
            raw_res = prediction_output.get("prediction_result", "ALLOW")
            conf = float(prediction_output.get("confidence_score", 0.90))

            # Calculate risk score (0-100) based on confidence & result
            if raw_res == "BLOCK":
                score = round(max(75.0, conf * 100.0), 2)
            elif raw_res == "FLAG":
                score = round(max(40.0, conf * 70.0), 2)
            else:
                score = round(max(5.0, (1.0 - conf) * 30.0), 2)

            return ModelExecutionResult(
                model_id=model.model_id,
                model_name=model.model_name,
                model_type=step.model_type.value,
                model_version=model.version,
                framework=model.framework.value,
                raw_result=raw_res,
                score=score,
                confidence=conf,
                latency_ms=prediction_output.get("inference_time_ms", latency),
                status=StepStatus.SUCCESS,
                evaluated_features_count=prediction_output.get("features_evaluated", 0),
            )

        except asyncio.TimeoutError:
            latency = round((time.perf_counter() - start_time) * 1000.0, 2)
            return ModelExecutionResult(
                model_id=model.model_id,
                model_name=model.model_name,
                model_type=step.model_type.value,
                model_version=model.version,
                framework=model.framework.value,
                raw_result="FLAG",
                score=50.0,
                confidence=0.5,
                latency_ms=latency,
                status=StepStatus.FAILED,
                error_message=f"Model execution timed out after {step.timeout_ms}ms.",
            )

        except Exception as e:
            latency = round((time.perf_counter() - start_time) * 1000.0, 2)
            return ModelExecutionResult(
                model_id=model.model_id,
                model_name=model.model_name,
                model_type=step.model_type.value,
                model_version=model.version,
                framework=model.framework.value,
                raw_result="FLAG",
                score=50.0,
                confidence=0.5,
                latency_ms=latency,
                status=StepStatus.FAILED,
                error_message=str(e),
            )

    async def execute_plan(
        self, plan: ExecutionPlan, context: ExecutionContext
    ) -> List[ModelExecutionResult]:
        """Executes all steps in the plan concurrently via asyncio.gather."""
        tasks = [self._execute_single_step(step, context) for step in plan.steps]
        results = await asyncio.gather(*tasks)
        return list(results)
