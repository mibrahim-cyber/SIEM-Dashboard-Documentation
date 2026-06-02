﻿# Performance notes

For a single-node demo the bottlenecks are modest. SQLite in WAL mode handles the read-during-write load of the live feed without locking, and the detection engine runs per event in memory, so the real limit is how fast the browser renders the feed. The threat cache keeps repeated lookups off the network. None of this is tuned for production scale, and it doesn't need to be.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/pipeline-health/INDEX.md)
