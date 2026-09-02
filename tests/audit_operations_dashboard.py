import os
import json
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    {"name": "375px_Mobile", "width": 375, "height": 667},
    {"name": "768px_Tablet", "width": 768, "height": 1024},
    {"name": "1024px_Tablet_Landscape", "width": 1024, "height": 768},
    {"name": "1280px_Laptop", "width": 1280, "height": 800},
    {"name": "1440px_Desktop", "width": 1440, "height": 900},
    {"name": "1920px_FHD", "width": 1920, "height": 1080},
    {"name": "2560px_4K", "width": 2560, "height": 1440},
]

def audit_operations():
    print("================================================================================")
    print("   RISKSHIELD AI — OPERATIONS DASHBOARD ENTERPRISE GRID AUDIT SUITE             ")
    print("================================================================================")

    os.makedirs("scratch/screenshots/operations_refactor", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OperationsAudit/1.0"
        )
        page = context.new_page()

        # Login
        print("\n[STEP 1] Logging in as Admin...")
        page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
        page.wait_for_selector("input[type='email']")
        page.fill("input[type='email']", "admin@riskshield.ai")
        page.fill("input[type='password']", "Password123!")
        page.click("button[type='submit']")
        page.wait_for_timeout(2000)

        # Audit Operations Dashboard across all viewports
        for vp in VIEWPORTS:
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.goto("http://localhost:3000/operations", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)

            scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
            inner_width = page.evaluate("() => window.innerWidth")
            body_scroll_width = page.evaluate("() => document.body.scrollWidth")

            has_overflow = scroll_width > inner_width + 1 or body_scroll_width > inner_width + 1

            status = "FAIL" if has_overflow else "PASS"
            print(f"[{status}] Operations Dashboard @ {vp['name']} ({vp['width']}x{vp['height']}) -> scrollWidth={scroll_width}px, innerWidth={inner_width}px")

            # Capture screenshot
            screenshot_path = f"scratch/screenshots/operations_refactor/operations_{vp['name']}.png"
            page.screenshot(path=screenshot_path, full_page=True)

        browser.close()

    print("\n================================================================================")
    print("OPERATIONS DASHBOARD AUDIT COMPLETE — All screenshots saved to scratch/screenshots/operations_refactor/")
    print("================================================================================")

if __name__ == "__main__":
    audit_operations()
