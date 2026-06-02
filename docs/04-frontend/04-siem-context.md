﻿# SIEM context

`SiemContext`: logs, alerts, `DetectionEngine` instance, and the `processLogs()` pipeline.

`SiemContext` is the app's single store. It keeps the log buffer, the alerts and incidents, and a long-lived `DetectionEngine` instance held in a ref so it survives re-renders. Components read what they need straight from the context instead of threading props down through the shell. New logs come in through `processLogs()`, which is what keeps every view looking at the same data.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
