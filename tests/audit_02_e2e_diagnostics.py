import os
import json
import time
import urllib.request
from playwright.sync_api import sync_playwright, Response

def run_diagnostics():
    print("================================================================================")
    print("      RISKSHIELD AI — PLAYWRIGHT DEEP DIAGNOSTICS & ERROR RECORDER             ")
    print("================================================================================")

    console_errors = []
    page_errors = []
    failed_requests = []
    
    # 1. Pre-authenticate admin token
    base = "http://localhost:8000/api/v1"
    login_payload = {"email": "admin@riskshield.ai", "password": "Password123!"}
    req = urllib.request.Request(
        f"{base}/auth/login",
        data=json.dumps(login_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    auth_data = json.loads(resp.read().decode())["data"]
    token = auth_data["access_token"]
    refresh = auth_data["refresh_token"]
    user = auth_data["user"]

    auth_storage = {
        "state": {
            "user": user,
            "accessToken": token,
            "refreshToken": refresh,
            "isAuthenticated": True,
        },
        "version": 0
    }

    all_routes = [
        "/",
        "/login",
        "/signup",
        "/forgot-password",
        "/operations",
        "/decisions",
        "/decisions/DEC-A5172D73",
        "/transactions",
        "/transactions/new",
        "/transactions/TXN-ML-PRED-992",
        "/rules",
        "/rules/new",
        "/rules/RULE-BLOCK-HIGH-RISK",
        "/models",
        "/models/register",
        "/models/MOD-XGB-001",
        "/cases",
        "/cases/new",
        "/cases/CASE-CRIT-901",
        "/merchants",
        "/merchants/new",
        "/merchants/MERCH-001",
        "/customers",
        "/customers/CUST-001",
        "/devices",
        "/devices/DEV-001",
        "/ingestion",
        "/features",
        "/features/TXN-ML-PRED-992",
        "/explanations",
        "/explanations/DEC-A5172D73",
        "/graph",
        "/orchestrator",
        "/orchestrator/history",
        "/orchestrator/history/EXEC-PIPE-001",
        "/predictions",
        "/predictions/PRED-001",
        "/notifications",
        "/profile",
        "/settings",
        "/ai",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append({"url": page.url, "type": msg.type, "text": msg.text}) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append({"url": page.url, "error": str(exc)}))
        
        def handle_response(resp: Response):
            if resp.status >= 400 and not "/auth/refresh" in resp.url and not ".hot-update." in resp.url:
                failed_requests.append({
                    "page_url": page.url,
                    "request_url": resp.url,
                    "method": resp.request.method,
                    "status": resp.status
                })

        page.on("response", handle_response)

        # Set localStorage token first
        page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
        page.evaluate(f"localStorage.setItem('riskshield-auth-storage', '{json.dumps(auth_storage)}')")
        page.wait_for_timeout(500)

        for route in all_routes:
            url = f"http://localhost:3000{route}"
            print(f"Testing route: {url} ...")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(1000)
            except Exception as e:
                page_errors.append({"url": url, "error": f"Navigation failed: {str(e)}"})

        browser.close()

    diagnostics = {
        "total_routes_tested": len(all_routes),
        "page_errors": page_errors,
        "console_errors": console_errors,
        "failed_requests": failed_requests
    }

    os.makedirs("scratch", exist_ok=True)
    with open("scratch/e2e_diagnostics.json", "w") as f:
        json.dump(diagnostics, f, indent=2)

    print("\n--- DIAGNOSTIC RESULTS ---")
    print(f"Page Errors ({len(page_errors)}):")
    for pe in page_errors:
        print(f"  - [{pe['url']}]: {pe['error']}")

    print(f"\nFailed Requests ({len(failed_requests)}):")
    for fr in failed_requests:
        print(f"  - On page [{fr['page_url']}] -> {fr['method']} {fr['request_url']} [{fr['status']}]")

    print(f"\nConsole Errors ({len(console_errors)}):")
    for ce in console_errors:
        print(f"  - On page [{ce['url']}] -> {ce['text']}")

if __name__ == "__main__":
    run_diagnostics()
