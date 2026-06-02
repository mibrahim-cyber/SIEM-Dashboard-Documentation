﻿# Session auth model

Cookie sessions (`siem.sid`), bcrypt login, CSRF on writes, role copied into session after auth.

Login checks the password against a bcrypt hash at cost 12 and, on success, calls `req.session.regenerate()` so a session id handed out before login can't be reused afterward. The session stores the user's role, and every write route reads that server-side role instead of trusting anything the client sends. Sessions persist in SQLite through connect-sqlite3, so restarting the server doesn't log everyone out. The CSRF token sits in the session and in a readable cookie, and writes have to send it back in the `X-CSRF-Token` header.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/04-rbac-roles.md)
