---
module: Heatmap Calendar
sidebar: Investigate → Heatmap Calendar
section: Investigate
subsection: How to read the calendar
last_updated: 2026-05-23
---

# How to read the calendar

**Sidebar path:** Investigate → Heatmap Calendar

![Heatmap Calendar main view](../../../screenshots/guides/investigate-heatmap-calendar.png)

### What you are looking at

Colour progression: zero `#0d1a22`, low `#0d3d2a` / `#1a6040`, mid `#cc7a00`, high `#cc3300`, peak `#ff2d55`. Selected cell cyan border `var(--cyan)`. Hover shows floating tooltip above cell. Severity × Hour uses fixed severity colours (critical red, high orange, medium yellow, low green) stacked bottom-up.

### What is happening underneath

`heatColor(val, max)` normalises count to max in current view: `t = val/max`, threshold steps at 0.25/0.5/0.75/0.9. Different modes use different max values (`maxHourDay`, `maxDayMonth`, `maxSevHour`). Severity mode bar height `(bucket[key] / maxSevHour) * 160px`. Focus filter matches cell definition precisely, hour+day index, month+day index, or hour-only for severity mode.

### Why this matters

Misreading colour scale causes false escalation, orange mid-range isn't critical severity, just moderate volume relative to peak. Legend anchors interpretation. Relative scaling means today's "red" depends on today's max, compare legend numbers across screenshots for historical analysis.

### Step-by-step walkthrough

1. Note legend max value on Hour × Day (e.g. max 47).
2. Identify red cell; hover tooltip for exact count.
3. Compare to legend max: is it 90% of peak or absolute high?
4. Click cell; verify count matches filtered event list length (≤20 shown).
5. Switch modes, observe max rescales (different normalisation).
6. Severity × Hour: read stack composition not just total height.
7. Deselect by re-clicking focused cell.

### Common questions

#### Does red mean critical severity?

In Hour × Day and Day × Month, red means high *volume* relative to peak, not necessarily critical severity. Use Severity × Hour mode for severity-specific timing.

#### Why does my red cell show only 5 events in panel?

Panel shows max 20; count may be higher. Tooltip shows true count. Low absolute count can still be red if it's the busiest cell in quiet dataset.

#### What's the cyan border?

Selected focus cell; drives right panel filter. Toggle off by clicking again.

#### How do severity stacks work?

Each hour column stacks coloured segments bottom to top proportional to critical/high/medium/low counts; tall red segment means many criticals that hour.

### Using this view during live response

Executive asks "how bad was last night?", screenshot severity×hour bars with red segment height, cite tooltip counts, attach filtered event list for top 3 IPs.

### Edge cases and gotchas

Single alert in empty dataset makes one green cell look "hot" relative to zeros; absolute count still 1. Mode switch clears focus (`setFocusTime(null)` on mode change). Severity focus filters by hour only: includes all severities in that hour in panel.

### Relative vs absolute interpretation discipline

Always read legend max alongside colour; red at max=5 means five events, red at max=500 means five hundred. Cross-shift handover must cite absolute tooltip counts, not colour alone, to prevent exaggeration. Severity × Hour focus filters `focusedAlerts` by hour only, panel includes all severities in that hour; read badge colours per row. Selected cell cyan border persists until toggle click; visual reminder that right panel is filtered, not global.

### Communicating reading the calendar to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Heatmap Calendar, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Operator vs maintainer focus

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### How would you summarise reading the calendar for leadership in under two minutes?

Use Investigate → Heatmap Calendar as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### What should developers verify in the React source for reading the calendar?

Treat this page as a contract test: every **LABEL** in prose should appear on screen or in derived state. Confirm API routes feeding Investigate → Heatmap Calendar match appendix endpoint docs. If geo, graph, or hunt pivots break, inspect shared normalisation first.

#### Which mistake do new analysts make most often here?

Over-trusting a single panel on Investigate → Heatmap Calendar. Severity colour ranks items against each other in memory, not against ground truth. Confirm with another view, then document in a case. Also save or screenshot before refresh; many Investigate tools keep state only in the browser session.
