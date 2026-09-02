from typing import List
from app.domain.explainability.types import FeatureContribution


class ReasonGenerator:
    @staticmethod
    def generate_primary_reason(
        decision: str,
        risk_score: float,
        top_features: List[FeatureContribution],
    ) -> str:
        """Synthesizes human-readable primary audit rationale."""
        if not top_features:
            return f"Decision '{decision}' produced composite risk score of {risk_score:.1f}/100 based on standard platform rules."

        risk_factors = [f.feature_name for f in top_features if f.direction == "INCREASES_RISK"]
        if risk_factors:
            factors_str = ", ".join(risk_factors[:3])
            return f"Decision '{decision}' triggered due to elevated risk from: {factors_str} (Risk Score: {risk_score:.1f}/100)."
        else:
            return f"Decision '{decision}' produced low composite risk score of {risk_score:.1f}/100 with baseline parameters."
