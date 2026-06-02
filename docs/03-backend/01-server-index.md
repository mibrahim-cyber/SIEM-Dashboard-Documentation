﻿# Server entry point

`server/index.js` is the single entry for the API. It loads environment config, builds the middleware stack, mounts the route groups, and opens the SQLite connection before it listens on `PORT` (3001 by default). Most of the file is wiring; the actual handlers live in their own modules. Keeping bootstrap in one place makes the startup order easy to follow top to bottom.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
