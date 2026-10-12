# Gate 2 Frontend Browser Tests

The default suite uses Playwright Chromium (desktop and Pixel 7 emulation) with deterministic **mocked backend HTTP**. It tests browser interactions and request shape; it does **not** prove Backend/PostgreSQL integration or physical camera behavior.

```powershell
npm ci
npx playwright install chromium
npm run test:e2e
```

`npm test` remains the fast source-contract suite. Playwright traces/screenshots on failure are written to ignored `test-results/`, and the HTML report to ignored `playwright-report/`. Tests use synthetic names, tokens, and generated color images only.

The opt-in real suite is guarded. Provision an isolated disposable PostgreSQL 16 + pgvector stack and a locally served FE configured to call that local BE, with seeded synthetic accounts for all five roles (Wali account linked to at least two children). Never point these tests at staging/production or put passwords in files or shell history. Set `KH2_E2E_DISPOSABLE=1`, `KH2_E2E_REAL_BASE_URL` to the **localhost FE origin**, and `KH2_E2E_REAL_ACCOUNTS_JSON` in a secure process environment with the five `{identity,password}` entries, then run `npm run test:e2e:real`. The real config rejects non-local URLs. The suite does not enroll real biometrics or seed the database itself.

Actual Android/iPhone/desktop-webcam QA remains a separate physical-device checklist: portrait and landscape framing, no excessive crop, mirrored preview versus natural saved frame, permission denied/retry/fallback, enrollment five-photo refresh, and a fresh self-verification photo. Never use personal face images or production credentials in test artifacts.
