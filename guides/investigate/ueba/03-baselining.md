---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: Baselining explained
last_updated: 2026-05-23
---

# Baselining explained

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

The subtitle formula is the baseline rubric printed on screen. Table columns quantify deviations: **OFF-HOURS** counts events between 22:00–06:00, **FAILED AUTH** counts failure events, UNIQUE IPs counts distinct source IPs, **PEAK HOUR** shows modal activity hour. **USER PROFILE** behaviour bars visualise Failed Auth, Off-Hours Activity, IP diversity, Total Events against max thresholds (20, 20, 10, 50).

### What is happening underneath

```javascript
function anomalyScore(events) {
 let score = 0;
 const offHours = hours.filter(h => h >= 22 || h < 6).length;
 score += offHours * 10;
 score += failedAuth * 5;
 if (uniqueIps > 3) score += (uniqueIps - 3) * 8;
 score += critEvents * 15;
 return Math.min(100, score);
}
```
Peak hour computed by counting events per hour 0–23, taking argmax. "Baseline" here is implicit current-session aggregation, not a stored 30-day profile, lab simplification.

### Why this matters

Baselining converts subjective "this feels weird" into comparable numbers. Executives understand "score 78/100 suspicious" better than raw log counts. Transparent formula lets analysts explain *why* a user flagged, required for HR/legal conversations about insider investigations.

### Step-by-step walkthrough

1. Select a **SUSPICIOUS** user (score ≥70).
2. Read large score in profile panel, note /100 cap.
3. Compare behaviour bars, which dimension dominates?
4. High off-hours bar → check **OFF-HOURS** column value.
5. High IP diversity → review OBSERVED IPs list length.
6. Cross-reference **FAILED AUTH** column colour (red if >5).
7. Document score components in case notes using formula.

### Common questions

#### How long does baselining take?

Enterprise UEBA needs 7–30 days of data. This lab calculates from all available events immediately, instant but less accurate statistically.

#### What's a normal score?

Below 20 shows **NORMAL** (green). 20–39 **ANOMALOUS** (yellow). 40–69 still anomalous. 70+ **SUSPICIOUS** (red).

#### Can I adjust thresholds?

Not in UI; formula hardcoded in component. Production tools allow tunable peer groups and seasonal adjustments.

#### Why multiply off-hours by 10?

Weights reflect operational risk, off-hours admin activity is rarer and more suspicious than midday browsing, so it contributes more to score.

### Using this view during live response

Analyst decomposes score for incident report: "Score 82 driven by 4 off-hours events (+40), 6 failed auth (+30), 5 unique IPs (+16)." Identifies dominant factor guiding response; password spray vs travel vs insider.

### Edge cases and gotchas

UTC vs local timezone is not handled; peak hour uses browser local time from timestamps. Users with few total events may score low despite one suspicious action; low **EVENTS** count context matters. Critical events add +15 each, rapid escalation possible.

### Transparent formula as teaching tool

Unlike black-box ML UEBA products, the on-screen formula lets analysts explain scores in hearings: "12 off-hours events × 10 = 120, capped to 100." Peak hour column supports shift scheduling, if peak hour is 3 for a day-shift employee, investigate regardless of score. **PEAK HOUR** of 14:00 with high off-hours count suggests sporadic anomaly, not complete schedule inversion. Pair with Heatmap Calendar hour×day view for org-wide off-hours context vs individual user deviation.

### Communicating baselining to leadership and engineering

For board conversations, frame Investigate → UEBA numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Operator vs maintainer focus

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### How can you frame baselining for a steering committee in two minutes?

Use Investigate → UEBA as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### What React and API checks apply to baselining?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → UEBA render with Simulate Campaign before merging.

#### What tripping point catches first-time users?

Jumping to containment from Investigate → UEBA without corroboration. Use the walkthrough fields as leads, not verdicts. Export or note your filter set before leaving the page.
