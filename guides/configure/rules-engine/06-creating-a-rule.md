---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 06-creating-a-rule.md
title: "Creating a new rule from scratch"
last_updated: 2026-05-23
---

# Creating a new rule from scratch

**Sidebar path:** Configure → Rules Engine

## Creating new rule step-by-step

### What you are looking at

Rules Engine does not provide a create-rule button. New detection rules enter the system by adding objects to `detectionRules` in the detection rules catalog with a unique `id`, metadata fields, and `check(log, allLogs)` function, then restarting or hot-reloading the dev server. The UI supports enable/disable toggling only. For interactive rule construction, Configure → Correlation Builder offers **+ NEW RULE** with form fields, local prototype separate from engine-backed rules listed in Rules Engine. Creating engine rules is like amending municipal law, the Rules Engine council chamber displays active statutes and lets you suspend enforcement (toggle), but drafting new law happens in the legislator's office (detection rules catalog source), not from the chamber floor.

### What is happening underneath

```javascript
{
 id: 'my-rule',
 name: 'My Rule',
 description: '...',
 severity: 'high',
 category: 'network',
 stride: 'Spoofing',
 mitre: { tactic, technique, name },
 enabled: true,
 hits: 0,
 check: (log, allLogs) => boolean,
}
```
`the SIEM context pipeline` constructs `new detection engine(detectionRules)`, engine holds reference to same array. Correlation Builder `createRule()` clones template with UUID, conditions array, threshold, windowSec; stored in React local screen state, not pushed to `detectionRules` export used by engine.

> **Technical note:** After editing detection rules catalog, refresh browser; hit counters reset if engine reinstantiated unless state hydrated from backend preserving hits.

### Why this matters

Teams expecting full GUI SOAR-style rule authoring may stall if they never learn the code path. Documenting the split prevents false belief that Correlation Builder changes affect live detections shown in Rules Engine.

### Step-by-step walkthrough

1. Open Rules Engine: confirm no **+** button; note toggles only.
2. Open detection rules catalog in editor; duplicate an existing rule object as template.
3. Assign new unique `id` string, collision breaks toggle targeting.
4. Write detection logic function; start with simple field test before complex windows.
5. Set `severity`, `category`, `stride`, `mitre` for Analytics/Overview display consistency.
6. Save file: reload dashboard; new card appears in Rules Engine list.
7. Enable rule via toggle if default `enabled: false`.
8. Ingest test log matching condition, verify hit counter and alert creation.
9. Optionally mirror logic in Correlation Builder for UI documentation training; label as non-production.

### Common questions

#### Why can't I save correlation builder rules to rules engine?

Architectural gap. Builder manages local pedagogical copies without detection logic export pipeline to `detection engine`. Integration would require serialising conditions to executable functions server-side.

#### Will new rules appear in overview RULE ACTIVITY?

Yes; once hits increment via matching logs, Overview bars include new rule names.

#### Do I need admin role to edit detection rules catalog?

File editing is developer operation outside RBAC. Runtime toggle requires tier2+ write.

#### How do I test without breaking production?

Use lab environment, disable new rule by default (`enabled: false`), test with Log Ingestion sample payloads, then enable.

### How an analyst uses this during active incident

Analysts typically do not author rules mid-incident, they escalate detection gaps to tier3/engineering. If pre-staged draft rules exist, tier3 enables via toggle after deployment. Incident urgency prioritises toggling existing rules (disable FP noise) over authoring new ones.

### Edge cases and gotchas

Syntax error in detection logic throws; rule silently fails per log. Forgetting `enabled: true` yields invisible rule. Duplicate ids cause toggle collisions. Session refresh may desync hit counts. Builder rules mislead testers into thinking detections updated; always verify Rules Engine card list. Validation checklist after adding detection rules catalog entry: unique id, enabled default intentional, check() safety, severity aligns with organisational matrix, category matches Analytics aggregation buckets, stride populated for Correlation Builder matrix, MITRE IDs validated, sample malicious log triggers match, benign log does not fire, Rules Engine toggle works without restart if hot reload active. Correlation Builder NEW RULE creates pedagogical duplicate; export conditions via screenshot when promoting to production. Never assume Builder save persists, refresh loses unsaved local rules. Change requests for rule updates should link MITRE technique and FP test evidence mirroring enterprise change advisory boards. Code review checklist for new check() functions: avoid mutating log objects, avoid unbounded allLogs scans without early exit, avoid catastrophic regex, log errors only to console in demo but plan structured logging in production fork. After merge, update Documentation screen module references if public docs list rule catalogue. Train operators where rule appears: Rules Engine list, Overview RULE ACTIVITY, Analytics categories, Correlation Builder initial clone on page load; four surfaces, one source array in the detection rules catalog until Builder sync implemented. Lab assignment: students add one rule, toggle off one noisy rule, document hit percentage before and after in one-page report. Reinforces Rules Engine as operational interface even when authoring is developer-side. Include screenshot of MITRE line and Analytics category bar change as deliverable evidence. Production promotion checklist beyond lab: peer review check() for ReDoS and logic bombs; run npm test if suite exists; snapshot Rules Engine hit bars before deploy; monitor Overview RULE ACTIVITY for twenty-four hours after enable; prepare rollback commit hash; notify SOC channel with rule name, severity, expected true positive scenarios, known false positive scenarios, and disable instruction if noise spikes. Correlation Builder draft works as product requirement attachment; attach screenshot of conditions and test result count to Jira story implementing detection rules catalog equivalent with sliding window if Builder threshold and windowSec populated in design. Authoring split responsibility model: detection engineer owns detection rules catalog merge; SOC analyst owns Builder prototype and test evidence; manager owns change window approval. HABIBI demo collapses roles but enterprise process prevents midnight regex edits without review. Document simulate regression expected hits per rule in runbook appendix so new hires verify environment health after deploy, if sql-injection hits zero after known good simulation, deployment or enablement failed silently.
