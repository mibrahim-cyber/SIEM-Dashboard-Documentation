﻿# API client

Fetch wrapper: sends session cookies, attaches CSRF header on POST/PUT/DELETE.

A thin wrapper around `fetch` sets credentials so the session cookie rides along, and reads the CSRF cookie to add the `X-CSRF-Token` header on any write. It centralizes the base path so calls hit `/api` and go through the Vite proxy in development. A non-2xx response throws, so callers handle errors in one place instead of checking status codes everywhere.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
