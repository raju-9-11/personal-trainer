## 2026-01-29 - Artificial Boot Delays
**Learning:** The codebase contained explicit `setTimeout` delays (2000ms in App, 1500ms in TrainerPage) to "simulate enterprise-level boot". These were major contributors to poor LCP/FCP.
**Action:** Always check for artificial delays in `useEffect` when auditing performance. Removing them yielded instant 3-4s gain.
