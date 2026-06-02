﻿# Threat quota cache

In-memory cache of AbuseIPDB daily quota so repeated lookups do not burn the API allowance.

The free AbuseIPDB tier has a daily cap, so the server keeps a small in-memory LRU cache (up to 200 entries) of recent results for about five minutes. A repeat lookup on the same IP returns the cached verdict instead of spending another request. The cache is per-process and clears on restart, which is fine for a lab where the quota resets daily anyway. When a confidence score crosses 75, the SOAR auto-watchlist reuses the same result.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
