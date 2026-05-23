---
module: Heatmap Calendar
sidebar: Investigate → Heatmap Calendar
section: Investigate
subsection: Detecting slow-burn attacks
last_updated: 2026-05-23
---

# Detecting slow-burn attacks

**Sidebar path:** Investigate → Heatmap Calendar

![Heatmap Calendar main view](../../../screenshots/guides/investigate-heatmap-calendar.png)

### What you are looking at

Slow-burn signature on Day × Month: horizontal streak of warm cells same day-of-month or consecutive days low absolute colour but persistent (light green every day). Hour × Day may show faint consistent cells vs single bright spike. Filtered panel after clicking streak day shows small event count per day but consistent source IP or rule across days.

### What is happening underneath

Low daily counts never reach red in hour view individually, aggregation across days in month view accumulates visual pattern. APT dwell time measured in weeks. 3 events/day × 42 days = 126 events invisible as spike, visible as sustained warmth. No automatic campaign detection, analyst interprets streak visually. `dayMonthMatrix` indexes `(monthIdx, dayIdx)` with rolling 12-month relative indexing from current date.

### Why this matters

Advanced attackers stay under alert thresholds deliberately. Volume-based rules won't fire. Heatmap is rare tool making multi-week persistence visible without ML. Mandiant dwell time statistics (median ~99 days) justify this analysis mode.

### Step-by-step walkthrough

1. Open Day × Month; scan for horizontal bands of non-dark cells.
2. Click mild green cell on streak: read filtered events (may be ≤20 total that day).
3. Note repeating `sourceIp` or rule across multiple days (manual multi-click comparison).
4. Switch Hour × Day; check if same hour repeats (bot schedule).
5. Open Threat Hunt, query low-severity events from identified IP across full range.
6. Open Event Graph; build multi-day relationship graph.
7. Escalate to case if pattern confirmed: volume alone didn't trigger before.

### Common questions

#### How few events per day still matter?

Context-dependent. 1 critical/day matters more than 10 low/day. Always read severity in filtered panel, not colour alone.

#### Why doesn't the SIEM auto-detect campaigns?

This lab lacks correlation across long time windows at low thresholds, analyst visual discovery compensates. Production adds ML anomaly over baselines.

#### Can simulate campaign show slow-burn?

Default simulation may create burst not drip; build ingest manually for streak testing via Log Ingestion spaced timestamps.

#### What's the difference from alert manager backlog?

Backlog is count of open alerts. Heatmap streak is the temporal pattern of all alerts, including closed ones (historical behaviour.

### What analysts do when the pager fires

When single alert seems minor, check Day × Month for 30-day streak same IP; transforms priority from low to critical campaign. Justifies incident elevation despite low daily volume.

### Edge cases and gotchas

Month matrix rolling index confusing near year boundaries, verify clicked day matches intended calendar date via filtered event timestamps. Streak of green may be legitimate cron job; know your scheduled tasks. 31-day row includes empty future days in current month as zero dark cells.

### APT dwell time analogue in lab data

Three events per day for forty days = 120 events, which may never trigger volume-based rules. Day × Month horizontal banding reveals persistence invisible in Alert Manager sorted by severity. Click multiple days in streak manually comparing `sourceIp` in each day's filtered panel; consistent IP across mild days confirms campaign. Escalate to Respond → Incidents when streak spans 14+ days with consistent attacker indicators regardless of daily volume.

### Communicating slow-burn attacks to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → Heatmap Calendar, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Operator vs maintainer focus

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### What talking points cover slow-burn attacks for senior leadership?

Brief the board on slow-burn attacks by showing Investigate → Heatmap Calendar live. Focus on trend direction, worst-case impact, and cost to respond. If data is sparse, say so and explain what you are doing to populate the view before the next meeting.

#### Which code paths should engineers check when changing slow-burn attacks?

Engineers should grep for the sidebar label `Investigate → Heatmap Calendar` in global header, open the routed component, and verify each bold UI string in this page still exists. Parser changes require a spot-check in Monitor → Live Feed because Investigate views inherit the same normalised objects.

#### Which mistake do new analysts make most often here?

Assuming empty or quiet means safe. Verify ingestion in Pipeline Health and rule hits on Overview before telling stakeholders the environment is clean.
