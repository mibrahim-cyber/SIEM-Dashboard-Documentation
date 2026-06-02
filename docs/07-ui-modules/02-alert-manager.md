﻿# Alert manager

HABIBI-SIEM exposes this capability under **Monitor → Alert Manager**. Analysts triage, acknowledge, and resolve individual detections here. It is the queue between raw detection and formal incident or case records.

## What you see on screen

A filterable table lists alerts with severity badges, status, source IP, rule names, and timestamps. Detail drawers expose matched rules, raw log excerpts, and quick actions where RBAC allows writes.

## How data moves through the dashboard

Alerts originate from the detection pass after ingest. Status changes (new → acknowledged → resolved) post back to the API with CSRF protection. Deduplication, when enabled in settings, suppresses repeat rule-and-IP pairs within a short window before they surface again.

## Day-to-day operator workflow

Work newest critical items first. Acknowledge when you own investigation; resolve only after containment or accepted risk. Tie recurring sources to Threat Intel and IOC Watchlist rather than resolving repeatedly without enrichment.

## Edge cases and false trails

Bulk resolve without reading matched rules erases useful audit narrative. Tier1 accounts may be read-only for some write actions; failed saves often show as 403 with no row change. Empty tables after a successful ingest usually mean severity or time filters, not a broken detector.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Alert Manager](../../guides/monitor/alert-manager/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
