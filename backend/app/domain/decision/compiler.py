import re
from typing import Any, Dict, Tuple


class RuleCompiler:
    @staticmethod
    def validate_expression(expression_str: str) -> bool:
        """Validates that a rule expression string contains valid tokens."""
        if not expression_str or not expression_str.strip():
            return False
        # Disallow dangerous python code
        forbidden = ["import", "eval", "exec", "os.", "sys.", "subprocess", "__"]
        for f in forbidden:
            if f in expression_str:
                return False
        return True


class RuleEvaluator:
    @staticmethod
    def evaluate_expression(
        expression_str: str, context_vars: Dict[str, Any]
    ) -> Tuple[bool, str]:
        """
        Safely evaluates rule expression string against context variables.
        Returns (is_matched, detail_explanation).
        """
        if not RuleCompiler.validate_expression(expression_str):
            return False, "Invalid or prohibited expression syntax."

        try:
            # Replace logical operators and boolean literals for safe Python evaluation
            expr = expression_str
            expr = re.sub(r'\bAND\b', 'and', expr, flags=re.IGNORECASE)
            expr = re.sub(r'\bOR\b', 'or', expr, flags=re.IGNORECASE)
            expr = re.sub(r'\bNOT\b', 'not', expr, flags=re.IGNORECASE)
            expr = re.sub(r'\btrue\b', 'True', expr)
            expr = re.sub(r'\bfalse\b', 'False', expr)
            expr = re.sub(r'\bnull\b', 'None', expr)

            # Build safe environment dictionary with default values for referenced missing keys
            env: Dict[str, Any] = {
                "true": True,
                "false": False,
                "null": None,
                "True": True,
                "False": False,
                "None": None,
                "txn_amount": 0.0,
                "amount": 0.0,
                "composite_risk_score": 0.0,
                "customer_risk_score": 0.0,
                "cust_ltv": 0.0,
                "dev_vpn_detected": False,
                "dev_rooted_detected": False,
                "loc_is_high_risk_country": False,
                "loc_is_new_country": False,
                "beh_unusual_amount": False,
                "beh_is_night_txn": False,
                "cust_chargeback_ratio": 0.0,
                "merchant_chargeback_rate": 0.0,
                "is_foreign_transaction": False,
                "velocity_count_1h": 0,
            }
            env.update(context_vars)

            # Evaluate in restricted global/local environment
            matched = bool(eval(expr, {"__builtins__": {}}, env))
            detail = f"Expression '{expression_str}' evaluated to {matched}."
            return matched, detail

        except Exception as e:
            return False, f"Evaluation error: {str(e)}"
