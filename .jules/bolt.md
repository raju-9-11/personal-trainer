## 2024-05-23 - Artificial Delays
**Learning:** The codebase contained explicit `setTimeout` delays (1.5s - 2s) to simulate "boot sequences". This directly degrades User Experience and LCP/FCP metrics.
**Action:** Always check for `setTimeout` used for "simulation" or "animation" purposes that block main content rendering.
