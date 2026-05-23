---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: What UEBA means and why it was invented
last_updated: 2026-05-23
---

# What UEBA means and why it was invented

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

The header banner reads UEBA. USER BEHAVIOR ANALYTICS with subtitle explaining the scoring formula: "Anomaly scoring: off-hours auth×10 + failed auth×5 + IP diversity×8 + critical events×15". The main area is a sortable table with columns **USER**, **ANOMALY SCORE** (progress bar + numeric), **EVENTS**, **FAILED AUTH**, UNIQUE IPs, **OFF-HOURS**, **PEAK HOUR**, **STATUS** (**NORMAL** / **ANOMALOUS** / **SUSPICIOUS**). Clicking a row opens a 300px **USER PROFILE** side panel with large score display, behaviour bars, OBSERVED IPs, and **RECENT EVENTS**.

### What is happening underneath

UEBA screen merges `alerts` and `rawLogs` from the SIEM context pipeline, grouping events by username extracted from `e.username || e.source?.user?.name || e.user?.name`. Users `anonymous` and `unknown` are excluded. Each profile computes `anomalyScore()` from off-hours activity, failed auth count, unique IP count >3, and critical severity events. Profiles sort descending by score. No ML model, weighted heuristic capped at 100.

> **Technical note:** Production UEBA (Exabeam, Splunk UBA) uses statistical baselines, peer groups, and machine learning over 7–30 day windows. This lab implements transparent arithmetic for educational clarity.

### Why this matters

Perimeter tools catch strangers breaking in. UEBA catches legitimate credentials behaving strangely, stolen password, insider exfil, compromised service account. Target breach involved stolen vendor credentials; Sony insider threat involved disgruntled employee. Neither looked like "external hacker" at first login.

### Step-by-step walkthrough

1. Open Investigate → UEBA after ingesting logs with usernames.
2. If empty message appears, add logs via Log Ingestion with username fields.
3. Scan **STATUS** column for **SUSPICIOUS** (score ≥70).
4. Click highest-score user row; **USER PROFILE** opens.
5. Review OBSERVED IPs and **RECENT EVENTS**.
6. Compare **FAILED AUTH** and **OFF-HOURS** bars.
7. Cross-check flagged user in Geo Map impossible travel panel.

### Common questions

#### What is UEBA in plain english?

It's a system that learns what "normal" looks like for each user, then flags when someone breaks their pattern, like a bank noticing your card buying electronics in another country at 3am.

#### Is this the same as antivirus?

No. Antivirus finds malicious files. UEBA finds suspicious behaviour using legitimate credentials and normal tools; living-off-the-land attacks.

#### Why combine alerts and raw logs?

Alerts may miss failed attempts that never triggered rules. Raw logs capture fuller authentication narrative for baseline building.

#### Who should look at this module?

SOC analysts during credential incidents, IT helpdesk during account lockout spikes, compliance officers auditing data access patterns.

### What analysts do when the pager fires

Credential compromise suspected: sort by anomaly score, click top user, verify IP list against known locations, check recent events for privilege escalation. High failed auth + multiple IPs + off-hours = priority account lock candidate.

### Edge cases and gotchas

Empty state if no usernames in data, not a broken module. Service accounts may score high due to automated multi-IP behaviour; investigate before lockout. Score is session snapshot, not historical baseline database.

### Data sources merged in profile construction

Profiles merge `alerts` and `rawLogs`; alerts bring severity and rule context; raw logs bring failed attempts and actions never promoted to alerts. Username extraction tries `e.username`, then `e.source?.user?.name`, then `e.user?.name`; ingest must populate at least one path. Excluded identities `anonymous` and `unknown` prevent polluting rankings with unauthenticated web traffic. Paths tracked in `profiles[user].paths` Set but not displayed in main table, future enhancement; currently use **RECENT EVENTS** in profile panel for path hints via `urlPath` or `url?.path`.

### Communicating UEBA invented to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → UEBA, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Two readers, one screen

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### What is the elevator pitch for UEBA invented when briefing the board?

Use Investigate → UEBA as a prop, not a tutorial. Highlight the top three labelled fields that changed since yesterday. Explain customer or revenue exposure in plain language. Request only the decision you need today. Document the screen with timestamp for the minutes.

#### What React and API checks apply to UEBA invented?

Treat this page as a contract test: every **LABEL** in prose should appear on screen or in derived state. Confirm API routes feeding Investigate → UEBA match appendix endpoint docs. If geo, graph, or hunt pivots break, inspect shared normalisation first.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
