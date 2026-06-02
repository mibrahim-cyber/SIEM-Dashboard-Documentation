﻿# Rate limiting

Rate limits cap how often sensitive routes can be hit, so brute force and quota abuse stay expensive. Login allows 5 attempts per 15 minutes per IP, and threat lookups are held to 20 per minute per session to protect the external API allowance. The limits are per route, so heavy ingest can't lock someone out of logging in, and crossing one returns a 429. They sit early in the middleware stack, so a blocked request costs almost nothing.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
