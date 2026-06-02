﻿# Frontend/backend split

React SPA on port 5173; Express API on 3001. Vite proxies `/api` during development. Production serves the built SPA from Express.

The split keeps a clean line between what the browser is allowed to know and what it isn't. React holds all view state in context and reaches the server only through `/api`, while Express owns the database, the sessions, the detection engine, and the only keys for the external threat services. In development the two run as separate processes and Vite forwards `/api` to 3001. In production the same Express process also serves the compiled bundle, so there is one origin and the session cookie works without extra setup.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/02-ingestion-pipeline-end-to-end.md)
