﻿# Middleware stack

Middleware order in Express: Helmet, CORS, rate limiters, session, JSON parser, then routes.

Order matters here. Helmet sets the security headers first, CORS runs before anything reads the body, and the rate limiters sit ahead of the session lookup so a flood of requests gets dropped cheaply. The session middleware loads the user before any route runs, and the JSON parser comes last so handlers receive a parsed body. By the time a route handler sees a request, it has already cleared every security check.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
