---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: Entity behaviour beyond users
last_updated: 2026-05-23
---

# Entity behaviour beyond users

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

Table column **USER** lists all identified usernames including likely service accounts (`svc-*`, `SYSTEM`, application names if logged). Same scoring applies, no separate entity type column. Service accounts often show high IP diversity and high event counts.

### What is happening underneath

Grouping key is username string only, no distinction between human and service account in code. Entity behaviour analytics in enterprise products model service principals, devices, and applications separately with different baselines. Here, any non-anonymous username gets same formula, educational limitation requiring analyst interpretation.

### Why this matters

Compromised service accounts enable lateral movement without human login; the SolarWinds attack used service accounts in the same way. Treating `svc-backup` like a human user generates false positives unless baselines differ. Conceptually UEBA applies to any identity; humans are just the common case.

### Step-by-step walkthrough

1. Scan **USER** column for service account naming patterns.
2. Note high **EVENTS** + high UNIQUE IPs on service accounts.
3. Compare to known automation baseline (document externally).
4. Investigate human users separately with HR context.
5. For machine-like users, prioritise critical events over off-hours.
6. Check **RECENT EVENTS** for unusual API actions.
7. Create separate monitoring policy notes for service accounts.

### Common questions

#### Why is my service account flagged?

Automated jobs often login from multiple IPs and run off-hours by design; expected behaviour for that entity type, anomalous for humans.

#### Can I exclude service accounts?

Not in UI, analyst filters mentally or future enhancement. Document excluded accounts in runbooks.

#### What about device entities?

Devices without username fields won't appear; device ID grouping requires extending the entity model. Appears only if logs include device as username.

#### Should service account scores trigger lockout?

Dangerous, since it may break production automation. Require human approval for service account response actions.

### Operational use during containment

Distinguish compromised service account from compromised human early; response differs (rotate secret vs call user). High-scoring `svc-*` during ransomware, priority credential rotation target.

### Edge cases and gotchas

Generic usernames (`admin`, `user`) aggregate unrelated activity if shared; identity hygiene matters. Missing username fields exclude events entirely; an ingest-gap blind spot.

### Service account runbook entries

Maintain external runbook listing expected service accounts (`svc-backup`, `svc-sql`) with expected IP count and schedule; compare manually to UEBA table. Machine accounts scoring **SUSPICIOUS** trigger secret rotation not password reset. Application services logging as single username aggregate all app traffic, high **EVENTS** may be normal; weight **FAILED AUTH** and critical-weighted score components heavier for service identities.

### Communicating entity behaviour to leadership and engineering

Leadership briefings on Investigate → UEBA should tie each KPI to a business owner. Technical stakeholders need the ingest → context → component path spelled out. Screenshot the stat strip with timestamps when evidence may be challenged later.

### Who should read which sections

Analyst readers: stay on-screen labels and the step list above. Maintainer readers: validate the screen against this prose before release. Enterprise deployments add scale; the interaction patterns here still apply.

#### What should executives hear first about entity behaviour?

Open Investigate → UEBA on the live dashboard during the meeting. Point to the primary visual described in the opening section; skip raw log lines. State how many items are flagged, whether the pattern is new or recurring (compare to yesterday's screenshot if you have one), and name one concrete next action (block IP, reset credential, open case). Boards decide on risk and resources, not MITRE techniques, so translate findings into business impact and recommended spend. Close with what remains unknown and when you will update them.

#### How do maintainers validate entity behaviour against the live UI?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → UEBA render with Simulate Campaign before merging.

#### What is the most common beginner mistake on this screen?

Treating visual intensity (colour, size, score) as absolute proof rather than relative prioritisation within the current dataset. Cross-check with a second module (Threat Hunt counts, Event Graph relationships, or Live Feed raw lines) before containment. A second frequent error is acting on session-only state (unsaved graphs, unsaved hunts, uncaptured heatmap focus) and losing context on refresh; screenshot or case-note artefacts before navigating away.
