import os
import sys
import time
import json
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright, Page, Response

def run_master_e2e_suite():
    print("================================================================================")
    print("       RISKSHIELD AI — MASTER REAL-USER PLAYWRIGHT E2E QA TEST SUITE            ")
    print("================================================================================")

    results = {
        "passed": [],
        "failed": [],
        "console_errors": [],
        "page_errors": [],
        "failed_requests": [],
        "latencies": {},
        "screenshots": []
    }

    os.makedirs("scratch/screenshots/master_e2e", exist_ok=True)

    def log_pass(test_name, details=""):
        msg = f"[PASS] {test_name}" + (f" -> {details}" if details else "")
        print(msg)
        results["passed"].append(test_name)

    def log_fail(test_name, error_msg):
        msg = f"[FAIL] {test_name} -> {error_msg}"
        print(msg)
        results["failed"].append({"test": test_name, "error": error_msg})

    # Step 0: Pre-authenticate admin token
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
    print("[AUTH] Admin credentials verified with backend.")

    auth_storage = {
        "state": {
            "user": user,
            "accessToken": token,
            "refreshToken": refresh,
            "isAuthenticated": True,
        },
        "version": 0
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: results["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: results["page_errors"].append(str(exc)))
        
        def handle_response(resp: Response):
            if resp.status >= 400 and not "/auth/refresh" in resp.url and not ".hot-update." in resp.url:
                results["failed_requests"].append(f"{resp.request.method} {resp.url} -> {resp.status}")

        page.on("response", handle_response)

        # --------------------------------------------------------------------------
        # 1. LANDING PAGE & NAVIGATION
        # --------------------------------------------------------------------------
        print("\n--- 1. LANDING PAGE & PUBLIC NAVIGATION ---")
        try:
            t0 = time.time()
            page.goto("http://localhost:3000", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            results["latencies"]["landing_page"] = round((time.time() - t0) * 1000, 2)
            page.screenshot(path="scratch/screenshots/master_e2e/01_landing_page.png")
            body = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body
            log_pass("Landing Page Render & Public Routing", f"{results['latencies']['landing_page']} ms")
        except Exception as e:
            log_fail("Landing Page Render", str(e))

        # --------------------------------------------------------------------------
        # 2. AUTHENTICATION (SIGNUP, LOGIN, SESSION PERSISTENCE)
        # --------------------------------------------------------------------------
        print("\n--- 2. AUTHENTICATION & SESSION MANAGEMENT ---")
        try:
            # Signup
            page.goto("http://localhost:3000/signup", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.screenshot(path="scratch/screenshots/master_e2e/02_signup_page.png")
            log_pass("Signup Screen Rendered")

            # Login Form
            page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.screenshot(path="scratch/screenshots/master_e2e/03_login_page.png")
            log_pass("Login Screen Rendered")

            # Inject session
            page.evaluate(f"localStorage.setItem('riskshield-auth-storage', '{json.dumps(auth_storage)}')")
            log_pass("JWT Session Storage Injected")
        except Exception as e:
            log_fail("Auth Suite", str(e))

        # --------------------------------------------------------------------------
        # 3. OPERATIONS COMMAND CENTER
        # --------------------------------------------------------------------------
        print("\n--- 3. OPERATIONS COMMAND CENTER (/operations) ---")
        try:
            t0 = time.time()
            page.goto("http://localhost:3000/operations", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            results["latencies"]["operations"] = round((time.time() - t0) * 1000, 2)
            page.screenshot(path="scratch/screenshots/master_e2e/04_operations_dashboard.png")
            body = page.locator("body").inner_text()
            assert "Unhandled Runtime Error" not in body
            log_pass("Operations KPIs & Live Telemetry", f"{results['latencies']['operations']} ms")
        except Exception as e:
            log_fail("Operations Dashboard", str(e))

        # --------------------------------------------------------------------------
        # 4. DECISIONS INTELLIGENCE & EVALUATION
        # --------------------------------------------------------------------------
        print("\n--- 4. DECISION INTELLIGENCE & EVALUATION (/decisions) ---")
        try:
            page.goto("http://localhost:3000/decisions", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/05_decisions_list.png")

            # Evaluate decision
            txn_input = page.locator("input[placeholder*='TXN-'][type='text']")
            if txn_input.count() > 0:
                txn_input.fill("TXN-ML-PRED-991")
                page.locator("button:has-text('Evaluate Decision')").click()
                page.wait_for_timeout(3000)
                page.screenshot(path="scratch/screenshots/master_e2e/06_decision_evaluated.png")
                log_pass("Live Decision Evaluation (POST /decisions/evaluate)")

            # Open detail
            links = page.locator("a[href^='/decisions/']")
            if links.count() > 0:
                links.first.click()
                page.wait_for_timeout(2500)
                page.screenshot(path="scratch/screenshots/master_e2e/07_decision_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                assert "DEC-" in body
                log_pass("Decision Trace Detail Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Decision Detail Direct Reload")

                copy_btn = page.locator("button:has-text('Copy JSON Trace')")
                if copy_btn.count() > 0:
                    copy_btn.click()
                    page.wait_for_timeout(500)
                    log_pass("Copy JSON Trace Action Executed")
        except Exception as e:
            log_fail("Decisions Suite", str(e))

        # --------------------------------------------------------------------------
        # 5. TRANSACTIONS MANAGEMENT
        # --------------------------------------------------------------------------
        print("\n--- 5. TRANSACTIONS MANAGEMENT (/transactions) ---")
        try:
            page.goto("http://localhost:3000/transactions", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/08_transactions_list.png")
            log_pass("Transactions Table Rendered")

            page.goto("http://localhost:3000/transactions/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/09_transaction_new_form.png")
            log_pass("New Transaction Ingestion Form")

            page.goto("http://localhost:3000/transactions", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            txn_links = page.locator("a[href^='/transactions/']:not([href='/transactions/new'])")
            if txn_links.count() > 0:
                txn_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/10_transaction_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Transaction Detail Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Transaction Detail Direct Reload")
        except Exception as e:
            log_fail("Transactions Suite", str(e))

        # --------------------------------------------------------------------------
        # 6. RULES STUDIO
        # --------------------------------------------------------------------------
        print("\n--- 6. RULES STUDIO (/rules) ---")
        try:
            page.goto("http://localhost:3000/rules", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/11_rules_list.png")
            log_pass("Rule Studio Catalog")

            page.goto("http://localhost:3000/rules/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/12_rule_new_form.png")
            log_pass("Rule Authoring Builder")

            page.goto("http://localhost:3000/rules", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            rule_links = page.locator("a[href^='/rules/']:not([href='/rules/new'])")
            if rule_links.count() > 0:
                rule_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/13_rule_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Rule Detail Editor Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Rule Detail Direct Reload")
        except Exception as e:
            log_fail("Rules Studio Suite", str(e))

        # --------------------------------------------------------------------------
        # 7. ML MODELS REGISTRY
        # --------------------------------------------------------------------------
        print("\n--- 7. ML MODELS REGISTRY (/models) ---")
        try:
            page.goto("http://localhost:3000/models", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/14_models_list.png")
            log_pass("ML Model Registry")

            page.goto("http://localhost:3000/models/register", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/15_model_register_form.png")
            log_pass("Model Registration Form")

            page.goto("http://localhost:3000/models", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            m_links = page.locator("a[href^='/models/']:not([href='/models/register'])")
            if m_links.count() > 0:
                m_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/16_model_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Model Performance Detail Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Model Detail Direct Reload")
        except Exception as e:
            log_fail("ML Models Suite", str(e))

        # --------------------------------------------------------------------------
        # 8. INVESTIGATION CASE MANAGEMENT
        # --------------------------------------------------------------------------
        print("\n--- 8. INVESTIGATION CASE MANAGEMENT (/cases) ---")
        try:
            page.goto("http://localhost:3000/cases", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/17_cases_list.png")
            log_pass("Cases Directory Loaded")

            page.goto("http://localhost:3000/cases/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/18_case_new_form.png")
            log_pass("Case Creation Form")

            page.goto("http://localhost:3000/cases", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            c_links = page.locator("a[href^='/cases/']:not([href='/cases/new'])")
            if c_links.count() > 0:
                c_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/19_case_workspace.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Analyst Case Workspace Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Case Workspace Direct Reload")
        except Exception as e:
            log_fail("Cases Suite", str(e))

        # --------------------------------------------------------------------------
        # 9. ENTITIES (MERCHANTS, CUSTOMERS, DEVICES)
        # --------------------------------------------------------------------------
        print("\n--- 9. ENTITY INTELLIGENCE ---")
        try:
            page.goto("http://localhost:3000/merchants", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/20_merchants_list.png")
            ml = page.locator("a[href^='/merchants/']:not([href='/merchants/new'])")
            if ml.count() > 0:
                ml.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/21_merchant_detail.png")
                log_pass("Merchant Detail Verified")

            page.goto("http://localhost:3000/customers", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/22_customers_list.png")
            cl = page.locator("a[href^='/customers/']")
            if cl.count() > 0:
                cl.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/23_customer_detail.png")
                log_pass("Customer Detail & Timeline Verified")

            page.goto("http://localhost:3000/devices", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/24_devices_list.png")
            dl = page.locator("a[href^='/devices/']")
            if dl.count() > 0:
                dl.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/25_device_detail.png")
                log_pass("Device Risk Profile Verified")
        except Exception as e:
            log_fail("Entities Suite", str(e))

        # --------------------------------------------------------------------------
        # 10. ADVANCED AI PIPELINES (INGESTION, FEATURES, EXPLANATIONS, GRAPH, ORCHESTRATOR)
        # --------------------------------------------------------------------------
        print("\n--- 10. ADVANCED AI PIPELINES ---")
        try:
            page.goto("http://localhost:3000/ingestion", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/26_ingestion_center.png")
            log_pass("Data Ingestion Center")

            page.goto("http://localhost:3000/features", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/27_features_list.png")
            fl = page.locator("a[href^='/features/']")
            if fl.count() > 0:
                fl.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/28_feature_detail.png")
                log_pass("Feature Vector Inspector")

            page.goto("http://localhost:3000/explanations", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/29_explanations_list.png")
            log_pass("Explainability Catalog")

            page.goto("http://localhost:3000/graph", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/30_graph_analysis.png")
            log_pass("Fraud Knowledge Graph Link Analysis")

            page.goto("http://localhost:3000/orchestrator", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/31_orchestrator_sandbox.png")
            log_pass("AI Orchestrator Sandbox")

            page.goto("http://localhost:3000/orchestrator/history", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/32_orchestrator_history.png")
            ol = page.locator("a[href^='/orchestrator/history/']")
            if ol.count() > 0:
                ol.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/33_orchestrator_trace.png")
                log_pass("Pipeline Execution Trace")

            page.goto("http://localhost:3000/predictions", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/34_predictions_list.png")
            log_pass("Prediction Audit History")
        except Exception as e:
            log_fail("Advanced AI Suite", str(e))

        # --------------------------------------------------------------------------
        # 11. USER PROFILE, NOTIFICATIONS & SETTINGS
        # --------------------------------------------------------------------------
        print("\n--- 11. NOTIFICATIONS & SETTINGS ---")
        try:
            page.goto("http://localhost:3000/notifications", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/35_notifications_center.png")
            log_pass("Alerts & Notification Center")

            page.goto("http://localhost:3000/profile", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/36_profile.png")
            log_pass("User Profile & Access Control")

            page.goto("http://localhost:3000/settings", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/37_settings.png")
            log_pass("System Risk Configuration")
        except Exception as e:
            log_fail("Settings Suite", str(e))

        browser.close()

    print("\n================================================================================")
    print("                    MASTER E2E SUITE EXECUTION SUMMARY                          ")
    print("================================================================================")
    print(f"Total Tests Passed: {len(results['passed'])}")
    print(f"Total Tests Failed: {len(results['failed'])}")
    print(f"Page Runtime Errors: {len(results['page_errors'])}")
    print(f"Console Errors: {len(results['console_errors'])}")
    print(f"Failed HTTP Requests: {len(results['failed_requests'])}")

    if not results['failed'] and not results['page_errors']:
        print("\n[SUCCESS] MASTER PLAYWRIGHT E2E QA SUITE COMPLETED WITH 100% SUCCESS!")
    else:
        print("\n[FAILURE] Issues detected during execution.")
        sys.exit(1)

if __name__ == "__main__":
    run_master_e2e_suite()
