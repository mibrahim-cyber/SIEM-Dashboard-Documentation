﻿# Bcrypt cost

bcrypt cost factor for password hashing and the dev-vs-prod performance tradeoff.

Passwords are hashed with bcrypt at cost 12, which takes a noticeable fraction of a second per hash on typical hardware. That delay is the point: it makes offline guessing expensive while staying fast enough that a real login doesn't feel slow. The cost is a single number, so it can be raised later as machines get faster without touching the rest of the auth code.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
