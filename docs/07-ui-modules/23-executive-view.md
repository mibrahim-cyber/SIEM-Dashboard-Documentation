# Executive view

HABIBI-SIEM exposes this capability under **Reporting → Executive View**. Executive view compresses posture into KPIs and narrative-friendly charts for non-operator audiences.

## What you see on screen

Posture score, period comparisons, and benchmark callouts appear with reduced technical density.

## How data moves through the dashboard

Aggregates alert severities, open incidents, and risk trends from the same state pool as Overview. Benchmark numbers may be sample constants.

## Day-to-day operator workflow

Toggle comparison periods only after stable ingest so charts do not jump. Explain SO WHAT captions beneath KPIs in voiceovers.

## Edge cases and false trails

Benchmark data is illustrative, not your organization's real peer set. Empty executive view means no alerts yet in session.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Executive View](../../guides/reporting/executive-view/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
