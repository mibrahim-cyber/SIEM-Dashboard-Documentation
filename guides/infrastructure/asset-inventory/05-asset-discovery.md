---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 05-asset-discovery.md
title: "Asset discovery methods"
last_updated: 2026-05-23
---

# Asset discovery methods

**Sidebar path:** Infrastructure → Asset Inventory

## Asset discovery trade-offs

### What you are looking at

HABIBI-SIEM's Asset Inventory does not expose a discovery wizard, agent installer, or network scan launcher. Instead, you see the output of a discovery philosophy already executed: twelve curated assets in a static registry, immediately enriched with live SIEM telemetry. The header **TOTAL ASSETS: 12** is fixed until developers extend static asset registry. What varies dynamically is **AT RISK**, CRITICAL CVEs, and per-row **ALERTS**, proof that discovery without ongoing correlation is incomplete. The search box filters known assets but cannot reveal unknown ones. Discovery methods in enterprise security resemble census-taking strategies. A door-to-door survey (active scanning) finds people at home today but annoys residents. Utility bill records (passive DNS/logs) reveal addresses without knocking but miss squatters. HABIBI-SIEM's demo chose the pre-populated census approach to teach triage; production teams combine methods with different trade-offs.

### What is happening underneath

Assets enter the system through compile-time definition in the static asset registry, not runtime discovery APIs. Enrichment layer cross-references `the SIEM context pipeline` alerts, themselves produced when `processLogs()` on the detection engine matches ingested or simulated events against `detectionRules`. Passive discovery analogue: if a log carried a novel IP never in `ASSETS`, it would appear in alert feeds and Overview **TOP ATTACKERS** but not in Asset Inventory. Active discovery analogue: absent entirely, no Nmap integration, no DHCP listener, no cloud API poller. CVE data is also static (`CVE_DB` subset), not live NVD queries. The architecture separates authoritative inventory (static) from observed behaviour (dynamic alerts), mirroring how many SOCs ingest CMDB weekly but process logs continuously.

> **Technical note:** Extending inventory requires adding objects to `ASSETS` with required fields `id`, `name`, `type`, `ip`, `criticality`, `os`, `tags`, `cves`. Invalid CVE IDs degrade gracefully in the detail panel.

### Why this matters

Discovery trade-offs shape blind spots. Pure passive discovery misses powered-off servers until they emit logs. Pure active scanning misses SaaS assets and may crash fragile IoT devices. Over-aggressive auto-registration creates duplicate CMDB entries; under-registration hides shadow IT. Understanding what HABIBI-SIEM includes and excludes prevents false confidence; an empty **AT RISK** column does not mean the network is safe; it may mean attackers hit unregistered IPs only visible on Overview.

### Step-by-step walkthrough

1. Note **TOTAL ASSETS**: this is registry size, not discovered-in-last-24-hours count.
2. Run Simulate Campaign and watch **AT RISK** increment as alerts correlate to registered IPs in malicious log templates.
3. Open Monitor → Overview **TOP ATTACKERS** and compare IPs against Asset Inventory; external attacker IPs appear in Overview but not as assets.
4. Ingest custom logs via Log Ingestion referencing `10.0.0.30` (`PROD-APP-01`) and confirm the asset row gains alerts.
5. Ingest logs referencing an unregistered IP (e.g., `10.0.0.99`), Overview alerts increase; Asset Inventory **AT RISK** may not.
6. Filter **CVES** to see discovery of vulnerability exposure on known assets; separate from host discovery.
7. Discuss with your team which real-world discovery source would populate each demo asset (CMDB export, Azure Resource Graph, agent inventory).
8. Document gaps: dev subnets partially covered (`172.16.0.x`), no endpoints, no containers.

### Common questions

#### Should we enable network scanning to populate this view?

In production, yes; typically via integrated CMDB or vulnerability scanner feeds rather than scanning from the SIEM UI itself. Scans find live hosts but require credential policies, scan windows, and change control. HABIBI-SIEM omits scanning to keep the lab deployable without network permissions.

#### Can log-based discovery add assets automatically?

Not currently. Log-based discovery (inferring assets from DHCP, DNS, or agent heartbeats) is a common enterprise pattern HABIBI could extend via a backend job that POSTs new `ASSETS` entries. Today, analysts must manually extend the registry file or integrate an API.

#### Why populate CVEs statically instead of live lookup?

Static `CVE_DB` ensures demo reliability offline. Live NVD/API lookups introduce rate limits, latency, and version-matching complexity. The UI pattern (CVE cards with CVSS and name) matches what live feeds would render.

#### What is the trade-off of high-criticality pre-labeling?

Pre-assigned criticality (DC at 10, dev web at 3) encodes business judgment without analyst input per incident; fast triage but stale if workloads move. Real CMDBs require ownership review cycles; the demo skips governance workflow.

### How an analyst uses this during active incident

The analyst recognises discovery limits under pressure. When **TOP ATTACKERS** shows an IP not in Asset Inventory, they treat it as unregistered exposure, potential shadow IT or external threat; rather than assuming safety. They prioritise registered **AT-RISK** crown jewels first, then hunt unregistered IPs in Investigate → Threat Hunt. They flag **TOTAL ASSETS** static count to management as a metric requiring CMDB integration, not as live coverage proof.

### Edge cases and gotchas

Simulated logs target known asset IPs by design; overstating registry coverage compared to real passive-only discovery. Search assets... cannot find what is not registered. CVE filter finds vulnerable known assets only, not vulnerable unknown hosts. Blocked IP count tracks asset IPs in block list, not discovered attackers.
