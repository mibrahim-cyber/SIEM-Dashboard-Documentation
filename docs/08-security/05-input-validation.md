﻿# Input validation

Every POST body is validated on the server against an explicit whitelist of expected fields and types; anything unexpected is rejected rather than cleaned up. That covers ingest payloads, alert updates, watchlist entries, and SOAR log writes. Whitelisting beats trying to strip bad input, because you only have to describe the valid shape instead of predicting every malformed one. Validation runs before the data reaches the database layer.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
