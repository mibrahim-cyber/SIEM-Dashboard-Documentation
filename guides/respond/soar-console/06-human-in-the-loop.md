---
module: SOAR Console
sidebar: Respond → SOAR
section: Respond
subsection: Human-in-the-loop vs fully automated
last_updated: 2026-05-23
---

# Human-in-the-loop vs fully automated

**Part of:** Respond → SOAR
**One-sentence focus:** Review automated orchestration, enrichment lookups, playbooks, and the SOAR audit log.

![SOAR Console main view](../../../screenshots/guides/respond-soar-console.png)

### What you are looking at

Automation: ingest-time `soarCheckIp` for external high/critical alerts; auto watchlist when score > 75 or CISA-listed. Human gates: **BLOCK IP** and **EXECUTE CONTAINMENT** buttons on Active Threats and Manual Lookup; playbook reading; optional **LOOKUP** before block. No approval modal; clicking block immediately calls `blockIp`.

### What is happening underneath

`canWrite` RBAC gates mutations. Auto path requires `canWrite && (score > threshold || cisa)`. Read-only users see data but cannot block. No two-person rule or manager approval queue. Respond → SOAR Console (SOAR Console screen) implements the shape of enterprise SOAR; playbooks, enrichment, containment, audit, without claiming hundreds of vendor integrations. The 220px left rail is fixed width so playbook counts, active threat counts, and watchlist totals remain visible while analysts scroll long audit tables. Every containment action funnels through the block-IP action in the SIEM context pipeline, which calls watchlist API, updates the `blockedIps` Set, and writes a SOAR log row with `enforcement: 'watchlist_only'`. That string is not cosmetic; it is the honest contract that demo blocking is correlation and visibility, not automatic firewall drop. Brief executives using airport security analogies: lookup is passport check; watchlist is the no-fly list; true network block requires a separate enforcement plane you integrate in production. The five shipped playbooks (brute force, SQL injection, data exfiltration, privilege escalation, XSS) are static `PLAYBOOKS` array entries, reference documents, not executable workflows. Each includes MITRE tactic/technique codes, STRIDE-flavoured descriptions, six SOP steps, and a displayed `automatedCountermeasure: 'blockIp'`. During bridge calls, read SOP steps aloud while a scribe tracks completion in Case Manager; do not assume clicking the playbook executes step 3 on a firewall. When adding a sixth playbook in code, mirror checklist steps in Incidents screen's `PLAYBOOK` constant to avoid trainee confusion between modules.

### Why this matters

Account lockouts and firewall changes can cause outages. Mature SOCs require approval for destructive actions. This demo biases toward speed for training; production should add approval workflows.

### Step-by-step walkthrough

1. Identify which actions ran automatically in SOAR log (operator: SYSTEM).
2. Compare manual blocks (operator: username from session).
3. For sensitive IPs (partner, CDN), always use Manual Lookup before **BLOCK**.
4. Document human override when not blocking despite high score.

### Common questions

#### Can viewers block IPs?

No, if `canWrite` is false: buttons may appear disabled or no-op.

#### Is there an undo for auto-block?

Call `unblockIp` programmatically. No prominent UI button in SOAR Console.

#### Which actions never need approval here?

#### Can automation run on medium alerts?

Not by default, only critical and high on ingest.

### Using this view during live response

Analyst lets automation handle obvious malicious scanners; holds manual approval for IPs touching production admin panels. Automatic enrichment on ingest executes inside log processing when severity is critical or high, the IP is public (non-RFC1918), and `canWrite` is true. The path calls `soarCheckIp` → GET `/api/threat/ip/:ip` → AbuseIPDB proxy, logging IP_LOOKUP, IP_SCORED, or IP_LOOKUP_ERROR. When `abuseConfidenceScore` exceeds `SOAR_BLOCK_THRESHOLD` (75) or CISA-known-bad flags apply server-side, `blockIp` may run with operator **SYSTEM**. Manual paths on Active Threats and Manual Lookup attribute `usernameRef.current` as operator. Train analysts to read the audit log after every campaign: automation silently failing (API key missing, rate limit) looks like "nothing happened" unless IP_LOOKUP_ERROR rows are monitored.

### Edge cases and gotchas

No approval trail beyond SOAR log. Rapid auto-block on shared NAT can watchlist many users' egress IP. CISA flag forces block even if score moderate. SOAR Console does not ship MTTR widgets, yet MTTR is derivable: timestamp first critical alert (`firstSeen` in Incidents), timestamp first WATCHLIST_ADD in audit log, timestamp alert resolution in Alert Manager. Track false positives by auditing manual unblocks (`unblockIp`) within twenty-four hours of auto blocks, not instrumented today, but necessary before raising `SOAR_BLOCK_THRESHOLD`. Read-only sessions disable automation during ingest: verify role assignments before blaming "SOAR broken" during demos. Treat the footer disclaimer (watchlist only, not firewall enforced) as mandatory language in every executive deck involving SOAR metrics. The audit log is your strongest compliance artefact in this module: pair **TIME** with Incidents **FIRST SEEN** and Case Manager note timestamps when reconstructing timelines. If IP_LOOKUP_ERROR spikes during an exercise, check API key configuration before assuming attacks stopped.
