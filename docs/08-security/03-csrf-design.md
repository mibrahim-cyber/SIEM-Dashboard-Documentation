﻿# CSRF token flow

Writes are protected with a double-submit token. On login the server stores a CSRF token in the session and also sets it in a cookie the page can read; every mutating request has to echo it back in the `X-CSRF-Token` header. The server compares the header to the session value and rejects the request when they don't match. A malicious cross-site page can make the browser send the cookie but can't read it to set the header, so the forged request fails. Read-only requests skip the check since they don't change state.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
