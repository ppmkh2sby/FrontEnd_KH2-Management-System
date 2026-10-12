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
| Wali Progress | selected child `nis` | `GET /api/v1/progress-keilmuan?santriCode=...` | Implemented; server authorizes code relation |

No `VITE_*` Face Service secret, embedding, or device credential is used by the client.
