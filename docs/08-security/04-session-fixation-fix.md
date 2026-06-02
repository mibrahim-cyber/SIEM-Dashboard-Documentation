﻿# Session fixation fix

Session fixation is the trick where an attacker plants a known session id on a victim and waits for them to log in under it. The fix is one call in the right place: `req.session.regenerate()` runs right after a successful login, so the id the user ends up authenticated under is brand new and any pre-login id is thrown away. The cookie is also http-only and scoped so page script can't read it. Small change, whole class of hijacking closed.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
