from typing import List
from app.domain.explainability.types import Recommendation


class RecommendationEngine:
    @staticmethod
    def generate_recommendations(decision: str, risk_score: float) -> List[Recommendation]:
        """Generates actionable analyst recommendations based on decision action and risk score."""
        recs: List[Recommendation] = []

        if decision == "BLOCK" or risk_score >= 80.0:
            recs.append(
                Recommendation(
                    action_type="BLOCK_CARD",
                    title="Block Payment Method & Card",
                    rationale="Critical composite risk score indicates high probability of fraudulent card abuse.",
                    priority="HIGH",
                )
            )
            recs.append(
                Recommendation(
                    action_type="VERIFY_IDENTITY",
                    title="Request KYC & Government Photo ID Verification",
                    rationale="Verify customer identity details prior to account unlock.",
                    priority="HIGH",
                )
            )
        elif decision == "REVIEW" or risk_score >= 50.0:
            recs.append(
                Recommendation(
                    action_type="REQUEST_3DS",
                    title="Step-Up 3D Secure Authentication",
                    rationale="Enforce mandatory 3DS OTP verification for subsequent payment attempts.",
                    priority="MEDIUM",
                )
            )
            recs.append(
                Recommendation(
                    action_type="VERIFY_IDENTITY",
                    title="Perform Out-of-Band Phone Verification",
                    rationale="Call customer phone number on record to confirm transaction authorization.",
                    priority="MEDIUM",
                )
            )
        else:
            recs.append(
                Recommendation(
                    action_type="APPROVE",
                    title="Approve Transaction",
                    rationale="Low composite risk score aligns with normal user behavior patterns.",
                    priority="LOW",
                )
            )

        return recs
