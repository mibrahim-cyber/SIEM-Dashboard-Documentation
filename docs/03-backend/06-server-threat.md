﻿# Server threat

`server/threat.js`: AbuseIPDB proxy with quota tracking and rate limiting.

`server/threat.js` is the only code that talks to AbuseIPDB, so the API key never reaches the browser. It tracks the daily quota and rate-limits lookups to 20 per minute per session to stay inside the free allowance. Results are cached for a few minutes, so checking the same IP twice doesn't spend a second request. VirusTotal lookups go through the same path.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
