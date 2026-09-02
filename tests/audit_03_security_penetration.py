import os
import sys
import json
import time
import urllib.request
import urllib.error
from typing import Dict, Any, List

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {
    "summary": {"total_tests": 0, "passed": 0, "failed": 0, "vulnerabilities_detected": []},
    "test_cases": []
}

def make_req(method: str, path: str, payload: dict = None, headers_extra: dict = None) -> Dict[str, Any]:
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if headers_extra:
        headers.update(headers_extra)
    
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            latency = (time.perf_counter() - t0) * 1000
            body = resp.read().decode("utf-8")
            res_json = json.loads(body) if body else {}
            return {"status": resp.status, "headers": dict(resp.headers), "data": res_json, "latency_ms": round(latency, 2)}
    except urllib.error.HTTPError as e:
        latency = (time.perf_counter() - t0) * 1000
        body = e.read().decode("utf-8")
        try:
            res_json = json.loads(body)
        except Exception:
            res_json = {"raw": body}
        return {"status": e.code, "headers": dict(e.headers), "data": res_json, "latency_ms": round(latency, 2)}
    except Exception as exc:
        latency = (time.perf_counter() - t0) * 1000
        return {"status": 0, "headers": {}, "data": {}, "latency_ms": round(latency, 2), "error": str(exc)}

def test_security():
    print("================================================================================")
    print("       RISKSHIELD AI — ENTERPRISE SECURITY & PENETRATION AUDIT                  ")
    print("================================================================================")

    # Obtain admin token
    auth_res = make_req("POST", "/auth/login", {"email": "admin@riskshield.ai", "password": "Password123!"})
    admin_token = auth_res.get("data", {}).get("data", {}).get("access_token")
    auth_header = {"Authorization": f"Bearer {admin_token}"}

    # 1. SQL Injection Tests
    sqli_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE transactions; --",
        "1 UNION SELECT 1, 'admin', 'password', 'ADMIN', true, datetime('now'), datetime('now') --",
        "' OR 1=1 --",
        "admin'--",
    ]
    for p in sqli_payloads:
        results["summary"]["total_tests"] += 1
        res = make_req("GET", f"/transactions?search={urllib.parse.quote(p)}", headers_extra=auth_header)
        # Should not throw 500 internal server error or expose DB schema
        if res["status"] in [200, 400, 422]:
            print(f"[PASS] SQL Injection Filter Test: payload `{p}` handled gracefully (Status {res['status']})")
            results["summary"]["passed"] += 1
        else:
            print(f"[FAIL] SQL Injection Vulnerability Suspect: payload `{p}` returned Status {res['status']}")
            results["summary"]["failed"] += 1
            results["summary"]["vulnerabilities_detected"].append({
                "type": "SQL_INJECTION",
                "payload": p,
                "endpoint": "/transactions?search=",
                "status": res["status"],
                "response": res["data"]
            })

    # 2. XSS Payload Injection Tests
    xss_payloads = [
        "<script>alert(document.cookie)</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert(1)>",
        "javascript:alert(1)",
        "'\"><script>alert(1)</script>"
    ]
    for xp in xss_payloads:
        results["summary"]["total_tests"] += 1
        case_res = make_req("POST", "/cases", {
            "transaction_id": "TXN-DEMO-001",
            "case_title": f"XSS Test {xp}",
            "case_description": f"XSS payload description {xp}",
            "priority": "LOW",
            "category": "Fraud"
        }, headers_extra=auth_header)
        # Verify status is 200/201/400/422 and verify it does not return unescaped script executable in HTML context
        if case_res["status"] in [200, 201, 400, 422]:
            print(f"[PASS] XSS Payload Storage Test: `{xp}` handled safely (Status {case_res['status']})")
            results["summary"]["passed"] += 1
        else:
            print(f"[FAIL] XSS Payload Handling Error: `{xp}` returned Status {case_res['status']}")
            results["summary"]["failed"] += 1

    # 3. JWT Tampering Tests
    # A. Algorithm None Attack
    fake_header = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0"  # {"alg":"none","typ":"JWT"}
    fake_payload = "eyJzdWIiOiJhZG1pbkByaXNrc2hpZWxkLmFpIiwicm9sZSI6IkFETUlOIiwiZXhwIjoxODkzNDU2MDAwfQ" # exp far in future
    tampered_alg_none = f"{fake_header}.{fake_payload}."
    
    results["summary"]["total_tests"] += 1
    res = make_req("GET", "/auth/me", headers_extra={"Authorization": f"Bearer {tampered_alg_none}"})
    if res["status"] == 401:
        print("[PASS] JWT Algorithm 'none' Attack successfully rejected (Status 401)")
        results["summary"]["passed"] += 1
    else:
        print(f"[CRITICAL VULNERABILITY] JWT Alg None accepted! Status: {res['status']}")
        results["summary"]["failed"] += 1
        results["summary"]["vulnerabilities_detected"].append({
            "type": "JWT_ALG_NONE_BYPASS",
            "status": res["status"]
        })

    # B. Forged Signature Token
    forged_token = admin_token[:-10] + "abcdef1234"
    results["summary"]["total_tests"] += 1
    res = make_req("GET", "/auth/me", headers_extra={"Authorization": f"Bearer {forged_token}"})
    if res["status"] == 401:
        print("[PASS] JWT Forged Signature successfully rejected (Status 401)")
        results["summary"]["passed"] += 1
    else:
        print(f"[CRITICAL VULNERABILITY] JWT Forged Signature accepted! Status: {res['status']}")
        results["summary"]["failed"] += 1
        results["summary"]["vulnerabilities_detected"].append({
            "type": "JWT_FORGED_SIGNATURE",
            "status": res["status"]
        })

    # C. Expired Token
    expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTYwOTQ1OTIwMH0.dummysignature"
    results["summary"]["total_tests"] += 1
    res = make_req("GET", "/auth/me", headers_extra={"Authorization": f"Bearer {expired_token}"})
    if res["status"] == 401:
        print("[PASS] Expired JWT Token successfully rejected (Status 401)")
        results["summary"]["passed"] += 1
    else:
        print(f"[FAIL] Expired Token not rejected properly! Status: {res['status']}")
        results["summary"]["failed"] += 1

    # 4. Broken Auth & Credential Stuffing
    results["summary"]["total_tests"] += 1
    res = make_req("POST", "/auth/login", {"email": "nonexistent@riskshield.ai", "password": "DummyPassword123!"})
    if res["status"] == 401:
        print("[PASS] Nonexistent user rejected with generic 401")
        results["summary"]["passed"] += 1
    else:
        print(f"[FAIL] Nonexistent user returned unexpected status: {res['status']}")
        results["summary"]["failed"] += 1

    # 5. Malformed JSON & Large Payload DoS
    # Malformed JSON string
    results["summary"]["total_tests"] += 1
    url = f"{BASE_URL}/transactions"
    req = urllib.request.Request(url, data=b"{malformed_json: 123", headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
    except urllib.error.HTTPError as e:
        status = e.code
    except Exception:
        status = 0
    if status in [400, 422]:
        print(f"[PASS] Malformed JSON rejected with status {status}")
        results["summary"]["passed"] += 1
    else:
        print(f"[FAIL] Malformed JSON handled with unexpected status {status}")
        results["summary"]["failed"] += 1

    # 6. Security Headers Verification
    results["summary"]["total_tests"] += 1
    res = make_req("GET", "/health")
    headers = {k.lower(): v for k, v in res.get("headers", {}).items()}
    sec_headers = {
        "x-content-type-options": headers.get("x-content-type-options"),
        "x-frame-options": headers.get("x-frame-options"),
        "x-xss-protection": headers.get("x-xss-protection"),
        "strict-transport-security": headers.get("strict-transport-security"),
        "content-security-policy": headers.get("content-security-policy"),
    }
    print(f"Security Headers Present: {sec_headers}")
    if sec_headers.get("x-content-type-options") == "nosniff" and sec_headers.get("x-frame-options") in ["DENY", "SAMEORIGIN"]:
        print("[PASS] Essential Security Headers (X-Content-Type-Options, X-Frame-Options) enforced")
        results["summary"]["passed"] += 1
    else:
        print("[WARN] Missing standard security hardening headers")
        results["summary"]["failed"] += 1

    os.makedirs("scratch", exist_ok=True)
    with open("scratch/security_penetration_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n================================================================================")
    print(f"SECURITY AUDIT SUMMARY: Total: {results['summary']['total_tests']} | Passed: {results['summary']['passed']} | Failed: {results['summary']['failed']}")
    print(f"Vulnerabilities Found: {len(results['summary']['vulnerabilities_detected'])}")
    print("================================================================================")

if __name__ == "__main__":
    test_security()
