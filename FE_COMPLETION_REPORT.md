# Frontend Remediation Completion Report

Updated: 2026-10-12. Branch: `agent/face-attendance-deployment`.

## Implemented and audited

- Successful login routes to `/dashboard`, except when `mustChangePassword` is true. A real `/api/v1/auth/change-password` form now enforces that requirement and requires fresh login after success. No email-completion gate was reintroduced.
- Wali child selection is scoped per authenticated Wali and validated against `GET /api/v1/wali/me/children`. Dashboard, Presensi, Kafarah, Progress Keilmuan, and Log render API records for the selected authorized child with loading, empty, and error states. Progress uses the actual Wali detail DTO.
- Pengurus, Dewan Guru, and Admin dashboards use staff API responses for Santri total, Presensi, Quran/Hadits progress, and team Log. Staff progress and Log pages use backend search/filter/pagination. No staff dashboard metric uses the old role preset. Attendance rate is labeled as a sample of the latest 100 records.
- Sidebar saves expansion and scroll by user/role, restores scroll on route changes, and mobile drawer supports Escape. Desktop sidebar remains fixed.
- Enrollment reads backend state after POST/refresh; UI claims completion only for Active status and exactly five samples. Self-verification POSTs a new `photo` to BE, displays similarity, and does not create Presensi.
- Camera uses portrait-friendly mobile and landscape desktop constraints, `object-contain` preview, natural unmirrored capture, and full-frame submission without a forced portrait crop. Existing permission/retry/fallback handling remains.
- Existing brand assets were preserved; KH2 logo was not changed.

## Verification performed

- `npm run typecheck`: passed.
- `npm run build`: passed; Vite production output generated.
- `npm test`: source-contract tests passed. Gate 2 adds separate Playwright browser E2E with mocked backend responses; see `docs/agent-handoff/FE_GATE2_HANDOFF.md` for executed results.
- `git diff --check`: passed.
- No authenticated disposable backend/PostgreSQL, real webcam, or physical mobile device was available. Browser mock results are not live BE–FE integration evidence.

## Open backend and release blockers

- BE `GET /api/v1/face-profiles/me/enrollment` now checks the required embedding count in controller source; the earlier discrepancy is resolved at source level, but not runtime-verified.
- BE `docs/agent-handoff/BE_CONTRACT_HANDOFF.md` was available for the Gate 2 re-audit, alongside `docs/BE_API_MATRIX.md` and controller/DTO source.
- No live FE↔BE/staging validation or biometric production approval was performed. This is not deploy sign-off. No deploy, commit, push, or edits outside Frontend were performed.
