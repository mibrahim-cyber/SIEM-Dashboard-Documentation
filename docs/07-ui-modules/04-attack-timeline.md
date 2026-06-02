﻿# Attack timeline

HABIBI-SIEM exposes this capability under **Monitor → Timeline**. Timeline orders security events chronologically so you can narrate an attack story for shift handoff or lab write-ups.

## What you see on screen

A horizontal or vertical timeline clusters alerts and notable log actions by time bucket. Severity colour helps spot escalation moments.

## How data moves through the dashboard

Events pull from the same alert and log pool as Overview, sorted by timestamp. Correlation may group related alerts into incidents that also appear as markers when active.

## Day-to-day operator workflow

Drag or zoom the visible window during incident review to isolate the first exploit attempt from lateral movement. Export mental notes by screenshotting the window before clearing resolved alerts.

## Edge cases and false trails

Sparse timelines after ingest mean timestamps failed parsing; check Live Feed for bad lines. Simulated campaigns pack many events into seconds; zoom in to avoid a single unreadable stack.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Timeline](../../guides/monitor/timeline/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
