from typing import Any, Dict, List
from app.domain.explainability.types import FeatureContribution


class FeatureImportanceService:
    @staticmethod
    def calculate_contributions(feature_payload: Dict[str, Any]) -> List[FeatureContribution]:
        """
        Calculates feature importance scores and SHAP-like attributions for a feature vector payload.
        """
        contributions: List[FeatureContribution] = []
        if not feature_payload:
            return contributions

        # Baseline thresholds for key feature indicators
        key_features = [
            ("txn_amount", "Transaction Amount", 0.35, lambda v: v > 10000),
            ("vpn_active", "VPN / Proxy Active", 0.25, lambda v: bool(v)),
            ("device_rooted", "Rooted / Jailbroken Device", 0.20, lambda v: bool(v)),
            ("velocity_1h", "1-Hour Transaction Velocity", 0.15, lambda v: float(v or 0) > 3),
            ("distance_from_home_km", "Distance From Home Location", 0.10, lambda v: float(v or 0) > 500),
        ]

        for key, name, imp, trigger in key_features:
            val = feature_payload.get(key)
            if val is not None:
                is_high_risk = trigger(val)
                shap_val = imp if is_high_risk else -0.05
                direction = "INCREASES_RISK" if is_high_risk else "DECREASES_RISK"

                contributions.append(
                    FeatureContribution(
                        feature_name=name,
                        feature_value=val,
                        importance_score=imp,
                        shap_value=shap_val,
                        direction=direction,
                        description=f"{name} is set to {val}, which {direction.lower().replace('_', ' ')}.",
                    )
                )

        # Sort by importance descending
        contributions.sort(key=lambda c: c.importance_score, reverse=True)
        return contributions
