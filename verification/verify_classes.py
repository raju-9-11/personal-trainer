
from playwright.sync_api import sync_playwright

def verify_classes_component():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Navigating to home page...")
            # Navigate to the home page (assuming it renders classes or we can navigate to where classes are)
            # The app likely uses a default trainer or listing on home page.
            page.goto("http://localhost:5173/")

            # Wait for content to load
            page.wait_for_load_state("networkidle")

            # Check if there is a "Classes" section or link
            # The section id is "classes" based on my code reading.
            # I'll try to scroll to it.

            print("Checking for Classes section...")
            classes_section = page.locator("#classes")

            if classes_section.count() > 0:
                print("Classes section found.")
                classes_section.scroll_into_view_if_needed()
                page.wait_for_timeout(1000) # Wait for animations
                page.screenshot(path="verification/classes_section.png")
                print("Screenshot saved to verification/classes_section.png")

                # Check if there are class cards
                cards = page.locator(".bg-background\\/50") # Based on class names I saw
                count = cards.count()
                print(f"Found {count} class cards.")

                if count > 0:
                     # Try to click "Book Class" on the first one
                     button = cards.first.get_by_role("button", name="Book Class")
                     if button.is_visible():
                         print("Clicking Book Class button...")
                         button.click()
                         page.wait_for_timeout(500)
                         page.screenshot(path="verification/booking_modal.png")
                         print("Screenshot saved to verification/booking_modal.png")
            else:
                print("Classes section NOT found on home page. Trying /trainer1 or similar if needed.")
                # Maybe the home page is a landing page without classes?
                # The memory says "The home page retrieves trainer data via getTrainers".
                # If I don't have data, I might not see classes.
                page.screenshot(path="verification/home_page.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_classes_component()
