﻿# Watchlist-only enforcement

The SOAR side can add an IP to the block watchlist automatically, but only the watchlist. It can't reach out to change a firewall or touch anything outside the app, which stops an automated decision from doing real-world damage on a false positive. The auto-add only fires when a threat lookup comes back above a confidence score of 75. From there a human still decides what to do with the watchlisted entry.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
