---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: Alerts fired vs incidents created
last_updated: 2026-05-23
---

# Alerts fired vs incidents created

**Part of:** Monitor → Overview
**One-sentence focus:** Alerts are individual detection firings stored in SQLite; incidents are ephemeral IP-time clusters computed by correlateAlerts() for situational summary.

### What you are looking at

The centre feed lists alerts, one row per detection firing with rule names, IP, event type, ACK/RES buttons. The red banner and right **ACTIVE INCIDENTS** panel show incidents, grouped clusters with `[ACTIVE]` blink tag, IP, `N alerts // categories`. Header **INCIDENTS: N ACTIVE** aggregates active incident count. These are parallel views of related but distinct objects. Alerts are like individual 911 calls; incidents are the dispatcher grouping multiple calls about the same fire into one response unit dispatch. One fire, many callers; one campaign, many alerts.

### What is happening underneath

Alerts are first-class objects stored in SQLite with UUID `id`, `status`, `severity`, `matchedRules`, `sourceIp`, `timestamp`, and an optional campaign data lineage flag. Incidents are ephemeral computed objects from `correlateAlerts()`, not persisted separately. Algorithm: sort alerts by time; for each unassigned alert, cluster all alerts sharing `sourceIp` within ±60 seconds (`IP_WINDOW_MS`); mark assigned; emit incident with `alertCount`, `categories` (unique rule categories), `severity` (highest in cluster), `firstSeen`/`lastSeen`, `status` active if last seen within 60s else contained. Dashboard filters `incidents.filter(i => i.status === 'active')` for banner and sidebar. Category-level cross-IP correlation exists in engine code path but IP clustering is primary visible behaviour.

### Why this matters

Escalation workflows differ. Tier1 acknowledges alerts; tier2 opens incidents/cases when multiple alerts represent one threat actor. Confusing the two leads to double-counting ("we have 40 incidents!" when it's 40 alerts from 3 incidents) or premature closure (resolving one alert while sibling alerts remain new). Executives want incident counts; engineers want alert-level detail for tuning.

### Step-by-step walkthrough

1. Run Simulate Campaign to generate multi-wave alerts from generated IPs.
2. Count feed rows (alerts) vs **ACTIVE INCIDENTS** cards.
3. Click incident card IP; mentally filter feed to that IP.
4. Acknowledge some but not all alerts for one IP: watch incident remain active until window expires or all resolved.
5. Wait 60+ seconds after last alert; active incident may flip to contained (not shown on Overview sidebar which filters active only).
6. Compare header **INCIDENTS** count to right panel list (max 5 displayed with slice).
7. Export alerts JSON, note incidents absent from export (computed only).

### Common questions

#### Can I create an incident manually?

Not on Overview. HABIBI-SIEM auto-correlates; human incident creation lives in Respond → Incidents and case management. Overview displays engine output only.

#### Why do I see incidents but fewer alert rows?

Time and status filters hide alerts but incidents derive from full alert set before display filtering; actually incidents recompute from all alerts regardless of feed filters. If incident shows 12 alerts but feed filtered to NEW only, counts diverge; remove filters for reconciliation.

#### Does resolving alerts destroy incidents?

Resolved alerts still exist until cleared. Incident recomputes from all non-resolved timing, if all alerts in cluster resolved, cluster may still show until time window logic updates. Active status depends on recency of last alert timestamp, not resolution state alone in current engine.

#### Who decides escalation to a case?

Human analyst at tier2+ using Respond → Case Manager, typically when active incident involves critical severity, multiple categories, or business asset impact. No automatic case creation from Overview incident panel.

### Analyst workflow under pressure

Analyst uses incidents for situational summary ("three active IPs") and alerts for concrete queue items. Banner text `203.0.113.45 [8] // 198.51.100.23 [4]` directs prioritisation. They ACK alerts individually but communicate incident-level status in Slack: "Incident cluster on 203.0.113.45, brute-force + SQLi categories, 8 alerts, investigating."

### Edge cases and gotchas

Incidents cap display at 5 in sidebar slice; sixth active incident hidden until scroll or sort changes. Incident IDs prefixed `inc-{alertId}` from seed alert. Cross-IP category waves (scan from many IPs) may not cluster as one incident; limitation of IP-centric correlation. **INCIDENTS** header counts active only; contained incidents invisible on Overview.

> **Technical note:** `CATEGORY_WINDOW_MS = 120_000` exists in correlation engine for category waves but primary loop shown is IP-based; extending correlation display may surface in future Timeline incident bands.

### Correlation limits and reporting language

When briefing non-technical leadership, vocabulary discipline prevents panic. Say "we have twelve alerts grouped into two active incident clusters" rather than "twelve incidents." HABIBI-SIEM incident objects include `categories` array from matched rule categories; useful noun phrases for executives ("brute-force and sql-injection activity from 203.0.113.45") without reading logs. Correlation window of 60 seconds (`IP_WINDOW_MS`) means slow-burn attacks spacing events more than one minute apart appear as separate incidents, acceptable tradeoff for demo simplicity. Category-wave correlation (`CATEGORY_WINDOW_MS` 120s) exists in engine code for future cross-IP scan detection but Overview incident cards emphasise IP clusters. Analysts investigating distributed scans should use Alert Manager sort by source IP and Timeline GROUP: RULE rather than incident banner alone. Incident `status` flips from `active` to `contained` when last alert timestamp older than 60 seconds; sidebar hides contained incidents, potentially making attack look "over" while new alerts still possible from other IPs. Header **INCIDENTS: N ACTIVE** remains authoritative for ongoing correlated activity per IP window. Export and legal: incidents are derived, not stored; export alerts JSON and recompute clusters externally for legal hold packages, or screenshot Overview incident panel with timestamp. Include correlation parameters in methodology footnote so opposing experts understand clustering logic. Correlation window of 60 seconds (`IP_WINDOW_MS`) means slow-burn attacks spacing events more than one minute apart appear as separate incidents. Analysts investigating distributed scans should use Alert Manager sorted by source IP and Timeline GROUP: RULE rather than the incident banner alone. Export alerts JSON and recompute clusters externally for legal hold packages, documenting correlation parameters in a methodology footnote.
