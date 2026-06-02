﻿# Threat API keys

The AbuseIPDB and VirusTotal lookups need API keys, and both have free tiers that are plenty for a lab. Add the keys through the environment or the settings screen; they're stored encrypted in the database and only ever used server-side, so they never reach the browser. If no key is set, threat lookups degrade quietly instead of erroring. Watch the free-tier daily caps, which is why results are cached.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/pipeline-health/INDEX.md)
