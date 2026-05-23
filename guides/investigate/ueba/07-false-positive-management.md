---
module: UEBA
sidebar: Investigate → UEBA
section: Investigate
subsection: False-positive management
last_updated: 2026-05-23
---

# False-positive management

**Sidebar path:** Investigate → UEBA

![UEBA main view](../../../screenshots/guides/investigate-UEBA.png)

### What you are looking at

False positive signals: executive with **SUSPICIOUS** after travel (check Geo Map impossible travel), on-call engineer with off-hours activity, pen-test account during engagement, developer with high event count normal for role. **STATUS** **ANOMALOUS** (40–69) band often false positive territory requiring context.

### What is happening underneath

No annotation or whitelist mechanism in UEBA module, false-positive management is manual analyst judgement documented externally. Expected deviations (travel, on-call) should reduce score in production via exception rules; lab lacks this. Peak hour column helps identify shift workers (peak at 8 vs 14).

### Why this matters

False positives erode analyst trust, crying wolf on CEO login destroys UEBA programme credibility. Travel, mergers, new projects, on-call rotations create legitimate deviation. Programmes fail without exception handling, not without detection.

### Step-by-step walkthrough

1. User flagged **SUSPICIOUS**, pause before lockout.
2. Check Geo Map impossible travel; VPN/travel explanation?
3. Verify **PEAK HOUR** against known work schedule.
4. Contact user's manager for context (out of band).
5. If expected deviation, document in case notes: do not escalate.
6. If repeated false flag, note for future baseline exception request.
7. Tune related detection rules in Rules Engine if alerts drive score.

### Common questions

#### Will travelling executives always score high?

Often yes; off-hours + new IPs + geo change. Production adds travel calendar integration; lab requires manual verification.

#### How do I annotate expected deviation?

Not in this UI, use Case Manager notes or external GRC tool. Future Settings enhancement possible.

#### Should I lower thresholds globally?

Prefer per-user or per-group exceptions over global lowering; global change misses real threats.

#### What's the difference between ANOMALOUS and SUSPICIOUS?

40–69 vs 70+; the higher band warrants faster response, lower band warrants investigation before action.

### Operational use during containment

Before account lock during breach, verify flagged user isn't incident responder working off-hours on containment; common false positive during active IR. Check **RECENT EVENTS** for security tool actions.

### Edge cases and gotchas

No undo for wrongful lockout, SOAR actions require confirmation. Shared accounts make baseline meaningless; fix identity first. Score doesn't decay over time in-session; old events still counted until data refresh.

### Exception documentation without UI support

Production UEBA adds allowlists for travel, on-call, pen-test windows; lab lacks these controls. Workaround: Case Manager tag `UEBA-exception` with expiry date for known deviations. Re-check exceptions weekly, expired travel exceptions causing repeated false flags indicate process failure. Pen-test accounts should be excluded from executive UEBA reports to avoid false escalation during engagements.

### Communicating false-positive management to leadership and engineering

Executives want impact and cost; developers want schema and file paths. Treat these one-line phrases as starting points and adapt to the meeting in the room. On Investigate → UEBA, read labels aloud from the UI and record them in case notes when legal may review the incident.

### Reading paths for analysts and engineers

Use the walkthrough if you run the SOC; use the source tree if you ship the code. Both paths describe the same Investigate → UEBA behaviour at different altitudes.

#### What should executives hear first about false-positive management?

Lead with the stat strip or dominant visual on Investigate → UEBA. Compare today's numbers to your last briefing slide if possible. Name the business process at risk, not the detection rule ID. Offer one mitigation already underway and one that needs approval. Reserve technical detail for the appendix.

#### What integration tests guard false-positive management behaviour?

Diff the component named in this guide against `the SIEM context pipeline` typings. Walkthrough steps must match rendered labels and filter chips. When props or hooks move, update the markdown in the same PR. Regression-test ingest → parse → alert → Investigate → UEBA render with Simulate Campaign before merging.

#### Which mistake do new analysts make most often here?

Assuming empty or quiet means safe. Verify ingestion in Pipeline Health and rule hits on Overview before telling stakeholders the environment is clean.
