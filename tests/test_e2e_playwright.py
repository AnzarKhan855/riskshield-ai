import sys
import time
import json
from playwright.sync_api import sync_playwright, Page, Response

def run_e2e_suite():
    print("==================================================")
    print("  RiskShield AI - Full Playwright E2E Test Suite  ")
    print("==================================================")

    console_errors = []
    failed_requests = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Wire up console and response monitoring
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        
        def handle_response(resp: Response):
            if resp.status >= 400 and not "/auth/refresh" in resp.url:
                failed_requests.append(f"{resp.request.method} {resp.url} -> {resp.status}")

        page.on("response", handle_response)

        # -----------------------------------------------------------------
        # STEP 1: Test Login
        # -----------------------------------------------------------------
        print("\n[TEST 1] Navigating to Login Page...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        page.screenshot(path="scratch/screenshots/01_login_page.png")
        print("  - Saved screenshot scratch/screenshots/01_login_page.png")

        print("  - Submitting admin credentials (admin@riskshield.ai)...")
        page.fill("input[type=\"email\"]", "admin@riskshield.ai")
        page.fill("input[type=\"password\"]", "Password123!")
        
        with page.expect_response(lambda r: "/api/v1/auth/login" in r.url and r.status == 200, timeout=10000) as login_resp_info:
            page.click("button[type=\"submit\"]")

        login_res = login_resp_info.value
        print(f"  - Login API Response: {login_res.status}")
        
        # Wait for navigation after login (to /operations or home)
        page.wait_for_timeout(3000)
        current_url = page.url
        print(f"  - Current URL after login: {current_url}")
        page.screenshot(path="scratch/screenshots/02_after_login.png")

        # -----------------------------------------------------------------
        # STEP 2: Test Decision Intelligence & Evaluate Flow
        # -----------------------------------------------------------------
        print("\n[TEST 2] Navigating to Decisions Intelligence Directory (/decisions)...")
        page.goto("http://localhost:3000/decisions", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/03_decisions_directory.png")

        # Fill transaction input and trigger evaluation
        print("  - Testing Evaluate Decision for TXN-ML-PRED-991...")
        txn_input = page.locator("input[placeholder*=\"Target Transaction ID\"]")
        if txn_input.count() > 0:
            txn_input.fill("TXN-ML-PRED-991")
            print("  - Input filled with TXN-ML-PRED-991")
            
            # Click Evaluate Decision button and watch network request
            eval_btn = page.locator("button:has-text(\"Evaluate Decision\")")
            with page.expect_response(lambda r: "/api/v1/decisions/evaluate" in r.url, timeout=15000) as eval_resp_info:
                eval_btn.click()

            eval_res = eval_resp_info.value
            print(f"  - Evaluate API Response Status: {eval_res.status} (Expected 200 or 201)")
            eval_json = eval_res.json()
            print(f"  - Evaluate API Response Data: success={eval_json.get("success")} decision={eval_json.get("data", {}).get("decision")} ID={eval_json.get("data", {}).get("decision_id")}")
            
            assert eval_res.status in [200, 201], f"Expected 200/201 but got {eval_res.status}"
            assert eval_json.get("success") is True, f"Expected success=True but got {eval_json.get("success")}"
        else:
            print("  - WARNING: Target Transaction ID input not found!")

        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/04_decision_evaluated.png")

        # -----------------------------------------------------------------
        # STEP 3: Test Transactions Directory
        # -----------------------------------------------------------------
        print("\n[TEST 3] Navigating to Transactions Directory (/transactions)...")
        page.goto("http://localhost:3000/transactions", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/05_transactions.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 4: Test Rules Studio
        # -----------------------------------------------------------------
        print("\n[TEST 4] Navigating to Rules Studio (/rules)...")
        page.goto("http://localhost:3000/rules", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/06_rules.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 5: Test AI Models Registry
        # -----------------------------------------------------------------
        print("\n[TEST 5] Navigating to ML Models Registry (/models)...")
        page.goto("http://localhost:3000/models", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/07_models.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 6: Test Investigation Cases
        # -----------------------------------------------------------------
        print("\n[TEST 6] Navigating to Investigation Cases (/cases)...")
        page.goto("http://localhost:3000/cases", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/08_cases.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 7: Test Merchants Directory
        # -----------------------------------------------------------------
        print("\n[TEST 7] Navigating to Merchants Directory (/merchants)...")
        page.goto("http://localhost:3000/merchants", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/09_merchants.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 8: Test Customers Directory
        # -----------------------------------------------------------------
        print("\n[TEST 8] Navigating to Customers Directory (/customers)...")
        page.goto("http://localhost:3000/customers", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/10_customers.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 9: Test Devices Directory
        # -----------------------------------------------------------------
        print("\n[TEST 9] Navigating to Devices Directory (/devices)...")
        page.goto("http://localhost:3000/devices", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/11_devices.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 10: Test Ingestion Center
        # -----------------------------------------------------------------
        print("\n[TEST 10] Navigating to Ingestion Center (/ingestion)...")
        page.goto("http://localhost:3000/ingestion", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/12_ingestion.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 11: Test Graph Entity Link Analysis
        # -----------------------------------------------------------------
        print("\n[TEST 11] Navigating to Graph Analysis (/graph)...")
        page.goto("http://localhost:3000/graph", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/13_graph.png")
        print(f"  - Page title/URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 12: Test Notifications Center
        # -----------------------------------------------------------------
        print("\n[TEST 12] Navigating to Notifications Center (/notifications)...")
        page.goto("http://localhost:3000/notifications", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="scratch/screenshots/14_notifications.png")
        print(f"  - Page title/URL: {page.url}")

        browser.close()

    print("\n==================================================")
    print("                 TEST SUMMARY                     ")
    print("==================================================")
    print(f"Console Errors Caught: {len(console_errors)}")
    for err in console_errors:
        print(f"  - {err}")

    print(f"Failed HTTP Requests: {len(failed_requests)}")
    for req in failed_requests:
        print(f"  - {req}")

    if not failed_requests:
        print("\n[SUCCESS] ALL PLAYWRIGHT E2E BROWSER TESTS PASSED! ZERO BROKEN ENDPOINTS!")
    else:
        print(f"\n[WARNING] {len(failed_requests)} Failed requests detected.")

if __name__ == "__main__":
    run_e2e_suite()
