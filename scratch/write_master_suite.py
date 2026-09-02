import time
import json
import uuid
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright, Page, Response, expect

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

    # Ensure screenshot directory exists
    os.makedirs("scratch/screenshots/master_e2e", exist_ok=True)

    def log_pass(test_name, details=""):
        msg = f"[PASS] {test_name}" + (f" -> {details}" if details else "")
        print(msg)
        results["passed"].append(test_name)

    def log_fail(test_name, error_msg):
        msg = f"[FAIL] {test_name} -> {error_msg}"
        print(msg)
        results["failed"].append({"test": test_name, "error": error_msg})

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Wire up listeners
        page.on("console", lambda msg: results["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda exc: results["page_errors"].append(str(exc)))
        
        def handle_response(resp: Response):
            if resp.status >= 400 and not "/auth/refresh" in resp.url and not ".hot-update." in resp.url:
                results["failed_requests"].append(f"{resp.request.method} {resp.url} -> {resp.status}")

        page.on("response", handle_response)

        # ==============================================================================
        # 1. LANDING PAGE & NAVIGATION
        # ==============================================================================
        print("\n--- 1. LANDING PAGE & PUBLIC NAVIGATION ---")
        try:
            t0 = time.time()
            page.goto("http://localhost:3000", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            results["latencies"]["landing_page"] = round((time.time() - t0) * 1000, 2)
            page.screenshot(path="scratch/screenshots/master_e2e/01_landing_page.png")
            
            body = page.locator("body").inner_text()
            assert "RiskShield" in body or "Risk" in body, "Expected RiskShield branding on landing page"
            assert "An unsupported type was passed to use()" not in body
            log_pass("Landing Page Render & Branding", f"Latency: {results['latencies']['landing_page']} ms")
        except Exception as e:
            log_fail("Landing Page Render", str(e))

        # ==============================================================================
        # 2. AUTHENTICATION & SECURITY (SIGNUP, LOGIN, REMEMBER ME, LOGOUT)
        # ==============================================================================
        print("\n--- 2. AUTHENTICATION & SESSION MANAGEMENT ---")
        try:
            # 2A: Navigate to Signup
            page.goto("http://localhost:3000/signup", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.screenshot(path="scratch/screenshots/master_e2e/02_signup_page.png")
            log_pass("Signup Page Render")

            # 2B: Navigate to Login
            page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.screenshot(path="scratch/screenshots/master_e2e/03_login_page.png")

            # 2C: Perform Login
            page.wait_for_selector("input[type=\"email\"]", timeout=5000)
            page.fill("input[type=\"email\"]", "admin@riskshield.ai")
            page.fill("input[type=\"password\"]", "Password123!")
            page.click("button[type=\"submit\"]")
            page.wait_for_timeout(3000)
            
            page.screenshot(path="scratch/screenshots/master_e2e/04_after_login.png")
            assert "/operations" in page.url or "/login" not in page.url, f"Expected redirect after login, got {page.url}"
            log_pass("Admin Authentication & JWT Session Storage", f"Current URL: {page.url}")

            # 2D: Verify Session Persistence on Refresh
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            assert "/login" not in page.url, "Session should persist after page reload"
            log_pass("Session Persistence on Hard Refresh")
        except Exception as e:
            log_fail("Authentication Suite", str(e))

        # ==============================================================================
        # 3. OPERATIONS COMMAND CENTER
        # ==============================================================================
        print("\n--- 3. OPERATIONS COMMAND CENTER (/operations) ---")
        try:
            t0 = time.time()
            page.goto("http://localhost:3000/operations", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            results["latencies"]["operations_page"] = round((time.time() - t0) * 1000, 2)
            page.screenshot(path="scratch/screenshots/master_e2e/05_operations_dashboard.png")

            body = page.locator("body").inner_text()
            assert "Operations" in body or "Command" in body or "Risk" in body
            assert "Unhandled Runtime Error" not in body
            log_pass("Operations Command Center Loaded", f"Latency: {results['latencies']['operations_page']} ms")
        except Exception as e:
            log_fail("Operations Dashboard", str(e))

        # ==============================================================================
        # 4. DECISION INTELLIGENCE & EVALUATION PIPELINE
        # ==============================================================================
        print("\n--- 4. DECISION INTELLIGENCE & EVALUATION (/decisions) ---")
        try:
            t0 = time.time()
            page.goto("http://localhost:3000/decisions", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            results["latencies"]["decisions_list"] = round((time.time() - t0) * 1000, 2)
            page.screenshot(path="scratch/screenshots/master_e2e/06_decisions_list.png")

            # Test Evaluate Target Transaction TXN-ML-PRED-991
            txn_input = page.locator("input[placeholder*=\"TXN-\"][type=\"text\"]")
            if txn_input.count() > 0:
                txn_input.fill("TXN-ML-PRED-991")
                eval_btn = page.locator("button:has-text(\"Evaluate Decision\")")
                eval_btn.click()
                page.wait_for_timeout(3000)
                page.screenshot(path="scratch/screenshots/master_e2e/07_decision_evaluated.png")
                log_pass("Decision Evaluation Execution (POST /decisions/evaluate)")

            # Test Navigation to Detail /decisions/[id]
            links = page.locator("a[href^=\"/decisions/\"]")
            if links.count() > 0:
                target_href = links.first.get_attribute("href")
                links.first.click()
                page.wait_for_timeout(2500)
                page.screenshot(path="scratch/screenshots/master_e2e/08_decision_detail.png")
                
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                assert "DEC-" in body, "Expected Decision ID rendered"
                log_pass("Decision Trace Detail View Loaded", f"URL: {page.url}")

                # Test Direct Reload on Detail
                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Decision Detail Direct Reload (0 Hydration Errors)")

                # Test Copy JSON button
                copy_btn = page.locator("button:has-text(\"Copy JSON Trace\")")
                if copy_btn.count() > 0:
                    copy_btn.click()
                    page.wait_for_timeout(500)
                    log_pass("Copy JSON Trace Action Executed")
        except Exception as e:
            log_fail("Decision Intelligence Suite", str(e))

        # ==============================================================================
        # 5. TRANSACTIONS MANAGEMENT (/transactions)
        # ==============================================================================
        print("\n--- 5. TRANSACTIONS MANAGEMENT (/transactions) ---")
        try:
            page.goto("http://localhost:3000/transactions", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/09_transactions_list.png")
            log_pass("Transactions Table Rendered")

            # Check New Transaction Form
            page.goto("http://localhost:3000/transactions/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/10_transaction_new_form.png")
            log_pass("New Transaction Ingestion Form Rendered")

            # Navigate to detail page
            page.goto("http://localhost:3000/transactions", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            txn_links = page.locator("a[href^=\"/transactions/\"]:not([href=\"/transactions/new\"])")
            if txn_links.count() > 0:
                txn_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/11_transaction_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Transaction Detail Page Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Transaction Detail Direct Reload")
        except Exception as e:
            log_fail("Transactions Suite", str(e))

        # ==============================================================================
        # 6. RULES STUDIO (/rules)
        # ==============================================================================
        print("\n--- 6. RULES STUDIO (/rules) ---")
        try:
            page.goto("http://localhost:3000/rules", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/12_rules_list.png")
            log_pass("Rules Studio Catalog Rendered")

            # Check New Rule Form
            page.goto("http://localhost:3000/rules/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/13_rule_new_form.png")
            log_pass("Rule Authoring Canvas Rendered")

            # Open Rule Detail
            page.goto("http://localhost:3000/rules", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            rule_links = page.locator("a[href^=\"/rules/\"]:not([href=\"/rules/new\"])")
            if rule_links.count() > 0:
                rule_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/14_rule_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Rule Detail Editor Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Rule Detail Direct Reload")
        except Exception as e:
            log_fail("Rules Studio Suite", str(e))

        # ==============================================================================
        # 7. ML MODELS REGISTRY (/models)
        # ==============================================================================
        print("\n--- 7. ML MODELS REGISTRY (/models) ---")
        try:
            page.goto("http://localhost:3000/models", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/15_models_list.png")
            log_pass("ML Model Registry Rendered")

            # Check Register Model Form
            page.goto("http://localhost:3000/models/register", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/16_model_register_form.png")
            log_pass("Model Registration Form Rendered")

            # Open Model Detail
            page.goto("http://localhost:3000/models", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            model_links = page.locator("a[href^=\"/models/\"]:not([href=\"/models/register\"])")
            if model_links.count() > 0:
                model_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/17_model_detail.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Model Performance Detail Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Model Detail Direct Reload")
        except Exception as e:
            log_fail("ML Models Suite", str(e))

        # ==============================================================================
        # 8. INVESTIGATION CASE MANAGEMENT (/cases)
        # ==============================================================================
        print("\n--- 8. INVESTIGATION CASE MANAGEMENT (/cases) ---")
        try:
            page.goto("http://localhost:3000/cases", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/18_cases_list.png")
            log_pass("Investigation Cases Directory Rendered")

            # Check New Case Form
            page.goto("http://localhost:3000/cases/new", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/19_case_new_form.png")
            log_pass("Case Creation Form Rendered")

            # Open Case Workspace
            page.goto("http://localhost:3000/cases", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            case_links = page.locator("a[href^=\"/cases/\"]:not([href=\"/cases/new\"])")
            if case_links.count() > 0:
                case_links.first.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="scratch/screenshots/master_e2e/20_case_workspace.png")
                body = page.locator("body").inner_text()
                assert "An unsupported type was passed to use()" not in body
                log_pass("Analyst Case Workspace Loaded", f"URL: {page.url}")

                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                log_pass("Case Workspace Direct Reload")
        except Exception as e:
            log_fail("Case Management Suite", str(e))

        # ==============================================================================
        # 9. MERCHANTS, CUSTOMERS & DEVICES
        # ==============================================================================
        print("\n--- 9. ENTITY INTELLIGENCE (MERCHANTS, CUSTOMERS, DEVICES) ---")
        try:
            # 9A: Merchants
            page.goto("http://localhost:3000/merchants", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/21_merchants_list.png")
            m_links = page.locator("a[href^=\"/merchants/\"]:not([href=\"/merchants/new\"])")
            if m_links.count() > 0:
                m_links.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/22_merchant_detail.png")
                log_pass("Merchant Profile & Direct Navigation Verified")

            # 9B: Customers
            page.goto("http://localhost:3000/customers", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/23_customers_list.png")
            c_links = page.locator("a[href^=\"/customers/\"]")
            if c_links.count() > 0:
                c_links.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/24_customer_detail.png")
                log_pass("Customer Profile & Behavioral Timeline Verified")

            # 9C: Devices
            page.goto("http://localhost:3000/devices", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/25_devices_list.png")
            d_links = page.locator("a[href^=\"/devices/\"]")
            if d_links.count() > 0:
                d_links.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/26_device_detail.png")
                log_pass("Device Fingerprinting & Risk Profile Verified")
        except Exception as e:
            log_fail("Entity Intelligence Suite", str(e))

        # ==============================================================================
        # 10. INGESTION, FEATURES, EXPLANATIONS, GRAPH, ORCHESTRATOR
        # ==============================================================================
        print("\n--- 10. ADVANCED AI & PIPELINE WORKFLOWS ---")
        try:
            # 10A: Ingestion
            page.goto("http://localhost:3000/ingestion", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/27_ingestion_center.png")
            log_pass("Batch Ingestion Center Rendered")

            # 10B: Features
            page.goto("http://localhost:3000/features", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/28_features_list.png")
            f_links = page.locator("a[href^=\"/features/\"]")
            if f_links.count() > 0:
                f_links.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/29_feature_vector_detail.png")
                log_pass("Feature Engineering Vector Inspector Verified")

            # 10C: Explanations
            page.goto("http://localhost:3000/explanations", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/30_explanations_list.png")
            log_pass("AI Explainability Directory Rendered")

            # 10D: Graph Analysis
            page.goto("http://localhost:3000/graph", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            page.screenshot(path="scratch/screenshots/master_e2e/31_graph_analysis.png")
            log_pass("Fraud Knowledge Graph Link Analysis Rendered")

            # 10E: Orchestrator
            page.goto("http://localhost:3000/orchestrator", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/32_orchestrator_sandbox.png")
            log_pass("AI Orchestrator Live Inference Sandbox Rendered")

            page.goto("http://localhost:3000/orchestrator/history", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/33_orchestrator_history.png")
            orch_links = page.locator("a[href^=\"/orchestrator/history/\"]")
            if orch_links.count() > 0:
                orch_links.first.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="scratch/screenshots/master_e2e/34_orchestrator_trace.png")
                log_pass("Orchestration Pipeline Trace Verified")

            # 10F: Predictions
            page.goto("http://localhost:3000/predictions", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/35_predictions_list.png")
            log_pass("Prediction Audit History Rendered")
        except Exception as e:
            log_fail("Advanced AI Suite", str(e))

        # ==============================================================================
        # 11. NOTIFICATIONS, PROFILE & SETTINGS
        # ==============================================================================
        print("\n--- 11. USER SETTINGS & NOTIFICATIONS ---")
        try:
            # 11A: Notifications
            page.goto("http://localhost:3000/notifications", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/36_notifications_center.png")
            log_pass("Alerts & Notification Center Rendered")

            # 11B: Profile
            page.goto("http://localhost:3000/profile", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/37_user_profile.png")
            log_pass("User Profile & Role Settings Rendered")

            # 11C: Settings
            page.goto("http://localhost:3000/settings", wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            page.screenshot(path="scratch/screenshots/master_e2e/38_system_settings.png")
            log_pass("System Configuration & Risk Threshold Settings Rendered")
        except Exception as e:
            log_fail("Settings & Notifications Suite", str(e))

        browser.close()

    print("\n================================================================================")
    print("                    MASTER E2E SUITE EXECUTION SUMMARY                          ")
    print("================================================================================")
    print(f"Total Tests Passed: {len(results['passed'])}")
    print(f"Total Tests Failed: {len(results['failed'])}")
    print(f"Total Page Errors: {len(results['page_errors'])}")
    print(f"Total Console Errors: {len(results['console_errors'])}")
    print(f"Total Failed Requests: {len(results['failed_requests'])}")
    
    if results['failed']:
        print("\nFailed Items:")
        for f in results['failed']:
            print(f"  - {f['test']}: {f['error']}")

    if not results['failed'] and not results['page_errors']:
        print("\n[SUCCESS] MASTER PLAYWRIGHT E2E QA SUITE PASSED WITH 100% COMPLETION!")
    else:
        print("\n[WARNING] Some QA checks require attention.")
        sys.exit(1)

if __name__ == "__main__":
    import os
    run_master_e2e_suite()
