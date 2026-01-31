## 2024-05-22 - Fix Unrelated Build Errors
**Learning:** Legacy code may contain build errors (e.g. duplicate variable declarations in `booking-modal.tsx`) that surface when running verification commands like `tsc`.
**Action:** Always run full project verification (`pnpm tsc`) before starting work to establish a baseline, or be prepared to fix existing blocking bugs.

## 2024-05-22 - Lockfile Hygiene
**Learning:** `pnpm install` may update `pnpm-lock.yaml` even if no packages are added.
**Action:** Revert `pnpm-lock.yaml` if not intentionally updating dependencies to avoid noise in PRs.
