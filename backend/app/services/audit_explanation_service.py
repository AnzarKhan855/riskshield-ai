from datetime import datetime, timezone
import hashlib
import json
from typing import Any, Dict


class AuditExplanationService:
    @staticmethod
    def generate_audit_info(
        decision_id: str,
        transaction_id: str,
        risk_score: float,
        engine_version: str = "RiskShield-XAI-v2.4",
    ) -> Dict[str, Any]:
        """
        Generates cryptographic audit hash and compliance metadata for AI Decision explanation.
        """
        now_utc = datetime.now(timezone.utc).isoformat()
        payload = {
            "decision_id": decision_id,
            "transaction_id": transaction_id,
            "risk_score": risk_score,
            "timestamp": now_utc,
            "engine_version": engine_version,
        }
        payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        audit_hash = hashlib.sha256(payload_bytes).hexdigest()

        return {
            "audit_hash": f"sha256:{audit_hash}",
            "engine_version": engine_version,
            "compliance_standard": "PCI-DSS v4.0 / SOC2 Type II / EU AI Act",
            "audited_at": now_utc,
            "verifiable": True,
        }
