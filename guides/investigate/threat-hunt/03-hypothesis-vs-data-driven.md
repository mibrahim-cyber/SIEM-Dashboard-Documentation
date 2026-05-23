---
module: Threat Hunt
sidebar: Investigate → Threat Hunt
section: Investigate
subsection: Hypothesis-driven vs data-driven hunting
last_updated: 2026-05-23
---

# Hypothesis-driven vs data-driven hunting

**Sidebar path:** Investigate → Threat Hunt

![Threat Hunt main view](../../../screenshots/guides/investigate-threat-hunt.png)

### What you are looking at

**SAVED HUNTS** embodies hypothesis-driven templates: Active Bruteforce (auth-failure + high/critical severity), SQL Injection Attempts (db-query + critical), Non-standard Ports (port 1024–32768), Unresolved Alerts (status new + high/critical). The **QUERY BUILDER** lets you construct data-driven explorations, start broad (severity equals medium), scan stats, add conditions iteratively. The **AND** / **OR** toggle at the top of the query builder switches combination logic.

### What is happening underneath

Hypothesis-driven hunts encode a prior belief: `{ field: 'eventType', op: 'equals', value: 'auth-failure' }`. Data-driven hunts often start with `{ field: 'severity', op: 'equals', value: 'critical' }` (the default initial rule) and refine based on `stats.counts` and `stats.topIp`. `loadHunt` replaces all query rules with the preset's rule set, regenerating IDs via `ruleId()`. The stats memo recalculates severity distribution and top source IP on every result set change.

### Why this matters

Hypothesis-driven hunting is efficient when intelligence points you somewhere ("APT28 uses port 443 to non-standard destinations"). Data-driven hunting discovers unknown unknowns, anomalies you did not anticipate. Mature SOC programmes use both: intel-driven hunts weekly, baseline-driven exploration daily. The preset / builder split in this UI mirrors that operational split.

### Step-by-step walkthrough

1. Hypothesis path: Click SQL Injection Attempts preset. Verify results show `eventType = db-query` and `severity = critical`.
2. Note hit count vs total in the stats strip.
3. Click **CLEAR ALL**, then **+ ADD CONDITION** twice.
4. Data-driven path: Set first rule `severity equals medium`, second `status equals new`, logic **AND**.
5. Scan results, if count is high, add `sourceIp contains 203` to narrow.
6. Toggle **OR** to see how logic changes breadth.
7. Save a promising query with **SAVE**.

### Common questions

#### When should I use AND vs OR?

**AND** narrows; every condition must match (precise, fewer results). **OR** widens; any condition matches (broad net, more noise). Start with **AND** for hypothesis testing; switch to **OR** when hunting multiple similar indicators simultaneously.

#### Which preset should I run first?

Unresolved Alerts gives immediate operational value; open high-severity work queue items. Active Bruteforce suits credential attack suspicion. Choose based on what your organisation fears most this week.

#### Can I combine a preset with custom rules?

Load a preset, then **+ ADD CONDITION** to extend it. Loading a preset replaces existing rules, save custom work first.

#### What's a good first data-driven query?

`severity equals medium` with **AND** `status equals new`; finds quietly queued items that might escalate. Review **TOP SOURCE IP** for concentration patterns.

### Operational use during containment

Intel says "look for DNS tunneling." Analyst builds hypothesis query: `eventType contains dns` **AND** `port gt 1024`. If hits are zero, they switch data-driven: remove eventType filter, sort by **PORT** column, scan for outliers highlighted yellow. The toggle between modes happens within minutes on the same screen.

### Edge cases and gotchas

Loading a preset wipes unsaved custom conditions without confirmation. **OR** logic with contradictory conditions (severity equals critical OR severity equals low) returns almost everything. Presets use fixed event type strings that must match the normalised values in ingested data; empty results may mean a data mismatch or gap in log coverage, not a confirmation of safety.

### Worked example: intel-driven vs baseline-driven on the same screen

Hypothesis-driven: threat intel report mentions CVE exploitation via `db-query` events; load SQL Injection Attempts, verify hits, click each for **MATCHED RULES** to see if existing detections cover the TTP. Data-driven: **CLEAR ALL**, single condition `severity equals medium`, logic **AND**, observe hit count, if unexpectedly high, add `status equals new`, if concentrated on one IP per **TOP SOURCE IP**, add `sourceIp contains <prefix>`. The stats strip's per-severity counts (critical/high/medium/low in SEV_COLOR) guide whether your widening logic is surfacing dangerous rows or noise. Toggle **OR** only when hunting parallel hypotheses ("find auth-failure OR port-scan"); never as default because it destroys specificity. Document which mode you used in case notes; auditors and successors need to know whether findings came from external intel (hypothesis) or internal anomaly discovery (data-driven). The distinction affects confidence statements: "intel match" vs "statistical outlier."

### Communicating hypothesis vs data driven to leadership and engineering

For board conversations, frame Investigate → Threat Hunt numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Operator vs maintainer focus

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → Threat Hunt behaviour at different altitudes.
