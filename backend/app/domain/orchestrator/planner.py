import secrets
from typing import Dict, List, Optional
from app.domain.orchestrator.types import ExecutionMode, ExecutionPlan, ExecutionStep
from app.models.model_registry import ModelRegistry, ModelType


class ExecutionPlanner:
    @staticmethod
    def create_plan(
        selected_models: Dict[ModelType, ModelRegistry],
        execution_mode: ExecutionMode = ExecutionMode.PARALLEL,
    ) -> ExecutionPlan:
        """Constructs an ExecutionPlan with steps for each candidate model."""
        plan_id = f"PLAN-{secrets.token_hex(4).upper()}"
        steps: List[ExecutionStep] = []

        for m_type, model in selected_models.items():
            step = ExecutionStep(
                step_id=f"STEP-{m_type.name}",
                model_type=m_type,
                target_model=model,
                execution_mode=execution_mode,
                timeout_ms=100.0,
                retry_count=1,
            )
            steps.append(step)

        return ExecutionPlan(plan_id=plan_id, steps=steps)
