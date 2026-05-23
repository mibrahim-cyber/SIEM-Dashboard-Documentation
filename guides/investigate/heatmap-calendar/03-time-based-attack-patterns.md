---
module: Heatmap Calendar
sidebar: Investigate → Heatmap Calendar
section: Investigate
subsection: Time-based patterns in attacks
last_updated: 2026-05-23
---

# Time-based patterns in attacks

**Sidebar path:** Investigate → Heatmap Calendar

![Heatmap Calendar main view](../../../screenshots/guides/investigate-heatmap-calendar.png)

### What you are looking at

Hour × Day grid: rows labelled Mon–Sun, columns 0–23 hours (labels every 6h). Warm colours on weekend rows or night columns (22–06) suggest off-hours activity. Severity × Hour bars tall overnight with red critical segments indicate serious night attacks. Legend on hour×day shows scale from 0 to `maxHourDay`.

### What is happening underneath

Timestamps parsed via `new Date(a.timestamp)`. Day index `(d.getDay() + 6) % 7` maps Sunday JS convention to Mon=0. Off-hours hunting aligns with UEBA (22:00–06:00). Attackers choose holidays/weekends for reduced staffing, visible as Sat/Sun row intensity. Automated attacks may show uniform 24×7 heat, human vs bot discrimination heuristic.

### Why this matters

Mature SOC staffing follows business hours. Attackers know this. Heatmap justifies overnight/on-call coverage funding with data, "40% of critical alerts fire between midnight and 6am" is persuasive to leadership.

### Step-by-step walkthrough

1. Scan Hour × Day for red cells outside business hours (9–17 weekdays).
2. Compare Wed 14:00 vs Sat 03:00 intensity.
3. Click Saturday night hot cell; review filtered events' source IPs.
4. Switch Severity × Hour: check if off-hours bars include red critical segment.
5. Cross-reference **UEBA** off-hours counts for same window users.
6. Document pattern: "Campaign active weekends only."
7. Adjust on-call roster or scheduled hunts accordingly.

### Common questions

#### Do attackers really prefer nights and weekends?

Often yes for human-operated attacks; defenders asleep, changes less noticed. Automated malware runs continuously, shows flat heatmap.

#### What timezone applies?

Browser local timezone from JavaScript Date; consistent with UEBA peak hour. Distributed teams must agree timezone for interpretation.

#### Why monday morning spikes happen?

Catch-up processing, batch jobs, users returning; not always malicious. Compare to baseline weeks before alerting leadership.

#### Can heatmap predict next attack?

No; descriptive not predictive. Informs hunting focus windows, not fortune telling.

### Using this view during live response

If incident occurs Saturday 2am, heatmap reveals whether prior Saturdays showed similar patterns, recurring scheduled task vs novel attack. Filters hunting to same hour blocks historically.

### Edge cases and gotchas

DST transitions may split/merge hour buckets oddly one day per year. Single massive incident creates one hot cell; don't over interpret as recurring pattern without Day × Month confirmation. Zero cells are dark `#0d1a22`; easy to miss vs low activity green.

### Human vs automated pattern discrimination

Flat 24×7 warmth across Hour × Day suggests bot or worm activity; no human sleep cycle. Concentrated Mon–Fri 09:00–17:00 warmth may reflect business traffic noise, not attack, compare severity mode before escalating. Weekend red cells in Hour × Day with critical severity stacks in Severity × Hour for same hours strongly suggest intentional off-hours human action or scheduled task compromise; investigate both hypotheses.

### Communicating time-based attack patterns to leadership and engineering

For board conversations, frame Investigate → Heatmap Calendar numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Operator vs maintainer focus

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### How can you frame time-based attack patterns for a steering committee in two minutes?

Share your screen on Investigate → Heatmap Calendar and anchor the conversation on the headline counters visible without scrolling. Give counts, severity mix, and whether the activity is isolated or spreading. Recommend a single decision: budget, block, or escalate. Avoid acronyms unless the room already uses them. End with a time-bound follow-up.

#### Where should time-based attack pattern behaviour be cross-checked?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → Heatmap Calendar render with Simulate Campaign before merging.

#### Which mistake do new analysts make most often here?

Over-trusting a single panel on Investigate → Heatmap Calendar. Severity colour ranks items against each other in memory, not against ground truth. Confirm with another view, then document in a case. Also save or screenshot before refresh; many Investigate tools keep state only in the browser session.
