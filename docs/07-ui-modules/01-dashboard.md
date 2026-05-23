# Dashboard

HABIBI-SIEM exposes this capability under **Monitor → Overview**. This is the primary security operations landing page. It answers whether the environment is quiet, heating up, or in active incident mode without opening five other tools.

## What you see on screen

The layout splits into three zones: left **alert summary** counters (total, per-severity, unread, resolved), a central live alert feed with status tabs, and a right analytics rail (top attackers, rule activity, threat scores, severity breakdown). Header chips show logs processed, enabled rules, active incidents, and session uptime.

## How data moves through the dashboard

Ingested logs pass validation and optional geo enrichment, then the client-side detection engine evaluates enabled rules. New alerts merge into shared application state and immediately update KPI tiles. Simulate Campaign injects a scripted burst so empty labs still demonstrate motion. Auto-refresh keeps the feed aligned with the latest alert list returned from the API.

## Day-to-day operator workflow

Start each shift by comparing **critical + high** to **unread**. If unread backlog grows while severity stays low, you likely have a staffing or process gap rather than a catastrophe. Use **top attackers** to pick the first IP for watchlist or case work. Cross-check **rule activity** when alert volume feels wrong: flat hits across all rules after a noisy ingest pass may mean most rules are disabled.

## Edge cases and false trails

Time filters on the feed can hide older **new** alerts while summary counters still count all unread globally; always note active filters before escalating. **Logs processed** is session-cumulative, not calendar-day billing. Threat scores on Overview are computed from local alert history and static bad-IP hints, not a live VirusTotal pull; use Threat Intel for enriched reputation when needed.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Overview](../../guides/monitor/overview/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)

## Shift handoff checklist

Before ending a lab session, record which account role was active, whether deduplication was on, and the last ingest batch size. Screenshot Overview KPIs if coursework requires evidence. If students report empty views, ask whether they refreshed after Simulate Campaign and whether filters hide new alerts. When promoting from tier1 to tier2 accounts, log out fully so cookies do not blend roles.

## Coordination with other modules

Cross-link findings in Case Manager or Incident views when drills span multiple screens. Threat Intel and Geo Map should tell the same story about an IP before watchlist blocking. Pipeline Health confirms whether zeros are detection silence or ingest failure. For security sign-off, pair this topic with CSRF and RBAC docs before external exposure.
