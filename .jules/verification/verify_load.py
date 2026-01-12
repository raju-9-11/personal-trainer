
from playwright.sync_api import sync_playwright
import time

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Start timing
        start_time = time.time()

        # Navigate to home
        page.goto("http://localhost:3000")

        # Wait for "Our Elite Coaches" to appear (content loaded)
        try:
            page.wait_for_selector("text=Our Elite Coaches", timeout=5000)
            end_time = time.time()

            load_time = end_time - start_time
            print(f"Time to interactive content: {load_time:.2f} seconds")

            # Take screenshot
            page.screenshot(path=".jules/verification/home_loaded.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path=".jules/verification/error.png")

        browser.close()

if __name__ == "__main__":
    verify_app_loads()
