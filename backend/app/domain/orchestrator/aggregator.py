from typing import Dict, List, Tuple
from app.domain.orchestrator.types import ModelExecutionResult, StepStatus


class CompositeRiskCalculator:
    # Domain weights for model types
    DEFAULT_WEIGHTS: Dict[str, float] = {
        "Fraud Detection": 0.35,
        "Chargeback Prediction": 0.25,
        "Merchant Risk": 0.15,
        "Customer Risk": 0.10,
        "Device Risk": 0.10,
        "Behaviour Analysis": 0.05,
    }

    @classmethod
    def calculate_composite_risk(
        cls, results: List[ModelExecutionResult]
    ) -> Tuple[float, float, str]:
        """
        Calculates weighted composite risk score (0.0 to 100.0), overall confidence, and risk level.
        Returns (overall_risk_score, overall_confidence, composite_risk_level).
        """
        if not results:
            return 0.0, 0.5, "LOW"

        weighted_score_sum = 0.0
        weight_total = 0.0
        conf_sum = 0.0
        active_count = 0

        for r in results:
            if r.status in (StepStatus.SUCCESS, StepStatus.FALLBACK):
                w = cls.DEFAULT_WEIGHTS.get(r.model_type, 0.10)
                weighted_score_sum += (r.score * w)
                weight_total += w
                conf_sum += r.confidence
                active_count += 1

        if weight_total == 0 or active_count == 0:
            overall_score = 0.0
            overall_conf = 0.5
        else:
            overall_score = round(weighted_score_sum / weight_total, 2)
            overall_conf = round(conf_sum / active_count, 4)

        if overall_score >= 80.0:
            level = "CRITICAL"
        elif overall_score >= 60.0:
            level = "HIGH"
        elif overall_score >= 35.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return overall_score, overall_conf, level
