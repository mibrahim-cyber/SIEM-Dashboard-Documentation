﻿# API endpoint reference

The endpoints group into auth, alerts and incidents, ingest, threat intel, geo, and admin. Auth covers login, logout, and the `/api/state` call that hydrates the SPA on load; the rest map closely to the modules that use them. Every route except login sits behind the session and CSRF middleware, and the admin routes also require the tier3 or manager role. The per-area backend pages cover the specific verbs and payloads.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
