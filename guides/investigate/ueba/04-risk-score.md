---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: The risk score
last_updated: 2026-05-23
---

# The risk score

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

**ANOMALY SCORE** column pairs colour-coded progress bar with numeric score. Colours: ≥70 red `#ff2d55`, ≥40 orange `#ff9500`, ≥20 yellow `#ffd60a`, else green `#30d158`. **STATUS** text mirrors thresholds. Profile panel repeats large coloured score with behaviour bar breakdowns.

### What is happening underneath

Four inputs compound additively: off-hours events (×10), failed authentication events (×5), IP diversity beyond 3 IPs (×8 per excess IP), critical severity events (×15). No diminishing returns, score caps at 100 via `Math.min`. Failed auth detected by `eventType.includes('failed')` or `event.outcome === 'failure'`. Critical detection uses `severity === 'critical'`.

### Why this matters

Single indicators may be benign, one failed login happens daily. Compounding reveals attack patterns: failed logins + off-hours + multiple IPs = credential stuffing. Weighted sum mimics analyst mental aggregation, automating consistency across shifts.

### Step-by-step walkthrough

1. Find user with high **FAILED AUTH** (red if >5).
2. Check if UNIQUE IPs >3 (orange highlight).
3. Note **OFF-HOURS** >0 (yellow highlight).
4. Verify score ≥40 triggers **ANOMALOUS** minimum.
5. Open profile, map bars to formula components.
6. Identify which input to investigate first (usually failed auth + IPs).
7. Reset password if score ≥70 with failed auth pattern.

### Common questions

#### What triggers an alert vs just a high score?

This module displays scores only; auto-alerting would require Rules Engine integration on score threshold (not implemented). Analyst must act on visual flag.

#### Do critical alerts always mean compromised account?

Not always; the user may have triggered one critical rule legitimately. Context in **RECENT EVENTS** clarifies.

#### Why cap at 100?

Normalised scale for executive communication and consistent STATUS thresholds. Uncapped scores would complicate triage bands.

#### How does IP diversity scoring work?

First 3 IPs free; each additional IP adds 8 points. Simulates impossible simultaneous geographic presence or credential sharing.

### Analyst workflow under pressure

Brute-force campaign: many users show elevated failed auth; prioritise those also with IP diversity and off-hours. Single user spike during incident window, isolate account immediately, preserve **RECENT EVENTS** for forensics.

### Edge cases and gotchas

Shared service accounts aggregate many IPs without malicious intent; know your service account list. `eventType.includes('failed')` may miss custom parser failure strings. One critical event adds 15, insufficient alone for SUSPICIOUS status (needs 70+).

### Response thresholds by score band

Score 70+ (**SUSPICIOUS**): initiate credential reset conversation within 15 minutes. Score 40–69 (**ANOMALOUS**): investigate within same shift, no immediate lockout without corroboration. Score 20–39: document and monitor, optional Geo Map check. Below 20 (**NORMAL**): no action unless other modules flag. Failed auth column turns red above 5: quick visual pre-filter before reading numeric score. IP diversity orange above 3 unique IPs, aligns with formula threshold (penalty starts at 4th IP).

### Communicating risk score to leadership and engineering

For board conversations, frame Investigate → UEBA numbers as risk to revenue and reputation. For engineering reviews, reference the component file and `the SIEM context pipeline` fields listed in the walkthrough. Keep artefacts: PNG exports beat memory.

### Reading paths for analysts and engineers

Operators should rely on visible labels, colour cues, and the numbered walkthrough. Confirm field names in the UI match hunt and graph queries, and treat this lab build as a subset of enterprise SIEM capability.

#### What is the elevator pitch for risk score when briefing the board?

Brief the board on risk score by showing Investigate → UEBA live. Focus on trend direction, worst-case impact, and cost to respond. If data is sparse, say so and explain what you are doing to populate the view before the next meeting.

#### Which code paths should engineers check when changing risk score?

Locate the matching component under `dashboard screens` and confirm field names in the UI match the `the SIEM context pipeline` alert and log schema. Breakpoints and filters described here should align with local screen state, `useMemo`, and render branches, if the code changed, update this document. Trace data from the ingest API through the parser to the context provider so hunt queries, graph drag payloads, and map aggregations stay consistent. Add integration tests when altering normalisation because every Investigate module consumes the same alert objects.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
