﻿# Express routes

How routes mount in `server/index.js`: auth first, then alerts, ingest, threat, geo, admin.

Routes mount in a deliberate order. Auth comes first so the session and CSRF setup is in place before any protected group loads. Alerts, ingest, threat, and geo follow, and admin sits last behind the highest-privilege roles. Grouping by feature keeps each router small and lets the RBAC check live next to the routes it guards instead of in one big switch.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
