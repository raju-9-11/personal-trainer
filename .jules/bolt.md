## 2025-02-23 - Artificial Delays Removed
**Learning:** The application had artificial delays (2000ms in `App.tsx` and 1500ms in `TrainerPageContent.tsx`) to simulate "enterprise boot sequences". This significantly hurt LCP and FCP without adding real value.
**Action:** Always verify if a "loading" state is waiting for actual data or just a timer. Removed these timers to let the app load as fast as possible. "Speed is a feature".
