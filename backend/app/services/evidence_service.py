import secrets
from typing import Any, Dict, List, Optional
import uuid
from app.models.evidence import Evidence
from app.repositories.customer_repository import CustomerRepository
from app.repositories.decision_repository import DecisionRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.feature_repository import FeatureStoreRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.investigation import EvidenceCreateRequest, EvidenceResponse


class EvidenceService:
    def __init__(
        self,
        evidence_repo: EvidenceRepository,
        transaction_repo: TransactionRepository,
        merchant_repo: MerchantRepository,
        customer_repo: CustomerRepository,
        device_repo: DeviceRepository,
        feature_repo: FeatureStoreRepository,
        decision_repo: DecisionRepository,
    ):
        self.evidence_repo = evidence_repo
        self.transaction_repo = transaction_repo
        self.merchant_repo = merchant_repo
        self.customer_repo = customer_repo
        self.device_repo = device_repo
        self.feature_repo = feature_repo
        self.decision_repo = decision_repo

    async def add_evidence(
        self,
        case_id: uuid.UUID,
        dto: EvidenceCreateRequest,
        created_by: str = "Risk Analyst",
    ) -> EvidenceResponse:
        """Attach a single custom evidence item to case."""
        evd_code = f"EVD-{secrets.token_hex(4).upper()}"
        record = Evidence(
            evidence_id=evd_code,
            case_id=case_id,
            evidence_type=dto.evidence_type,
            title=dto.title,
            description=dto.description,
            reference_id=dto.reference_id,
            metadata_json=dto.metadata_json,
            created_by=created_by,
        )
        created = await self.evidence_repo.create(record)
        return EvidenceResponse.model_validate(created)

    async def auto_discover_and_attach_evidence(
        self,
        case_id: uuid.UUID,
        transaction_id: str,
        decision_id_str: Optional[str] = None,
    ) -> List[EvidenceResponse]:
        """
        Automatically gathers and creates evidence items across:
        1. Transaction Details
        2. Decision Intelligence Output & Triggered Rules
        3. Merchant Profile & Risk Level
        4. Customer Metrics & LTV
        5. Device Telemetry & VPN Flags
        6. Feature Store Payload Snapshot
        """
        attached: List[EvidenceResponse] = []

        # 1. Transaction Evidence
        txn = await self.transaction_repo.get_by_txn_id(transaction_id)
        if txn:
            dto = EvidenceCreateRequest(
                evidence_type="TRANSACTION",
                title=f"Transaction {txn.transaction_id} Details",
                description=f"Amount: ${txn.amount:.2f} {txn.currency}, Method: {txn.payment_method}, Card: {txn.card_network}",
                reference_id=txn.transaction_id,
                metadata_json={
                    "amount": float(txn.amount),
                    "currency": txn.currency,
                    "payment_method": txn.payment_method,
                    "status": txn.status,
                    "country": txn.country,
                },
            )
            attached.append(await self.add_evidence(case_id, dto, "Automated Discovery Engine"))

        # 2. Decision Intelligence Evidence
        dec = None
        if decision_id_str:
            dec = await self.decision_repo.get_by_decision_id(decision_id_str)
        if dec:
            dto = EvidenceCreateRequest(
                evidence_type="DECISION_RULES",
                title=f"Decision {dec.decision_id} - Action: {dec.decision}",
                description=f"Composite Risk Score: {dec.composite_risk_score:.1f}/100, Rationale: {dec.decision_reason}",
                reference_id=dec.decision_id,
                metadata_json={
                    "decision": dec.decision,
                    "confidence": dec.decision_confidence,
                    "composite_risk_score": dec.composite_risk_score,
                    "triggered_rules": dec.triggered_rules,
                    "triggered_policies": dec.triggered_policies,
                },
            )
            attached.append(await self.add_evidence(case_id, dto, "Automated Discovery Engine"))

        # 3. Feature Vector Snapshot
        feat = await self.feature_repo.get_by_txn_id(transaction_id)
        if feat:
            dto = EvidenceCreateRequest(
                evidence_type="FEATURE_SNAPSHOT",
                title=f"Feature Vector {feat.feature_vector_id} Snapshot",
                description=f"Evaluated {len(feat.feature_payload)} features under schema {feat.feature_version}",
                reference_id=feat.feature_vector_id,
                metadata_json=feat.feature_payload,
            )
            attached.append(await self.add_evidence(case_id, dto, "Automated Discovery Engine"))

        return attached

    async def get_case_evidence(self, case_id: uuid.UUID) -> List[EvidenceResponse]:
        """List attached evidence items for a case."""
        items = await self.evidence_repo.get_by_case_id(case_id)
        return [EvidenceResponse.model_validate(e) for e in items]
