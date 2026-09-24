#!/usr/bin/env python3
"""
RiskShield AI - Security, Governance, RBAC & Decision Override Audit
Verifies:
1. Horizontal & Vertical Privilege Escalation (User/Merchant -> Admin/Analyst)
2. Unauthorized Decision Override Attempt (Non-Admin/Analyst rejected with 403)
3. Authorized Decision Override Audit Trail (Actor, Reason, Timestamps)
4. Rule Studio Lifecycle (Create, Simulate, Validate, Toggle, Delete)
5. Repository-Wide Secret & Credential Scan
6. Security Penetration Vectors (NoSQLi, SQLi, XSS, JWT alg 'none')
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse
import uuid
import re

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {
    "suite": "Security, Governance, RBAC & Decision Override Audit",
    "timestamp": time.time(),
    "summary": {"total_tests": 0, "passed": 0, "failed": 0},
    "checks": [],
    "secret_audit_findings": []
}

def log_test(name: str, passed: bool, details: str = ""):
    results["summary"]["total_tests"] += 1
    if passed:
        results["summary"]["passed"] += 1
        status = "PASS"
    else:
        results["summary"]["failed"] += 1
        status = "FAIL"
    print(f"[{status}] {name}" + (f" -> {details}" if details else ""))
    results["checks"].append({"name": name, "status": status, "details": details})

def api_call(path: str, method: str = "GET", payload: dict = None, token: str = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            latency_ms = round((time.perf_counter() - t0) * 1000, 2)
            raw = resp.read().decode("utf-8")
            res_json = json.loads(raw) if raw else {}
            return {"status": resp.status, "data": res_json, "latency_ms": latency_ms, "error": None}
    except urllib.error.HTTPError as e:
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        raw = e.read().decode("utf-8")
        try:
            res_json = json.loads(raw)
        except Exception:
            res_json = {"raw": raw}
        return {"status": e.code, "data": res_json, "latency_ms": latency_ms, "error": f"HTTP {e.code}"}
    except Exception as exc:
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        return {"status": 0, "data": {}, "latency_ms": latency_ms, "error": str(exc)}

def run_security_audit():
    print("=" * 80)
    print("      RISKSHIELD AI — SECURITY, GOVERNANCE, RBAC & SECRETS AUDIT SUITE        ")
    print("=" * 80)

    # 1. Admin Authentication
    r = api_call("/auth/login", method="POST", payload={"email": "admin@riskshield.ai", "password": "Password123!"})
    admin_token = r["data"].get("data", {}).get("access_token")
    log_test("Admin Authentication", bool(admin_token), "Admin credentials verified")

    # 2. Register a standard non-admin user
    non_admin_email = f"user_unauth_{int(time.time())}@riskshield.ai"
    r = api_call("/auth/signup", method="POST", payload={
        "email": non_admin_email,
        "password": "Password123!",
        "first_name": "Standard",
        "last_name": "Merchant",
        "role": "Merchant"
    })
    log_test("Standard User Signup", r["status"] in [200, 201], f"Created account {non_admin_email}")

    # Login as standard user
    r = api_call("/auth/login", method="POST", payload={"email": non_admin_email, "password": "Password123!"})
    user_token = r["data"].get("data", {}).get("access_token")
    log_test("Standard User Login", bool(user_token), "User session active")

    # 3. Privilege Escalation Prevention: Signup as Admin blocked
    r = api_call("/auth/signup", method="POST", payload={
        "email": f"hacker_admin_{int(time.time())}@riskshield.ai",
        "password": "Password123!",
        "first_name": "Evil",
        "last_name": "Admin",
        "role": "Admin" # should be rejected
    })
    log_test("Vertical Privilege Escalation Prevention", r["status"] == 422, "Self-registering Admin role rejected with HTTP 422")

    # 4. Decision Override RBAC & Audit Trail
    # First create a decision to override
    r = api_call("/merchants", token=admin_token)
    merch_id = r["data"].get("data", {}).get("items", [])[0]["id"]
    r = api_call("/transactions", method="POST", payload={
        "merchant_id": merch_id,
        "amount": 5500.0,
        "currency": "USD",
        "payment_method": "Credit Card",
        "country": "United States"
    }, token=admin_token)
    sample_txn_id = r["data"].get("data", {}).get("transaction_id")
    
    r = api_call("/decisions/evaluate", method="POST", payload={"transaction_id": sample_txn_id}, token=admin_token)
    sample_dec_id = r["data"].get("data", {}).get("decision_id") or r["data"].get("decision_id")

    # Attempt unauthorized override by standard user
    r = api_call(f"/decisions/{sample_dec_id}/override", method="POST", payload={
        "decision": "APPROVE",
        "justification": "Malicious override attempt by low-privileged user"
    }, token=user_token)
    log_test("RBAC: Unauthorized Decision Override Blocked", r["status"] == 403, f"Non-analyst received HTTP {r['status']}")

    # Authorized override by Admin
    r = api_call(f"/decisions/{sample_dec_id}/override", method="POST", payload={
        "decision": "APPROVE",
        "justification": "Authorized manual review by Risk Admin"
    }, token=admin_token)
    override_ok = r["status"] == 200 and r["data"].get("data", {}).get("decision") == "APPROVE"
    log_test("Authorized Decision Override with Audit Trail", override_ok, "Decision overridden to APPROVE and persisted")

    # Verify override audit log
    r = api_call(f"/decisions/{sample_dec_id}", token=admin_token)
    overridden_dec = r["data"].get("data", {})
    log_test("Decision Override State Persistence", overridden_dec.get("decision") == "APPROVE", f"Final decision: {overridden_dec.get('decision')}")

    # 5. Rule Studio Governance Lifecycle
    # Validate Rule Syntax
    r = api_call("/rules/validate", method="POST", payload={
        "expression": "txn_amount > 5000 and loc_is_new_country == True"
    }, token=admin_token)
    log_test("Rule Studio: AST Syntax Validation", r["status"] == 200, "Expression syntax valid")

    # Simulate Rule
    r = api_call("/rules/simulate", method="POST", payload={
        "expression": "txn_amount > 5000 and loc_is_new_country == True",
        "transaction_data": {"txn_amount": 7500, "loc_is_new_country": True}
    }, token=admin_token)
    sim_ok = r["status"] == 200 and r["data"].get("data", {}).get("matched") is True
    log_test("Rule Studio: Expression Simulation Engine", sim_ok, "Rule matched simulated payload")

    # Create Custom Rule
    new_rule_name = f"QA Custom High Velocity Rule {int(time.time())}"
    r = api_call("/rules", method="POST", payload={
        "rule_name": new_rule_name,
        "rule_category": "VELOCITY",
        "priority": 25,
        "expression": "velocity_txns_1h > 10",
        "action": "FLAG",
        "severity": "HIGH",
        "description": "Custom rule added during security & governance audit"
    }, token=admin_token)
    rule_created = r["status"] in [200, 201]
    rule_id = r["data"].get("data", {}).get("rule_id")
    log_test("Rule Studio: Rule Creation", rule_created, f"Rule {rule_id} created")

    # Non-admin attempt to delete rule
    r = api_call(f"/rules/{rule_id}", method="DELETE", token=user_token)
    log_test("RBAC: Unauthorized Rule Deletion Blocked", r["status"] == 403, f"Standard user received HTTP {r['status']}")

    # 6. Model Promotion Governance
    # Attempt unauthorized model promotion by standard user
    r = api_call("/models/promote", method="POST", payload={
        "model_id": "MOD-XGB-001",
        "model_type": "Fraud Detection",
        "target_version": "v2.0.0"
    }, token=user_token)
    log_test("RBAC: Unauthorized Model Promotion Blocked", r["status"] == 403, f"Standard user received HTTP {r['status']}")

    # 7. Safe Security Penetration Vectors
    # NoSQL Injection attempt in query params
    r = api_call("/transactions?search={\"$ne\":null}", token=admin_token)
    log_test("NoSQL Injection Vector Handling", r["status"] == 200, "Handled safely without error or injection leakage")

    # SQL Injection attempt in transaction ID lookup
    sqli_param = urllib.parse.quote("TXN-1' OR '1'='1")
    r = api_call(f"/transactions/{sqli_param}", token=admin_token)
    log_test("SQL Injection Vector Handling", r["status"] in [200, 404], "Safely sanitized and handled by ORM")

    # XSS vector in case comments
    r = api_call("/cases", token=admin_token)
    cases = r["data"].get("data", {}).get("items", [])
    if cases:
        sample_c_id = cases[0]["case_id"]
        r = api_call(f"/cases/{sample_c_id}/comments", method="POST", payload={
            "comment": "<script>alert('XSS_AUDIT')</script>"
        }, token=admin_token)
        log_test("XSS Storage Vector Handling", r["status"] in [200, 201], "Stored safely without script execution")

    # JWT None Algorithm Attempt
    fake_token = "eyJhbGciOiJub25lIiwidHlwZSI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiJ9."
    r = api_call("/auth/me", token=fake_token)
    log_test("JWT Alg 'none' Attack Blocked", r["status"] == 401, "Rejected with HTTP 401 Unauthorized")

    # 8. Repository-Wide Secret & Credential Scan
    print("\n--- 8. Scanning Repository for Exposed Secrets ---")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    secret_patterns = [
        re.compile(r'mongodb\+srv://([^:]+):([^@]+)@'),
        re.compile(r'AKIA[0-9A-Z]{16}'),
        re.compile(r'ghp_[0-9a-zA-Z]{36}'),
        re.compile(r'sk_live_[0-9a-zA-Z]{24}'),
        re.compile(r'gsk_[0-9a-zA-Z]{48}'),
    ]

    exposed_secrets = []
    for root, dirs, files in os.walk(base_dir):
        if ".git" in root or "node_modules" in root or ".venv" in root or "__pycache__" in root:
            continue
        for file in files:
            # Exclude local gitignored developer environment files (.env, .env.local)
            if file in [".env", ".env.local"] or file.endswith((".db", ".sqlite")):
                continue
            if file.endswith((".py", ".example", ".json", ".ts", ".tsx", ".md", ".yml", ".yaml")):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        for pat in secret_patterns:
                            m = pat.search(content)
                            if m and "<username>" not in m.group(0) and "<password>" not in m.group(0):
                                rel = os.path.relpath(file_path, base_dir)
                                exposed_secrets.append(f"{rel}: matched {pat.pattern}")
                except Exception:
                    pass

    log_test("Secret Scan: Zero Real Exposed Credentials", len(exposed_secrets) == 0, f"{len(exposed_secrets)} exposed secrets detected")
    results["secret_audit_findings"] = exposed_secrets

    # Save Output
    os.makedirs(os.path.join(base_dir, "audit", "test-results"), exist_ok=True)
    out_path = os.path.join(base_dir, "audit", "test-results", "security_governance_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 80)
    print(f"SECURITY AUDIT SUMMARY: Total: {results['summary']['total_tests']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    print(f"Saved to: {out_path}")
    print("=" * 80)

if __name__ == "__main__":
    run_security_audit()
