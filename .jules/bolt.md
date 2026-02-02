## 2024-05-22 - Artificial Delays Found
**Learning:** The codebase contained artificial `setTimeout` delays (2s in App.tsx, 1.5s in TrainerPageContent.tsx) explicitly simulating "enterprise boot sequence". This drastically hurt LCP/FCP.
**Action:** Always check for `setTimeout` used for "simulated loading" in early optimization passes. Real performance > Simulated "smoothness".
