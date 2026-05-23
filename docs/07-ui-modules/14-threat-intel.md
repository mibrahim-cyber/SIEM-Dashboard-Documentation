# Threat intel

HABIBI-SIEM exposes this capability under **Intelligence → Threat Intel**. Threat intel aggregates external IP reputation, alert counts, and severity roll-ups for addresses seen in your pipeline.

## What you see on screen

KPI tiles track IPs monitored, critical and high risk buckets, and known-bad counts. Cards show country, ISP, scores, and top severity per IP.

## How data moves through the dashboard

Scores blend static bad-IP hints with dynamic weight from alert history. Live reputation fetches go through the server proxy when API keys are configured.

## Day-to-day operator workflow

Use after campaigns to prioritize blocks. Compare card scores with Alert Manager for the same IP before SOAR watchlist adds.

## Edge cases and false trails

Without API keys, dynamic enrichment is limited to local heuristics. Layout toggles (normal vs brute-force tint) only change presentation, not data.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Threat Intel](../../guides/intelligence/threat-intel/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
