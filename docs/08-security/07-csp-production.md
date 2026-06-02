﻿# CSP production

In production the app ships a Content-Security-Policy header that names where scripts, styles, and connections are allowed to come from. The point is to blunt cross-site scripting: even if some markup slipped through, an injected script from an unlisted origin wouldn't be allowed to run. The dev build runs a looser policy so Vite's tooling works, and the strict one is served once the app is built. Helmet sets it alongside the other security headers.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
