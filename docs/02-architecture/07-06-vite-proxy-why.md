﻿# Why Vite proxies `/api` in dev

Dev proxy keeps cookies same-origin and avoids extra CORS config while testing CSRF locally.

Without the proxy, the SPA on 5173 and the API on 3001 would be separate origins, so the session cookie would count as cross-site and the CSRF double-submit check would be a pain to exercise during development. Routing `/api` through Vite makes the browser treat both as one origin, which is also how they're served in production. So the auth and CSRF paths behave the same in dev as they do live, and there's no separate CORS branch to keep maintained.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
