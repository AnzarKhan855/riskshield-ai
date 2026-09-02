from typing import Any, Dict, Tuple
from app.domain.notifications.types import EventType, NotificationPriority


class TemplateEngine:
    @staticmethod
    def render(event_type: EventType, payload: Dict[str, Any]) -> Tuple[str, str, NotificationPriority]:
        """Renders title, message, and priority for a given EventType."""
        if event_type == EventType.HIGH_RISK_TRANSACTION:
            txn_id = payload.get("transaction_id", "TXN-UNKNOWN")
            amount = payload.get("amount", 0)
            score = payload.get("risk_score", 95.0)
            return (
                f"High-Risk Transaction Detected ({txn_id})",
                f"Transaction {txn_id} for ${amount:,.2f} flagged with critical risk score {score:.1f}/100.",
                NotificationPriority.CRITICAL,
            )

        elif event_type == EventType.DECISION_GENERATED:
            dec_id = payload.get("decision_id", "DEC-UNKNOWN")
            action = payload.get("decision", "BLOCK")
            return (
                f"AI Risk Decision Generated ({dec_id})",
                f"Decision engine executed action '{action}' for decision {dec_id}.",
                NotificationPriority.HIGH if action == "BLOCK" else NotificationPriority.MEDIUM,
            )

        elif event_type == EventType.CASE_CREATED:
            case_id = payload.get("case_id", "CASE-UNKNOWN")
            title = payload.get("title", "Suspicious Activity")
            return (
                f"New Fraud Case Opened ({case_id})",
                f"Investigation case {case_id} created: {title}.",
                NotificationPriority.HIGH,
            )

        elif event_type == EventType.CASE_ASSIGNED:
            case_id = payload.get("case_id", "CASE-UNKNOWN")
            assignee = payload.get("assignee", "Analyst")
            return (
                f"Case Assigned ({case_id})",
                f"Investigation case {case_id} assigned to analyst {assignee}.",
                NotificationPriority.MEDIUM,
            )

        elif event_type == EventType.RULE_PUBLISHED:
            rule_id = payload.get("rule_id", "RULE-UNKNOWN")
            rule_name = payload.get("rule_name", "Policy Rule")
            return (
                f"Decision Rule Published ({rule_id})",
                f"Decision rule '{rule_name}' ({rule_id}) has been activated in production.",
                NotificationPriority.MEDIUM,
            )

        elif event_type == EventType.TRANSACTION_FAILED:
            txn_id = payload.get("transaction_id", "TXN-UNKNOWN")
            reason = payload.get("reason", "Gateway timeout")
            return (
                f"Payment Processing Failure ({txn_id})",
                f"Transaction {txn_id} failed: {reason}.",
                NotificationPriority.MEDIUM,
            )

        else:
            return (
                f"System Event ({event_type.value})",
                f"Event {event_type.value} recorded across RiskShield platform.",
                NotificationPriority.LOW,
            )
