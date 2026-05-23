---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 07-tuning-false-positives.md
title: "Tuning rules to reduce false positives"
last_updated: 2026-05-23
---

# Tuning rules to reduce false positives

**Sidebar path:** Configure → Rules Engine

## Tuning false positives

### What you are looking at

Rules Engine supports false-positive tuning primarily through disable toggles and qualitative review of hit counts and hit percentage bars. There are no threshold sliders, suppression lists, or exception UI on this screen. Noisy rules show high **HITS** and wide green bars relative to peers, e.g., `Off-Hours Authentication` firing on global UTC windows during legitimate shift work. Disabled rules render at 50% opacity with `[DISABLED]` tag and greyed toggle. Tuning false positives is adjusting a car alarm sensitivity, too sensitive and passing trucks trigger sirens; desensitise too much and real break-ins go silent. HABIBI offers a binary sensor switch (toggle) plus hit telemetry to decide which sensor to adjust in code.

### What is happening underneath

False positive reduction paths in demo SIEM:

1. `toggleRule(id)`, immediate cessation of new matches.
2. Edit detection logic logic in the detection rules catalog; tighten regex, raise τ, shorten Δt.
3. Overview [ RULES: PAUSE ALL ] / `pauseAllRules()`: bulk disable (admin context).
4. Alert dedupe on Overview; operational suppression, not rule-level. Hit percentage formula highlights dominance, not precision. No built-in baseline of true vs false labels, analysts infer from ACK/RES patterns manually. `off-hours-auth` low severity designed to be first tuning candidate in labs.

> **Technical note:** Disabling rule does not remove historical alerts; clear or resolve separately to clean feeds.

### Why this matters

Un tuned rules erode SOC trust; analysts ignore alerts, missing real attacks in noise ("cry wolf"). Visible hit share accelerates tuning prioritisation: spend hour on 60% rule before 1% rule.

### Step-by-step walkthrough

1. Run ingestion until multiple rules register hits.
2. Sort rules mentally by hit bar width; identify top two contributors.
3. Review descriptions for expected false-positive scenarios (off-hours logins, sensitive-path scans on dev).
4. Toggle suspect rule off, observe subsequent logs produce no new alerts from that rule.
5. Validate true positives still caught by other rules (defence in depth).
6. If toggle too blunt, edit check logic; e.g., raise brute-force τ from 5 to 10 in source.
7. Re-enable and replay test logs: compare hit delta.
8. Document tuning change in change management log (real world) or commit message (lab).

### Common questions

#### Does disabling a rule hide its alerts from overview?

No; existing alerts remain. Feed may still show historical off-hours auth alerts until resolved.

#### Can I suppress by IP instead of disabling whole rule?

Not in Rules Engine UI. Would require check() modification excluding CIDR or SOAR dedupe on Overview.

#### How do I measure false positive rate?

Not automated. Compare resolved-as-benign vs total manually or via case outcomes. Reports resolution rate proxies effort, not FP rate.

#### Will hit percentage drop after tuning?

Only new hits stop, old hit counts remain until `clearAlerts()` resets engine tallies.

### How an analyst uses this during active incident

During FP storm (e.g., vulnerability scanner hitting sensitive-path rule), analyst disables `Sensitive Path Access` temporarily after manager approval, restoring after scan window. They monitor hit bars post-change to confirm dominance shifted. They avoid pausing critical injection rules unless absolutely necessary.

### Edge cases and gotchas

Toggle state may not persist across full server reset depending on backend. Pausing all rules mid-incident blinds SOC entirely; use surgically. Low-severity rules still consume analyst attention if volume high. Correlation Builder changes do not tune engine rules. Simulation traffic predictable. FP tuning on sim data may not transfer to production traffic. Organisational tuning tiers: tier-1 proposes disable with ticket citing hit count evidence; tier-2 approves temporary disable during change window; tier-3 edits check() for permanent fix. Document known noisy rules: off-hours-auth for 24/7 shifts; sensitive-path during VA scans; rapid-requests behind CDN aggregators. Measure tuning success: after edit, hit percentage share should drop while true positive regression tests still fire on Simulate Campaign. Overview DEDUPE toggle suppresses repeat alert display within thirty seconds; display-layer suppression distinct from rule tuning. Re-enable rules after maintenance windows, orphaned disabled rules accumulate silently unless periodic audits compare enabled count to baseline twelve. Establish FP review cadence weekly: export rules sorted by hit percentage, top three reviewed in stand-up, decision logged in ticket. Temporary disables expire via calendar reminder; Monday re-enable unless change ticket extends. Compare FP tuning to detection coverage metrics: disabling last sensitive-path rule may zero recon category in Analytics; acceptable only if compensating control documented. Voice false positive definition with stakeholders: alert that consumed analyst time without malicious outcome; requires human disposition data HABIBI does not automate; use RES with benign classification in case notes as proxy. Quarterly rule health review agenda item: enabled ratio, top hit rule, disabled rules without tickets, simulate regression pass/fail. Manager signs agenda, lightweight governance replacing enterprise GRC tooling in demo context. Track off-hours-auth disable during holidays as standing exception list. Executives should interpret hit percentage bars as workload indicators, not security success metrics; a quiet rule may mean good tuning or blind spots. Analysts should document every toggle in the case or change ticket system so temporary false-positive relief during maintenance windows does not become permanent detection gaps visible only as empty **RULE ACTIVITY** bars on Overview.
