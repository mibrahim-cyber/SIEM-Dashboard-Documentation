﻿# IOC watchlist

HABIBI-SIEM exposes this capability under **Intelligence → IOC Watchlist**. Watchlist stores indicators analysts choose to emphasize on future alerts and SOAR checks.

## What you see on screen

Table of IPs with reason, added by, and timestamp. Add and remove flows respect RBAC tiers.

## How data moves through the dashboard

Watchlist state is held client-side in the prototype; server enforcement paths still gate API writes. Matching highlights incoming alerts in several views.

## Day-to-day operator workflow

Add IPs only after intel confirmation to avoid alert fatigue. Review quarterly for stale CDN or DNS resolver entries.

## Edge cases and false trails

Tier1 cannot add entries; teach with deliberate 403 tests. Watchlist without re-ingest does not retroactively alter old alerts.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Ioc Watchlist](../../guides/intelligence/ioc-watchlist/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
