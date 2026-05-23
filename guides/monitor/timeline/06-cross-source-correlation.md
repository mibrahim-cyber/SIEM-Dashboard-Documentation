---
module: Attack Timeline
sidebar: Monitor → Timeline
section: Monitor
subsection: Correlating events across multiple source systems
last_updated: 2026-05-23
---

# Correlating events across multiple source systems

**Part of:** Monitor → Attack Timeline
**One-sentence focus:** Timeline groups alerts by IP, rule, or severity, cross-source correlation requires shared keys and rules firing on each source.

### What you are looking at

Lanes grouped by IP or rule may include alerts whose underlying logs came from different synthetic sources (firewall, web, auth) in HABIBI-SIEM demos, unified by shared `sourceIp` and time colocation. **INCIDENT BANDS** panel lists up to six incidents with IP, time range, alert count. Cross-source correlation is detective work merging witness statements from different locations into one timeline of the suspect's movements, each witness (log source) alone is incomplete.

### What is happening underneath

HABIBI-SIEM v4 correlates at alert layer via `correlateAlerts()` (IP time window) not raw multi-index join. Logs carry implicit source via `eventType` and ingest path but Timeline ignores source field in grouping keys. Geo and SOAR enrichment happen pre-alert. True multi-source correlation (firewall deny + AD auth + EDR process) requires rules firing on each and shared IP/user keys; engine does not merge unrelated event types without alerts.

### Why this matters

Real breaches span SIEM categories. Analysts must know Timeline shows alert correlation, not magic log fusion; missing alert means missing dot.

### Step-by-step walkthrough

1. Ingest mixed event types sharing attacker IP.
2. **GROUP: IP** to confirm multiple rule dots same lane.
3. Open selected alert, inspect embedded log `eventType`.
4. Read incident band spanning multi-category alerts.
5. Compare categories string in incident card on Overview.
6. Identify gap; web attack visible, no EDR dot → coverage hole.
7. Plan rule enablement or ingest fix.

### Common questions

#### Does timeline merge firewall and AD logs automatically?

Only if both produced alerts with shared grouping key within window.

#### What fields link events?

Primarily `sourceIp` in v4; user/host correlation lives in Investigate modules (Event Graph).

#### Can I group by log source?

Not in current GROUP toggles; only ip, rule, severity.

#### Do incident bands equal cross-source correlation?

They signal IP-time clustering of alerts; often cross-rule, not guaranteed cross-source.

### Using this view during live response

Validates whether authentication and web exploit alerts align temporally in one IP lane, supports unified containment. Missing expected lane triggers ingest checks on Pipeline Health.

### Edge cases and gotchas

NAT collapses many hosts; false correlation. Tor rotation splits one actor across IP lanes.

> **Technical note:** `CATEGORY_WINDOW_MS` in correlation engine supports category waves across IPs; Timeline bands are primarily IP-incident driven. HABIBI-SIEM v4 correlates at the alert layer via `correlateAlerts()`, not by joining raw multi-index logs. Firewall deny alerts and AD auth alerts appear on the same IP lane only when both produced alert objects with shared `sourceIp` within the time window. Missing ingest from one source means missing dots. Timeline cannot invent cross-source fusion. For deeper graph-style correlation, pivot to Investigate → Event Graph or Network Map after Timeline identifies temporal colocation. Pipeline Health source cards help explain coverage gaps: if EDR shows DEGRADED while web logs flow, endpoint-stage dots may be absent from Timeline despite network-stage activity.
