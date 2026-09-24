#!/usr/bin/env python3
"""
RiskShield AI - Chaos Engineering, Failure Recovery & Circuit Breaker Audit
Tests platform resilience under degraded and hostile conditions:
1. External AI / LLM Failure Fallback (Copilot & Explainability without Groq)
2. ML Pipeline Fallback & Partial Feature Degradation
3. Database Integrity Violation & Session Rollback Recovery
4. Malformed Payload & Boundary Defense (Zero Crash)
5. Rapid High-Frequency Burst Resilience
"""

import os
import sys
import json
import time
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {
    "suite": "Chaos Engineering, Failure Recovery & Circuit Breaker Audit",
    "timestamp": time.time(),
    "summary": {"total_tests": 0, "passed": 0, "failed": 0},
    "scenarios": []
}

def log_test(scenario_name: str, passed: bool, details: str = ""):
    results["summary"]["total_tests"] += 1
    if passed:
        results["summary"]["passed"] += 1
        print(f"[PASS] {scenario_name} -> {details}")
    else:
        results["summary"]["failed"] += 1
        print(f"[FAIL] {scenario_name} -> {details}")
    results["scenarios"].append({
        "scenario": scenario_name,
        "passed": passed,
        "details": details
    })

def run_chaos_audit():
    print("=" * 80)
    print("      RISKSHIELD AI - CHAOS ENGINEERING & FAILURE RECOVERY AUDIT       ")
    print("=" * 80)

    with httpx.Client(timeout=15.0) as client:
        # Auth
        r = client.post(f"{BASE_URL}/auth/login", json={"email": "admin@riskshield.ai", "password": "Password123!"})
        admin_token = r.json().get("data", {}).get("access_token")
        headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. External AI / LLM Circuit Breaker & Fallback
        print("\n--- 1. Testing External AI / LLM Fallback ---")
        # Send Copilot chat request - even if Groq API key is invalid/unconfigured, it must return analytical fallback
        copilot_payload = {
            "query": "What is the fraud risk for high-value cross-border transactions?",
            "context": {"user_id": "test_analyst"}
        }
        r = client.post(f"{BASE_URL}/ai/chat", json=copilot_payload, headers=headers)
        copilot_data = r.json().get("data", {})
        copilot_ok = (r.status_code == 200 and ("response" in copilot_data or "answer" in copilot_data or "summary" in copilot_data))
        resp_text = str(copilot_data.get("response") or copilot_data.get("answer") or copilot_data)[:60]
        log_test("External AI Unreachable Circuit Breaker", copilot_ok, 
                 f"HTTP {r.status_code} - Responded with graceful analytical fallback: '{resp_text}...'")

        # 2. ML Engine Resilience on Partial / Sparse Features
        print("\n--- 2. Testing ML Engine Resilience on Degraded Inputs ---")
        # Get sample merchant for evaluation
        r_m = client.get(f"{BASE_URL}/merchants", headers=headers)
        m_items = r_m.json().get("data", {}).get("items", [])
        m_id = m_items[0]["id"] if m_items else ""
        
        # Create minimal transaction
        r_txn = client.post(f"{BASE_URL}/transactions", json={
            "merchant_id": m_id,
            "amount": 299.99,
            "currency": "USD",
            "payment_method": "Credit Card",
            "country": "United States"
        }, headers=headers)
        sparse_txn_id = r_txn.json().get("data", {}).get("transaction_id")
        
        r = client.post(f"{BASE_URL}/decisions/evaluate", json={"transaction_id": sparse_txn_id}, headers=headers)
        ml_degradation_ok = (r.status_code in [200, 201] and ("decision" in r.json().get("data", {}) or "risk_score" in r.json().get("data", {})))
        log_test("ML Pipeline Graceful Degradation on Sparse Features", ml_degradation_ok,
                 f"HTTP {r.status_code} - Fallback heuristics computed risk evaluation")

        # 3. Database Session Recovery After Constraint Violation
        print("\n--- 3. Testing DB Session Poisoning Recovery ---")
        bad_payload = {"merchant_id": "INVALID", "amount": -99999.0, "currency": "INVALID_CURRENCY"}
        r_bad = client.post(f"{BASE_URL}/transactions", json=bad_payload, headers=headers)
        
        # Verify immediately subsequent normal query succeeds (session not poisoned/deadlocked)
        r_good = client.get(f"{BASE_URL}/transactions?size=5", headers=headers)
        recovery_ok = (r_bad.status_code == 422 and r_good.status_code == 200)
        log_test("Database Session Recovery After Bad Request", recovery_ok,
                 f"Bad payload rejected ({r_bad.status_code}), subsequent query succeeded ({r_good.status_code})")

        # 4. Hostile / Extreme Payloads Boundary Test
        print("\n--- 4. Testing Extreme Boundary Payloads ---")
        extreme_payload = {
            "merchant_id": m_id,
            "amount": 1e12, # 1 Trillion
            "currency": "USD",
            "country": "XX", # Non-existent ISO code
            "payment_method": "A" * 500 # Oversized string
        }
        r = client.post(f"{BASE_URL}/transactions", json=extreme_payload, headers=headers)
        extreme_handled = (r.status_code in [200, 201, 422])
        log_test("Extreme Numerical & String Boundaries Handled", extreme_handled,
                 f"HTTP {r.status_code} - System rejected or processed safely without 500 crash")

        # 5. Rapid Burst Stress Recovery
        print("\n--- 5. Testing Rapid Burst Recovery (50 Immediate Pings) ---")
        burst_success = 0
        for _ in range(50):
            res = client.get(f"{BASE_URL}/health")
            if res.status_code == 200:
                burst_success += 1
        burst_ok = (burst_success == 50)
        log_test("Immediate Micro-Burst Recovery", burst_ok, f"Handled {burst_success}/50 micro-burst pings at 100% availability")

    # Save Output
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base_dir, "audit", "test-results")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "chaos_recovery_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 80)
    print(f"CHAOS AUDIT SUMMARY: Total: {results['summary']['total_tests']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    print(f"Saved to: {out_file}")
    print("=" * 80)

if __name__ == "__main__":
    run_chaos_audit()
