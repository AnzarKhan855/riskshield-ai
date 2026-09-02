import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
    hash_token,
)
from app.domain.decision.compiler import RuleCompiler, RuleEvaluator
from app.domain.explainability.feature_importance import FeatureImportanceService
from app.domain.orchestrator.aggregator import CompositeRiskCalculator
from app.domain.orchestrator.types import ModelExecutionResult, StepStatus

client = TestClient(app)


def test_health_check():
    """Verify health check endpoint returns 200 OK and valid health payload."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"].upper() == "HEALTHY"
    assert "environment" in data["data"]
    assert "timestamp" in data["data"]


def test_security_headers():
    """Verify security headers middleware injects OWASP headers."""
    response = client.get("/api/v1/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Strict-Transport-Security" in response.headers


def test_password_hashing():
    """Verify bcrypt hashing and verification with safe truncation."""
    raw_pass = "SuperSecurePassword123!_with_very_long_entropy_string_that_exceeds_limits"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_generation_and_decoding():
    """Verify JWT access and refresh token creation and decode payload integrity."""
    sub = "11111111-2222-3333-4444-555555555555"
    role = "Admin"
    token = create_access_token(sub, role)
    decoded = decode_token(token)

    assert decoded["sub"] == sub
    assert decoded["role"] == role
    assert decoded["type"] == "access"
    assert "jti" in decoded
    assert "exp" in decoded

    # Test token hashing for DB revocation lookup
    token_hash = hash_token(token)
    assert len(token_hash) == 64  # SHA-256 hex digest length


def test_rule_compiler():
    """Verify Boolean rule evaluator evaluates transactional logic correctly."""
    assert RuleCompiler.validate_expression("txn_amount > 1000") is True
    assert RuleCompiler.validate_expression("import os") is False

    expr = "txn_amount > 1000 and loc_is_high_risk_country == True"
    context_true = {"txn_amount": 1500.0, "loc_is_high_risk_country": True}
    context_false = {"txn_amount": 500.0, "loc_is_high_risk_country": True}

    matched_true, _ = RuleEvaluator.evaluate_expression(expr, context_true)
    matched_false, _ = RuleEvaluator.evaluate_expression(expr, context_false)

    assert matched_true is True
    assert matched_false is False


def test_feature_importance_contributions():
    """Verify SHAP-like feature importance calculations."""
    service = FeatureImportanceService()
    payload = {
        "txn_amount": 15000.0,
        "velocity_1h": 8,
        "vpn_active": True,
        "device_rooted": False,
        "distance_from_home_km": 1200.0,
    }
    contributions = service.calculate_contributions(payload)
    assert len(contributions) > 0
    assert any(c.feature_name == "Transaction Amount" for c in contributions)
    top_c = contributions[0]
    assert hasattr(top_c, "importance_score")
    assert hasattr(top_c, "shap_value")
    assert top_c.direction == "INCREASES_RISK"


def test_composite_risk_calculator():
    """Verify multi-model risk score aggregation."""
    calculator = CompositeRiskCalculator()
    results = [
        ModelExecutionResult(
            model_id="M-1",
            model_name="XGBoost",
            model_type="Fraud Detection",
            model_version="v1.0.0",
            framework="XGBoost",
            score=85.0,
            confidence=0.92,
            raw_result="BLOCK",
            latency_ms=8.2,
            status=StepStatus.SUCCESS,
        ),
        ModelExecutionResult(
            model_id="M-2",
            model_name="ONNX Behaviour",
            model_type="Behaviour Analysis",
            model_version="v1.0.0",
            framework="ONNX",
            score=90.0,
            confidence=0.88,
            raw_result="BLOCK",
            latency_ms=10.4,
            status=StepStatus.SUCCESS,
        ),
    ]

    overall_score, confidence, risk_level = calculator.calculate_composite_risk(results)
    assert overall_score > 80.0
    assert confidence > 0.85
    assert risk_level in ["CRITICAL", "HIGH"]
