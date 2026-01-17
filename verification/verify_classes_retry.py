
from playwright.sync_api import sync_playwright

def verify_classes_component():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a desktop viewport
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:5173/")

            # Wait for content to load
            # The app has a boot delay.
            # And it might be failing data fetch.

            page.wait_for_timeout(3000)

            # Check if we are stuck on loading
            if page.get_by_text("Burpees don't like you either").is_visible():
                print("Stuck on boot loader. Data fetch likely failed.")
                page.screenshot(path="verification/boot_loader.png")
            else:
                print("Loaded home page.")
                page.screenshot(path="verification/home_loaded.png")

            # Try to navigate to a trainer page directly: /t/mock
            # Since I don't have real data, this might show 404 or empty profile.
            # But the 'Classes' component is inside 'TrainerPageContent'.

            print("Navigating to /t/mock...")
            page.goto("http://localhost:5173/t/mock")
            page.wait_for_timeout(3000)
            page.screenshot(path="verification/trainer_mock.png")

            # If I mocked the Classes data in the component, and if TrainerPage renders Classes even if profile is empty?
            # Likely not. TrainerPage probably checks if profile exists.

            # However, I can verify the Classes component works if I can get it to render.

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_classes_component()
