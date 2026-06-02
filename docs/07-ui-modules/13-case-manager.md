﻿# Case manager

HABIBI-SIEM exposes this capability under **Respond → Case Manager**. Case manager tracks investigation cases with title, priority, linked alerts, and analyst notes for longer-running work than single incidents.

## What you see on screen

Kanban or list style boards show open and closed cases. Linking an alert copies identifiers for traceability.

## How data moves through the dashboard

Cases live primarily in client state for the teaching build; linking does not duplicate alert storage on the server.

## Day-to-day operator workflow

Open a case when investigation spans multiple shifts. Reference case id in shift logs even if persistence is session-bound.

## Edge cases and false trails

Deleting alerts underneath an open case leaves dangling references until refresh. RBAC may block case mutations for tier1.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Case Manager](../../guides/respond/case-manager/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
