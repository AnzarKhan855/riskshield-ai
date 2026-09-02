from typing import Any, Dict, Tuple
from app.domain.features.context import FeatureContext
from app.domain.features.registry import FeatureRegistry
from app.domain.features.strategies import register_default_strategies
from app.services.feature_validation_service import FeatureValidationService


class FeaturePipeline:
    def __init__(self):
        register_default_strategies()
        self.registry = FeatureRegistry

    def run_pipeline(self, context: FeatureContext) -> Tuple[Dict[str, Any], bool, int]:
        """
        Executes all registered feature extraction strategies against the context.
        Returns (feature_payload, prediction_ready, feature_count).
        """
        # Ensure strategies are registered
        register_default_strategies()

        combined_payload: Dict[str, Any] = {}

        for strategy in self.registry.get_all_strategies():
            computed = strategy.compute(context)
            combined_payload.update(computed)

        is_ready, errors = FeatureValidationService.validate_payload(combined_payload)
        feature_count = len(combined_payload)

        return combined_payload, is_ready, feature_count
