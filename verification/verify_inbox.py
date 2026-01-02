from playwright.sync_api import sync_playwright

def verify_inbox(page):
    print("Navigating to login...")
    page.goto('http://localhost:5173/admin/login')

    # Wait for login page
    print("Waiting for login inputs...")
    page.wait_for_selector('input[type="email"]', timeout=10000)
    page.fill('input[type="email"]', 'admin@admin.com')
    page.fill('input[type="password"]', 'password')
    print("Clicking submit...")
    page.click('button[type="submit"]')

    # Wait for dashboard
    print("Waiting for dashboard...")
    page.wait_for_selector('text=Trainer Dashboard', timeout=10000)

    # Check for Inbox Tab
    print("Clicking messages tab...")
    page.click('button[value="messages"]')

    # Check for "Inbox" text
    print("Waiting for Inbox content...")
    page.wait_for_selector('text=Inbox')

    print("Taking screenshot...")
    page.screenshot(path='verification/inbox.png')

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_inbox(page)
            print("Done.")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='verification/error.png')
        finally:
            browser.close()
