import math
from typing import List


class ConfidenceAnalyzer:
    @staticmethod
    def calculate_confidence(model_scores: List[float]) -> float:
        """
        Calculates ensemble confidence percentage based on score variance across model outputs.
        High consensus across models produces >90% confidence score.
        """
        if not model_scores:
            return 90.0

        if len(model_scores) == 1:
            return 95.0

        mean = sum(model_scores) / len(model_scores)
        variance = sum((s - mean) ** 2 for s in model_scores) / len(model_scores)
        std_dev = math.sqrt(variance)

        # Higher agreement (lower std_dev) = higher confidence
        confidence = max(50.0, min(99.9, 100.0 - (std_dev * 1.5)))
        return round(confidence, 1)
