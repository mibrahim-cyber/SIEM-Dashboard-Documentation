# Pipeline health

HABIBI-SIEM exposes this capability under **Monitor → Pipeline Health**. Pipeline health shows ingest throughput, parser errors, and source status for quick answers to is data flowing.

## What you see on screen

EPS-style counters, last batch time, and per-source green/red indicators when implemented in the build.

## How data moves through the dashboard

Derived from session ingest counters and validation responses. Differs from Overview logs chip by focusing on errors and rates.

## Day-to-day operator workflow

Open when dashboards go quiet after a demo. If validation errors climb, fix parser format before touching rules.

## Edge cases and false trails

Mock generator traffic looks healthy but is synthetic; label demos clearly. Geo and threat steps do not affect EPS alone.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Pipeline Health](../../guides/monitor/pipeline-health/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
