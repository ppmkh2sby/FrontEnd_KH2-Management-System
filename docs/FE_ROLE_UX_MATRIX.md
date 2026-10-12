# FE Role UX Matrix

| Role | UI scope | Write boundary |
|---|---|---|
| Admin | Administrative navigation | Backend policy only |
| Pengurus / DewanGuru | Monitoring pages | Backend policy only |
| Santri | Own dashboard, enrollment and self verification | Backend owns authorization |
| WaliSantri | Linked children from `/wali/me/children`; selection session-scoped by authenticated user | Read-only; no client-side cross-child filtering |

Wali detailed records remain unavailable rather than fabricated or fetched broadly until BE freezes the selected-child read contract.
