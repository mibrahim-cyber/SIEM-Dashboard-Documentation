---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 06-testing-before-deployment.md
title: "Testing a correlation rule before deployment"
last_updated: 2026-05-23
---

# Testing a correlation rule before deployment

**Sidebar path:** Configure → Correlation Builder

## Testing before deployment

### What you are looking at

The Builder test section shows **TEST AGAINST LIVE LOGS** button (label says logs; implementation tests alerts), disabled state TESTING... during 600ms timeout, caption `{alerts.length} events in memory`, and results box: match count in red if >0 else green, up to five sample rows with timestamp, IP, event type. Test runs only when a rule is selected and conditions defined. No export test report, no saved test history, no A/B against production engine hits. Pre-deployment testing is dress rehearsal, actors (conditions) perform on stage (alert dataset) before opening night (production enablement). HABIBI's rehearsal reviews current alert memory, not full log archive.

### What is happening underneath

```javascript
setTimeout(() => {
 const matches = alerts.filter((log) => { /* condition eval */ });
 setTestResult({ count: matches.length, samples: matches.slice(0, 5) });
}, 600);
```
Simulated delay mimics async query UX only, no server round trip. Tests case-insensitive string ops; regex with `/i` flag. Does not increment rule `hits`, does not create alerts, does not write SQLite. Production validation path: enable rule in the detection rules catalog, ingest sample logs, observe Rules Engine hit counter, separate workflow.

> **Technical note:** Empty alerts → zero matches always; populate via **Simulate Campaign** before testing.

### Why this matters

Deploying untested correlation patterns causes production incidents; either missed detections or alert storms. Builder test provides sanity check on field availability and condition syntax before engineering implements real windowed checks.

### Step-by-step walkthrough

1. Populate alerts. Simulate Campaign minimum.
2. Select target rule in Builder.
3. Verify conditions reflect hypothesis.
4. Click **TEST AGAINST LIVE LOGS**.
5. Wait for TESTING... completion (~600ms).
6. Read match count, zero green suggests conditions too strict or wrong fields.
7. Inspect sample rows; confirm timestamps and IPs expected.
8. Adjust conditions: retest; iterate until match set plausible.
9. Implement validated logic in the detection rules catalog for production path.
10. Compare Rules Engine hits after real ingestion, ultimate deployment test.

### Common questions

#### Why does button say LIVE LOGS but test alerts?

Labelling inconsistency; implementation filters `alerts` from the SIEM context pipeline. Interpret as "live session alert population."

#### Can I test against historical DB alerts?

Only alerts loaded in current client session state; not full SQLite history unless hydrated on login.

#### Does test respect enabled checkbox?

No; test runs regardless of enabled flag; checkbox affects list dot only locally.

#### Five samples enough?

Preview only, full match count shown; export alerts JSON for deeper review if count high.

### How an analyst uses this during active incident

Live incident response bypasses Builder test; use Overview triage. After incident, analyst replays mental model: clone conditions matching attack alerts, test count approximates incident alert volume, validates proposed rule would have fired. They attach screenshot of test result to change request.

### Edge cases and gotchas

600ms delay unnecessary for local filter; still blocks double-click. Regex DoS possible with catastrophic backtracking patterns; avoid on large alert sets. Test on alerts post-detection, fields may differ from raw logs pre-normalisation. Zero alerts misleading "rule broken" vs "no data." Test does not validate threshold/window behaviour. Test interpretation guide: zero matches with non-zero alerts suggests field mismatch; open alert raw JSON in Overview modal, compare keys to Builder field dropdown. High match count with overly broad OR conditions signals pattern refinement needed before production. Five sample rows show timestamp, sourceIp, eventType, if samples blank those fields, verify alert schema normalisation. Promotion workflow after successful test: copy conditions to ticket, implement check() with window/threshold if needed, deploy detection rules catalog, verify Rules Engine hit increment, confirm Analytics category bar reflects new category, run Simulate Campaign regression, archive test screenshot in change record. Never enable Builder Enabled checkbox believing production detection active; local flag only. Negative testing equally important: build alert that should NOT match, confirm zero additional matches after tightening conditions. Regression bundle: five fixture alerts from last incident saved as JSON snippets pasted into test discussion. Compare testRule alert filter count to Rules Engine hit delta after engine deploy; large divergence indicates Builder test diverged from production check semantics; stop deployment. Schedule retest after alert schema migration; field renames break conditions silently. Add TEST click to demo script only after alerts populated, empty state zero matches embarrasses presenters. Pre-load Simulate Campaign in runbook before executive Correlation Builder tour. Document the 600 ms delay so observers do not double-click TEST. Demo script pitfall list: presenter clicks TEST before Simulate Campaign; zero matches green message implies rule broken; always narrate prerequisite alert population. Second pitfall: regex special characters in value field without escaping; test silently returns zero matches, teach escaping live. Third pitfall: assuming test validates window; narrate engine integration gap every Correlation Builder demo to build trust. Test evidence retention: screenshot match count and first sample row with timestamp for change ticket PDF. ISO 27001 change management expects evidence of testing before production. Builder test satisfies story for design phase; detection rules catalog deployment requires Simulate Campaign second screenshot. Two-phase test record closes audit loop even in demo environment pedagogy. Automated test future vision: fixture alerts JSON in repo consumed by Vitest asserting testRule logic equals expected match ids; students optional advanced module. Until built, manual TEST button remains sole validation, emphasise human discipline. Compare to Sigma validation pipeline in enterprise tools; maturity gap awareness for evaluators comparing HABIBI to commercial SIEM during procurement bake-offs.
