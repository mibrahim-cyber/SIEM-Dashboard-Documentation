---
module: Risk Scoring
sidebar: Intelligence → Risk Scoring
section: Intelligence
subsection: The risk formula
last_updated: 2026-05-23
---

# The risk formula

**Part of:** Intelligence → Risk Scoring
**One-sentence focus:** Composite and per-asset risk numbers for posture reporting and triage.

![Risk Scoring main view](../../../screenshots/guides/intelligence-risk-scoring.png)

### What you are looking at

Explicit formula text under dial. Breakdown cards show live counts and weight labels ×8 pts, ×4 pts, ×12 pts. Asset column scores 0–100 with per-row alert subtext. STRIDE bars scale hits ×20 for width cap 100%.

### What is happening underneath

Composite: only unresolved critical/high alerts + active incidents (`status === 'active'` from correlation). Asset formula: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`. Threat list maps `threatScores` object/array; handles number or `{score}` shape defensively in `scoreValue()`. When the composite dial reads **CRITICAL**, walk executives through the breakdown cards arithmetically before recommending spend. Remember blocked IPs appear as mitigated informationally but do not subtract from the formula today. If **TOP THREAT ACTORS** shows numeric indices instead of IPs, use Threat Intel external cards until the `Object.entries` data-shape issue is corrected in Risk Scoring screen.

### Why this matters

Transparent weights enable challenge; executives ask "why 68?" analyst shows arithmetic on cards.

### Step-by-step walkthrough

1. Count critical alerts not resolved manually in Alert Manager.
2. Multiply by 8, compare to card.
3. Add high×4 and active incidents×12.
4. Sum and cap; should match dial within rounding.
5. For asset row, estimate criticality from inventory.

### Common questions

#### Vulnerability severity in composite dial?

Not directly: asset ranking includes CVE count×3 separately). Excluded from composite. May understate noise.

#### False positives inflate score?

Yes, resolve FP alerts to drop weight.

### What analysts do when the pager fires

Before/after containment screenshot dial + cards for incident timeline evidence.

### Edge cases and gotchas

Incident active status auto-expires after 60s quiet; score may drop without human resolution. `threatScores` iteration assumes object entries: array from `buildThreatScores` handled in Threat Intel but RiskScoring uses `Object.entries(threatScores ?? {})`. if array passed, entries may be wrong; verify context exports array (it does), Known implementation gap: `Object.entries` on an array yields numeric indices rather than real IPs; verify displayed values in the browser and prefer Threat Intel for accurate actor lists until corrected.

### Supplemental implementation notes

Intelligence → Risk Scoring (Risk Scoring screen) presents a composite dial plus decomposition cards so executives see one number while practitioners see arithmetic. Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`: unresolved critical/high alerts and incidents with `status === 'active'` only; medium/low alerts and blocked IPs do not subtract from composite (blocked card is informational mitigated). Dial colours: green **LOW RISK** <20, yellow **GUARDED** 20–39, orange **ELEVATED** 40–69, red **CRITICAL** ≥70. hardcoded, not Settings-configurable. Asset ranking recomputes per asset: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`, listing top eight by score with optional subtext N alerts, crit: M. `getCriticalityLabel()` is imported but unused, criticality visible only indirectly. STRIDE matrix aggregates `detectionRules` `hits` by `stride` field with bar width `min(100, hits*20)%`; `critHits` computed but not displayed. Known implementation gaps: `strideRisks` useMemo uses empty deps `[]` so hits may stale until navigation remounts; `threatIpList` uses `Object.entries(threatScores)` while context supplies an array from `buildThreatScores`, potentially displaying index keys 0, 1 instead of IPs; verify in browser and prefer Threat Intel for accurate IP lists until fixed.

#### Using the dial without misleading leadership

Composite score is activity-weighted, not breach probability. It can plummet when alerts resolve while root cause remains unpatched (Vuln Intel still shows high CVSS). Auto-incident contained after sixty seconds quiet reduces incident weight without human verification: pair dial readings with Threat Intel and open Case Manager counts during P1. Capture screenshots before/after containment for timeline evidence; no built-in history series exists though `epsHistory` elsewhere suggests a pattern for future `riskHistory`. Lead with dial label and number, cite top three **ASSET RISK RANKING** names in business terms, dominant STRIDE bar category, and count of Blocked Threat IPs as response evidence, not as score reduction. Explicitly state formula footnote (criticals×8 + highs×4 + incidents×12) so finance and audit can reproduce the metric. Label Simulate Campaign exercises in verbal briefings to avoid comparing lab spikes to production baselines.
