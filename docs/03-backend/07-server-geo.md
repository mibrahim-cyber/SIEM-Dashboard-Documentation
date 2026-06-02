﻿# Server GEO

`server/geo.js`: MaxMind GeoLite2 lookups for IP enrichment on ingest.

`server/geo.js` resolves source IPs to a country and city using MaxMind's GeoLite2 database, read from the path in `GEOIP_PATH`. The database loads lazily on first use, so startup doesn't pay for it when no geo lookup happens. Private and reserved addresses are skipped because they won't resolve. The enrichment runs during ingest, so the GeoMap already has coordinates without a live lookup per alert.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
