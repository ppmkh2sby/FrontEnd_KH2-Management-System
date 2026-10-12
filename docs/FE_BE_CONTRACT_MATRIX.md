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

Known BE discrepancy: enrollment `isEnrolled` may be true before five embeddings exist. FE requires `status === "Active" && sampleCount === 5` before showing a completed enrollment. This has not been validated against a running BE.
