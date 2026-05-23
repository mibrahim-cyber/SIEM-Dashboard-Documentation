---
module: Risk Scoring
sidebar: Intelligence → Risk Scoring
section: Intelligence
subsection: Using risk scores for board reporting
last_updated: 2026-05-23
---

# Using risk scores for board reporting

**Part of:** Intelligence → Risk Scoring
**One-sentence focus:** Composite and per-asset risk numbers for posture reporting and triage.

![Risk Scoring main view](../../../screenshots/guides/intelligence-risk-scoring.png)

### What you are looking at

Exportable narrative elements: composite label (**CRITICAL**), top 3 asset names with scores, top threat IPs, STRIDE dominant category. No PDF button; use Reporting → Executive View companion.

### What is happening underneath

Board slides translate: "Domain Controller score 82 + active critical incidents drove composite 78; fund identity hardening Q3." Numbers from this module; business impact from analyst oral translation. Intelligence → Risk Scoring (Risk Scoring screen) presents a composite dial plus decomposition cards so executives see one number while practitioners see arithmetic. Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`, unresolved critical/high alerts and incidents with `status === 'active'` only; medium/low alerts and blocked IPs do not subtract from composite (blocked card is informational mitigated). Dial colours: green **LOW RISK** <20, yellow **GUARDED** 20–39, orange **ELEVATED** 40–69, red **CRITICAL** ≥70; hardcoded, not Settings-configurable. Asset ranking recomputes per asset: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`, listing top eight by score with optional subtext N alerts, crit: M. `getCriticalityLabel()` is imported but unused: criticality visible only indirectly. STRIDE matrix aggregates `detectionRules` `hits` by `stride` field with bar width `min(100, hits*20)%`; `critHits` computed but not displayed. Known implementation gaps: `strideRisks` useMemo uses empty deps `[]` so hits may stale until navigation remounts; `threatIpList` uses `Object.entries(threatScores)` while context supplies an array from `buildThreatScores`, potentially displaying index keys 0, 1 instead of IPs. Verify in browser and prefer Threat Intel for accurate IP lists until fixed. When the composite dial reads **CRITICAL**, walk executives through the breakdown cards arithmetically before recommending spend. Remember blocked IPs appear as mitigated informationally but do not subtract from the formula today. If **TOP THREAT ACTORS** shows numeric indices instead of IPs, use Threat Intel external cards until the `Object.entries` data-shape issue is corrected in Risk Scoring screen.

### Why this matters

CEOs fund problems they understand, "CVSS 9.8" fails; "customer VPN gateway under active attack" succeeds.

### Step-by-step walkthrough

1. Screenshot dial + breakdown before board meeting.
2. List top 3 assets plain language ("payroll server").
3. Explain one STRIDE bar ("most detections are spoofing attacks").
4. State blocked IP count as evidence of response.
5. Propose budget tied to lowering asset scores.

### Common questions

#### Export for board pack?

Screenshot or Reporting module; not native export here.

#### Compare to industry?

Not in UI: consult benchmarks externally. Finance/legal defines. Map to score band.

### Operational use during containment

CISO deck updated live with dial screenshot during prolonged P1.

### Edge cases and gotchas

Over-reliance on single number hides resolved-but-unpatched vulns in asset column. TOP THREAT ACTORS may display index keys if `threatScores` array mishandled, verify IPs look valid before board use. Composite score is activity-weighted, not breach probability. It can plummet when alerts resolve while root cause remains unpatched (Vuln Intel still shows high CVSS). Auto-incident contained after sixty seconds quiet reduces incident weight without human verification; pair dial readings with Threat Intel and open Case Manager counts during P1. Capture screenshots before/after containment for timeline evidence; no built-in history series exists though `epsHistory` elsewhere suggests a pattern for future `riskHistory`. Lead with dial label and number, cite top three **ASSET RISK RANKING** names in business terms, dominant STRIDE bar category, and count of Blocked Threat IPs as response evidence, not as score reduction. Explicitly state formula footnote (criticals×8 + highs×4 + incidents×12) so finance and audit can reproduce the metric. Label Simulate Campaign exercises in verbal briefings to avoid comparing lab spikes to production baselines.
