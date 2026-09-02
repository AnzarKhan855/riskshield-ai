from typing import Any, Dict, List, Tuple
from app.models.decision_rule import DecisionRule


class ConflictResolutionService:
    ACTION_HIERARCHY: Dict[str, int] = {
        "BLOCK": 4,
        "ESCALATE": 3,
        "REVIEW": 2,
        "APPROVE": 1,
    }

    @classmethod
    def resolve_winning_decision(
        cls, matched_rules: List[Tuple[DecisionRule, Dict[str, Any]]]
    ) -> Tuple[str, float, str]:
        """
        Resolves final decision action, confidence score, and primary reason from triggered rules.
        Returns (final_action, decision_confidence, decision_reason).
        """
        if not matched_rules:
            return "APPROVE", 0.95, "No risk rules or policy violations triggered."

        # Sort matched rules by Action Hierarchy weight DESC, then Priority ASC (lower = higher priority)
        sorted_matches = sorted(
            matched_rules,
            key=lambda x: (
                cls.ACTION_HIERARCHY.get(x[0].action.upper(), 1),
                -x[0].priority,  # Negative priority so lower integer sorts earlier
            ),
            reverse=True,
        )

        winning_rule, eval_details = sorted_matches[0]
        final_action = winning_rule.action.upper()

        # Compute confidence based on severity and count of triggered rules
        severity_conf = {
            "CRITICAL": 0.99,
            "HIGH": 0.95,
            "MEDIUM": 0.85,
            "LOW": 0.75,
        }
        confidence = severity_conf.get(winning_rule.severity.upper(), 0.90)
        reason = f"Triggered rule '{winning_rule.rule_name}' ({winning_rule.rule_id}) with action {final_action}."

        return final_action, confidence, reason
