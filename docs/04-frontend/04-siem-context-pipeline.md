﻿# processLogs pipeline

This is the path a batch of logs takes once it's in the browser. `processLogs()` runs the raw entries through the active parsers, normalizes them, then feeds each event to the `DetectionEngine`. Rules that match produce alerts, correlation groups them by source IP, and dedup drops the repeats before the results land in `SiemContext` for the views to read. It works the same way for the live mock feed and for a simulated campaign.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
