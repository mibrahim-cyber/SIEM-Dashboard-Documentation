﻿# Geo map

HABIBI-SIEM exposes this capability under **Investigate → Geo Map**. Geo map plots alert sources on a world map using offline MaxMind enrichment applied during ingest.

## What you see on screen

Markers cluster by country; tooltips show city, country, alert count, and max severity for that origin.

## How data moves through the dashboard

After validation, the server attaches country and coordinates when the GeoLite database file is installed. The UI reads enriched fields already on alerts.

## Day-to-day operator workflow

When markers are missing, complete geo database setup under operations docs, then re-ingest a sample. Compare country spread with Threat Intel reputation scores.

## Edge cases and false trails

Private RFC1918 addresses do not geo-locate; they should not appear offshore. VPN egress can place a domestic attacker abroad; treat geo as hint not verdict.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Geo Map](../../guides/investigate/geo-map/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
