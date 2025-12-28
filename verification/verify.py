from playwright.sync_api import sync_playwright

def verify_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to homepage
            page.goto("http://localhost:3000")
            page.wait_for_timeout(3000) # Wait for hydration/loading

            # Check for title
            page.screenshot(path="verification/homepage.png")
            print("Homepage screenshot taken")

            # Navigate to Admin Login
            page.goto("http://localhost:3000/admin/login")
            page.wait_for_selector("text=Trainer Portal")
            page.screenshot(path="verification/admin_login.png")
            print("Admin Login screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_homepage()
