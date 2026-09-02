import uuid
import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole, UserStatus

client = TestClient(app)

mock_user = User(
    id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
    first_name="AI",
    last_name="Analyst",
    email="analyst@riskshield.ai",
    role=UserRole.ADMIN,
    status=UserStatus.ACTIVE,
    email_verified=True,
    password_hash="mock_hash",
)

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_active_user] = lambda: mock_user
    yield
    app.dependency_overrides.pop(get_current_active_user, None)


def test_copilot_general_query():
    response = client.post(
        "/api/v1/ai/copilot/query",
        json={"query": "What is the status of the risk monitoring cluster?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "answer" in data["data"]
    assert "evidence" in data["data"]
    assert "recommended_actions" in data["data"]


def test_copilot_rule_query():
    response = client.post(
        "/api/v1/ai/copilot/query",
        json={"query": "Can you suggest a rule for high velocity cross border transactions?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["intent"] == "RULE_SYNTHESIS"
    assert "suggested_rule" in data["data"]["evidence"]


def test_copilot_drift_query():
    response = client.post(
        "/api/v1/ai/copilot/query",
        json={"query": "What is the current model drift and PSI status?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["intent"] == "MODEL_DRIFT_ANALYSIS"


def test_nl_search():
    response = client.post(
        "/api/v1/ai/nl-search",
        json={"query": "Show blocked transactions over $500 in US"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "structured_filters" in data["data"]
    assert "results" in data["data"]
    assert data["data"]["structured_filters"].get("min_amount") == 500.0
    assert data["data"]["structured_filters"].get("country") == "US"


def test_fraud_patterns():
    response = client.get("/api/v1/ai/fraud-patterns")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["active_clusters_count"] > 0
    assert len(data["data"]["detected_patterns"]) > 0
    first_pattern = data["data"]["detected_patterns"][0]
    assert "pattern_name" in first_pattern
    assert "severity" in first_pattern
    assert "suggested_rule" in first_pattern


def test_risk_recommendations():
    response = client.get("/api/v1/ai/risk-recommendations")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["recommendations"]) > 0
    assert "projected_impact" in data["data"]["recommendations"][0]


def test_rule_suggestions():
    response = client.get("/api/v1/ai/rule-suggestions")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["suggested_rules"]) > 0


def test_model_recommendations():
    response = client.get("/api/v1/ai/model-recommendations")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "champion_model" in data["data"]
    assert "recommendations" in data["data"]


def test_drift_detection():
    response = client.get("/api/v1/ai/drift-detection")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overall_psi" in data["data"]
    assert "feature_drift_breakdown" in data["data"]


def test_feature_importance():
    response = client.get("/api/v1/ai/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["global_feature_importance"]) > 0


def test_scenario_testing():
    response = client.post(
        "/api/v1/ai/scenario-testing",
        json={
            "scenario_type": "BOTNET_CARD_TESTING",
            "parameters": {"attack_intensity": "HIGH"}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "simulation_results" in data["data"]
    assert data["data"]["simulation_results"]["projected_block_pct"] > 0
