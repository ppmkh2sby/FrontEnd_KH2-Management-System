# FE Camera Test Matrix

| Scenario | Automated coverage | Manual status |
|---|---|---|
| Desktop webcam | Build/typecheck only | Not run in this workspace |
| iOS Safari portrait / rotate | No emulator available | Not run; capture no longer applies a viewport-based 90-degree rotation |
| Chrome Android portrait | No device available | Not run; preview uses `object-contain` and output is unmirrored |
| File-camera fallback | Code review/build only | Not run |

`getUserMedia` constraints are hints. Runtime stream dimensions are logged only in development; no browser/device precision claim is made.
