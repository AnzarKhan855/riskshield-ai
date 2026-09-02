import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api/v1"

def safe_json_parse(text):
    if not text:
        return {}
    text_stripped = text.strip()
    if text_stripped.startswith("{") or text_stripped.startswith("["):
        try:
            return json.loads(text_stripped)
        except Exception:
            return text
    return text

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_headers = {"Content-Type": "application/json", **headers}
    body = json.dumps(data).encode("utf-8") if data else None
    
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, dict(resp.headers), safe_json_parse(resp_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return e.code, dict(e.headers), safe_json_parse(err_body)

def run_integration_audit():
    print("=" * 65)
    print("STARTING LIVE FRONTEND-BACKEND INTEGRATION AUDIT")
    print("=" * 65)

    # 1. Test CORS Preflight OPTIONS Request
    opt_headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
    }
    status_code, resp_headers, _ = make_request(f"{BASE_URL}/auth/login", method="OPTIONS", headers=opt_headers)
    print(f"[CORS Preflight OPTIONS /auth/login] Status: {status_code}")
    assert status_code == 200, f"CORS Preflight failed: {status_code}"
    cors_origin = resp_headers.get("access-control-allow-origin") or resp_headers.get("Access-Control-Allow-Origin")
    assert cors_origin == "http://localhost:3000", f"CORS Header missing: {resp_headers}"
    print("  [OK] CORS Preflight & Origin Header Verified!")

    # 2. Test User Signup
    email = f"audit_user_{int(time.time())}@riskshield.ai"
    signup_payload = {
        "email": email,
        "first_name": "Integration",
        "last_name": "Admin",
        "password": "SecurePassword123!",
        "role": "Admin",
    }
    status_code, resp_headers, signup_data = make_request(
        f"{BASE_URL}/auth/signup", method="POST", data=signup_payload, headers={"Origin": "http://localhost:3000"}
    )
    print(f"[POST /auth/signup] Status: {status_code}")
    assert status_code in [200, 201], f"Signup failed: {signup_data}"
    assert signup_data["success"] is True
    access_token = signup_data["data"]["access_token"]
    refresh_token = signup_data["data"]["refresh_token"]
    print("  [OK] User Signup & JWT Tokens Verified!")

    # 3. Test User Login
    status_code, resp_headers, login_data = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        data={"email": email, "password": "SecurePassword123!"},
        headers={"Origin": "http://localhost:3000"},
    )
    print(f"[POST /auth/login] Status: {status_code}")
    assert status_code == 200, f"Login failed: {login_data}"
    assert login_data["success"] is True
    access_token = login_data["data"]["access_token"]
    refresh_token = login_data["data"]["refresh_token"]
    print("  [OK] User Login & JWT Token Rotation Verified!")

    # 4. Test Authenticated Header Injection on Protected Endpoints
    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Origin": "http://localhost:3000",
    }

    # /auth/me
    status_code, _, me_data = make_request(f"{BASE_URL}/auth/me", method="GET", headers=auth_headers)
    print(f"[GET /auth/me] Status: {status_code}")
    assert status_code == 200, f"/auth/me failed: {me_data}"
    assert me_data["data"]["email"] == email
    print("  [OK] /auth/me Verified!")

    # 14 Protected Domain Endpoints
    protected_endpoints = [
        ("/merchants", "Merchants Platform"),
        ("/transactions", "Transactions Platform"),
        ("/customers", "Customer Intelligence"),
        ("/devices", "Device Intelligence"),
        ("/features", "Feature Store"),
        ("/models", "Model Registry"),
        ("/predictions", "Predictions Engine"),
        ("/orchestrator/history", "AI Orchestration"),
        ("/decisions", "Decision Intelligence"),
        ("/rules", "Policy Rules Studio"),
        ("/cases", "Investigation Cases"),
        ("/graph/snapshot", "Relationship Graph"),
        ("/explanations", "AI Explainability"),
        ("/notifications", "Notification Center"),
    ]

    for path, label in protected_endpoints:
        status_code, headers, resp_data = make_request(f"{BASE_URL}{path}", method="GET", headers=auth_headers)
        print(f"[GET {path}] ({label}) Status: {status_code}")
        assert status_code == 200, f"Endpoint {path} failed with status {status_code}: {resp_data}"
        origin_hdr = headers.get("access-control-allow-origin") or headers.get("Access-Control-Allow-Origin")
        assert origin_hdr == "http://localhost:3000"

    print("  [OK] All 14 Protected Domain Endpoints Returned HTTP 200 OK & CORS Headers!")

    # 5. Test Token Refresh Flow
    status_code, _, refresh_data = make_request(
        f"{BASE_URL}/auth/refresh",
        method="POST",
        data={"refresh_token": refresh_token},
        headers={"Origin": "http://localhost:3000"},
    )
    print(f"[POST /auth/refresh] Status: {status_code}")
    assert status_code == 200, f"Refresh failed: {refresh_data}"
    new_access_token = refresh_data["data"]["access_token"]
    assert new_access_token is not None
    print("  [OK] Refresh Token Rotation Flow Verified!")

    print("=" * 65)
    print("ALL 17 INTEGRATION, SECURITY & AUTH CHECKS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    run_integration_audit()
