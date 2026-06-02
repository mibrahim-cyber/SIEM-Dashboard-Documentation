﻿# Raw logs

HABIBI-SIEM exposes this capability under **Monitor → Live Feed**. This view shows the verbatim stream of normalized events after parsing, before or alongside alert generation. It supports hunt and validation work when analysts need the ground truth line.

## What you see on screen

Rows display normalized timestamps, source addresses, actions, HTTP or auth details where present, and format tags. Search and scroll help you find a needle event in a short lab window.

## How data moves through the dashboard

Each accepted batch flows: paste or upload → parser selection → validation endpoint → optional geo fields → detection engine → alert creation. Events retained in client state power this feed even when no rule fired.

## Day-to-day operator workflow

Use Live Feed to confirm a parser choice before trusting alert volume. When alerts are unexpectedly low, find the event here first, then check whether the matching rule is enabled in Rules Engine.

## Edge cases and false trails

High-volume paste can freeze the browser tab in small VMs; ingest in chunks. Mixed formats in one paste produce partial parse failures that still show as odd rows. Geo columns stay blank until the geo database is present on the server.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Live Feed](../../guides/monitor/live-feed/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
