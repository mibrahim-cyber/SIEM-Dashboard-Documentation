---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 07-orphaned-assets.md
title: "The orphaned asset problem"
last_updated: 2026-05-23
---

# The orphaned asset problem

**Sidebar path:** Infrastructure → Asset Inventory

## Orphaned asset / shadow IT

### What you are looking at

An orphaned asset in enterprise terms is a registered CMDB entry whose owner left, whose application retired, or whose monitoring agent stopped reporting, still counting toward compliance scope but nobody maintains it. Shadow IT is the opposite problem: infrastructure running without registration, a developer's cloud instance, an unauthorised NAS, a forgotten test VM. HABIBI-SIEM's Asset Inventory shows neither category explicitly. You see twelve maintained records with owners implied by naming (`PROD-`, `DEV-`) and tags, while anything outside the registry is invisible here but may still generate alerts on Overview. Shadow IT is like a guest house built behind the main property without a permit, the county tax roll (CMDB) does not know it exists, but utility usage (network logs) might reveal occupants. Orphaned assets are boarded-up rooms still listed on the hotel registry; officially open, practically abandoned.

### What is happening underneath

Orphan detection would require comparing `ASSETS` against recent log sources, agent heartbeats, or cloud API inventories; not implemented. The enrichment query only iterates registered assets and searches inward into alerts; it never promotes unknown IPs to asset candidates. `DEV-BUILD-01` and `DEV-WEB-01` on `172.16.0.x` represent semi-trusted dev infrastructure; common shadow IT breeding grounds in real organisations, but here they are fully registered. `blockedIps` tracks attacker IPs from SOAR, not orphaned internal hosts. Risk scoring does not include "days since last patch" or "missing agent" signals that often flag orphans.

> **Technical note:** To simulate shadow IT in the lab, ingest logs with `sourceIp: '10.0.0.99'`; alerts appear in the SIEM context pipeline but Asset Inventory **AT RISK** stays unchanged unless you add a matching registry entry.

### Why this matters

Shadow IT bypasses change control, vulnerability scanning, and backup policies, yet it still connects to corporate networks. Orphaned assets accumulate CVEs unpatched because nobody receives ticket assignments. Both inflate breach impact when attackers find the unmonitored path. Asset Inventory trains analysts to ask "what is not on this list?" every time they triage, complementing the **AT RISK** count on what is listed.

### Step-by-step walkthrough

1. Export or memorise the twelve registered IPs/subnets in Asset Inventory.
2. Run Simulate Campaign and collect attacker sourceIp values from Overview alerts.
3. Compare attacker IPs to registry; external IPs will not appear as assets (expected).
4. Build a custom log in Log Ingestion with internal `sourceIp` not in registry; confirm alert fires without Asset Inventory update.
5. Review dev subnet assets (`172.16.0.10`, `172.16.0.20`), registered, but in real life often shadow if CMDB lags.
6. Check **BLOCKED** stat; reflects blocked asset IPs, unrelated to shadow detection.
7. Open Investigate → Network Map or Threat Hunt to visualise IPs absent from inventory.
8. File a CMDB ticket (real world) or add `ASSETS` entry (lab) to close the shadow gap.

### Common questions

#### Does AT RISK = 0 prove no shadow IT?

No; it proves no registered asset has correlated alerts. Shadow resources may generate alerts visible only on Overview or Live Feed without registry linkage.

#### Can tags like dev identify shadow IT?

Tags indicate classification assigned at registration; they do not detect unauthorised dev servers. A shadow instance would lack tags entirely because it lacks a record.

#### How do orphaned assets behave in HABIBI?

All demo assets are "owned" by definition. Simulating orphan status would mean stop sending logs from an asset while keeping its row, **CLEAN** status persists misleadingly. Production SOCs flag orphans via stale heartbeat rules (see Configure → Rules Engine off-hours and auth rules as partial analogues).

#### Should shadow IT discoveries auto-create assets?

Best practice: create provisional discovered records pending owner validation, not silent promotion. HABIBI has no auto-create path; intentional to keep the lab registry stable.

### How an analyst uses this during active incident

When alert volume concentrates on an IP not in Asset Inventory, the analyst flags potential shadow IT or external attacker and escalates for asset validation before assuming production impact. When a registered dev asset (`DEV-WEB-01`) shows **AT-RISK**, they verify whether traffic is authorised test activity or shadow deployment on approved dev subnet. They document registry gaps in the incident case for post-incident CMDB reconciliation.

### Edge cases and gotchas

Hostname partial matching may falsely link alerts to registered assets, hiding shadow instances with similar names. **JUMP-HOST-01** is registered; unregistered jump boxes in real environments are high-risk shadow paths. Decommissioned IPs reassigned to new devices cause orphan-like confusion; lifecycle hygiene matters. CVE filter may distract from shadow discovery, vulnerable registered assets are not shadows. Operational playbooks for shadow IT often begin with DHCP logs, DNS query anomalies, or EDR agents appearing from unknown subnets; none of which auto-populate HABIBI Asset Inventory. When Monitor → Pipeline Health shows healthy ingestion but Asset Inventory **AT RISK** stays zero while Overview alert volume climbs, suspect either purely external attack traffic or internal hosts outside registry scope. The `172.16.0.x` dev subnet in the demo is a teaching example: in many enterprises that RFC1918 range is under-documented and becomes shadow IT harbour; here it is fully registered, modelling what "good" looks like after discovery. Orphaned assets create compliance debt: PCI scoped systems must appear on inventory lists with owners. An orphaned but still-powered mail-server clone on an old VLAN may lack CVE cards if removed from `ASSETS` while still running; auditors see a gap. Pair Asset Inventory reviews with quarterly CMDB reconciliation meetings even when the SIEM screen looks complete.
