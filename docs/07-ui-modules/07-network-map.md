﻿# Network map

HABIBI-SIEM exposes this capability under **Investigate → Network Map**. Network map visualizes observed source and destination relationships as a topology-style picture for storytelling in reports.

## What you see on screen

Hosts appear as nodes; observed flows become edges weighted by alert counts or bytes when available from parsed HTTP logs.

## How data moves through the dashboard

Map data derives from alert source and destination fields plus parsed network metadata. No live routing table feed is required for the teaching build.

## Day-to-day operator workflow

Use during lab demos to show how one external scanner touches many internal names. Pair with Geo Map when the campaign uses geographically scattered sources.

## Edge cases and false trails

Internal-only lab traffic collapses to a star; that is expected. Missing edges usually mean logs lacked parseable IP pairs, not a broken renderer.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Network Map](../../guides/investigate/network-map/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
