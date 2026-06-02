﻿# API surface map

REST endpoints grouped by auth, alerts, ingest, threat intel, and admin operations.

The auth group covers login, logout, and the `/api/state` call that hydrates the SPA on load. Alert routes read and update alerts and incidents; ingest accepts and validates log batches; threat-intel proxies the external lookups behind the server-side cache and rate limit. The admin routes for user and key management sit behind the tier3 and manager roles. Every route except login passes through the session and CSRF middleware before it runs.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
