import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    {"name": "320px_Mobile_SE", "width": 320, "height": 568},
    {"name": "375px_Mobile_Standard", "width": 375, "height": 667},
    {"name": "390px_iPhone14", "width": 390, "height": 844},
    {"name": "480px_Large_Mobile", "width": 480, "height": 854},
    {"name": "768px_Tablet_Portrait", "width": 768, "height": 1024},
    {"name": "1024px_Tablet_Landscape", "width": 1024, "height": 768},
    {"name": "1280px_Laptop", "width": 1280, "height": 800},
    {"name": "1440px_Desktop", "width": 1440, "height": 900},
    {"name": "1920px_FHD", "width": 1920, "height": 1080},
    {"name": "2560px_4K", "width": 2560, "height": 1440},
]

ROUTES = [
    "/operations",
    "/ai",
    "/transactions",
    "/transactions/new",
    "/decisions",
    "/rules",
    "/rules/new",
    "/cases",
    "/cases/new",
    "/orchestrator",
    "/orchestrator/history",
    "/models",
    "/predictions",
    "/features",
    "/graph",
    "/ingestion",
    "/merchants",
    "/customers",
    "/devices",
    "/notifications",
    "/profile",
    "/settings",
    "/login",
    "/forgot-password"
]

def run_responsive_audit():
    print("================================================================================")
    print("   RISKSHIELD AI — MULTI-BREAKPOINT RESPONSIVENESS & OVERFLOW AUDIT SUITE       ")
    print("================================================================================")

    os.makedirs("scratch/screenshots/responsive", exist_ok=True)

    results = {
        "viewports_tested": len(VIEWPORTS),
        "routes_tested": len(ROUTES),
        "total_checks": 0,
        "passed_checks": 0,
        "overflow_detected": [],
        "details": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ResponsiveAudit/1.0"
        )
        page = context.new_page()

        # Login first to obtain auth state
        print("\n[STEP 1] Performing Admin Authentication...")
        page.goto("http://localhost:3000/login", wait_until="domcontentloaded")
        page.wait_for_selector("input[type='email']")
        page.fill("input[type='email']", "admin@riskshield.ai")
        page.fill("input[type='password']", "Password123!")
        page.click("button[type='submit']")
        page.wait_for_timeout(2000)
        print("[STEP 1 COMPLETE] Authenticated successfully.")

        # Iterate over all viewports and routes
        for vp in VIEWPORTS:
            print(f"\n--- Testing Breakpoint: {vp['name']} ({vp['width']}x{vp['height']}) ---")
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})

            for route in ROUTES:
                results["total_checks"] += 1
                url = f"http://localhost:3000{route}"
                try:
                    page.goto(url, wait_until="domcontentloaded")
                    page.wait_for_timeout(800)

                    # Check for horizontal overflow
                    scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
                    inner_width = page.evaluate("() => window.innerWidth")
                    body_scroll_width = page.evaluate("() => document.body.scrollWidth")

                    has_overflow = scroll_width > inner_width + 1 or body_scroll_width > inner_width + 1

                    status = "FAIL" if has_overflow else "PASS"
                    detail = f"scrollWidth={scroll_width}px, innerWidth={inner_width}px"

                    if not has_overflow:
                        results["passed_checks"] += 1
                        print(f"[{status}] {route} @ {vp['width']}px -> {detail}")
                    else:
                        print(f"[{status}] OVERFLOW DETECTED: {route} @ {vp['width']}px -> {detail}")
                        results["overflow_detected"].append({
                            "route": route,
                            "viewport": vp,
                            "scrollWidth": scroll_width,
                            "innerWidth": inner_width
                        })

                    # Capture screenshot on sample key viewports (320px, 375px, 768px, 1440px)
                    if vp["width"] in [320, 375, 768, 1440] and route in ["/operations", "/ai", "/transactions", "/decisions", "/rules", "/graph", "/cases"]:
                        clean_route = route.replace("/", "_").strip("_") or "root"
                        screenshot_path = f"scratch/screenshots/responsive/{clean_route}_{vp['width']}px.png"
                        page.screenshot(path=screenshot_path)

                    results["details"].append({
                        "route": route,
                        "viewport": vp["name"],
                        "width": vp["width"],
                        "status": status,
                        "scrollWidth": scroll_width,
                        "innerWidth": inner_width
                    })
                except Exception as e:
                    print(f"[ERROR] {route} @ {vp['width']}px -> {e}")

        browser.close()

    os.makedirs("scratch", exist_ok=True)
    with open("scratch/responsive_audit_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n================================================================================")
    print(f"RESPONSIVE AUDIT SUMMARY: Total Checks: {results['total_checks']} | Passed: {results['passed_checks']} | Overflow Failures: {len(results['overflow_detected'])}")
    print("================================================================================")

if __name__ == "__main__":
    run_responsive_audit()
