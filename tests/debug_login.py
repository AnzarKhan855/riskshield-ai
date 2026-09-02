from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000/login")
    page.fill("input[type='email']", "admin@riskshield.ai")
    page.fill("input[type='password']", "Password123!")
    page.click("button[type='submit']")
    page.wait_for_timeout(3000)
    print("Current URL:", page.url)
    print("HTML:", page.content()[:500])
    page.screenshot(path="scratch/login_debug.png")
    browser.close()
