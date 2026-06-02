﻿# SQLITE WAL

WAL mode on `siem.db`: concurrent reads during writes, typical for local demo workloads.

The database runs in write-ahead logging mode, so reads don't block while a write is in progress. In practice that means the live feed can keep querying alerts while ingest writes new ones, without lock contention stalling the UI. WAL also makes writes a little faster, since they append to a log first and a periodic checkpoint folds them back into the main file.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
