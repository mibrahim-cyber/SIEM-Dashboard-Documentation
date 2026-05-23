---
module: Risk Scoring
sidebar: Intelligence → Risk Scoring
section: Intelligence
subsection: Asset criticality classification
last_updated: 2026-05-23
---

# Asset criticality classification

**Part of:** Intelligence → Risk Scoring
**One-sentence focus:** Composite and per-asset risk numbers for posture reporting and triage.

![Risk Scoring main view](../../../screenshots/guides/intelligence-risk-scoring.png)

### What you are looking at

**ASSET RISK RANKING** lists up to 8 assets by descending score: name truncated, numeric score colour-coded (≥70 red, ≥40 orange, else green/yellow), progress bar, optional subtext N alerts, crit: M. Criticality not labelled directly; embedded in score via `asset.criticality * 5`.

### What is happening underneath

`ASSETS` from static asset registry include `criticality` numeric, `name`, `ip`, `type`, `tags`, `cves`. `getCriticalityLabel()` imported but unused in the UI; missed display. Blast radius `dependents` computed for infra types (Domain Controller, VPN Gateway, SIEM/Monitoring) but not shown in UI. Intelligence → Risk Scoring (Risk Scoring screen) presents a composite dial plus decomposition cards so executives see one number while practitioners see arithmetic. Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`, unresolved critical/high alerts and incidents with `status === 'active'` only; medium/low alerts and blocked IPs do not subtract from composite (blocked card is informational mitigated). Dial colours: green **LOW RISK** <20, yellow **GUARDED** 20–39, orange **ELEVATED** 40–69, red **CRITICAL** ≥70; hardcoded, not Settings-configurable. Asset ranking recomputes per asset: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`, listing top eight by score with optional subtext N alerts, crit: M. `getCriticalityLabel()` is imported but unused: criticality visible only indirectly. STRIDE matrix aggregates `detectionRules` `hits` by `stride` field with bar width `min(100, hits*20)%`; `critHits` computed but not displayed. Known implementation gaps: `strideRisks` useMemo uses empty deps `[]` so hits may stale until navigation remounts; `threatIpList` uses `Object.entries(threatScores)` while context supplies an array from `buildThreatScores`, potentially displaying index keys 0, 1 instead of IPs. Verify in browser and prefer Threat Intel for accurate IP lists until fixed. When the composite dial reads **CRITICAL**, walk executives through the breakdown cards arithmetically before recommending spend. Remember blocked IPs appear as mitigated informationally but do not subtract from the formula today. If **TOP THREAT ACTORS** shows numeric indices instead of IPs, use Threat Intel external cards until the `Object.entries` data-shape issue is corrected in Risk Scoring screen.

### Why this matters

Crown jewel assets should dominate ranking, misclassified criticality under-risks domain controllers.

### Step-by-step walkthrough

1. Open Infrastructure → Asset Inventory for criticality numbers.
2. Return to Risk Scoring; verify DC/VPN high in ranking after campaign.
3. If surprise low score, check criticality constant in data file.
4. Advocate ownership: business unit names asset criticality annually.

### Common questions

#### Where is crown jewels label?

Not rendered: only implied via score.

#### Who sets criticality?

Asset inventory data stewards. Organisational process.

#### Revenue dependency captured?

Only if reflected in criticality integer in demo data.

#### Blast radius shown?

Computed (`dependents`) but hidden, future UI enhancement.

### Analyst workflow under pressure

Identify if attacked asset ranks top 3; drives escalation severity narrative.

### Edge cases and gotchas

Assets with zero alerts still score from criticality×5 + CVE×3 baseline. Unused `getCriticalityLabel` import suggests planned label never shipped. Composite score is activity-weighted, not breach probability. It can plummet when alerts resolve while root cause remains unpatched (Vuln Intel still shows high CVSS). Auto-incident contained after sixty seconds quiet reduces incident weight without human verification: pair dial readings with Threat Intel and open Case Manager counts during P1. Capture screenshots before/after containment for timeline evidence; no built-in history series exists though `epsHistory` elsewhere suggests a pattern for future `riskHistory`. Lead with dial label and number, cite top three **ASSET RISK RANKING** names in business terms, dominant STRIDE bar category, and count of Blocked Threat IPs as response evidence, not as score reduction. Explicitly state formula footnote (criticals×8 + highs×4 + incidents×12) so finance and audit can reproduce the metric. Label Simulate Campaign exercises in verbal briefings to avoid comparing lab spikes to production baselines.
