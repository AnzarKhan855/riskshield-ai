import math
from typing import Any, Dict, List, Tuple


class FeatureValidationService:
    @staticmethod
    def validate_payload(payload: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validates feature vector payload for ML model prediction readiness.
        Returns (is_ready, list_of_validation_errors).
        """
        errors: List[str] = []

        if not payload:
            return False, ["Feature payload is empty."]

        for key, val in payload.items():
            if val is None:
                errors.append(f"Feature '{key}' is None.")
            elif isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                errors.append(f"Feature '{key}' contains NaN or Infinite value.")

        is_ready = len(errors) == 0
        return is_ready, errors
