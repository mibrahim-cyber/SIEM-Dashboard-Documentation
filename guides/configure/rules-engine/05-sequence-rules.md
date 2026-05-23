---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 05-sequence-rules.md
title: "Sequence rules (correlation rules)"
last_updated: 2026-05-23
---

# Sequence rules (correlation rules)

**Sidebar path:** Configure → Rules Engine

## Sequence/correlation rules

### What you are looking at

Rules Engine lists per-log and sliding-window rules; it does not display multi-stage sequence rules (A then B then C within T) as first-class cards. HABIBI-SIEM approximates correlation at the alert layer via `correlateAlerts()` in the correlation engine, clustering alerts by source IP within 60 seconds into incidents shown on Overview and Analytics, rather than sequence detection in the detection rules catalog. Rule descriptions are single-stage: match condition → fire alert. Configure → Correlation Builder provides a UI for multi-condition rules with AND/OR logic, but that builder's output is not wired into `detection engine` in the current build. Sequence rules resemble a relay race: leg one (recon), leg two (exploit), leg three (exfil) must complete in order within the meet window. HABIBI's shipped rules mostly judge single legs; incident correlation hands off the baton after alerts already fired.

### What is happening underneath

correlation engine groups alerts (not raw logs) sharing `sourceIp` within `IP_WINDOW_MS = 60_000`. Incidents include aggregated `ruleNames`, `categories`, `severity` highest among cluster. No ordered sequence validation (e.g., recon before exfil) exists. Some rules use `allLogs` historical scan (brute-force, rapid-requests), temporal co-occurrence, not ordered sequence. Correlation Builder `selectedRule.logic` AND/OR across conditions on same alert object tests simultaneously, not event sequences across time unless combined with threshold/window fields unused by engine export.

> **Technical note:** True sequence engines maintain per-entity state machines; HABIBI demo prioritises teachable regex and threshold checks plus post-hoc alert correlation.

### Why this matters

Analysts expecting MITRE kill-chain sequence detections must know where correlation actually occurs; incident panel, not Rules Engine list. Budget conversations about "correlation engine" should distinguish alert clustering (implemented) from multi-event sequence rules (partial UI only).

### Step-by-step walkthrough

1. Review Rules Engine: confirm each card describes single-check logic.
2. Run simulation generating diverse rule hits same attacker IP.
3. Open Analytics → CORRELATED INCIDENTS to see IP-clustered rows with multiple `ruleNames` joined by ` // `.
4. Compare to Monitor → Overview ACTIVE INCIDENTS, same `correlateAlerts` output.
5. Open Correlation Builder; note AND/OR conditions as sequence-building UI exercise.
6. Understand Builder rules stay in component state: no engine integration.
7. Map incident `ruleNames` list to ordered narrative manually for kill-chain reporting.
8. Propose production enhancement: export Builder rules to detection logic state machines.

### Common questions

#### Is brute-force a sequence rule?

No; it counts concurrent failures in window without order requirement among failure types.

#### Where do I build IF login_fail×5 THEN admin_success rules?

Conceptually in Correlation Builder with threshold/window fields, not executed by detection engine today. Would require custom detection logic in the detection rules catalog for functional sequence.

#### Do incidents imply attack sequence?

No; only co-temporal clustering by IP. Rule name ordering in incident string is set insertion order, not temporal sort.

#### What's the 120-second category window?

Defined as `CATEGORY_WINDOW_MS` in correlation engine but unused in `correlateAlerts` export shown; future extension for cross-IP category waves.

### How an analyst uses this during active incident

The analyst reads incident `ruleNames` on Analytics as approximate attack narrative; e.g., `Brute Force Attack // SQL Injection Attempt` suggests multi-vector campaign. They do not assume temporal order. They escalate to tier-3 when multiple categories cluster on one IP even if Rules Engine shows independent rule hits.

### Edge cases and gotchas

Alert correlation ≠ log sequence. Builder test matches alert objects, not raw log streams. Category window constant unused, documentation drift risk. Multi-rule single alert from one log (multiple matches) looks like sequence in incident text but one event. Kill-chain sequence examples not implemented but commonly requested: sensitive-path probe, then sql-injection, then data-exfil within 3600s; would require state machine keyed by sourceIp storing stage progress. HABIBI instead fires independent alerts and lets correlateAlerts merge by IP within sixty seconds; useful narrative, not ordered validation. Category window constant in correlation engine hints at future cross-IP scan-wave clustering unused in exported function. Correlation Builder AND/OR across fields on one alert approximates single-event correlation, not cross-event sequence. Testing Builder against alerts evaluates post-detection objects; sequence across alerts would require iterating alert timelines sorted by timestamp with state, absent in testRule(). Enterprise buyers often ask whether SIEM supports chained correlation; answer honestly for HABIBI: post-alert IP clustering yes; ordered multi-stage log correlation requires custom check() state machines or external stream processor. Use Correlation Builder classroom exercises to design desired sequences, then map gap to engineering estimate. MITRE ATT&CK heatmaps from Rules Engine MITRE lines complement sequence discussion; tactics array across rules shows coverage breadth even when sequence enforcement absent. Tabletop scenario: recon category alert followed six minutes later by exfil category on same IP appears as two incidents in Analytics; discuss manual merge procedure in case manager versus automatic sequence rule fantasy. Sets realistic expectations for HABIBI incident panel behaviour during executive simulations. For programme managers, sequence correlation is the difference between seeing isolated alerts and recognising a staged attack narrative. For detection engineers, implementing true sequences in HABIBI today means extending `check(log, allLogs)` with per-entity state, the Correlation Builder UI previews that design but does not yet compile to production code listed in Rules Engine screen.
