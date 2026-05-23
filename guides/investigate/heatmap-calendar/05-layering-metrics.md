---
module: Heatmap Calendar
sidebar: Investigate → Heatmap Calendar
section: Investigate
subsection: Comparing multiple metrics on the calendar
last_updated: 2026-05-23
---

# Comparing multiple metrics on the calendar

**Sidebar path:** Investigate → Heatmap Calendar

![Heatmap Calendar main view](../../../screenshots/guides/investigate-heatmap-calendar.png)

### What you are looking at

Three modes compare volume (Hour × Day, Day × Month) vs severity composition (Severity × Hour). Analyst mentally layers findings: hot weekday hour in mode 1 + critical stack same hour in mode 3 = high-priority hunting window. Right panel shows rule names (`matchedRules[0].ruleName`) or `eventType` per filtered alert.

### What is happening underneath

No simultaneous multi-layer overlay, comparison requires switching modes and remembering patterns (or screenshots). `focusedAlerts` filter logic differs per `focusTime.type`. Severity matrix `severityByHour` independent from hourDayMatrix, same alerts, different aggregation. Event type layering is accomplished via the filtered alert list content inspection; add a dedicated mode to the heatmap component to surface event-type breakdowns directly alongside temporal data.

### Why this matters

Volume without severity misallocates resources; Monday 9am may spike low-severity scan noise. Severity without volume misses slow critical drip. Layering both dimensions is professional analysis discipline this UI teaches through mode switching.

### Step-by-step walkthrough

1. Hour × Day: identify busiest hour (e.g. Tue 10:00).
2. Switch Severity × Hour: inspect hour 10 stack: mostly red or green?
3. If red-critical heavy, click hour 10 bar; filter panel events.
4. Note dominant `eventType` or rule names in panel list.
5. Switch Day × Month: check if Tue 10 pattern repeats weekly (same Tuesday column across months approximate via day-of-month proxy, limitation acknowledged).
6. Document combined finding: "High volume + critical severity Tuesday mornings = scheduled task or recurring attacker TTP."
7. Create Threat Hunt query for that window conditions.

### Common questions

#### Can I overlay severity on the day×hour grid?

Not natively; switch modes or export data externally. Enterprise tools offer multi-metric heatmaps; lab teaches sequential analysis.

#### How do I correlate event types?

Use filtered panel after cell click; read rule names/types across listed events for commonality.

#### What's the best mode for executives?

Hour × Day with legend; intuitive "when are we attacked?" Severity × Hour answers "when are serious attacks?"

#### Do modes share the same data?

Yes, all derive from same `alerts` array, different aggregations. Counts should be logically consistent across modes for same time windows.

### What analysts do when the pager fires

Correlate ongoing incident timestamp to heatmap, if current attack hour matches historically hot severity column, pull Threat Hunt templates tuned for that event type from prior investigations.

### Edge cases and gotchas

Mode switch clears selection; re-click after switching. Day×month uses day-of-month not day-of-week; different question than hour×day. Panel 20-event cap hides tail of large buckets.

### Sequential analysis protocol

Mandatory sequence for campaign assessment: (1) Day × Month streak identification, (2) click streak day → note IPs in panel, (3) Hour × Day same IPs' hour concentration, (4) Severity × Hour critical confirmation, (5) Threat Hunt `sourceIp equals` for full count beyond 20-panel cap. Skipping steps causes misattribution, streak without critical severity may be benign batch job.

### Communicating layering metrics to leadership and engineering

For board conversations, frame Investigate → Heatmap Calendar numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Two readers, one screen

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### What should executives hear first about layering metrics?

Use Investigate → Heatmap Calendar as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### How do maintainers validate layering metrics against the live UI?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → Heatmap Calendar render with Simulate Campaign before merging.

#### What is the most common beginner mistake on this screen?

Over-trusting a single panel on Investigate → Heatmap Calendar. Severity colour ranks items against each other in memory, not against ground truth. Confirm with another view, then document in a case. Also save or screenshot before refresh; many Investigate tools keep state only in the browser session.
