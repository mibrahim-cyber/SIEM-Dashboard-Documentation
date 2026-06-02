﻿# Auth context

`AuthContext`: login state, CSRF token, and role used for client-side permission checks.

`AuthContext` holds whether someone is logged in, their role, and the CSRF token, and it exposes login and logout. The role drives client-side checks that hide controls a user can't use, but those are cosmetic; the server enforces the real permission on every write. On load it calls the bootstrap endpoint so a refresh doesn't drop the session.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
