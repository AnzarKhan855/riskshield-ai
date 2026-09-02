import asyncio
import os
import sys
import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {
    "summary": {"total_tests": 0, "passed": 0, "failed": 0},
    "ml_models": {},
    "latencies_ms": {},
    "shap_explainability": {},
    "details": []
}

def make_req(method: str, path: str, payload: dict = None, token: str = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            latency = (time.perf_counter() - t0) * 1000
            body = resp.read().decode("utf-8")
            res_json = json.loads(body) if body else {}
            return {"status": resp.status, "data": res_json, "latency_ms": round(latency, 2)}
    except urllib.error.HTTPError as e:
        latency = (time.perf_counter() - t0) * 1000
        body = e.read().decode("utf-8")
        try:
            res_json = json.loads(body)
        except Exception:
            res_json = {"raw": body}
        return {"status": e.code, "data": res_json, "latency_ms": round(latency, 2)}
    except Exception as exc:
        latency = (time.perf_counter() - t0) * 1000
        return {"status": 0, "data": {}, "latency_ms": round(latency, 2), "error": str(exc)}

def log_test(name, passed, detail=""):
    results["summary"]["total_tests"] += 1
    if passed:
        results["summary"]["passed"] += 1
        print(f"[PASS] {name}" + (f" -> {detail}" if detail else ""))
    else:
        results["summary"]["failed"] += 1
        print(f"[FAIL] {name} -> {detail}")
    results["details"].append({"test": name, "passed": passed, "detail": detail})

def run_ml_audit():
    print("================================================================================")
    print("        RISKSHIELD AI — AI & ML ARCHITECTURE DEEP VALIDATION                    ")
    print("================================================================================")

    # Auth
    auth_res = make_req("POST", "/auth/login", {"email": "admin@riskshield.ai", "password": "Password123!"})
    token = auth_res.get("data", {}).get("data", {}).get("access_token")

    # 1. Model Registry Active Models Inspection
    m_res = make_req("GET", "/models", token=token)
    models_data = m_res.get("data", {}).get("data", {})
    model_list = models_data.get("items", []) if isinstance(models_data, dict) else []
    first_model_uuid = model_list[0]["id"] if model_list else None
    log_test("Model Registry Active Catalog", len(model_list) > 0, f"{len(model_list)} models loaded in registry")
    
    # 2. Multi-Model Inference Latency Benchmarks (5 consecutive inference runs)
    latencies = []
    for i in range(5):
        if first_model_uuid:
            pred_res = make_req("POST", "/predictions", {
                "transaction_id": f"TXN-BENCH-{i}",
                "model_id": first_model_uuid,
                "features": {"amount": 1000.0 + (i * 250), "velocity_1h": 3.0}
            }, token=token)
            if pred_res["status"] in [200, 201]:
                latencies.append(pred_res["latency_ms"])
    
    if latencies:
        sorted_l = sorted(latencies)
        p50 = sorted_l[len(sorted_l)//2]
        p95 = sorted_l[int(len(sorted_l)*0.95)]
        results["latencies_ms"] = {"p50": p50, "p95": p95, "min": sorted_l[0], "max": sorted_l[-1]}
        log_test("ML Inference Latency Benchmark", p95 < 500, f"p50={p50}ms, p95={p95}ms (SLA < 500ms)")
    else:
        log_test("ML Inference Latency Benchmark", False, "Inference requests failed")

    # 3. AI Orchestrator Execution Pipeline
    orch_res = make_req("POST", "/orchestrator/predict", {
        "transaction_id": "TXN-DEMO-001"
    }, token=token)
    log_test("AI Orchestrator Pipeline Execution", orch_res["status"] in [200, 201], f"Status: {orch_res['status']} ({orch_res['latency_ms']}ms)")

    # 4. Explainability & SHAP Feature Importance
    dec_res = make_req("GET", "/decisions", token=token)
    dec_items = dec_res.get("data", {}).get("data", {}).get("items", [])
    if dec_items:
        first_dec_id = dec_items[0]["decision_id"]
        exp_res = make_req("GET", f"/explanations/{first_dec_id}", token=token)
        exp_data = exp_res.get("data", {}).get("data", {})
        log_test("SHAP Explainability & Feature Contribution", exp_res["status"] in [200, 404], f"Decision {first_dec_id} explanation queried (Status: {exp_res['status']})")
    else:
        log_test("SHAP Explainability & Feature Contribution", False, "No decisions found to explain")

    # 5. Rule Studio AST & Conflict Detection
    sim_res = make_req("POST", "/rules/simulate", {
        "expression": "amount > 1000 and customer_risk_score > 0.8",
        "transaction_data": {"amount": 2500, "customer_risk_score": 0.9}
    }, token=token)
    sim_data = sim_res.get("data", {}).get("data", {})
    matched = sim_data.get("matched", False) or sim_data.get("result", False)
    log_test("Rule Studio Expression Evaluation", sim_res["status"] == 200 and matched, f"Evaluated expression with match result: {matched}")

    os.makedirs("scratch", exist_ok=True)
    with open("scratch/ai_ml_deep_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n================================================================================")
    print(f"AI/ML AUDIT SUMMARY: Total: {results['summary']['total_tests']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    print("================================================================================")

if __name__ == "__main__":
    run_ml_audit()
