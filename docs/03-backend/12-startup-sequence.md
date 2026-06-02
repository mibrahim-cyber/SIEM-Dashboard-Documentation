﻿# Startup sequence

Boot sequence: load env, validate secrets, init SQLite, seed dev users if allowed, listen on `PORT`.

Boot runs in a fixed order so failures show up early. It loads the environment, checks that the required secrets are present, opens and migrates the SQLite database, and seeds the demo users only when a dev flag allows it. Once that's done it binds to `PORT` and starts accepting requests. If secret validation fails, the process exits before the listener opens, so the server never comes up half-configured.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
