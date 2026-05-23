---
module: Heatmap Calendar
sidebar: Investigate → Heatmap Calendar
section: Investigate
subsection: Shift-handover use
last_updated: 2026-05-23
---

# Shift-handover use

**Sidebar path:** Investigate → Heatmap Calendar

![Heatmap Calendar main view](../../../screenshots/guides/investigate-heatmap-calendar.png)

### What you are looking at

Shift handover workflow: incoming analyst opens Hour × Day, scans overnight columns (22–06) and current weekday row, clicks warm cells, reads **FILTERED EVENTS** panel for summary without opening every alert in Alert Manager. Hint bar explicitly describes drill-down purpose. Deselect clears panel to placeholder guidance text.

### What is happening underneath

Handover is procedural not automated, no shift notes integration. Heatmap compresses 8-hour overnight window into one visual row scan taking seconds vs hundreds of alert rows. `focusTime` state drives panel; clearing returns instructional empty state. Severity×hour mode answers "were any criticals overnight?" with one glance at bar stacks in hours 0–6.

### Why this matters

Missed handover continuity causes duplicated work or dropped alerts, classic SOC failure mode. Heatmap standardises "what happened on my watch" narrative. NIST SP 800-61 emphasises communication during incident handling, visual summary aids verbal brief.

### Step-by-step walkthrough

1. Start shift; open Heatmap Calendar before Alert Manager.
2. Hour × Day: scan your weekday row overnight hours.
3. Click any non-dark overnight cell: read top 5 filtered events.
4. Severity × Hour: verify hours 0–6 bar stacks for red segments.
5. Note IPs/rules repeating; add to shift log.
6. Brief outgoing analyst: "Warm spot Thu 02:00, auth failures IP X."
7. Clear focus; repeat at end of shift for incoming analyst.

### Common questions

#### Does this replace reading alert manager?

No; prioritises where to read. Heatmap finds windows; Alert Manager triages individual alerts.

#### How long should handover take?

Target under 5 minutes for heatmap scan plus 5 minutes verbal brief; vs 30+ minutes reading full queue.

#### What if overnight was all dark (no colour)?

Good sign, still verify Severity × Hour and Alert Manager new count. Absence of heat isn't absence of single critical alert.

#### Can I save focus selection for next shift?

No persistence; screenshot or copy IPs to case notes. Scheduler doesn't apply to heatmap state.

### How an analyst uses this during an active incident

Mid-incident shift change: outgoing analyst screenshots current Hour × Day with focus on active window, attaches to case, incoming analyst continues from filtered event IPs without re-deriving timeline from scratch.

### Edge cases and gotchas

Timezone mismatch between shifts in different regions; agree UTC reference. Clicking wrong cell briefs wrong window; double-check tooltip before verbal handover. 20-event panel cap may hide tail of busy hour, note "20+ shown of N" from tooltip count.

### Handover checklist tied to heatmap

Incoming analyst: (1) open Hour × Day, (2) scan overnight hours on current weekday row, (3) click warmest overnight cell, (4) copy top 3 IPs from panel to shift log, (5) Severity × Hour hours 0–6 critical check, (6) verbal brief outgoing analyst confirming or correcting interpretation, (7) Alert Manager triage of new status only after heatmap orientation complete; prevents fighting latest alert while missing overnight pattern.

### Communicating shift handover to leadership and engineering

Leadership briefings on Investigate → Heatmap Calendar should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Reading paths for analysts and engineers

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### How do you walk a non-technical board through shift handover quickly?

When leadership asks about shift handover, open Investigate → Heatmap Calendar and read the visible KPIs aloud. Tie each number to an owner and a deadline. Separate confirmed incidents from suspected noise. Ask for one resource decision rather than open-ended concern.

#### What React and API checks apply to shift handover?

Maintainers: open DevTools, compare network payloads to the field names cited here, and ensure RBAC gates still match Settings → RBAC. Document any intentional drift between demo data and production schemas in the technical note block.

#### Which mistake do new analysts make most often here?

Jumping to containment from Investigate → Heatmap Calendar without corroboration. Use the walkthrough fields as leads, not verdicts. Export or note your filter set before leaving the page.
