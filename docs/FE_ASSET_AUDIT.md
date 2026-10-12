# FE Asset Audit

All eight distinct `/assets/images/...` paths referenced by React source were checked against `public` on 2026-10-12: the unchanged KH2 logo, landing hero, three gallery images, and three feature PNGs (URL-decoded names with spaces). All files exist. The source-contract test also checks representative critical files. Nginx content type, cache headers, direct-refresh behavior, and browser network 404/CSP checks require a deployed or locally served environment and were not run here.
