# Bolt's Journal

## 2024-05-23 - Artificial Boot Delays
**Learning:** This codebase contained significant artificial delays (`setTimeout` of 1.5s-2s) in `App.tsx` and `TrainerPageContent` to simulate "boot sequences". These were major bottlenecks for LCP.
**Action:** Always search for `setTimeout` usage in "loading" or "boot" components when diagnosing slow startups. Real loading states are better than fake ones.
