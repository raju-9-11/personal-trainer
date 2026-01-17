
from playwright.sync_api import sync_playwright

def verify_classes_component():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Navigating to /test-classes...")
            page.goto("http://localhost:5173/test-classes")

            # Wait for content to load
            page.wait_for_timeout(3000)

            print("Taking screenshot of classes...")
            page.screenshot(path="verification/test_classes.png")

            # Find class cards
            cards = page.locator(".bg-background\\/50")
            count = cards.count()
            print(f"Found {count} class cards.")

            if count > 0:
                 # Try to click "Book Class" on the first one
                 # The first one is "Power Yoga (TEST)"
                 button = cards.first.get_by_role("button", name="Book Class")
                 if button.is_visible():
                     print("Clicking Book Class button...")
                     button.click()
                     page.wait_for_timeout(500)
                     page.screenshot(path="verification/test_booking_modal.png")
                     print("Screenshot saved to verification/test_booking_modal.png")

                     # Verify modal content
                     if page.get_by_text("Book Power Yoga (TEST)").is_visible():
                         print("Modal opened correctly.")
                     else:
                         print("Modal might not have opened correctly.")
            else:
                print("No class cards found. Check selector or mock data.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_classes_component()
