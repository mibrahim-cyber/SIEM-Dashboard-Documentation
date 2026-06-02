﻿# Rotating secrets

Secrets come from environment variables, so rotating one means changing the value and restarting the server, not editing code. `SESSION_SECRET` is the one to rotate on a schedule; changing it invalidates existing sessions and logs everyone out, so do it during a quiet window. The threat API keys rotate the same way whenever a provider issues new ones. The demo account passwords should be rotated or removed before any exposure beyond a local lab.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/pipeline-health/INDEX.md)
