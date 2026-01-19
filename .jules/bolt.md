## 2024-05-23 - Removed Artificial Delays and Implemented Code Splitting
**Learning:** The application had artificial delays (`setTimeout`) in the boot sequence and data fetching, likely for "effect". Removing these directly improves TTI. Combined with `React.lazy` for route-based code splitting, we see a significant reduction in the main bundle size (main chunk is still large ~800kb, but pages are split).
**Action:** Always check for artificial delays in "boot" sequences or "loading" effects. Route-based code splitting is low-hanging fruit for SPA performance.
