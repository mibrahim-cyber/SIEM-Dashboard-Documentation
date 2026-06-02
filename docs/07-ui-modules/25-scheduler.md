﻿# Scheduler

HABIBI-SIEM exposes this capability under **Reporting → Scheduler**. Scheduler configures cron-style report delivery records for operations storytelling.

## What you see on screen

List of schedules with cron expression, recipient email field, and last run status in the teaching UI.

## How data moves through the dashboard

Scheduler configs are primarily client-side prototypes; delivery may be simulated rather than SMTP live.

## Day-to-day operator workflow

Use cron cheat sheet from guides when writing expressions. Test failure handling by forcing an invalid email format.

## Edge cases and false trails

Do not expect real email without external integration. Clock skew on laptops affects next-run displays.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Scheduler](../../guides/reporting/scheduler/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
