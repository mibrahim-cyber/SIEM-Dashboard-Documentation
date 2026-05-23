---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 03-rule-anatomy.md
title: "Rule anatomy"
last_updated: 2026-05-23
---

# Rule anatomy

**Sidebar path:** Configure → Rules Engine

## Rule anatomy

### What you are looking at

Each rule card exposes the user-visible anatomy: toggle (enabled state), name, severity (critical/high/medium/low with colour classes `text-hack-critical`, etc.), category (injection, authentication, network, recon, host), description (STRIDE prefix and plain English), **MITRE** block (technique ID, tactic, technique name), hits integer, hit percentage bar, and id slug. Hidden from UI but present in code: `stride` classification, detection logic function body, optional temporal parameters inside check (threshold τ, window Δt). Rule anatomy parallels a legal statute: title (name), penalty tier (severity), jurisdiction (category), plain-language summary (description), precedent citation (MITRE), and enforcement counter (hits). The toggle is whether the statute is currently enforced.

### What is happening underneath

Example structure from `sql-injection` rule:

| Field | Value |
|-------|-------|
| id | `sql-injection` |
| severity | `critical` |
| category | `injection` |
| stride | `Tampering` |
| mitre | `{ tactic, technique: 'T1190', name }` |
| check | regex scan of queryParams, body, urlPath, http nested fields |

```javascript
matchedRules.push({ ruleId, ruleName, severity, category });
severity: this._highest(matchedRules);
```
Alert severity becomes the minimum numeric rank among matched rules (critical beats high). Category colours in UI map loosely: `CAT_COLOR` object in Rules Engine screen, injection uses `text-hack-low` styling paradoxically; trust severity colours for urgency.

> **Technical note:** Rule `id` displays greyed in card corner for developer reference, not shown to executives in briefings; use `name` instead.

### Why this matters

Analysts triaging alerts need to decode `matchedRules` arrays in Alert Detail modals. Knowing anatomy connects feed badges to Rules Engine cards instantly. Developers extending detection rules catalog must populate all fields consistently or Analytics category breakdown and MITRE reporting break.

### Step-by-step walkthrough

1. Select `Brute Force Attack` card, read description with mathematical notation `|E(t)| ≥ τ=5`.
2. Identify severity **HIGH**, category authentication, stride Spoofing (in code, not on card face).
3. Compare to `Privilege Escalation Detected`; note **CRITICAL** and host category.
4. Open an alert on Overview detail: map `matchedRules[].ruleName` back to card.
5. Verify hit bar after simulation; percentage reflects share of total hits across all rules.
6. Inspect MITRE on `data-exfil` rule, Exfiltration tactic T1048.
7. Read disabled styling; border opacity 50%, `[DISABLED]` tag.
8. Cross-reference Monitor → Overview RULE ACTIVITY: first word of rule name maps to hits there.

### Common questions

#### Why doesn't STRIDE appear on the rule card?

STRIDE is stored on rule objects for Correlation Builder matrix but omitted from Rules Engine screen card header; only category and severity show. Open detection rules catalog or Correlation Builder → MATRIX tab for STRIDE mapping.

#### Can one rule have multiple categories?

No, each rule has one `category` string. Multi-category alerts arise from multiple rules matching one log.

#### What does the hit percentage mean?

`(rule.hits / totalHits) * 100`; share of all rule firings, not share of logs processed. High percentage means dominant detection, not necessarily high true positive rate.

#### Where is the check function visible?

Not in UI; only in source detection rules catalog. Rules Engine is management, not authoring (authoring partial in Correlation Builder with different semantics).

### How an analyst uses this during active incident

The analyst matches alert rule names to cards for severity confirmation and MITRE technique IDs for threat intel enrichment. They check if dominant rules are disabled accidentally (opacity styling). They use descriptions to explain to management what was detected without reading regex source.

### Edge cases and gotchas

MITRE block optional; not all rules lack it in demo, all shipped rules include mitre. Category colour CSS inconsistent, rely on severity. Hit counters reset on clear alerts; distorts percentage mid-incident. Rule id slugs differ from display names; use id for API/code references only. Hidden check(log, allLogs) signatures vary: unary checks examine only current log; binary checks scan historical buffer for brute-force and rapid-requests. MITRE objects use tactic, technique, name shape consistent with ATT&CK sub-technique strings like T1059.007. Severity colours map through Tailwind semantic tokens distinct from Overview hex colours; cosmetic inconsistency only. Rule card opacity at fifty percent when disabled preserves layout stability, hits remain visible as historical telemetry unless engine cleared. ID slug displayed supports developer grep in the detection rules catalog; operators should cite human name in tickets. Category drives Analytics breakdown colouring separate from Rules Engine category text colour mapping; trust severity badge over category colour for urgency triage. When reading alert detail modals, matchedRules array entries mirror rule anatomy fields; ruleName, severity, category, without stride or MITRE unless UI extended. Developers adding rules should keep descriptions under two hundred characters for card layout stability on Rules Engine scroll view. Long regex inside check() does not surface in UI anatomy; maintain parallel description text explaining pattern intent for operators who cannot read JavaScript. Category host appears on file-tampering and privilege-escalation rules; ensure Analytics breakdown includes host slice when those fire so purple teams see endpoint coverage not only network and injection categories. Document for each shipped rule whether check uses allLogs parameter; grep detection rules catalog before incident reviews so tier-3 knows which rules incur historical scan cost during log replay. Display name versus id slug divergence most visible on xss-attempt id versus Cross-Site Scripting Attempt label, cite both in tickets to avoid search confusion.
