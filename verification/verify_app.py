from playwright.sync_api import sync_playwright

def verify_trainer_platform():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Home Page (Directory)
        print("Navigating to Home Page...")
        page.goto("http://localhost:3000")
        page.wait_for_selector('text="FIND YOUR TITAN"')
        page.screenshot(path="verification/home_page.png")
        print("Home Page Screenshot Taken.")

        # 2. Verify Trainer 1 Page
        print("Navigating to Trainer 1 Page...")
        page.goto("http://localhost:3000/trainer1")
        page.wait_for_selector('text="Alex \'The Forge\' Titan"')
        page.screenshot(path="verification/trainer1_page.png")
        print("Trainer 1 Page Screenshot Taken.")

        # 3. Verify Test Trainer Page
        print("Navigating to Test Trainer Page...")
        page.goto("http://localhost:3000/testtrainer")
        page.wait_for_selector('text="Jordan \'The Jet\' Speed"')
        page.screenshot(path="verification/testtrainer_page.png")
        print("Test Trainer Page Screenshot Taken.")

        # 4. Verify Admin Login
        print("Navigating to Admin Login...")
        page.goto("http://localhost:3000/admin/login")
        page.wait_for_selector('text="Trainer Portal"')
        page.screenshot(path="verification/admin_login.png")
        print("Admin Login Screenshot Taken.")

        browser.close()

if __name__ == "__main__":
    verify_trainer_platform()
