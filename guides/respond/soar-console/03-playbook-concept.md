---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: The playbook concept
last_updated: 2026-05-23
---

# The playbook concept

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

Playbook Library renders five cards in a 2-column grid: Brute Force Response, SQL Injection Response, Data Exfiltration Response, Privilege Escalation Response, and XSS Attack Response. Each card shows name, severity badge (**HIGH** or **CRITICAL**), STRIDE-flavoured description, and MITRE tactic/technique codes (e.g. **TA0006**, T1110.001). Clicking a card highlights a cyan border and opens a 320px right drawer with **SOP STEPS** ordered list, **AUTOMATED COUNTERMEASURE** box showing `blockIp(source.ip)`, and MITRE footer lines. Hospital triage protocol analogy: colour tags tell you urgency; ordered steps tell you what to do in sequence; automated countermeasure is the defibrillator; used when thresholds met.

### What is happening underneath

Playbooks are static data in the `PLAYBOOKS` array; each object has `id`, `name`, `mitreTactic`, `technique`, `severity`, `description`, `sopSteps[]`, `automatedCountermeasure: 'blockIp'`, and `triggerRule` string matching detection categories. Selecting toggles `selectedPb` state; no execution engine runs steps automatically. The UI maps human procedures to the same `blockIp` function used elsewhere. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR, playbooks, enrichment, containment, audit; without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Consistency beats heroics in incident response. Playbooks encode legal and technical order (capture forensic buffer before rebooting). Showing MITRE linkage helps reports speak auditor language.

### Step-by-step walkthrough

1. Open Playbook Library.
2. Click SQL Injection Response (critical badge).
3. Read six SOP steps from HTTP capture through Tier 3 escalation.
4. Note automated countermeasure and threshold text Triggers when AbuseIPDB score > 75.
5. Compare with Incident Response playbook for same category. Similar steps, different UI.
6. Deselect by clicking the card again.

### Common questions

#### Do playbooks run automatically?

No. They are reference documents in this build. Auto actions are limited to IP lookup/block on ingest.

#### Can I edit playbooks in the UI?

Not without code changes to `PLAYBOOKS` in SOAR Console screen.

#### What is STRIDE in the descriptions?

Microsoft threat model categories (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation). Each playbook description prefixes one.

#### How do playbooks relate to rules?

`triggerRule` strings (`brute-force`, `sql-injection`) align with detection rule IDs/categories conceptually but are not wired programmatically.

### What analysts do when the pager fires

Analyst identifies rule category from Alert Manager, opens matching playbook, reads SOP aloud in bridge call, executes steps in SOAR/Incidents/firewall manually while checking off externally. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

Five playbooks do not cover all Simulate Campaign scenarios (e.g. port scan). Data Exfiltration SOP mentions DPO notification, organisational process, not a button. Drawer absent until selection; empty right pane confuses first-time users. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks: not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest; verify role assignments before blaming "SOAR broken" during demos.
