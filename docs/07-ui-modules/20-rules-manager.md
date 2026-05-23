# Rules manager

HABIBI-SIEM exposes this capability under **Configure → Rules Engine**. Rules manager toggles detections, shows hit counts, and exposes MITRE mapping for each bundled rule.

## What you see on screen

Cards per rule show severity, category, description, MITRE technique, enable switch, and hit bar share.

## How data moves through the dashboard

Detection engine evaluates enabled rules on each ingested event batch. Disabling a rule stops new matches immediately; hits reset on full reload in teaching builds.

## Day-to-day operator workflow

Disable noisy rules during parser debugging, then re-enable systematically. Read MITRE blocks before mapping to ATT&CK matrix view.

## Edge cases and false trails

Toggle state may not persist to database; document enabled set in lab notes. Hit percentages divide by total hits; one dominant rule skews bars.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Rules Engine](../../guides/configure/rules-engine/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
