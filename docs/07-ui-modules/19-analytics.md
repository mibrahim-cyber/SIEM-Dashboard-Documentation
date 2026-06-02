﻿# Analytics

HABIBI-SIEM exposes this capability under **Infrastructure → Analytics**. Analytics breaks alert volume, categories, and top lists for management-style reporting inside the app.

## What you see on screen

Charts show alert volume over time, category breakdown, and ranked sources or rules.

## How data moves through the dashboard

Charts read the same in-memory alert statistics as Overview rule activity. Refresh follows alert state updates.

## Day-to-day operator workflow

Screenshot analytics before clearing resolved alerts for weekly lab reports. Compare category spikes with Rules Engine enablement.

## Edge cases and false trails

Very small sample sizes make charts noisy; run Simulate Campaign first. Timezone on charts follows browser settings.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Analytics](../../guides/infrastructure/analytics/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
