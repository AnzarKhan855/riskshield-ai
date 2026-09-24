import os
import json
import hashlib
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.domain.models.loaders.base import IModelLoader, ModelArtifact, ModelIntegrityError

try:
    import xgboost as xgb
except ImportError:
    xgb = None

try:
    import onnxruntime as ort
except ImportError:
    ort = None

try:
    import joblib
except ImportError:
    joblib = None

FEATURE_NAMES = [
    "amount",
    "velocity_1h",
    "velocity_24h",
    "risk_score_prior",
    "is_cross_border",
    "is_new_device",
    "device_trust_score",
    "failed_attempts_24h",
    "merchant_risk_score",
    "channel_risk",
]

def _get_models_dir() -> Path:
    """Resolve the directory containing serialized models and model_manifest.json."""
    # 1. Check relative to this source file: backend/models
    pkg_models = Path(__file__).resolve().parents[4] / "models"
    if pkg_models.exists():
        return pkg_models
    
    # 2. Check cwd / backend / models
    cwd_models = Path.cwd() / "backend" / "models"
    if cwd_models.exists():
        return cwd_models
    
    # 3. Check cwd / models
    direct_models = Path.cwd() / "models"
    if direct_models.exists():
        return direct_models

    return pkg_models

def _compute_sha256(filepath: Path) -> str:
    """Compute deterministic SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def _resolve_and_verify_artifact(model_id: str, artifact_path: str, framework: str) -> Tuple[Path, Dict[str, Any]]:
    """
    Resolve model artifact path and verify cryptographic integrity against model_manifest.json.
    Raises ModelIntegrityError if hash does not match, or FileNotFoundError if artifact missing.
    """
    models_dir = _get_models_dir()
    manifest_file = models_dir / "model_manifest.json"
    manifest: Dict[str, Any] = {}

    if manifest_file.exists():
        try:
            with open(manifest_file, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception as e:
            raise ModelIntegrityError(f"Corrupt model manifest: {e}") from e

    model_entry = manifest.get("models", {}).get(model_id, {})
    resolved_path: Optional[Path] = None

    # Priority 1: Manifest filename lookup
    if model_entry and "filename" in model_entry:
        candidate = models_dir / model_entry["filename"]
        if candidate.exists():
            resolved_path = candidate

    # Priority 2: Direct artifact_path lookup
    if not resolved_path and artifact_path:
        cand_direct = Path(artifact_path)
        if cand_direct.exists() and cand_direct.is_file():
            resolved_path = cand_direct
        else:
            # Check relative to models_dir (e.g. /models/MOD-XGB-001 or MOD-XGB-001)
            filename_only = cand_direct.name
            cand_in_models = models_dir / filename_only
            if cand_in_models.exists():
                resolved_path = cand_in_models

    # Priority 3: Lookup by standard framework defaults only for generic model ids
    if not resolved_path and (not model_id or model_id.lower() in ("default", "baseline")):
        default_filenames = {
            "xgboost": "fraud_detection_xgb_v1.json",
            "onnx": "chargeback_onnx_v1.onnx",
            "joblib": "merchant_risk_v1.joblib",
            "pytorch": "device_risk_iso_v1.joblib",
        }
        fallback_name = default_filenames.get(framework.lower())
        if fallback_name:
            cand_fb = models_dir / fallback_name
            if cand_fb.exists():
                resolved_path = cand_fb

    if not resolved_path or not resolved_path.exists():
        raise FileNotFoundError(
            f"Artifact for model '{model_id}' ({framework}) not found at '{artifact_path}' or '{models_dir}'."
        )

    # Cryptographic SHA-256 verification
    actual_hash = _compute_sha256(resolved_path)
    expected_hash = model_entry.get("sha256_hash")
    if expected_hash and actual_hash.lower() != expected_hash.lower():
        raise ModelIntegrityError(
            f"Model integrity violation for '{model_id}': SHA-256 hash mismatch. "
            f"Expected {expected_hash}, calculated {actual_hash}."
        )

    return resolved_path, model_entry

def _align_features(features: Any, expected_features: List[str] = FEATURE_NAMES) -> np.ndarray:
    """
    Deterministically align and impute feature dictionary or array to standard 10-feature schema.
    Validates input dimension and returns a float32 numpy array of shape (1, 10).
    """
    if isinstance(features, np.ndarray):
        if features.ndim == 1:
            if features.shape[0] != len(expected_features):
                raise ModelIntegrityError(
                    f"Feature shape mismatch: expected {len(expected_features)} features, received {features.shape[0]}"
                )
            return features.reshape(1, -1).astype(np.float32)
        elif features.ndim == 2:
            if features.shape[1] != len(expected_features):
                raise ModelIntegrityError(
                    f"Feature shape mismatch: expected {len(expected_features)} features, received {features.shape[1]}"
                )
            return features.astype(np.float32)
        else:
            raise ModelIntegrityError(f"Invalid feature array dimension: {features.ndim}")

    if isinstance(features, list):
        if len(features) != len(expected_features):
            raise ModelIntegrityError(
                f"Feature vector length mismatch: expected {len(expected_features)} features, received {len(features)}"
            )
        return np.array([features], dtype=np.float32)

    if not isinstance(features, dict):
        raise ModelIntegrityError(f"Unsupported features type: {type(features)}")

    # Deterministic mapping with feature aliases and safe defaults
    amount = float(features.get("amount") or features.get("txn_amount") or 0.0)
    velocity_1h = float(features.get("velocity_1h") or features.get("velocity_txns_1h") or 0.0)
    velocity_24h = float(features.get("velocity_24h") or features.get("velocity_txns_24h") or 0.0)
    risk_score_prior = float(
        features.get("risk_score_prior")
        if features.get("risk_score_prior") is not None
        else features.get("risk_composite_raw_score", features.get("customer_risk_score", 15.0))
    )
    is_cross_border = 1.0 if (features.get("is_cross_border") or features.get("loc_is_cross_border")) else 0.0
    is_new_device = 1.0 if (features.get("is_new_device") or features.get("dev_is_new_device")) else 0.0
    device_trust_score = float(
        features.get("device_trust_score")
        if features.get("device_trust_score") is not None
        else features.get("dev_trust_score", 0.85)
    )
    failed_attempts_24h = float(
        features.get("failed_attempts_24h")
        if features.get("failed_attempts_24h") is not None
        else features.get("cust_failed_payments", 0.0)
    )
    merchant_risk_score = float(
        features.get("merchant_risk_score")
        if features.get("merchant_risk_score") is not None
        else features.get("merchant_reputation_score", 50.0)
    )
    channel_risk = 1.0 if (
        features.get("channel_risk")
        or features.get("loc_is_high_risk_country")
        or features.get("dev_vpn_detected")
    ) else 0.0

    aligned = [
        amount,
        velocity_1h,
        velocity_24h,
        risk_score_prior,
        is_cross_border,
        is_new_device,
        device_trust_score,
        failed_attempts_24h,
        merchant_risk_score,
        channel_risk,
    ]
    return np.array([aligned], dtype=np.float32)


class XGBoostLoader(IModelLoader):
    def __init__(self):
        self._cache: Dict[str, ModelArtifact] = {}

    @property
    def framework_name(self) -> str:
        return "XGBoost"

    def load_model(self, model_id: str, artifact_path: str) -> ModelArtifact:
        if model_id in self._cache:
            return self._cache[model_id]

        resolved_path, entry = _resolve_and_verify_artifact(model_id, artifact_path, self.framework_name)
        booster = xgb.Booster()
        booster.load_model(str(resolved_path))

        artifact = ModelArtifact(
            model_id=model_id,
            model_type=entry.get("model_type", "Fraud Detection"),
            framework=self.framework_name,
            version=entry.get("version", "v1.0.0"),
            artifact_instance=booster,
            metadata={"path": str(resolved_path), "manifest": entry},
        )
        self._cache[model_id] = artifact
        return artifact

    def predict(self, artifact: ModelArtifact, features: Dict[str, Any]) -> Dict[str, Any]:
        start = time.perf_counter()
        X = _align_features(features, FEATURE_NAMES)
        dmatrix = xgb.DMatrix(X, feature_names=FEATURE_NAMES)
        booster: xgb.Booster = artifact.artifact_instance

        # 1. Native XGBoost inference
        raw_prob_arr = booster.predict(dmatrix)
        raw_prob = float(raw_prob_arr[0])
        confidence = round(min(0.9999, max(0.0001, raw_prob)), 4)

        # 2. Real SHAP Tree Feature Contributions
        contribs = booster.predict(dmatrix, pred_contribs=True)[0]
        # First 10 entries correspond to FEATURE_NAMES, 11th is bias
        feature_importance = {
            FEATURE_NAMES[i]: round(float(contribs[i]), 4)
            for i in range(min(len(FEATURE_NAMES), len(contribs) - 1))
        }

        # 3. Categorical Decision Resolution
        if confidence > 0.70:
            result = "BLOCK"
        elif confidence > 0.35:
            result = "FLAG"
        else:
            result = "ALLOW"

        # Exact elapsed time without simulated overhead
        elapsed_ms = round((time.perf_counter() - start) * 1000.0, 3)

        return {
            "prediction_result": result,
            "confidence_score": confidence,
            "raw_probability": raw_prob,
            "inference_time_ms": elapsed_ms,
            "features_evaluated": len(FEATURE_NAMES),
            "feature_importance": feature_importance,
            "model_version": artifact.version,
            "framework": self.framework_name,
        }


class ONNXLoader(IModelLoader):
    def __init__(self):
        self._cache: Dict[str, ModelArtifact] = {}

    @property
    def framework_name(self) -> str:
        return "ONNX"

    def load_model(self, model_id: str, artifact_path: str) -> ModelArtifact:
        if model_id in self._cache:
            return self._cache[model_id]

        resolved_path, entry = _resolve_and_verify_artifact(model_id, artifact_path, self.framework_name)
        session = ort.InferenceSession(str(resolved_path), providers=["CPUExecutionProvider"])

        artifact = ModelArtifact(
            model_id=model_id,
            model_type=entry.get("model_type", "Chargeback Prediction"),
            framework=self.framework_name,
            version=entry.get("version", "v1.0.0"),
            artifact_instance=session,
            metadata={"path": str(resolved_path), "manifest": entry},
        )
        self._cache[model_id] = artifact
        return artifact

    def predict(self, artifact: ModelArtifact, features: Dict[str, Any]) -> Dict[str, Any]:
        start = time.perf_counter()
        X = _align_features(features, FEATURE_NAMES)
        session = artifact.artifact_instance

        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: X})

        # Parse ONNX output (handles Scikit-Learn zipmap probabilities or tensor)
        if len(outputs) > 1 and isinstance(outputs[1], list) and isinstance(outputs[1][0], dict):
            # Dict mapping class label -> probability
            prob_dict = outputs[1][0]
            raw_prob = float(prob_dict.get(1, prob_dict.get("1", 0.05)))
        elif len(outputs) > 1 and isinstance(outputs[1], np.ndarray):
            raw_prob = float(outputs[1][0, 1] if outputs[1].shape[1] > 1 else outputs[1][0, 0])
        else:
            raw_val = outputs[0]
            raw_prob = float(raw_val[0]) if hasattr(raw_val, "__getitem__") else float(raw_val)

        confidence = round(min(0.9999, max(0.0001, raw_prob)), 4)
        if confidence > 0.65:
            result = "BLOCK"
        elif confidence > 0.35:
            result = "FLAG"
        else:
            result = "ALLOW"

        elapsed_ms = round((time.perf_counter() - start) * 1000.0, 3)

        return {
            "prediction_result": result,
            "confidence_score": confidence,
            "raw_probability": raw_prob,
            "inference_time_ms": elapsed_ms,
            "features_evaluated": len(FEATURE_NAMES),
            "model_version": artifact.version,
            "framework": self.framework_name,
        }


class JoblibLoader(IModelLoader):
    def __init__(self):
        self._cache: Dict[str, ModelArtifact] = {}

    @property
    def framework_name(self) -> str:
        return "Joblib"

    def load_model(self, model_id: str, artifact_path: str) -> ModelArtifact:
        if model_id in self._cache:
            return self._cache[model_id]

        resolved_path, entry = _resolve_and_verify_artifact(model_id, artifact_path, self.framework_name)
        loaded_instance = joblib.load(str(resolved_path))

        artifact = ModelArtifact(
            model_id=model_id,
            model_type=entry.get("model_type", "Merchant Risk"),
            framework=self.framework_name,
            version=entry.get("version", "v1.0.0"),
            artifact_instance=loaded_instance,
            metadata={"path": str(resolved_path), "manifest": entry},
        )
        self._cache[model_id] = artifact
        return artifact

    def predict(self, artifact: ModelArtifact, features: Dict[str, Any]) -> Dict[str, Any]:
        start = time.perf_counter()
        X = _align_features(features, FEATURE_NAMES)
        model = artifact.artifact_instance

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)
            raw_prob = float(probs[0][1] if probs.shape[1] > 1 else probs[0][0])
        elif hasattr(model, "decision_function"):
            df = float(model.decision_function(X)[0])
            raw_prob = 1.0 / (1.0 + np.exp(-df))
        else:
            pred = model.predict(X)
            raw_prob = 1.0 if float(pred[0]) > 0 else 0.0

        confidence = round(min(0.9999, max(0.0001, raw_prob)), 4)
        result = "FLAG" if confidence > 0.50 else "ALLOW"
        elapsed_ms = round((time.perf_counter() - start) * 1000.0, 3)

        return {
            "prediction_result": result,
            "confidence_score": confidence,
            "raw_probability": raw_prob,
            "inference_time_ms": elapsed_ms,
            "features_evaluated": len(FEATURE_NAMES),
            "model_version": artifact.version,
            "framework": self.framework_name,
        }


class PyTorchLoader(IModelLoader):
    @property
    def framework_name(self) -> str:
        return "PyTorch"

    def load_model(self, model_id: str, artifact_path: str) -> ModelArtifact:
        # Fallback to Joblib isolation/anomaly model if PyTorch JIT is not registered
        import joblib

        resolved_path, entry = _resolve_and_verify_artifact(model_id, artifact_path, self.framework_name)
        loaded_instance = joblib.load(str(resolved_path))

        return ModelArtifact(
            model_id=model_id,
            model_type=entry.get("model_type", "Behaviour Analysis"),
            framework=self.framework_name,
            version=entry.get("version", "v1.0.0"),
            artifact_instance=loaded_instance,
            metadata={"path": str(resolved_path), "manifest": entry},
        )

    def predict(self, artifact: ModelArtifact, features: Dict[str, Any]) -> Dict[str, Any]:
        start = time.perf_counter()
        X = _align_features(features, FEATURE_NAMES)
        model = artifact.artifact_instance

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)
            raw_prob = float(probs[0][1] if probs.shape[1] > 1 else probs[0][0])
        elif hasattr(model, "decision_function"):
            df = float(model.decision_function(X)[0])
            raw_prob = float(1.0 / (1.0 + np.exp(-df)))
        else:
            raw_prob = 0.15

        confidence = round(min(0.9999, max(0.0001, raw_prob)), 4)
        result = "FLAG" if confidence > 0.50 else "ALLOW"
        elapsed_ms = round((time.perf_counter() - start) * 1000.0, 3)

        return {
            "prediction_result": result,
            "confidence_score": confidence,
            "raw_probability": raw_prob,
            "inference_time_ms": elapsed_ms,
            "features_evaluated": len(FEATURE_NAMES),
            "model_version": artifact.version,
            "framework": self.framework_name,
        }
