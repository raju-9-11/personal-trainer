## 2024-05-22 - Artificial Delays as "Features"
**Learning:** This codebase utilized artificial `setTimeout` delays (1.5s - 2s) in `App.tsx` and `TrainerPageContent.tsx` to simulate a "boot sequence" or "loading" state. This purely aesthetic choice significantly degraded LCP and FCP.
**Action:** Always check for `setTimeout` usage in top-level components when diagnosing slow initial loads. "Speed is a feature" means removing fake loading states.
