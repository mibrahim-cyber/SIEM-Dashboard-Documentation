# Incident response

HABIBI-SIEM exposes this capability under **Respond → Incidents**. Incidents group related alerts into a single response object with status, owner notes, and timeline suitable for tabletop exercises.

## What you see on screen

List view shows active and closed incidents; detail view lists member alerts and correlation reason (shared IP, time window).

## How data moves through the dashboard

Correlation engine clusters alerts arriving within a short window sharing key identifiers. Creating or closing incidents updates shared state and Overview incident chip.

## Day-to-day operator workflow

Prefer promoting correlated clusters instead of manual ticket splitting. Close incidents only when contained or accepted; keep alerts resolved in sync.

## Edge cases and false trails

Prototype persistence may reset incidents on full page reload; export notes for coursework. Very loose correlation can merge unrelated scan noise during noisy campaigns.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Incidents](../../guides/respond/incidents/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
