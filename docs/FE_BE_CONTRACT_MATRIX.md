# FE–BE Contract Matrix

Status is based on the Phase 1 frozen paths; it is not evidence of a live staging run.

| Feature | FE route / DTO | BE endpoint | Status |
|---|---|---|---|
| Authentication | `LoginRequest`, `AuthMeResponse` | `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` | Implemented; dashboard direct unless `mustChangePassword` |
| Wali relations | `WaliChildrenResponse` | `GET /api/v1/wali/me/children` | Implemented in client; selection persists per Wali session |
| Santri face enrollment | `MyFaceEnrollmentStatus`, `FaceProfileEnrollmentResponse` | `GET/POST /api/v1/face-profiles/me/enrollment` | Frozen; POST supplies exactly five `photos` |
| Santri self verification | `SantriFaceVerificationResponse` | `POST /api/v1/face-profiles/me/verify` | Frozen; multipart field `photo`; no attendance endpoint used |
| Staff recognition | `FaceRecognitionResponse` | `POST /api/v1/face-recognition` | Staff-only UI; no browser Face Service access |
| Wali Presensi / Kafarah / Log | selected child `santriId` | Existing guarded reads with `santriId` | Implemented; server authorizes each request |
| Wali Progress | selected child `nis`; `ProgressKeilmuanDetailResponse` | `GET /api/v1/progress-keilmuan?santriCode=...` | Implemented; BE returns detail DTO and authorizes code relation |
| Staff/Admin progress | `ProgressKeilmuanStaffPageResponse` | `GET /api/v1/progress-keilmuan/staff` with category/filter/page | Implemented; server-side pagination |
| Staff/Admin log | `LogKeluarMasukListResponse` | `GET /api/v1/log-keluar-masuk?scope=team` | Implemented; `scope=team` required for staff overview |

No `VITE_*` Face Service secret, embedding, or device credential is used by the client.

Gate 2 source re-audit (2026-10-12): BE `SantriFaceProfileController.GetEnrollment` now computes `isEnrolled` from `sampleCount == RequiredEnrollmentSamples`; the prior source-level discrepancy is resolved. FE still defensively requires `status === "Active" && sampleCount === 5`. This has not been validated against a running BE/PostgreSQL instance.

`POST /api/v1/auth/change-password` accepts JSON `{ currentPassword, newPassword }` and returns `204`; FE now uses this route for mandatory password changes and requires a fresh login afterward because the existing JWT retains the old claim. `GET /api/v1/dashboard/santri/me` remains Santri-only; Wali no longer requests it.
