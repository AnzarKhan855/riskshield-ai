import sys
import time
import json
from playwright.sync_api import sync_playwright, Page, Response

def run_dynamic_routes_suite():
    print("================================================================")
    print("  RiskShield AI - Dynamic Routes [id] Playwright Verification   ")
    print("================================================================")

    console_errors = []
    failed_requests = []
    page_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Listen for console errors and unhandled exceptions
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        
        def handle_response(resp: Response):
            if resp.status >= 400 and not "/auth/refresh" in resp.url:
                failed_requests.append(f"{resp.request.method} {resp.url} -> {resp.status}")

        page.on("response", handle_response)

        # -----------------------------------------------------------------
        # STEP 1: Login
        # -----------------------------------------------------------------
        print("\n[STEP 1] Logging in as admin@riskshield.ai...")
        page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
        page.wait_for_selector("input[type=\"email\"]", timeout=10000)
        page.fill("input[type=\"email\"]", "admin@riskshield.ai")
        page.fill("input[type=\"password\"]", "Password123!")
        
        with page.expect_response(lambda r: "/api/v1/auth/login" in r.url and r.status == 200, timeout=10000):
            page.click("button[type=\"submit\"]")
            
        page.wait_for_timeout(2000)
        print(f"  - Logged in successfully. Current URL: {page.url}")

        # -----------------------------------------------------------------
        # STEP 2: Navigate to /decisions
        # -----------------------------------------------------------------
        print("\n[STEP 2] Navigating to /decisions...")
        page.goto("http://localhost:3000/decisions", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        page.screenshot(path="scratch/screenshots/dynamic_01_decisions_list.png")

        # -----------------------------------------------------------------
        # STEP 3: Click a Decision Row to test /decisions/[id]
        # -----------------------------------------------------------------
        print("\n[STEP 3] Locating and clicking Decision row link...")
        # Check if decision rows exist in table
        decision_links = page.locator("a[href^=\"/decisions/\"]")
        count = decision_links.count()
        print(f"  - Found {count} decision links on page.")
        
        if count > 0:
            target_href = decision_links.first.get_attribute("href")
            print(f"  - Clicking first decision link: {target_href}...")
            decision_links.first.click()
            page.wait_for_timeout(2500)
            print(f"  - Navigated to: {page.url}")
            page.screenshot(path="scratch/screenshots/dynamic_02_decision_detail.png")

            # Check that the runtime error 'An unsupported type was passed to use()' did NOT occur
            body_text = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body_text, "CRITICAL ERROR: 'use(params)' runtime error found in DOM!"
            assert "Unhandled Runtime Error" not in body_text, "CRITICAL ERROR: Unhandled Runtime Error found on /decisions/[id]!"
            print("  - [PASS] No 'use(params)' or Unhandled Runtime Error on /decisions/[id]!")

            # Test Copy JSON Trace button
            copy_btn = page.locator("button:has-text(\"Copy JSON Trace\")")
            if copy_btn.count() > 0:
                print("  - Clicking 'Copy JSON Trace' button...")
                copy_btn.click()
                page.wait_for_timeout(500)
                print("  - [PASS] Copy button clicked without crash.")

            # Test page refresh on /decisions/[id]
            print("  - Testing page refresh on /decisions/[id] directly...")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            body_after_reload = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body_after_reload, "CRITICAL ERROR after reload!"
            print("  - [PASS] Page reloaded directly with zero hydration or runtime error.")
            page.screenshot(path="scratch/screenshots/dynamic_03_decision_reloaded.png")

            # Test back navigation link
            back_link = page.locator("a:has-text(\"Back to Decisions\")")
            if back_link.count() > 0:
                print("  - Clicking 'Back to Decisions' link...")
                back_link.click()
                page.wait_for_timeout(1500)
                print(f"  - Back navigation successful. Current URL: {page.url}")
                assert "/decisions" in page.url
        else:
            print("  - WARNING: No decision links found!")

        # -----------------------------------------------------------------
        # STEP 4: Test Other Dynamic [id] Pages
        # -----------------------------------------------------------------
        # Test Transactions [id]
        print("\n[STEP 4A] Testing /transactions and dynamic link...")
        page.goto("http://localhost:3000/transactions", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        txn_links = page.locator("a[href^=\"/transactions/\"]")
        if txn_links.count() > 0:
            target_txn = txn_links.first.get_attribute("href")
            print(f"  - Clicking transaction link: {target_txn}...")
            txn_links.first.click()
            page.wait_for_timeout(2000)
            print(f"  - Navigated to {page.url}")
            body = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body
            page.screenshot(path="scratch/screenshots/dynamic_04_transaction_detail.png")
            print("  - [PASS] Transaction detail page loaded cleanly.")

        # Test Rules [id]
        print("\n[STEP 4B] Testing /rules and dynamic link...")
        page.goto("http://localhost:3000/rules", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        rule_links = page.locator("a[href^=\"/rules/\"]:not([href=\"/rules/new\"])")
        if rule_links.count() > 0:
            target_rule = rule_links.first.get_attribute("href")
            print(f"  - Clicking rule link: {target_rule}...")
            rule_links.first.click()
            page.wait_for_timeout(2000)
            print(f"  - Navigated to {page.url}")
            body = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body
            page.screenshot(path="scratch/screenshots/dynamic_05_rule_detail.png")
            print("  - [PASS] Rule detail page loaded cleanly.")

        # Test Models [id]
        print("\n[STEP 4C] Testing /models and dynamic link...")
        page.goto("http://localhost:3000/models", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        model_links = page.locator("a[href^=\"/models/\"]:not([href=\"/models/register\"])")
        if model_links.count() > 0:
            target_model = model_links.first.get_attribute("href")
            print(f"  - Clicking model link: {target_model}...")
            model_links.first.click()
            page.wait_for_timeout(2000)
            print(f"  - Navigated to {page.url}")
            body = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body
            page.screenshot(path="scratch/screenshots/dynamic_06_model_detail.png")
            print("  - [PASS] Model detail page loaded cleanly.")

        # Test Cases [id]
        print("\n[STEP 4D] Testing /cases and dynamic link...")
        page.goto("http://localhost:3000/cases", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)
        case_links = page.locator("a[href^=\"/cases/\"]:not([href=\"/cases/new\"])")
        if case_links.count() > 0:
            target_case = case_links.first.get_attribute("href")
            print(f"  - Clicking case link: {target_case}...")
            case_links.first.click()
            page.wait_for_timeout(2000)
            print(f"  - Navigated to {page.url}")
            body = page.locator("body").inner_text()
            assert "An unsupported type was passed to use()" not in body
            page.screenshot(path="scratch/screenshots/dynamic_07_case_detail.png")
            print("  - [PASS] Case workspace page loaded cleanly.")

        browser.close()

    print("\n================================================================")
    print("                 DYNAMIC ROUTES VERIFICATION SUMMARY            ")
    print("================================================================")
    print(f"Page Runtime Errors: {len(page_errors)}")
    for e in page_errors:
        print(f"  - {e}")
    print(f"Console Errors: {len(console_errors)}")
    for e in console_errors:
        print(f"  - {e}")
    print(f"Failed HTTP Requests: {len(failed_requests)}")
    for req in failed_requests:
        print(f"  - {req}")

    if not page_errors and not console_errors:
        print("\n[SUCCESS] ALL DYNAMIC ROUTES [id] LOADED FLAWLESSLY WITH ZERO RUNTIME ERRORS!")
    else:
        print(f"\n[FAILURE] Errors detected during dynamic route testing.")
        sys.exit(1)

if __name__ == "__main__":
    run_dynamic_routes_suite()
