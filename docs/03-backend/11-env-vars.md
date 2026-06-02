﻿# ENV vars

Environment variables: `SESSION_SECRET`, `CORS_ORIGIN`, threat keys, geo DB path, and production flags.

The server reads its secrets and environment-specific settings from environment variables instead of committing them. `SESSION_SECRET` signs the session cookie, `CORS_ORIGIN` pins the allowed origin in production, `GEOIP_PATH` points at the GeoLite2 file, and the threat keys hold the AbuseIPDB and VirusTotal credentials. Startup refuses to run when a required secret is missing, so a misconfigured deploy fails loudly rather than coming up insecure.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
