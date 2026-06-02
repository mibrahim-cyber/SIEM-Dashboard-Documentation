﻿# Heatmap calendar

HABIBI-SIEM exposes this capability under **Investigate → Heatmap**. Heatmap shows alert density by day and hour so you can spot off-hours activity called out by detection rules.

## What you see on screen

A grid colours cells by count; brighter cells mean more alerts in that hour bucket.

## How data moves through the dashboard

Aggregation runs client-side across alert timestamps. No separate warehouse table is queried.

## Day-to-day operator workflow

Use to justify off-hours login investigations. Compare weekday lunch spikes (often benign scanning labs) against night windows.

## Edge cases and false trails

Timezone follows browser locale; document that in reports when comparing to UTC syslog sources. Empty grid means no parsed timestamps on alerts yet.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Heatmap Calendar](../../guides/investigate/heatmap-calendar/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
