---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: MITRE ATT&CK integration
last_updated: 2026-05-23
---

# MITRE ATT&CK integration

**Part of:** Monitor → Alert Manager
**One-sentence focus:** MITRE technique metadata lives on detection rules and surfaces in the alert detail modal, not in the Manager table columns.

### What you are looking at

Alert Manager table does not show MITRE IDs directly, integration appears in `AlertDetailModal` under each matched rule: green `technique` code, tactic and name line (e.g. technique // tactic · name). Rules Engine configuration also stores MITRE metadata per rule. MITRE ATT&CK is the periodic table of adversary behaviours, each technique ID (like T1110.001) is an element with known properties, not a vague "hack attempt" label.

### What is happening underneath

detection rules catalog entries optional `mitre: { technique, tactic, name }`. Modal resolves full rule by `ruleId`. No ATT&CK matrix navigator in Alert Manager, see Investigate modules for matrix views if enabled. Export CSV includes stride not MITRE ID today; gap for GRC integrations.

### Why this matters

Industry speaks MITRE; bridging from alert to playbook steps (credential access → reset password, audit auth) speeds consistent response. Executives learn that ATT&CK is shared vocabulary across vendors.

### Step-by-step walkthrough

1. Open alert via Overview modal (from Manager row reference).
2. Locate MITRE line under each matched rule block.
3. Web search or ATT&CK site lookup technique ID externally.
4. Map technique to response playbook step.
5. Document technique in case for trending (T1110 brute force spike week).
6. Cross-check Rules Engine rule definition matches modal display.
7. Train tier1 to escalate unfamiliar techniques to tier2.

### Common questions

#### Why not show t-code in manager table?

Space and readability; modal is detail layer.

#### Are all rules MITRE-tagged?

Most demo rules include metadata, custom rules may omit.

#### Does MITRE drive severity?

No; severity from rule config independent of ATT&CK tactic.

#### Can I filter by technique?

Search box matches rule name text only; not technique ID substring unless in name.

### How an analyst uses this during an active incident

Reads MITRE to pick containment: T1071 application layer protocol vs T1021 remote services different playbooks.

### Edge cases and gotchas

Multiple rules mean multiple techniques; address highest severity first. Outdated ATT&CK versions in static rule files may drift from current MITRE release.

> **Technical note:** Modal imports `detectionRules` static array, ensure rule file sync with engine enabled set.

detection rules catalog stores optional `mitre: { technique, tactic, name }` on each detection rule. `AlertDetailModal` resolves the full rule by `ruleId` and renders green technique codes with tactic/name lines. Alert Manager search matches rule name text only; searching `T1110` will not find brute-force alerts unless the ID appears in the rule name string. Industry playbooks map techniques to actions: credential access techniques trigger password resets and auth audits; exfiltration techniques trigger DLP and egress blocks. Document technique IDs in case notes for weekly trending ("T1110 spike this week").
