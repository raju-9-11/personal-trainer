import time
from playwright.sync_api import sync_playwright

def verify_load():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Test 1: Home Page
        page = browser.new_page()
        start_time = time.time()
        print(f"Navigating to Home Page (http://localhost:5173)...")
        page.goto("http://localhost:5173")

        print("Waiting for 'UNLEASH YOUR POTENTIAL' text...")
        try:
            page.wait_for_selector("text=UNLEASH YOUR POTENTIAL", timeout=5000)
            end_time = time.time()
            load_time = end_time - start_time
            print(f"HOME PAGE SUCCESS: Loaded in {load_time:.2f} seconds.")
        except Exception as e:
            print(f"HOME PAGE FAILED: {e}")
            page.screenshot(path="home_error.png")

        # Test 2: Trainer Page
        print("\nNavigating to Trainer Page (http://localhost:5173/t/bolt)...")
        start_time = time.time()
        page.goto("http://localhost:5173/t/bolt")

        # Wait for something unique to Trainer Page content or failure to load fast
        # If loading takes 1.5s+, we failed.
        # We look for the absence of loading state or presence of Navbar
        try:
             # Wait for BootLoader to disappear or content to appear
             # "BootLoader" is not easily selectable by text, but we can wait for a nav link or similar.
             # The Navbar has links. Or we can wait for "HULK FITNESS" (default brand name) in title or text.
             # Let's wait for the Hero section or similar.
             # The Hero component usually has text.
             # Since 'bolt' likely doesn't exist, it might default.
             # But the 'loading' state should resolve quickly.
             page.wait_for_selector("nav", timeout=5000)
             end_time = time.time()
             load_time = end_time - start_time
             print(f"TRAINER PAGE SUCCESS: Loaded in {load_time:.2f} seconds.")

             if load_time > 1.5:
                print("WARNING: Trainer Page load time > 1.5s.")
             else:
                print("PERFORMANCE: Trainer Page load time is excellent.")

             page.screenshot(path="success.png")

        except Exception as e:
            print(f"TRAINER PAGE FAILED: {e}")
            page.screenshot(path="trainer_error.png")

        browser.close()

if __name__ == "__main__":
    verify_load()
