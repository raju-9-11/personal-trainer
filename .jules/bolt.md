## 2025-05-22 - Artificial Delays Persist & Missing Code Splitting
**Learning:** The memory stated that artificial boot delays were removed and code splitting was implemented, but codebase analysis revealed the delays (2000ms in `App.tsx`, 1500ms in `TrainerPageContent.tsx`) were still present and `App.tsx` used static imports.
**Action:** Always verify "known" state against the actual codebase. Trust the code, not the memory. When removing features like artificial delays, ensure they are removed from all layers (App shell and inner content).
