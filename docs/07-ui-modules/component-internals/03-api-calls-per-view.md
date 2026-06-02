﻿# API calls per view

HABIBI-SIEM UI modules share implementation patterns documented here for coursework extensions.

## Purpose

Read-heavy views hit GET endpoints for alerts, incidents, audit (admin), and health. Writes batch status changes, watchlist operations, and SOAR log entries with CSRF headers.

## Runtime behavior

Threat and geo endpoints are server-proxied to hide third-party keys. Rate limits may return 429 on repeated threat lookups during student pile-ons.

## Operator and developer notes

Map each button in lab worksheets to HTTP method and expected status for tier1 vs tier2. Teaches that UI labels are not authorization.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Siem context pipeline](../04-frontend/04-siem-context-pipeline.md)
- [UI modules overview](../07-ui-modules/01-dashboard.md)
