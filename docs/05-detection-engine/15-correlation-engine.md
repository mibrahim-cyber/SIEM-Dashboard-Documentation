﻿# Correlation engine

The correlation engine sits downstream of the rules, in `correlationEngine.js`. As alerts arrive it buckets them by source IP and keeps each bucket open for a 60-second window; alerts from the same IP inside that window get tied into one correlated group. That's what turns a brute-force burst followed by a SQL injection from the same host into a single incident an analyst can read top to bottom, instead of a wall of unrelated rows. The window stays short on purpose, so unrelated activity from a shared address an hour later doesn't get stapled onto an old group.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
