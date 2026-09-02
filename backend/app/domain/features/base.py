from abc import ABC, abstractmethod
from typing import Any, Dict
from app.domain.features.context import FeatureContext


class BaseFeatureStrategy(ABC):
    @property
    @abstractmethod
    def group_name(self) -> str:
        """Name of the feature group (e.g. 'transaction', 'customer', 'velocity')."""
        pass

    @abstractmethod
    def compute(self, context: FeatureContext) -> Dict[str, Any]:
        """
        Extract and compute features from context.
        Must return a dict mapping feature_name -> feature_value.
        """
        pass
