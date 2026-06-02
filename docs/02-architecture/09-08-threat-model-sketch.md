﻿# Threat model sketch

STRIDE-oriented trust boundaries: browser, API, SQLite, external threat and geo services.

The browser is treated as untrusted, so authorization and input validation happen on the server rather than in the SPA. The API is the main boundary: it owns the session store, the bcrypt check, and the only credentials for the external services. SQLite sits behind the API and is never reachable directly. Outbound calls to AbuseIPDB, VirusTotal, and the GeoLite2 database are kept isolated so a slow or failing third party degrades one lookup instead of the whole app. Each detection rule maps to a STRIDE category, which is how this sketch ties back to the rules engine.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
