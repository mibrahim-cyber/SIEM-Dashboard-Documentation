---
module: Risk Scoring
sidebar: Intelligence → Risk Scoring
section: Intelligence
subsection: Why a single risk number per asset
last_updated: 2026-05-23
---

# Why a single risk number per asset

**Part of:** Intelligence → Risk Scoring
**One-sentence focus:** Composite and per-asset risk numbers for posture reporting and triage.

![Risk Scoring main view](../../../screenshots/guides/intelligence-risk-scoring.png)

### What you are looking at

Top-left **COMPOSITE risk score** card: SVG circular dial showing 0–100 with colour green/yellow/orange/red, label **LOW RISK**, **GUARDED**, **ELEVATED**, or **CRITICAL**, footnote criticals×8 + highs×4 + incidents×12. Adjacent 2×2 grid cards: Active Critical Alerts (×8 pts), Active High Alerts (×4 pts), Active Incidents (×12 pts), Blocked Threat IPs (mitigated label). Below, three columns: **ASSET RISK RANKING**, **STRIDE THREAT MATRIX**, **TOP THREAT ACTORS**. Executives cannot digest forty-seven dashboards; they need a fuel gauge. This dial is that gauge, with the formula printed small so technicians can explain it.

### What is happening underneath

Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`. Separate per-asset scores computed in component `useMemo` from `ASSETS`, alert severities, CVE counts, criticality. Threat actors from top 8 `threatScores` entries. STRIDE matrix from `detectionRules` hit counts. Intelligence → Risk Scoring (Risk Scoring screen) presents a composite dial plus decomposition cards so executives see one number while practitioners see arithmetic. Global `riskScore` from the SIEM context pipeline: `min(100, critActive*8 + highActive*4 + activeIncidents*12)`; unresolved critical/high alerts and incidents with `status === 'active'` only; medium/low alerts and blocked IPs do not subtract from composite (blocked card is informational mitigated). Dial colours: green **LOW RISK** <20, yellow **GUARDED** 20–39, orange **ELEVATED** 40–69, red **CRITICAL** ≥70, hardcoded, not Settings-configurable. Asset ranking recomputes per asset: `min(100, criticality*5 + critAlerts*8 + highAlerts*4 + cves.length*3)`, listing top eight by score with optional subtext N alerts, crit: M. `getCriticalityLabel()` is imported but unused; criticality visible only indirectly. STRIDE matrix aggregates `detectionRules` `hits` by `stride` field with bar width `min(100, hits*20)%`; `critHits` computed but not displayed. Known implementation gaps: `strideRisks` useMemo uses empty deps `[]` so hits may stale until navigation remounts; `threatIpList` uses `Object.entries(threatScores)` while context supplies an array from `buildThreatScores`, potentially displaying index keys 0, 1 instead of IPs: verify in browser and prefer Threat Intel for accurate IP lists until fixed. When the composite dial reads **CRITICAL**, walk executives through the breakdown cards arithmetically before recommending spend. Remember blocked IPs appear as mitigated informationally but do not subtract from the formula today. If **TOP THREAT ACTORS** shows numeric indices instead of IPs, use Threat Intel external cards until the `Object.entries` data-shape issue is corrected in Risk Scoring screen.

### Why this matters

Board asks "are we safer than last month?" without a composite metric, CISOs resort to anecdote. Single number enables threshold policies ("above 70 triggers executive briefing") while breakdown cards prevent blind trust.

### Step-by-step walkthrough

1. Baseline score after clean start (~0–20).
2. Run Simulate Campaign. Watch dial animate (stroke transition 0.8s).
3. Read breakdown cards contributing points.
4. Scroll asset and threat columns for drivers.
5. Block top threat IP, note Blocked Threat IPs mitigated count rises (does not subtract from composite formula directly).

### Common questions

#### Is the score a probability of breach?

No; weighted activity index, not actuarial probability.

#### Can score exceed 100?

Capped at 100 in code.

#### Why incidents weighted ×12?

Incidents represent correlated attack clusters: higher organisational urgency than single alert.

#### Blocked IPs reduce score?

Displayed as mitigated informational card. Not in subtraction formula currently.

### Analyst workflow under pressure

Quote current dial number in first executive ping; update after containment when critical alerts resolved.

### Edge cases and gotchas

Resolved alerts drop weight immediately, score can plummet while root cause unpatched. Empty threat actor list until alerts exist. Composite score is activity-weighted, not breach probability. It can plummet when alerts resolve while root cause remains unpatched (Vuln Intel still shows high CVSS). Auto-incident contained after sixty seconds quiet reduces incident weight without human verification; pair dial readings with Threat Intel and open Case Manager counts during P1. Capture screenshots before/after containment for timeline evidence; no built-in history series exists though `epsHistory` elsewhere suggests a pattern for future `riskHistory`. Lead with dial label and number, cite top three **ASSET RISK RANKING** names in business terms, dominant STRIDE bar category, and count of Blocked Threat IPs as response evidence, not as score reduction. Explicitly state formula footnote (criticals×8 + highs×4 + incidents×12) so finance and audit can reproduce the metric. Label Simulate Campaign exercises in verbal briefings to avoid comparing lab spikes to production baselines.
