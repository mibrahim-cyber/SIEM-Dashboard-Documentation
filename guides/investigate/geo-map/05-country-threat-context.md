---
module: Geo Map
sidebar: Investigate → Geo Map
section: Investigate
subsection: Country-level threat context
last_updated: 2026-05-23
---

# Country-level threat context

**Sidebar path:** Investigate → Geo Map

![Geo Map main view](../../../screenshots/guides/investigate-geo-map.png)

### What you are looking at

Toolbar filters: **ALL** (default), **CRITICAL** (maxSev critical only), **BLOCKED** (blocked IPs only). Stat **COUNTRIES** shows unique country count from external geo points. **IP DETAIL** panel displays Country and City fields. **TOP ATTACKERS** list ranks by global `topAttackers` from context, showing count and **BLOCKED** tag.

### What is happening underneath

No country watchlist configuration exists in this module, filtering is severity/block based, not geo-political. Country aggregation: `[...new Set(geoPoints.map(p => p.geo.country))].length`. Threat context must come from analyst knowledge or Intelligence → Threat Intel feeds, not hardcoded country blocklists here. `blockedIps` Set drives blocked filter and styling from IOC/watchlist actions elsewhere.

### Why this matters

Country alone is weak signal (CDN, legitimate global customers) but useful heuristic when combined with severity and reputation. Compliance discussions often ask "are we under attack from sanctioned regions?", country stat answers quantitatively. Heuristic not rule: never auto-block solely on country in production without business review.

### Step-by-step walkthrough

1. Note **COUNTRIES** stat; sudden increase may indicate distributed attack.
2. Click **TOP ATTACKERS**: observe country in detail after selecting IP.
3. Apply **CRITICAL** filter; see if critical threats concentrate geographically on map.
4. Apply **BLOCKED** filter, verify previously blocked IPs greyed on map.
5. Compare blocked count stat to **BLOCKED** filter node count.
6. Research suspicious country IPs in Threat Intel module.
7. Document country distribution screenshot for incident leadership.

### Common questions

#### Can I block entire countries from this screen?

No UI for geo-blocking rules. Use firewall policies externally; mark individual IPs blocked via IOC Watchlist.

#### Why don't certain countries appear?

No alerts from those origins in current dataset, or IPs resolved to same coordinates overlapping, or all sources internal.

#### Should I prioritize alerts from specific countries?

Prioritise by severity and threat intel first; use country as supplementary context for organisations with known geopolitical threat models.

#### What's the difference between CRITICAL filter and severity colour?

Filter hides non-critical nodes entirely. Severity colour applies within unfiltered view; critical max severity IPs red regardless of filter when shown.

### What analysts do when the pager fires

DDoS from many countries: **COUNTRIES** stat high, many medium nodes. Targeted nation-state hypothesis: few countries, critical nodes, correlate with Threat Intel labels. Briefing slide: screenshot map + country stat + top 5 IPs.

### Edge cases and gotchas

Country "Unknown" from failed geo lookup skews stats. Blocked filter shows IPs you've acted on; not "bad countries." CRITICAL filter may empty map while alerts exist at lower severities; switch to **ALL**.

### Using COUNTRIES stat in executive narrative

**COUNTRIES** stat counts distinct `geo.country` values among external points, sudden jump from 3 to 18 during an hour suggests distributed attack or scan. **CRITICAL** filter shows only IPs whose aggregated max severity is critical; may hide distributed low-severity DDoS sources. **BLOCKED** filter validates watchlist propagation; blocked count should rise during active containment shifts. No country watchlist UI exists here; geopolitical prioritisation remains analyst judgement enriched by Threat Intel feeds, not automated block rules.

### Communicating country threat context to leadership and engineering

Leadership briefings on Investigate → Geo Map should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Reading paths for analysts and engineers

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### How do you walk a non-technical board through country threat context quickly?

Use Investigate → Geo Map as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### Which code paths should engineers check when changing country threat context?

Maintainers: open DevTools, compare network payloads to the field names cited here, and ensure RBAC gates still match Settings → RBAC. Document any intentional drift between demo data and production schemas in the technical note block.

#### What should newcomers avoid on this view?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
