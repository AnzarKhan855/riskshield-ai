from typing import Any, Dict, List


class PolicyEvaluationService:
    @staticmethod
    def evaluate_policies(
        context_vars: Dict[str, Any]
    ) -> List[str]:
        """
        Evaluates system-level business and compliance policies.
        Returns list of triggered policy names.
        """
        triggered_policies: List[str] = []

        # 1. High Risk Country Policy
        if context_vars.get("loc_is_high_risk_country", False):
            triggered_policies.append("POL-SANCTIONS-HIGH-RISK-COUNTRY")

        # 2. Extreme Velocity Policy
        txns_1m = context_vars.get("velocity_txns_1m", 0)
        if txns_1m > 10:
            triggered_policies.append("POL-VELOCITY-BURST-ATTACK")

        # 3. High Value Unverified Customer Policy
        amt = context_vars.get("txn_amount", 0.0)
        ltv = context_vars.get("cust_ltv", 0.0)
        if amt > 5000.0 and ltv == 0.0:
            triggered_policies.append("POL-COMPLIANCE-HIGH-VALUE-FIRST-TXN")

        # 4. Critical Composite Risk Policy
        comp_risk = context_vars.get("composite_risk_score", 0.0)
        if comp_risk >= 85.0:
            triggered_policies.append("POL-AI-CRITICAL-COMPOSITE-RISK")

        return triggered_policies
