import time
from playwright.sync_api import sync_playwright, expect

def test_load_performance():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        start_time = time.time()
        print(f"Starting navigation at {start_time}")

        page.goto("http://localhost:5173/")

        # Wait for the "Browse Trainers" link to be visible, which is in the hero section.
        # This confirms the page has rendered the main content.
        browse_button = page.get_by_text("Browse Trainers")
        expect(browse_button).to_be_visible(timeout=5000) # Should be well under 5s, definitely under 2s now.

        end_time = time.time()
        duration = end_time - start_time
        print(f"Page loaded and interactive in {duration:.4f} seconds")

        if duration > 2.0:
             print("WARNING: Load time > 2.0s. Optimization might have failed or server is slow.")
        else:
             print("SUCCESS: Load time < 2.0s. Artificial delay removed.")

        page.screenshot(path="verification/home_page_loaded.png")
        print("Screenshot saved to verification/home_page_loaded.png")

        browser.close()

if __name__ == "__main__":
    test_load_performance()
