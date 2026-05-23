---
module: Reports
sidebar: Reporting → Reports
section: Reporting
subsection: Compliance report mapping
last_updated: 2026-05-23
---

# Compliance report mapping

**Part of:** Reporting → Reports
**One-sentence focus:** How NIST CSF, ISO 27001, and SOC 2 checklist cards map live SIEM metrics to framework language.

### What you are looking at

Select **COMPLIANCE VIEW** to reveal // COMPLIANCE POSTURE, a three-column grid of framework cards. Each card shows a bold framework name, a large percentage score in VT323 font (green if ≥80%, amber if ≥60%, red below), a horizontal progress bar, and four checklist rows prefixed with yes (pass, green) or no (fail, red). The three frameworks rendered in the UI are **NIST CSF**, **ISO 27001**, and **SOC 2**, not PCI DSS, GDPR, or HIPAA by name. Below the posture grid, // MITRE ATT&CK COVERAGE displays a three-column grid of detection rule cards. Each card lists the MITRE technique ID, **ACTIVE** or **DISABLED** status, technique name, parent tactic, and a bold {N} detections hit count. Together these panels answer "are we monitoring?" and "do our controls look healthy?" without exporting data. Checklist examples you will see: under NIST CSF. "Threat detection rules active", "Alert triage process in place", "Incident logging enabled", "No uncontained critical incidents". Under ISO 27001, "Security monitoring operational", "All detection rules enabled", "Incident response process", "Log retention active". Under SOC 2; "Continuous monitoring", "Alert deduplication available", "Audit trail maintained", "Critical alerts escalated".

### What is happening underneath

Compliance scores are calculated in an inline configuration map, not fetched from a GRC database. **NIST CSF** score: `Math.min(100, Math.round(50 + stats.resolutionRate / 2))`. **ISO 27001**: `Math.min(100, Math.round(45 + (enabledRulesCount / rules.length) * 40))`. **SOC 2**: `Math.min(100, Math.round(40 + stats.resolutionRate * 0.6))`. Each `items[]` array contains `{ check, pass }` booleans evaluated against live metrics: for example NIST "Alert triage process in place" passes if `stats.acked > 0 || stats.resolved > 0`; ISO "All detection rules enabled" passes only when `enabledRulesCount === rules.length`; SOC 2 "Critical alerts escalated" passes if `stats.critical === 0 || stats.acked > 0`. MITRE coverage iterates `rules.map` showing `rule.mitre.technique`, `rule.mitre.name`, `rule.mitre.tactic`, `rule.enabled`, and `rule.hits`. This is detection coverage, not full ATT&CK matrix completeness. Only techniques tied to shipped rules appear. Conceptually, you can map the visible checks to other frameworks even though the UI does not label them:

| Framework (conceptual) | How to read this screen |
|---|---|
| **PCI DSS** (Req. 10–11) | "Incident logging enabled" + "Continuous monitoring" ≈ log review and monitoring controls; export audit trail for assessor evidence. |
| **GDPR** (Art. 32, 33) | "Security monitoring operational" + incident counts ≈ technical measures and breach awareness; active critical incidents flag potential notification workflows. |
| **HIPAA** (§164.308, §164.312) | "Audit trail maintained" + access-related detections in MITRE grid ≈ access monitoring and integrity controls. |

These mappings are interpretive, the dashboard does not compute PCI, GDPR, or HIPAA scores.

### Why this matters

Auditors ask for control evidence, not raw alert JSON. Framework-labelled checklists give compliance stakeholders a familiar vocabulary even when the SOC lives in MITRE and severity language day to day. Showing pass/fail tied to real metrics (rules enabled, acks exist, no uncontained critical incidents) makes the report a conversation starter for gap remediation rather than a vanity percentage. MITRE coverage visible on the same view links "compliance monitoring" to "actual detections deployed," which is what assessors increasingly expect under continuous-control monitoring models. Because scores are formula-derived, teams must understand they are indicators, not replacements for formal control testing or penetration findings. Still, a sudden drop in ISO score when someone disables half the rules in Configure → Detection Rules is a legitimate early warning for change-management drift.

### Step-by-step walkthrough

1. Open Reporting → Reports and click **COMPLIANCE VIEW**.
2. Read the three percentage scores top-down; note colour thresholds (≥80% green, ≥60% amber, below red).
3. For each framework card, scan the four yes/no lines and write down any failures.
4. Cross-check failures against live modules: disabled rules in rule config, unacked criticals in Alert Manager, active critical incidents in Respond → Incidents.
5. Scroll to // MITRE ATT&CK COVERAGE and list techniques marked **DISABLED**; each is a coverage gap.
6. Compare detection counts with **TECHNICAL VIEW → DETECTION RULE PERFORMANCE** for consistency.
7. Document remediation owners for each no before an audit meeting.
8. Export a `.txt` report or alert CSV if evidence must leave the browser (see Export section).

### Common questions

#### Why does the UI show NIST, ISO, and SOC 2 but not PCI or HIPAA?

The component hard-codes three framework objects in an array. PCI DSS, GDPR, and HIPAA require domain-specific controls (cardholder data scope, lawful basis, PHI access) that are not modelled separately. Use the conceptual mapping table above and MITRE/rule evidence for assessor conversations.

#### Are the compliance percentages certified scores?

No. They are deterministic formulas from resolution rate and rule-enable ratios plus boolean checks. A 92% NIST display does not mean NIST certification: it means the demo heuristics yield 92.

#### What makes "No uncontained critical incidents" fail?

The check counts `activeIncidents.filter(i => i.severity === 'critical').length === 0`. Any active incident whose correlated severity is critical fails the NIST card line.

#### Does "Alert deduplication available" verify dedupe is turned on?

No. it is hard-coded `pass: true` in the SOC 2 items array. It indicates the product capability exists (`dedupeEnabled` in context), not that your org enabled it in Settings.

#### How does MITRE coverage relate to ISO 27001 annex a?

Annex A expects threat intelligence and monitoring controls. The MITRE grid demonstrates which attacker techniques have active detections, a supporting artefact for A.8 monitoring discussions, not a one-to-one Annex mapping.

### Edge cases and gotchas

Fresh installs with zero alerts still pass several checks ("Incident logging enabled" passes when `stats.total > 0` only; at zero alerts that fails). Disabling one rule fails ISO "All detection rules enabled" even if that rule is a test stub. Resolution rate of 0% pulls NIST/SOC scores down sharply. Critical incidents with contained backend status but not resolved may still count as active. MITRE grid size equals rule count: adding custom rules increases cards but does not auto-update framework formulas.

> **Technical note:** Framework definitions are declared inline on the Reports screen. Pass conditions reference `stats`, `enabledRulesCount`, `rules.length`, and `activeIncidents`. No API endpoint serves compliance posture; everything recomputes on `alerts` or `rules` change via parent context.

### How an analyst uses this

A compliance-focused analyst runs **COMPLIANCE VIEW** before quarterly reviews, captures screenshots of any no rows, and opens tickets: enable missing rules, acknowledge stale critical alerts, resolve or contain incidents. They pair MITRE **DISABLED** cards with change tickets that paused rules during maintenance. For PCI-facing environments they narrate how "Continuous monitoring" and export audit logs satisfy Req. 10.6-style daily review narratives, even though the label says SOC 2. For GDPR they highlight whether active incidents imply personal-data breach assessment triggers based on event types in **TECHNICAL VIEW**.
