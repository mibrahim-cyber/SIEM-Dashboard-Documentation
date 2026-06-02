﻿# Data flow diagram

Paths for log ingest, alert creation, threat lookup, and authentication. See [system overview](00-system-overview.md) for the ASCII diagram.

Logs enter through the ingestion endpoint, get parsed and sanitized, then run against the detection rules; a match writes an alert row and pushes it onto the live feed. Threat lookups travel from the browser to Express, which calls AbuseIPDB or VirusTotal server-side and caches the answer so repeat IPs don't burn quota. Authentication posts credentials to Express, which checks the bcrypt hash, regenerates the session, and copies the role in. The diagram lives in one place so the four paths don't drift out of sync as pages get edited.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/02-ingestion-pipeline-end-to-end.md)
