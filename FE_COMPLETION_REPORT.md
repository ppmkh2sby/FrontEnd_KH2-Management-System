# Frontend Remediation Completion Report

## Implemented

- Login now routes directly to `/dashboard` unless `mustChangePassword` is true; email state remains truthful but is no longer an access gate.
- Added `GET /api/v1/wali/me/children` client DTO and per-authenticated-Wali session selection.
- Added Wali Kafarah navigation and route. Presensi, Kafarah, and Log use the selected authorized `santriId`; Progress uses the selected child's authorized `santriCode` (`nis`).
- Replaced staff attendance static values with the authorized Presensi list, staff log empty placeholder with the authorized log read, and staff total Santri zero with the authorized Santri list count.
- Sidebar expanded state and scroll position are namespaced by authenticated user and role in session storage.
- Removed viewport-driven 90-degree camera rotation and switched enrollment preview to `object-contain`; transmitted captures remain unmirrored.
- Added source-contract tests and the contract, role UX, camera, and asset audit documents.

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed, 3 source-contract tests.
- `npm run build`: passed (Vite production build).
- `git diff --check`: passed.

## Known limits / release status

- No real browser, mobile device, backend runtime, database, or biometric staging test was available. Those scenarios are **not verified**.
- Wali detailed reads depend on backend authorization at every guarded endpoint; no client-side filtering of broad child data is implemented.
- Biometric production remains blocked pending the separate model/license/calibration/security approval gate.
- Deployment and rollback require the approved immutable frontend artifact workflow; no deployment, DNS, database, or biometric activation was performed.
