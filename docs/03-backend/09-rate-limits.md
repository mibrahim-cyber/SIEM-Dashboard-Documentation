﻿# Rate limits

Per-route limits on auth attempts, general API traffic, geo lookups, and log ingest volume.

Login is capped at 5 attempts per 15 minutes per IP to slow brute force, and threat lookups are held to 20 per minute per session to protect the external quota. General API traffic and ingest volume have their own looser ceilings. The limits are per route rather than global, so heavy ingest doesn't lock someone out of logging in. Crossing a limit returns a 429 instead of silently dropping the request.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
