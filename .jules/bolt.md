## 2025-02-19 - Artificial Boot Delays
**Learning:** The codebase contained artificial delays (setTimeout) of 2000ms in `App.tsx` and 1500ms in `TrainerPageContent.tsx` to simulate an "enterprise boot sequence". This is a major anti-pattern that directly hurts LCP (Largest Contentful Paint) and user experience.
**Action:** Always grep for `setTimeout` in the codebase to find potential artificial delays or inefficient polling mechanisms. Speed is a feature; never add artificial delays.
