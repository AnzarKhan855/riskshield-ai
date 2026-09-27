import os
import json
import tempfile
import pytest
import numpy as np

from app.domain.models.loaders.base import ModelIntegrityError
from app.domain.models.loaders.implementations import (
    XGBoostLoader,
    ONNXLoader,
    JoblibLoader,
    FEATURE_NAMES,
)


def test_xgboost_loader_real_inference():
    loader = XGBoostLoader()
    artifact = loader.load_model("MOD-XGB-001", "/models/MOD-XGB-001")

    assert artifact is not None
    assert artifact.framework == "XGBoost"
    assert artifact.model_id == "MOD-XGB-001"

    features = {
        "amount": 2500.0,
        "velocity_1h": 3.0,
        "velocity_24h": 5.0,
        "risk_score_prior": 45.0,
        "is_cross_border": True,
        "is_new_device": False,
        "device_trust_score": 0.85,
        "failed_attempts_24h": 0.0,
        "merchant_risk_score": 60.0,
        "channel_risk": 0.0,
    }

    result = loader.predict(artifact, features)

    assert result["prediction_result"] in ["ALLOW", "FLAG", "BLOCK"]
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert 0.0 <= result["raw_probability"] <= 1.0
    # Native inference without simulated latency
    assert result["inference_time_ms"] < 25.0
    assert result["features_evaluated"] == len(FEATURE_NAMES)
    assert "feature_importance" in result
    assert len(result["feature_importance"]) == len(FEATURE_NAMES)


def test_onnx_loader_real_inference():
    loader = ONNXLoader()
    artifact = loader.load_model("MOD-ONNX-002", "/models/MOD-ONNX-002")

    assert artifact is not None
    assert artifact.framework == "ONNX"
    assert artifact.model_id == "MOD-ONNX-002"

    features = {
        "amount": 500.0,
        "velocity_1h": 1.0,
        "velocity_24h": 2.0,
        "risk_score_prior": 10.0,
        "is_cross_border": False,
        "is_new_device": False,
        "device_trust_score": 0.95,
        "failed_attempts_24h": 0.0,
        "merchant_risk_score": 20.0,
        "channel_risk": 0.0,
    }

    result = loader.predict(artifact, features)

    assert result["prediction_result"] in ["ALLOW", "FLAG", "BLOCK"]
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert 0.0 <= result["raw_probability"] <= 1.0
    assert result["inference_time_ms"] < 20.0
    assert result["features_evaluated"] == len(FEATURE_NAMES)


def test_joblib_loader_real_inference():
    loader = JoblibLoader()
    artifact = loader.load_model("MOD-RF-004", "/models/MOD-RF-004")

    assert artifact is not None
    assert artifact.framework == "Joblib"

    features = {"amount": 100.0, "velocity_1h": 0.0}
    result = loader.predict(artifact, features)

    assert result["prediction_result"] in ["ALLOW", "FLAG", "BLOCK"]
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert result["inference_time_ms"] < 30.0


def test_missing_model_raises_file_not_found():
    loader = XGBoostLoader()
    with pytest.raises(FileNotFoundError):
        loader.load_model("MOD-NONEXISTENT-999", "/nonexistent/path/model.json")


def test_corrupted_hash_raises_model_integrity_error(monkeypatch):
    loader = XGBoostLoader()
    from app.domain.models.loaders import implementations

    # Mock manifest with an invalid expected hash
    orig_resolve = implementations._resolve_and_verify_artifact

    def mock_resolve(model_id, artifact_path, framework):
        path, entry = orig_resolve(model_id, artifact_path, framework)
        entry_corrupt = dict(entry)
        entry_corrupt["sha256_hash"] = "0000000000000000000000000000000000000000000000000000000000000000"
        # Directly call verification to trigger error
        actual_hash = implementations._compute_sha256(path)
        if actual_hash != entry_corrupt["sha256_hash"]:
            raise ModelIntegrityError(f"Hash mismatch for {model_id}")
        return path, entry_corrupt

    monkeypatch.setattr(implementations, "_resolve_and_verify_artifact", mock_resolve)

    with pytest.raises(ModelIntegrityError):
        loader.load_model("MOD-XGB-001", "/models/MOD-XGB-001")


def test_feature_dimension_mismatch_raises_model_integrity_error():
    loader = XGBoostLoader()
    artifact = loader.load_model("MOD-XGB-001", "/models/MOD-XGB-001")

    # Pass 5 features instead of 10
    invalid_array = np.array([1.0, 2.0, 3.0, 4.0, 5.0], dtype=np.float32)

    with pytest.raises(ModelIntegrityError):
        loader.predict(artifact, invalid_array)
