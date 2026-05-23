---
module: Rules Engine
sidebar: Configure → Rules Engine
page: 02-what-is-a-detection-rule.md
title: "What a detection rule is"
last_updated: 2026-05-23
---

# What a detection rule is

**Sidebar path:** Configure → Rules Engine

## What a detection rule is

### What you are looking at

Configure → Rules Engine renders Rules Engine screen, a vertical stack of terminal-styled rule cards under the header `>> RULES ENGINE // DETECTION RULE MANAGEMENT`. Each card shows a toggle switch (green when enabled), rule name (e.g., `SQL Injection Attempt`), severity badge in bracket notation (`[CRITICAL]`), category (`[injection]`), optional `[DISABLED]` label, description paragraph, optional **MITRE ATT&CK** line (`T1190 // Initial Access · Exploit Public-Facing Application`), a **HITS** count with horizontal bar showing percentage of total rule hits, and a muted rule.id string on the right (`sql-injection`, `brute-force`, etc.). The summary line reads `{enabled}/{total} RULES ACTIVE // {totalHits} TOTAL HITS`. A footer panel **HOW RULES WORK** explains the detection loop in plain language. A detection rule is like a smoke detector's sensor profile, not the alarm sound itself, but the condition that decides when to scream. Logs are air particles; rules detect suspicious density or chemistry; alerts are the audible alarm delivered to the SOC.

### What is happening underneath

Rules originate from `detectionRules` in the detection rules catalog, cloned into `the SIEM context pipeline` state and referenced by `detection engine` via shared object identity. Each rule object includes: `id`, `name`, `description`, `severity`, `category`, `stride`, optional `mitre` object, `enabled` boolean, `hits` counter, and a JavaScript `check(log, allLogs)` function executed per ingested log. When `processLogs()` runs, enabled rules evaluate; matches increment `hits` and contribute to `matchedRules` on the emitted alert. `toggleRule(ruleId)` flips `enabled` in context state, immediately respected by the engine on next log because rules are shared references, not copies.

> **Technical note:** Rules are not persisted to SQLite individually; toggling survives session via `api.getState()` hydration depending on backend implementation; hit counts reset on `clearAlerts()` in `detection engine`.

### Why this matters

Without explicit rule visibility, SOCs treat alerts as mystical events. Analysts blame "the SIEM" when false positives spike instead of disabling or tuning specific checks. Rules Engine makes detection logic accountable; every alert traces to named, categorised, severity-rated rules with measurable hit share.

### Step-by-step walkthrough

1. Navigate to Configure → Rules Engine.
2. Read `{enabled}/{total} RULES ACTIVE`; confirm most rules enabled for lab work.
3. Pick `SQL Injection Attempt`, read description referencing STRIDE Tampering.
4. Note MITRE line mapping to T1190; use in incident reporting.
5. Observe **0 HITS** before ingestion: baseline.
6. Run Simulate Campaign on Overview; return and watch hit counters increment on matching rules.
7. Toggle off `Brute Force Attack`, rerun simulation; brute-force hits should not increase.
8. Re-enable the rule: confirm next matching logs increment hits again.
9. Read footer **HOW RULES WORK** to internalise check-per-log model.

### Common questions

#### Is a rule the same as an alert?

No. A rule is a test; an alert is a fired result when a log matches one or more enabled rules. One log can match multiple rules, producing one alert with multiple `matchedRules` entries.

#### Who can toggle rules?

Any role with write access (`tier2+`) can call `toggleRule`. Tier1/auditor see rules but toggling may no-op if RBAC enforced on API, UI still renders toggles.

#### How many rules ship in HABIBI-SIEM?

Twelve detection rules in the detection rules catalog covering injection, authentication, network, host, and recon categories across STRIDE types.

#### Do disabled rules delete their past alerts?

No. Footer states explicitly: "Existing alerts are unaffected." Disabling stops future firing only.

### How an analyst uses this during active incident

During alert storms, the analyst opens Rules Engine to see which rules dominate hit percentages; a rule at 80% of hits identifies tuning target or primary attack vector. They temporarily disable noisy non-necessary rules (e.g., `off-hours-auth` during known maintenance window) if authorised. They cite rule names and MITRE IDs from cards in incident tickets for consistency with ATT&CK-based reporting.

### Edge cases and gotchas

Hit percentages normalise against sum of all rule hits; new rule with 1 hit shows small bar even if critical. detection logic exceptions log to console and skip match; silent rule failure possible. Rules lack UI editor here, code changes required for logic edits. Correlation Builder rules are separate local state; not listed in Rules Engine. The twelve shipped rules span STRIDE categories: Tampering, Spoofing, Denial of Service, Elevation of Privilege, Information Disclosure, Repudiation. Each executes synchronously inside the ingestion loop; no async queue, so rule latency adds directly to processLogs duration observable indirectly via Pipeline Health EPS stability. Rules share object references with Overview **RULES** counter and Pause All admin controls in the SIEM context pipeline. Disabling via Overview bulk pause mirrors individual toggles in Rules Engine, two UIs, one rules array. Alert objects store matchedRules snapshots preserving ruleName at fire time; renaming rule in code does not alter historical alert labels already persisted to SQLite through api.saveAlerts(). Detection rules differ from prevention controls. WAF blocks, rules alert. HABIBI rules never drop logs; they annotate risk via alert creation. Understanding that distinction prevents analysts from assuming disabling SQLi rule removes attack traffic; traffic remains in raw logs up to MAX_RAW_LOGS retention, merely unseen in alert feed. Rule enablement ratio on Overview header should stay above seventy-five percent in healthy programmes; sustained fifty percent enabled suggests change freeze or incident panic deserving manager review separate from individual rule merit.
