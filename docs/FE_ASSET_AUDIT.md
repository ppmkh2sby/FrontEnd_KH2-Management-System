# FE Asset Audit

Static critical assets referenced by the React source are under `public/assets/images` and use `.webp` paths: logo, hero, and landing gallery. The source-contract test checks representative critical files. Nginx content type, cache headers, direct-refresh behavior, and browser network 404/CSP checks require a deployed or locally served environment and were not run here.
