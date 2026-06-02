﻿# Server validate

`server/validate.js`: whitelist validation for POST bodies (alerts, watchlist, SOAR log entries).

`server/validate.js` checks incoming POST bodies against an explicit list of expected fields and types, and rejects anything else rather than trying to clean it up. That covers alert updates, watchlist entries, and SOAR log writes. Whitelisting instead of blacklisting means a field nobody anticipated can't slip through, and it stops malformed input before it reaches the database layer.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
