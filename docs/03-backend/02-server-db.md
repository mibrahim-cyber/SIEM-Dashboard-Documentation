﻿# Database layer

`server/db.js` wraps the better-sqlite3 connection and exposes the prepared statements the rest of the server uses. It creates the tables on first run, seeds the demo users when that's allowed, and holds helpers like `writeAudit` for the audit trail. Because better-sqlite3 is synchronous, queries return directly with no callbacks or promises, which keeps the handler code short. Everything that touches the database goes through here instead of opening its own connection.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
