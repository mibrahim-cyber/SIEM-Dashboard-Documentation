﻿# Production build path

`npm run build` writes to `dist/`; Express serves static assets and SPA fallback in production.

The build compiles the React app into hashed static files under `dist/`. In production Express serves those files directly and falls back to `index.html` for any path the SPA owns, so refreshing on a deep link still loads the right view. Because one server handles both the API and the static assets, the session cookie stays first-party and the dev proxy isn't needed.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
