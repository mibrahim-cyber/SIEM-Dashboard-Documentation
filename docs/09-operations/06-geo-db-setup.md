﻿# GEO DB setup

IP geolocation needs MaxMind's GeoLite2 city database, which isn't shipped in the repo because of its license. Download it from MaxMind, drop the `.mmdb` file on disk, and point `GEOIP_PATH` at it. The server loads the file lazily on the first lookup, so a wrong path shows up the first time the GeoMap tries to resolve an IP rather than at startup. Without it, geo enrichment is skipped and the rest of the app runs fine.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/pipeline-health/INDEX.md)
