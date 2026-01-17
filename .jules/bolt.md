## 2024-05-22 - Artificial Delays
**Learning:** Found explicit `setTimeout` delays (2000ms in App.tsx, 1500ms in TrainerPageContent) used to "simulate enterprise boot sequence". This indicates a legacy design choice prioritizing "cinematic" feel over actual performance.
**Action:** Always grep for `setTimeout` in new codebases to catch artificial latency. Real loading states (Suspense) are superior to fake ones.
