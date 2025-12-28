from playwright.sync_api import sync_playwright

def verify_trainer_platform():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Home Page (Directory)
        print("Navigating to Home Page...")
        page.goto("http://localhost:3000", timeout=60000)
        # Wait for any h1 to ensure render
        page.wait_for_selector('h1', timeout=60000)
        page.screenshot(path="verification/home_page.png")
        print("Home Page Screenshot Taken.")

        # 2. Verify Trainer 1 Page
        print("Navigating to Trainer 1 Page...")
        page.goto("http://localhost:3000/trainer1", timeout=60000)
        page.wait_for_selector('h1', timeout=60000)
        page.screenshot(path="verification/trainer1_page.png")
        print("Trainer 1 Page Screenshot Taken.")

        # 3. Verify Admin Login
        print("Navigating to Admin Login...")
        page.goto("http://localhost:3000/admin/login", timeout=60000)
        page.wait_for_selector('input[type="email"]', timeout=60000)
        page.screenshot(path="verification/admin_login.png")
        print("Admin Login Screenshot Taken.")

        browser.close()

if __name__ == "__main__":
    verify_trainer_platform()
