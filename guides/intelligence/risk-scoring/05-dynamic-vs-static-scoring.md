---
module: Risk Scoring
sidebar: Intelligence → Risk Scoring
section: Intelligence
subsection: Dynamic vs static scoring
last_updated: 2026-05-23
---

# Dynamic vs static scoring

**Part of:** Intelligence → Risk Scoring
**One-sentence focus:** Composite and per-asset risk numbers for posture reporting and triage.

![Risk Scoring main view](../../../screenshots/guides/intelligence-risk-scoring.png)

### What you are looking at

Dial and asset bars update when alerts refresh; no manual recalculate button. STRIDE matrix updates when rule `hits` increment on ingest. Blocked threat actors show at 50% opacity with **BLOCKED** label.

### What is happening underneath

Dynamic: alert counts, incident active state, rule hits. Static-ish: asset criticality and CVE list from inventory until asset data edited. Threat intel base scores feed threat actor list indirectly via alert-derived threatScores. Intelligence → Risk Scoring (Risk Scoring screen) presents a composite dial plus decomposition cards so executives see one number while practitioners see arithmetic. Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`; unresolved critical/high alerts and incidents with `status === 'active'` only; medium/low alerts and blocked IPs do not subtract from composite (blocked card is informational mitigated). Dial colours: green **LOW RISK** <20, yellow **GUARDED** 20–39, orange **ELEVATED** 40–69, red **CRITICAL** ≥70, hardcoded, not Settings-configurable. Asset ranking recomputes per asset: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`, listing top eight by score with optional subtext N alerts, crit: M. `getCriticalityLabel()` is imported but unused; criticality visible only indirectly. STRIDE matrix aggregates `detectionRules` `hits` by `stride` field with bar width `min(100, hits*20)%`; `critHits` computed but not displayed. Known implementation gaps: `strideRisks` useMemo uses empty deps `[]` so hits may stale until navigation remounts; `threatIpList` uses `Object.entries(threatScores)` while context supplies an array from `buildThreatScores`, potentially displaying index keys 0, 1 instead of IPs: verify in browser and prefer Threat Intel for accurate IP lists until fixed. When the composite dial reads **CRITICAL**, walk executives through the breakdown cards arithmetically before recommending spend. Remember blocked IPs appear as mitigated informationally but do not subtract from the formula today. If **TOP THREAT ACTORS** shows numeric indices instead of IPs, use Threat Intel external cards until the `Object.entries` data-shape issue is corrected in Risk Scoring screen.

### Why this matters

Risk at 8am differs from 5pm after campaign. Static annual assessment misses intraday spikes executives care about during active breach.

### Step-by-step walkthrough

1. Note score T0.
2. Ingest new critical alert, score jumps within same session.
3. Resolve alerts; score falls though vulns remain (static inventory risk in asset column persists).
4. Compare dial (dynamic) vs asset ranking (mixed).

### Common questions

#### Score without attacks?

Non-zero possible via open incidents briefly or misconfigured stale incidents.

#### Historical trend line?

#### Threat field external factor?

Not in composite unless alerts fire.

#### Weekend quiet drops score?

### Analyst workflow under pressure

Refresh view after each containment milestone to show leadership downward trend.

### Edge cases and gotchas

Auto-contained incidents reduce incident weight while IP still malicious: watch Threat Intel concurrently. Composite score is activity-weighted, not breach probability. It can plummet when alerts resolve while root cause remains unpatched (Vuln Intel still shows high CVSS). Auto-incident contained after sixty seconds quiet reduces incident weight without human verification; pair dial readings with Threat Intel and open Case Manager counts during P1. Capture screenshots before/after containment for timeline evidence; no built-in history series exists though `epsHistory` elsewhere suggests a pattern for future `riskHistory`. Lead with dial label and number, cite top three **ASSET RISK RANKING** names in business terms, dominant STRIDE bar category, and count of Blocked Threat IPs as response evidence, not as score reduction. Explicitly state formula footnote (criticals×8 + highs×4 + incidents×12) so finance and audit can reproduce the metric. Label Simulate Campaign exercises in verbal briefings to avoid comparing lab spikes to production baselines.
