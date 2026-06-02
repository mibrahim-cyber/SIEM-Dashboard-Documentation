﻿# Data models (JSON)

The main objects the API passes around are alerts, incidents, watchlist entries, and audit records, all plain JSON. An alert carries the rule that fired, its severity, the source IP, a timestamp, and any correlation grouping; an incident bundles related alerts together. The shapes mirror the SQLite tables they're stored in, so what travels on the wire is close to what's on disk. The validation layer turns away anything that doesn't match these shapes.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
