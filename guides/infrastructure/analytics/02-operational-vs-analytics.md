---
module: Analytics
sidebar: Infrastructure → Analytics
page: 02-operational-vs-analytics.md
title: "Operational dashboards vs analytics"
last_updated: 2026-05-23
---

# Operational dashboards vs analytics

**Sidebar path:** Infrastructure → Analytics

## Operational vs analytics dashboards

### What you are looking at

Monitor → Overview (Overview dashboard) is the operational dashboard: three-column layout, alert feed with **ACK**/**RES** buttons, time filters **1M/5M/15M/1H/ALL**, simulation controls, and export actions, optimised for second-by-second triage. Infrastructure → Analytics (Analytics screen) is the analytics dashboard: full-width terminal-themed panels, no acknowledge buttons, no simulation trigger, emphasis on aggregate KPIs and charts. The Analytics header reads `>> ANALYTICS // THREAT ANALYSIS DASHBOARD`. If `alerts.length === 0`, Analytics shows a centred empty state: `NO DATA // START INGESTION TO POPULATE`. Overview instead shows **NO THREATS DETECTED** with left/right context panels still populated. Operational versus analytics dashboards are like a hospital ER whiteboard versus the epidemiology department's weekly report. The ER board names patients needing care right now; epidemiology tracks infection rates across weeks to spot outbreaks and allocate budget. Both use patient data; neither replaces the other.

### What is happening underneath

Both views consume the SIEM context pipeline from the SIEM context pipeline, shared `alerts`, `incidents`, `getAlertStats()`, and `alertHistory`. Overview also exposes write actions (`acknowledgeAlert`, `simulateCampaign`, exports) gated by RBAC. Analytics is read-only visualisation: `useMemo` transforms shared state into chart datasets without mutating it. Incidents in Analytics come from the same incident correlation memo as Overview's **ACTIVE INCIDENTS** panel. Analytics does not subscribe separately to the server; empty Analytics means zero alerts in client state, not a distinct analytics database failure.

> **Technical note:** Analytics returns early with empty state when `alerts.length === 0`. Overview always renders its shell. Populate Analytics by ingesting logs or running **Simulate Campaign** on Overview first.

### Why this matters

Teams that conflate dashboards make two mistakes: managers open Overview expecting trend insight and see unreadable alert noise; analysts open Analytics expecting triage actions and lose minutes navigating away. Separating operational from analytical surfaces matches SOC maturity models; tier-1 lives in Overview; tier-2, threat intel, and leadership consume Analytics for pattern confirmation, staffing decisions, and reporting cycles.

### Step-by-step walkthrough

1. Open Monitor → Overview: note triage controls (**ACK**, status tabs, **SIMULATE CAMPAIGN**).
2. Open Infrastructure → Analytics; confirm absence of triage buttons and presence of chart panels.
3. With zero alerts, observe Analytics empty state versus Overview's wider layout.
4. Run Simulate Campaign from Overview (requires write role).
5. Return to Analytics, KPI tiles populate: **TOTAL ALERTS**, **ACTIVE INCIDENTS**, **CONTAINED**, **UNRESOLVED**.
6. Compare Overview **ALERT SUMMARY** totals to Analytics KPI **TOTAL ALERTS**; they must match `getAlertStats().total`.
7. Resolve alerts on Overview; refresh Analytics mentally via React re-render: **UNRESOLVED** should drop as `unread + acknowledged` changes.
8. Use Overview for immediate response; use Analytics for briefing slides and pattern analysis.

### Common questions

#### Why does analytics say NO DATA when overview shows logs processed?

Analytics gates on `alerts.length`, not `logsProcessed`. Logs can ingest without rule matches; zero alerts means empty Analytics. Check **RULES** enabled count on Overview and rule patterns in Configure → Rules Engine.

#### Can I acknowledge alerts from analytics?

No. Analytics has no write path to alert status. Navigate to Overview or Monitor → Alert Manager for triage mutations.

#### Which dashboard should executives see?

Reporting → Executive View summarises MTTR and risk score for leadership. Analytics suits SOC managers and threat intel analysts who need charts without triage clutter. Overview overwhelms non-operators.

#### Do both dashboards update in real time?

Both re-render on `the SIEM context pipeline` state changes. Neither polls independently. Analytics time-series also appends buckets every ten seconds via `alertHistory` interval, slight visual lag acceptable for trends.

### How an analyst uses this during active incident

The analyst stays on Overview for ACK/RES workflow during the first response phase. Once immediate fires are owned, they open Analytics to see whether alert growth is accelerating (**ALERT VOLUME // TIME SERIES** slope), whether severity skews critical (**SEVERITY DISTRIBUTION** donut), and whether one IP dominates (TOP ATTACKING IPs). They return to Overview for actions; Analytics informs escalation narrative to tier-3 ("critical trend rising, three active incidents, brute-force category leading").

### Edge cases and gotchas

Analytics empty state triggers on zero alerts even if incidents memo would be empty anyway. Overview **TIME** filters do not apply to Analytics; Analytics shows full alert set aggregates. Simulated alerts count in Analytics identically to ingested alerts; label **SIM** appears on Overview feed rows only, not Analytics panels. Switching tabs does not reset `alertHistory` buckets. Layout comparison: the distinction: Overview left column width is fixed at 208px with simulation and export controls; Analytics uses responsive Tailwind grids (`grid-cols-2 sm:grid-cols-4`) filling `max-w-7xl` centred content without sidebar navigation chrome duplication. Overview feed rows support keyboard shortcuts (N, A, S); Analytics is mouse-scroll only. Sound alerts and critical toasts register on Overview via `onCritical()` callback. Analytics omits sensory urgency by design so managers review charts without interrupting operators. Training defaults: assign persona defaults: tier-1 bookmark Overview, SOC lead bookmarks both, CISO bookmarks Executive View plus Analytics monthly. Attempting triage solely from Analytics forces navigation latency, each missed ACK minute increases MTTR proxies even though MTTR is not labelled here. Conversely, attempting trend briefings from Overview requires mentally aggregating rows; error-prone under sleep deprivation during night shifts.
