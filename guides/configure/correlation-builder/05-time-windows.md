---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 05-time-windows.md
title: "Why time windows matter"
last_updated: 2026-05-23
---

# Why time windows matter

**Sidebar path:** Configure → Correlation Builder

## Time windows and dwell time

### What you are looking at

The Builder exposes TIME WINDOW (seconds) numeric input (minimum 5, default 60 on new rules) and Threshold integer (minimum 1, default 1). Together they represent dwell time intent: how long a pattern may span and how many matching events required, classic SIEM correlation parameters. List subline shows condition count, not window value. Production rules in the detection rules catalog embed windows inside code (`brute-force` Δt=60s, `rapid-requests` 10s) invisible to Builder unless manually documented in **DESCRIPTION**. Time windows are the expiration date on milk, events outside the window sour the correlation (no match). Dwell time is how long an attacker must loiter repeating behaviour before the rule cares, five failed logins in one minute, not spread across a week.

### What is happening underneath

`newRule()` sets `windowSec: 60`, `threshold: 1`. `updateRule({ windowSec: Number(e.target.value) })` persists in local state only. **`testRule()` ignores `windowSec` and `threshold`**; evaluates each alert as instantaneous condition satisfaction. True windowed correlation requires sliding buffer keyed by entity (IP, user) across log timestamps; implemented in engine `check(log, allLogs)` for shipped rules but not for Builder test use. Incident `correlateAlerts` uses separate 60s IP window on alerts. Dwell semantics therefore differ three ways: Builder UI fields (design), engine checks (functional for coded rules), incident clustering (functional post-alert).

> **Technical note:** Aligning Builder window with `correlateAlerts` 60s is conceptual coincidence; separate code paths.

### Why this matters

Analysts setting window=300 and threshold=10 expect test to honour aggregates, current test undermines tuning trust. Documenting gap prevents deploying Builder config believing dwell logic active. Proper dwell design reduces split incidents and false negatives on slow attacks.

### Step-by-step walkthrough

1. Select rule; note default **TIME WINDOW** 60 seconds.
2. Increase window to 300: understand this is design-only until engine integration.
3. Set Threshold to 5, emulating brute-force semantics.
4. Run **TEST**, observe match count unchanged by threshold/window (per-alert evaluation).
5. Open detection rules catalog brute-force; compare coded Δt=60000 ms and τ=5.
6. Open Analytics incidents: see 60s alert clustering separate from Builder window field.
7. Document in DESCRIPTION: "Intended: 5 failures in 300s per source.ip".
8. Hand off to developer implementing sliding window in detection logic.

### Common questions

#### Why include window/threshold if test ignores them?

UI scaffolding for educational correlation design; future hook points for compiler to executable rules.

#### What dwell time does incident correlation use?

60 seconds same-IP alert clustering, not configurable in UI.

#### Minimum window 5 seconds; why?

Input `min={5}` on number field; prevents zero/negative windows in UI validation only.

#### How does dwell relate to SOAR?

SOAR may wait dwell before auto-block; separate system; Builder dwell not connected to SOAR in demo.

### How an analyst uses this during active incident

Analyst references coded rule windows (brute-force 60s) when explaining timing to management, not Builder fields. Post-incident, they specify dwell requirements on draft Builder rules for engineering backlog. They recognise slow attacks exceeding 60s incident gap may split into two incident rows on Analytics.

### Edge cases and gotchas

Test ignores window; false validation risk. Builder windowSec differs from engine milliseconds constant naming. Threshold default 1 matches any single alert satisfying conditions; noisy. Incident contained status uses wall clock `Date.now()`; dwell for status not same as rule window. Dwell time vocabulary: dwell equals attacker presence duration in zone; window equals analyst-defined observation interval. NIST continuous monitoring frameworks use similar concepts, map Builder windowSec didactically even without automated execution. Incident contained status uses Date.now minus lastSeen; different dwell semantics from rule window. Brute-force engine window sixty seconds vs Builder default sixty seconds; pedagogical alignment coincidental. For slow password spraying one attempt per five minutes, neither sixty-second window catches attack; requires longer delta-t in coded rule or UEBA module for entity baselines. Explain to stakeholders why tuning window is threat-model dependent, not universal constant. Incident dwell differs from detection window: attacker may dwell days on endpoint while incident correlation only clusters alerts sixty seconds apart, long dwell campaigns appear as many incident rows not one extended incident. Set expectations in SOC runbooks. Builder windowSec minimum five seconds prevents accidental zero; discuss why sub-second windows rare in network security except high-frequency trading environments. Align vocabulary with MITRE D3FEND dwell detection terms when speaking with experienced practitioners; map conceptually though HABIBI does not implement D3FEND catalogue. Compare Builder windowSec field to brute-force sixty seconds in class debate: should they match organisation-wide standard? Propose SOC policy document section defining default windows per use case; authentication, exfil, recon, even before engine enforces Builder values. Executive FAQ rehearse: Why sixty seconds? Answer: demo balances incident clustering readability with attack campaign coherence; production may use five minutes or variable per asset criticality. Why Builder window ignored in test? Answer: honest gap. UI prepares policy spec, engine implements separately until integration story complete. Reduces credibility loss when sharp-eyed stakeholders click TEST expecting threshold behaviour. Dwell time attack taxonomy link: ransomware dwell averages days in industry reports. HABIBI sixty-second windows intentionally unsuitable for dwell analytics, point executives to UEBA and EDR telemetry for dwell, SIEM correlation for burst campaigns. Prevents wrong tool expectation sale. Mapping table exercise: credential spray burst to brute-force window; port scan burst to rapid-requests; slow API scraping to custom longer window rule not shipped; students propose parameters. Window overlap mathematics brief: sliding window of width W on event stream with n events per second generates O(n) evaluations per second per rule in naive implementation; discuss optimisation to bucketised counters keyed by sourceIp; standard interview topic for detection engineering hires using HABIBI as discussion prompt.
