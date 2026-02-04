## 2024-05-23 - Artificial Delays
**Learning:** The codebase contained `setTimeout` calls (2000ms and 1500ms) specifically added to simulate "enterprise boot sequences" and loading states. This pattern intentionally degrades LCP/FCP for aesthetic reasons (BootLoader).
**Action:** Always check for and remove `setTimeout` calls that serve no functional purpose other than slowing down the user experience. Speed is a feature; artificial waits are anti-patterns.
