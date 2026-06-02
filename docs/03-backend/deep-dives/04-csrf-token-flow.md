﻿# CSRF token flow

CSRF token issued on login, stored in session, required via `X-CSRF-Token` on mutating requests.

This is a double-submit setup. On login the server puts a CSRF token in the session and also sends it in a cookie the JavaScript can read. For any write, the client copies that value into the `X-CSRF-Token` header, and the server accepts the request only if the header matches the session token. A cross-site form can send the cookie automatically but can't read it to set the header, so the forged request fails the check.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
