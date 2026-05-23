---
module: Analytics
sidebar: Infrastructure → Analytics
page: 06-mttd-mttr.md
title: "MTTD and MTTR"
last_updated: 2026-05-23
---

# MTTD and MTTR

**Sidebar path:** Infrastructure → Analytics

## MTTD and MTTR

### What you are looking at

The Analytics module does not display MTTD (Mean Time to Detect) or MTTR (Mean Time to Respond/Remediate) KPI tiles. Those metrics appear in Reporting → Executive View as simulated values (e.g., MTTR `12m` hardcoded in component stats) and partially in Reporting → Reports via resolution rate calculations. Analytics shows proxy indicators: **UNRESOLVED** (`unread + acknowledged`), **ACTIVE INCIDENTS**, **CONTAINED**, and time-series volume, from which analysts infer detection/response speed qualitatively but not as labelled MTTD/MTTR numbers. MTTD and MTTR are like pizza delivery metrics: time from order to oven (detect) and oven to doorstep (respond). Analytics shows how many pizzas are in the kitchen right now; Executive View prints average delivery minutes on the menu board.

### What is happening underneath

HABIBI-SIEM does not compute true MTTD = `alert.timestamp - attack_start` because attack start is unknown without ground truth. MTTR approximations in Reports screen use `((acked + resolved) / total) * 100` as a resolution rate percentage, not minutes. Executive View `mttr: 12` is placeholder narrative for leadership demos. Meaningful MTTD/MTTR requires timestamped milestones: first log event, first alert, first ACK, first RES, data exists partially in alert `status` transitions persisted via `api.saveAlerts()` but Analytics does not aggregate them. `alertHistory` buckets could support detection lag charts if extended, not current behaviour.

> **Technical note:** To measure MTTR manually in the lab, export alerts JSON from Overview and compute `resolved.timestamp - alert.timestamp` per alert if resolution timestamps are captured; verify schema in exported payload.

### Why this matters

Leadership benchmarks SOC maturity on MTTD/MTTR. Showing **TOTAL ALERTS** without time-to-respond context invites unfair criticism ("why so many alerts?") without measuring ("how fast do we close them?"). Analysts must know Analytics gaps to pull correct reporting surfaces and set expectations during incidents.

### Step-by-step walkthrough

1. Open Analytics: confirm no MTTD/MTTR labels; note **UNRESOLVED** and incident status KPIs instead.
2. Open Reporting → Executive View; locate MTTR display for leadership-aligned numbers (simulated).
3. Open Reporting → Reports, review resolution rate metric derivation.
4. On Overview, ACK several new alerts; **UNRESOLVED** in Analytics should reflect acknowledged-but-not-resolved state in the KPI formula.
5. Resolve alerts: watch **UNRESOLVED** drop and **CONTAINED** incidents potentially rise as time windows elapse.
6. Export alert JSON; inspect timestamps and status fields for manual MTTR calculation exercise.
7. Define SOC MTTD operationally: time from first malicious log ingestion to first matching alert, measure with controlled simulation timestamps.
8. Brief managers: use Executive View for SLA slides; use Analytics for operational volume during incidents.

### Common questions

#### Why isn't MTTD shown if we have alert timestamps?

Detection time requires knowing when the attack began; usually approximated by first related log event. HABIBI stores alert timestamps but not automated first-event linkage in Analytics. Monitor → Timeline helps narratively, not as MTTD KPI.

#### Is UNRESOLVED the same as MTTR?

No. **UNRESOLVED** is a count of alerts in `new` or `acknowledged` status. MTTR is an average duration metric. High unresolved count suggests slow MTTR but does not quantify it.

#### What is a good MTTR target?

Industry targets vary (15–60 minutes for critical tiers). HABIBI demo MTTR is not contractual; replace with your org SLA when presenting Executive View.

#### Can CONTAINED incidents inform MTTR?

**CONTAINED** correlates to incidents whose last alert is older than 60 seconds (correlation engine). It signals correlation lifecycle, not human containment confirmation; useful proxy, not MTTR.

### How an analyst uses this during active incident

The analyst tracks **UNRESOLVED** count against team capacity as a real-time backlog proxy while formally MTTR is calculated post-incident from case timestamps. They note first ACK time in Case Manager manually for MTTR evidence. They avoid citing Analytics as MTTR source in executive calls, pivot to Executive View or exported reports.

### Edge cases and gotchas

Simulated alerts compress timelines unrealistically. Ack without investigate depresses unresolved count without true remediation. Executive View MTTR is static demo data; do not quote in compliance audits. Alert history buckets measure stocks, not response intervals. Define MTTD narratively for HABIBI labs: time from first malicious log entry in Simulate Campaign batch to first alert row appearing in Overview feed: typically sub-second on localhost. MTTR demo: time from alert creation to analyst clicking **RES**; human measured, not automated. Reporting → Reports computes resolution rate as percentage of acked plus resolved over total, leadership sometimes mislabel this MTTR; clarify it is closure ratio, not minutes. Executive View pairs simulated MTTR with riskScore and incident counts for board slides; replace with ticket-system exports in production. Analytics **UNRESOLVED** formula counts alerts neither resolved nor ignored; useful backlog KPI proxy when MTTR minutes unavailable. Active vs contained incident KPIs reflect sixty-second freshness heuristic; not human containment confirmation, do not report as MTTR without annotation. Operational leaders should build a metrics dictionary linking each Analytics KPI to formal definitions: **TOTAL ALERTS** is stock, not rate; **UNRESOLVED** is queue depth; **ACTIVE INCIDENTS** is correlated cluster count with sixty-second freshness. When proposing dashboard enhancements, request persisted milestone timestamps on alert status transitions in SQLite so MTTR can be computed server-side and surfaced on Analytics KPI row alongside Executive View; today that join is manual. Tier-1 analysts record first-viewed time in Case Manager notes as interim MTTD proxy until instrumentation matures.
