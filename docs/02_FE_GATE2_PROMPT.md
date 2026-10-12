# KH2 GATE 2 — Frontend Agent: Five-Role Browser E2E

You are **Lead React/TypeScript Engineer, Browser Automation QA, Accessibility Engineer and API Integration Specialist**.

**Working directory:** `FrontEnd_KH2-Management-System` only. Read `../KH2_Gate2_Parallel_Agents/00_GATE2_SHARED_PROTOCOL.md`, existing remediation documents if available, FE role/contract matrices, and read-only Backend `docs/BE_API_MATRIX.md` and `docs/agent-handoff/BE_CONTRACT_HANDOFF.md`. Backend and Face are read-only.

## Mandatory Graphify

- `git status --short`, HEAD; read `AGENTS.md`; `graphify --help`, `graphify update .`; explain impacted modules (`AppRouter`, `AppShell`, `useWaliSelectedChild`, `WaliOverviewView`, API client, FaceEnrollment) using only supported Graphify commands.
- Query impact before changes; refresh Graphify after major edits and at completion; report graph nodes/edges, commands and affected dependencies. Do not assert Graphify success without logs.

## Priority 0 — Real tests, not source-regex-only

At historical HEAD `7476b56c04ea84cb4bdb070a9c8020e5f5f62362`, Node 20/22 builds passed; code already fetches Wali child data. Existing tests largely inspect source strings. Keep those tests but ADD meaningful browser E2E/interaction tests. Check latest HEAD first and preserve work.

## Implementation sequence

**A. API contract alignment.** Verify every FE request method, field, content type, query, response DTO/status, token handling and error state against BE's source of truth. Do not invent endpoints or silently fallback to fabricated data. Record mismatches for BE owner and continue independent tasks.

**B. Browser E2E harness.** Implement a maintainable test harness (e.g. Playwright, if repo setup permits). Split two honest layers: deterministic mocked-network UI tests for quick regression, and opt-in genuine HTTP integration against BE + disposable PostgreSQL seeded accounts. Label reports accordingly; mocks never count as real BE–FE integration. Keep passwords/seeded tokens/test images out of repo; use non-sensitive synthetic fixtures.

**C. Five-role journeys.** Test Admin, Pengurus, DewanGuru, Santri and Wali: login→dashboard; optional email does not block, mustChangePassword preserved; expired/invalid JWT goes to safe auth state; staff sees permitted Santri list and real stats, Santri sees own, Wali sees only related children. Verify Wali A with 2 children switching A1→A2 updates Dashboard, Presensi, Kafarah, Progress and Log without mixing prior-child records; refresh/back/forward and a second Wali B prove isolation. Ensure loading/empty/403/404/5xx states are explicit. Check pagination totals and filters.

**D. Sidebar and assets.** Browser tests with scroll-to-bottom→navigate→scroll position preserved, expansion and active route remain accurate, desktop fixed layout and mobile drawer Escape/back behavior. Asset smoke checks for logo/images/routes (HTTP 200, MIME and no broken `img`), not only path existence. Preserve original logo.

**E. Face UI and camera.** Test enrollment route and role restrictions, 5 sample UI state, backend active-five-sample status after refresh, self-verify using a FRESH photo and `photo` field, prevent any browser call to Face Service or trusted-device endpoint. Browser mock unit/UI tests for media permission denied/unsupported/retry, portrait/landscape camera constraints, full-frame capture (no forced crop), preview/result correspondence. Actual Android/iPhone/desktop camera tests require real devices; provide checklist and mark BLOCKED if unavailable. No storing raw face images/embeddings in storage/logs.

**F. Real integration and reporting.** If BE integration environment available, run authenticated browser E2E against its disposable seeded DB, record verified actual cases/results. If not available, mark `BE_FE_RUNTIME=BLOCKED_ENV`; do not assert success from mock tests. Run `npm run typecheck`, `npm test`, `npm run build`, browser suite, Graphify final refresh and `git diff --check`. Never deploy, change BE or Face or push without consent.

## Deliverable

Write `docs/agent-handoff/FE_GATE2_HANDOFF.md` summarizing Graphify evidence, source changes, screenshot/test artifacts without personal data, five-role x feature matrix, user/child isolation scenarios, real vs mock E2E evidence, contract drift and status `FE_COMPONENT`, `BROWSER_E2E_MOCK`, `BE_FE_RUNTIME`, `PHYSICAL_CAMERA`, `GATE2_FE_READY` (PASS/FAIL/BLOCKED). Output reproducible commands/README for full authenticated suite.

**Start implementation now; FE folder only.**
