﻿# Audit logging

Server-side audit trail written on security-sensitive mutations (`writeAudit` in `server/db.js`).

Anything that changes security-relevant state, like blocking an IP, editing a rule, or managing users, writes a row through `writeAudit`. Each entry records the actor, the action, and the time, so there's a server-side trail the client can't rewrite. Read-only views aren't logged, which keeps the table focused on changes that actually matter. The audit log is one of the tables included in the database backup.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
