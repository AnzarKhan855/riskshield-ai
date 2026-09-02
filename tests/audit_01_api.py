import os
import sys
import json
import time
import urllib.request
import urllib.error
from typing import Dict, Any, List

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {
    "summary": {"total": 0, "passed": 0, "failed": 0, "warnings": 0},
    "endpoints": [],
    "latencies": [],
    "errors": []
}

def make_request(method: str, path: str, payload: dict = None, token: str = None) -> Dict[str, Any]:
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            latency = (time.perf_counter() - t0) * 1000
            body = resp.read().decode("utf-8")
            res_json = json.loads(body) if body else {}
            return {
                "status": resp.status,
                "headers": dict(resp.headers),
                "data": res_json,
                "latency_ms": round(latency, 2),
                "error": None
            }
    except urllib.error.HTTPError as e:
        latency = (time.perf_counter() - t0) * 1000
        body = e.read().decode("utf-8")
        try:
            res_json = json.loads(body)
        except Exception:
            res_json = {"raw": body}
        return {
            "status": e.code,
            "headers": dict(e.headers),
            "data": res_json,
            "latency_ms": round(latency, 2),
            "error": f"HTTP {e.code}"
        }
    except Exception as exc:
        latency = (time.perf_counter() - t0) * 1000
        return {
            "status": 0,
            "headers": {},
            "data": {},
            "latency_ms": round(latency, 2),
            "error": str(exc)
        }

def log_test(endpoint_name: str, method: str, path: str, expected_status: List[int], res: Dict[str, Any]):
    results["summary"]["total"] += 1
    results["latencies"].append(res["latency_ms"])
    
    is_pass = res["status"] in expected_status
    if is_pass:
        results["summary"]["passed"] += 1
        status_label = "PASS"
    else:
        results["summary"]["failed"] += 1
        status_label = "FAIL"
        results["errors"].append({
            "test": endpoint_name,
            "method": method,
            "path": path,
            "expected": expected_status,
            "actual_status": res["status"],
            "response": res["data"]
        })
    
    record = {
        "name": endpoint_name,
        "method": method,
        "path": path,
        "status": res["status"],
        "expected": expected_status,
        "result": status_label,
        "latency_ms": res["latency_ms"],
        "has_correlation_id": "X-Correlation-ID" in res["headers"] or "x-correlation-id" in res["headers"],
    }
    results["endpoints"].append(record)
    print(f"[{status_label}] {method} {path} -> Status {res['status']} ({res['latency_ms']}ms)")

def extract_data(r):
    d = r.get("data", {}).get("data", {})
    if isinstance(d, dict) and "items" in d:
        return d["items"]
    if isinstance(d, list):
        return d
    return []

def run_suite():
    print("="*80)
    print("        RISKSHIELD AI — EXHAUSTIVE API ENDPOINT ACCEPTANCE TEST SUITE           ")
    print("="*80)
    
    # 1. Health Endpoints
    r = make_request("GET", "/health")
    log_test("Health Check", "GET", "/health", [200], r)
    
    r = make_request("GET", "/health/detailed")
    log_test("Detailed Telemetry Probe", "GET", "/health/detailed", [200], r)
    
    # 2. Authentication Flow
    r = make_request("POST", "/auth/login", {
        "email": "admin@riskshield.ai",
        "password": "Password123!"
    })
    log_test("Admin Login (Valid)", "POST", "/auth/login", [200], r)
    
    login_data = r.get("data", {}).get("data", {})
    admin_token = login_data.get("access_token")
    refresh_token = login_data.get("refresh_token")
    
    # Invalid Login Attempt
    r = make_request("POST", "/auth/login", {
        "email": "admin@riskshield.ai",
        "password": "WrongPassword999!"
    })
    log_test("Admin Login (Invalid Credentials)", "POST", "/auth/login", [401], r)
    
    # Current User Me
    r = make_request("GET", "/auth/me", token=admin_token)
    log_test("Current User Profile (/auth/me)", "GET", "/auth/me", [200], r)
    
    # Token Refresh
    if refresh_token:
        r = make_request("POST", "/auth/refresh", {"refresh_token": refresh_token})
        log_test("Refresh JWT Token", "POST", "/auth/refresh", [200], r)
    
    # Signup New Analyst
    test_user_email = f"analyst_qa_{int(time.time())}@riskshield.ai"
    r = make_request("POST", "/auth/signup", {
        "first_name": "QA",
        "last_name": "Analyst",
        "email": test_user_email,
        "password": "Password123!",
        "role": "ANALYST"
    })
    log_test("User Registration (/auth/signup)", "POST", "/auth/signup", [200, 201], r)
    
    # 5. Merchants Platform
    r = make_request("GET", "/merchants", token=admin_token)
    log_test("List Merchants", "GET", "/merchants", [200], r)
    merchants = extract_data(r)
    sample_merch_id = merchants[0]["merchant_code"] if merchants else "MERCH-GLOBAL-01"
    sample_merch_uuid = merchants[0]["id"] if merchants else "a0000000-0000-0000-0000-000000000001"
    
    r = make_request("GET", f"/merchants/{sample_merch_id}", token=admin_token)
    log_test("Get Merchant Detail", "GET", f"/merchants/{sample_merch_id}", [200], r)
    
    # 6. Customers Platform
    r = make_request("GET", "/customers", token=admin_token)
    log_test("List Customers", "GET", "/customers", [200], r)
    customers = extract_data(r)
    sample_cust_id = customers[0]["customer_id"] if customers else "CUST-883901"
    
    r = make_request("GET", f"/customers/{sample_cust_id}", token=admin_token)
    log_test("Get Customer Detail", "GET", f"/customers/{sample_cust_id}", [200], r)
    
    # 7. Devices Platform
    r = make_request("GET", "/devices", token=admin_token)
    log_test("List Devices", "GET", "/devices", [200], r)
    devices = extract_data(r)
    sample_dev_id = devices[0]["device_fingerprint"] if devices else "DEV-FP-IPHONE-15-SECURE"
    
    r = make_request("GET", f"/devices/{sample_dev_id}", token=admin_token)
    log_test("Get Device Detail", "GET", f"/devices/{sample_dev_id}", [200], r)

    # 3. Transactions API
    r = make_request("GET", "/transactions", token=admin_token)
    log_test("List Transactions", "GET", "/transactions", [200], r)
    txns = extract_data(r)
    sample_txn_id = txns[0]["transaction_id"] if txns else "TXN-ML-PRED-991"
    
    # Create Transaction
    test_txn_payload = {
        "merchant_id": sample_merch_uuid,
        "customer_id": sample_cust_id,
        "amount": 1450.50,
        "fee": 10.0,
        "tax": 5.0,
        "currency": "USD",
        "payment_method": "Credit Card",
        "transaction_type": "Payment",
        "status": "Pending",
        "country": "United States"
    }
    r = make_request("POST", "/transactions", test_txn_payload, token=admin_token)
    log_test("Create Transaction", "POST", "/transactions", [200, 201], r)
    if r.get("data", {}).get("data", {}).get("transaction_id"):
        sample_txn_id = r["data"]["data"]["transaction_id"]
    
    # Get Specific Transaction
    r = make_request("GET", f"/transactions/{sample_txn_id}", token=admin_token)
    log_test("Get Transaction Details", "GET", f"/transactions/{sample_txn_id}", [200], r)
    
    # 4. Ingestion Platform
    r = make_request("GET", "/ingestion/status", token=admin_token)
    log_test("Ingestion Pipeline Status", "GET", "/ingestion/status", [200], r)
    
    r = make_request("POST", "/ingestion/stream", {
        "events": [
            {
                "event_type": "transaction_created",
                "transaction_id": f"TXN-STRM-{int(time.time())}",
                "amount": 500.0,
                "currency": "USD",
                "merchant_id": sample_merch_uuid,
                "user_id": "USR-101"
            }
        ]
    }, token=admin_token)
    log_test("Streaming Ingestion Push", "POST", "/ingestion/stream", [200, 202], r)
    
    # 8. Model Registry & Inference
    r = make_request("GET", "/models", token=admin_token)
    log_test("List Model Registry Models", "GET", "/models", [200], r)
    models = extract_data(r)
    sample_model_id = models[0]["model_id"] if models else "MDL-XGB-FRAUD-V3"
    sample_model_uuid = models[0]["id"] if models else None
    
    r = make_request("GET", f"/models/{sample_model_id}", token=admin_token)
    log_test("Get Model Detail", "GET", f"/models/{sample_model_id}", [200], r)
    
    # 9. Predictions
    r = make_request("GET", "/predictions", token=admin_token)
    log_test("List Predictions", "GET", "/predictions", [200], r)
    
    # Live ML Prediction
    if sample_model_uuid:
        r = make_request("POST", "/predictions", {
            "transaction_id": sample_txn_id,
            "model_id": sample_model_uuid,
            "features": {"amount": 2500.0, "velocity_1h": 3.0}
        }, token=admin_token)
        log_test("Generate ML Model Prediction", "POST", "/predictions", [200, 201], r)
    
    # 10. AI Orchestrator Pipelines
    r = make_request("GET", "/orchestrator/pipelines", token=admin_token)
    log_test("List Orchestrator Pipelines", "GET", "/orchestrator/pipelines", [200], r)
    
    r = make_request("GET", "/orchestrator/history", token=admin_token)
    log_test("List Orchestrator History", "GET", "/orchestrator/history", [200], r)
    
    r = make_request("POST", "/orchestrator/predict", {
        "transaction_id": sample_txn_id
    }, token=admin_token)
    log_test("Execute Multi-Model AI Orchestrator Pipeline", "POST", "/orchestrator/predict", [200, 201], r)
    
    # 11. Decision Intelligence Engine
    r = make_request("GET", "/decisions", token=admin_token)
    log_test("List Decisions", "GET", "/decisions", [200], r)
    decisions = r.get("data", {}).get("items", [])
    sample_dec_id = decisions[0]["decision_id"] if decisions else None
    
    # Evaluate Live Decision
    r = make_request("POST", "/decisions/evaluate", {
        "transaction_id": sample_txn_id
    }, token=admin_token)
    log_test("Evaluate Decision Platform", "POST", "/decisions/evaluate", [200, 201], r)
    if r.get("data", {}).get("decision_id"):
        sample_dec_id = r["data"]["decision_id"]
    
    if sample_dec_id:
        r = make_request("GET", f"/decisions/{sample_dec_id}", token=admin_token)
        log_test("Get Decision Details", "GET", f"/decisions/{sample_dec_id}", [200], r)
        
        # Decision Override
        r = make_request("POST", f"/decisions/{sample_dec_id}/override", {
            "decision": "APPROVE",
            "justification": "Verified user identity via two-factor phone auth in QA audit."
        }, token=admin_token)
        log_test("Decision Manual Override", "POST", f"/decisions/{sample_dec_id}/override", [200], r)
    
    # 12. Rule Studio
    r = make_request("GET", "/rules", token=admin_token)
    log_test("List Active Rule Set", "GET", "/rules", [200], r)
    rules = r.get("data", {}).get("items", [])
    sample_rule_id = rules[0]["rule_id"] if rules else "RULE-001"
    
    # Rule Simulation
    r = make_request("POST", "/rules/simulate", {
        "expression": "amount > 5000 and customer_risk_score > 0.7",
        "transaction_data": {"amount": 7500, "customer_risk_score": 0.85}
    }, token=admin_token)
    log_test("Simulate Custom Risk Rule Expression", "POST", "/rules/simulate", [200], r)
    
    # Rule Validation
    r = make_request("POST", "/rules/validate", {
        "expression": "amount > 1000 and is_foreign_transaction == true"
    }, token=admin_token)
    log_test("Validate Rule Expression AST Syntax", "POST", "/rules/validate", [200], r)
    
    # 13. Case Management Platform
    r = make_request("GET", "/cases", token=admin_token)
    log_test("List Investigation Cases", "GET", "/cases", [200], r)
    cases = r.get("data", {}).get("items", [])
    sample_case_id = cases[0]["case_id"] if cases else None
    
    # Create Case
    test_case_payload = {
        "transaction_id": sample_txn_id,
        "case_title": "QA Acceptance High-Risk Investigation",
        "case_description": "Triggered by automated production acceptance audit suite.",
        "priority": "HIGH",
        "category": "Fraud"
    }
    r = make_request("POST", "/cases", test_case_payload, token=admin_token)
    log_test("Create Investigation Case", "POST", "/cases", [200, 201], r)
    if r.get("data", {}).get("case_id"):
        sample_case_id = r["data"]["case_id"]
    
    if sample_case_id:
        r = make_request("GET", f"/cases/{sample_case_id}", token=admin_token)
        log_test("Get Case Detail", "GET", f"/cases/{sample_case_id}", [200], r)
        
        # Add Case Comment
        r = make_request("POST", f"/cases/{sample_case_id}/comments", {
            "comment": "Analyst QA verified proof of address and confirmed velocity alert."
        }, token=admin_token)
        log_test("Add Case Analyst Comment", "POST", f"/cases/{sample_case_id}/comments", [200, 201], r)
        
        # Case Timeline
        r = make_request("GET", f"/cases/{sample_case_id}/timeline", token=admin_token)
        log_test("Get Case Timeline History", "GET", f"/cases/{sample_case_id}/timeline", [200], r)
    
    # 14. Graph Intelligence Engine
    r = make_request("GET", "/graph/nodes", token=admin_token)
    log_test("Get Graph Nodes Entity Matrix", "GET", "/graph/nodes", [200], r)
    
    r = make_request("GET", "/graph/relationships", token=admin_token)
    log_test("Get Graph Relationship Edges", "GET", "/graph/relationships", [200], r)
    
    # 15. Explainability Platform
    r = make_request("GET", "/explanations", token=admin_token)
    log_test("List Decision Explainability Catalog", "GET", "/explanations", [200], r)
    
    if sample_dec_id:
        r = make_request("GET", f"/explanations/{sample_dec_id}", token=admin_token)
        log_test("Get Specific Decision SHAP Explanation", "GET", f"/explanations/{sample_dec_id}", [200, 404], r)
    
    # 16. Feature Store
    r = make_request("GET", "/features", token=admin_token)
    log_test("List Feature Store Definitions", "GET", "/features", [200], r)
    
    r = make_request("GET", f"/features/{sample_txn_id}", token=admin_token)
    log_test("Get Real-Time Feature Vector by Transaction", "GET", f"/features/{sample_txn_id}", [200], r)
    
    # 17. Notifications
    r = make_request("GET", "/notifications", token=admin_token)
    log_test("List Notifications", "GET", "/notifications", [200], r)
    
    r = make_request("POST", "/notifications/read-all", {}, token=admin_token)
    log_test("Mark All Notifications as Read", "POST", "/notifications/read-all", [200], r)
    
    # 18. AI Copilot & Forensics
    r = make_request("POST", "/ai/chat", {
        "message": "Summarize the fraud indicators for recent high-risk transactions.",
        "context": {"analyst_role": "ADMIN"}
    }, token=admin_token)
    log_test("AI Copilot Interactive Inquiry", "POST", "/ai/chat", [200], r)
    
    if sample_case_id:
        r = make_request("GET", f"/ai/case-summary/{sample_case_id}", token=admin_token)
        log_test("AI Case Investigation Summary Synthesis", "GET", f"/ai/case-summary/{sample_case_id}", [200], r)
    
    # Output results
    os.makedirs("scratch", exist_ok=True)
    with open("scratch/api_exhaustive_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n================================================================================")
    print(f"API SUITE SUMMARY: Total: {results['summary']['total']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    if results['latencies']:
        p50 = sorted(results['latencies'])[len(results['latencies'])//2]
        p95 = sorted(results['latencies'])[int(len(results['latencies'])*0.95)]
        p99 = sorted(results['latencies'])[int(len(results['latencies'])*0.99)]
        print(f"API Latency Profile: p50={p50}ms | p95={p95}ms | p99={p99}ms")
    print("================================================================================")

if __name__ == "__main__":
    run_suite()
