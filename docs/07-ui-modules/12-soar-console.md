﻿# SOAR console

HABIBI-SIEM exposes this capability under **Respond → SOAR Console**. SOAR console records automated and semi-automated response actions such as watchlist adds and threat lookups tied to high-severity alerts.

## What you see on screen

Action log lists who ran what, on which target, with success or denial. Buttons on alert detail may trigger checks when role allows.

## How data moves through the dashboard

High and critical external alerts can trigger IP reputation checks through the server-side proxy. Writes require tier2 or higher; attempts from tier1 should fail closed with 403.

## Day-to-day operator workflow

Run threat check before watchlist block to avoid blocking CDN edges shared by good traffic. Read denial entries when teaching RBAC; they prove server enforcement.

## Edge cases and false trails

Quota limits on external threat APIs throttle repeated clicks; wait or cache mentally. SOAR entries are not a full ITSM replacement.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Soar Console](../../guides/respond/soar-console/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
