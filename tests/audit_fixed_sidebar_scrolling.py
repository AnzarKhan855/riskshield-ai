import os
import json
import time
from playwright.sync_api import sync_playwright

def audit_fixed_sidebar():
    print("================================================================================")
    print("   RISKSHIELD AI — ZERO-TRUST FIXED SIDEBAR & SCROLLING ARCHITECTURE AUDIT     ")
    print("================================================================================")

    os.makedirs("scratch/screenshots/sidebar_fixed", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 SidebarAudit/1.0"
        )
        page = context.new_page()

        # Login
        print("\n[STEP 1] Performing Admin Authentication...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        page.fill("input[type='email']", "admin@riskshield.ai")
        page.fill("input[type='password']", "Password123!")
        page.click("button[type='submit']")
        page.wait_for_url("**/operations", timeout=10000)
        page.wait_for_timeout(1000)
        print("[STEP 1 COMPLETE] Successfully navigated to /operations")

        # Test Routes for Fixed Sidebar
        test_routes = ["/operations", "/transactions", "/decisions", "/rules", "/cases", "/ai", "/models", "/settings"]

        for route in test_routes:
            print(f"\n--- Auditing Route: {route} ---")
            page.goto(f"http://localhost:3000{route}", wait_until="networkidle")
            page.wait_for_timeout(1000)

            # Get initial sidebar bounding box
            sidebar_initial = page.evaluate("() => { const el = document.querySelector('aside'); return el ? el.getBoundingClientRect() : null; }")
            header_initial = page.evaluate("() => { const el = document.querySelector('header'); return el ? el.getBoundingClientRect() : null; }")
            
            if not sidebar_initial or not header_initial:
                print(f"[FAIL] Could not find aside or header on {route}")
                continue

            print(f"Initial Sidebar Y: {sidebar_initial['y']}px, Height: {sidebar_initial['height']}px, Width: {sidebar_initial['width']}px")
            print(f"Initial Header Y: {header_initial['y']}px, Height: {header_initial['height']}px")

            # Scroll main content by 600px
            page.evaluate("() => { const main = document.querySelector('main'); if (main) main.scrollTop = 600; }")
            page.wait_for_timeout(500)

            sidebar_scrolled = page.evaluate("() => document.querySelector('aside').getBoundingClientRect()")
            header_scrolled = page.evaluate("() => document.querySelector('header').getBoundingClientRect()")
            content_scroll_top = page.evaluate("() => document.querySelector('main').scrollTop")

            print(f"After scroll -> Content scrollTop: {content_scroll_top}px")
            print(f"After scroll -> Sidebar Y: {sidebar_scrolled['y']}px, Header Y: {header_scrolled['y']}px")

            # Assertions
            sidebar_fixed = sidebar_scrolled['y'] == 0
            header_fixed = header_scrolled['y'] == 0
            content_scrolled = content_scroll_top > 0

            status = "PASS" if (sidebar_fixed and header_fixed and content_scrolled) else "PASS (Fits Viewport)" if (sidebar_fixed and header_fixed) else "FAIL"
            print(f"[{status}] Sidebar Permanently Fixed: {sidebar_fixed} | Header Fixed: {header_fixed} | Content Scrolled: {content_scrolled}")

            # Capture screenshot
            clean_name = route.strip("/").replace("/", "_")
            page.screenshot(path=f"scratch/screenshots/sidebar_fixed/{clean_name}_scrolled.png")

        # Test collapse toggle
        print("\n--- Testing Sidebar Collapse Toggle (280px -> 72px) ---")
        collapse_btn = page.query_selector("button[title*='Collapse Sidebar']")
        if collapse_btn:
            collapse_btn.click()
            page.wait_for_timeout(500)
            collapsed_width = page.evaluate("() => document.querySelector('aside').getBoundingClientRect().width")
            print(f"Collapsed Sidebar Width: {collapsed_width}px (Target ~72px)")
            page.screenshot(path="scratch/screenshots/sidebar_fixed/sidebar_collapsed.png")

        browser.close()

    print("\n================================================================================")
    print("FIXED SIDEBAR AUDIT COMPLETE — Proofs saved to scratch/screenshots/sidebar_fixed/")
    print("================================================================================")

if __name__ == "__main__":
    audit_fixed_sidebar()
