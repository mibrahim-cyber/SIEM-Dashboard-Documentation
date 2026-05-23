---
module: Vulnerability Intel
sidebar: Intelligence → Vuln Intel
section: Intelligence
subsection: Patch prioritisation
last_updated: 2026-05-23
---

# Patch prioritisation

**Part of:** Intelligence → Vuln Intel
**One-sentence focus:** CVE data mapped to asset inventory with prioritisation and exploitation heuristics.

![Vulnerability Intel main view](../../../screenshots/guides/intelligence-vuln-intel.png)

### What you are looking at

**PRIORITY** column: mini progress bar plus numeric score (e.g., rounded CVSS×criticality/10). Sort button **PRIORITY** reorders table. Detail remediation text: patch within 24h if CVSS ≥9, 7 days if ≥7, else next cycle.

### What is happening underneath

Formula simplified in demo; does not explicitly multiply internet exposure flag (would be enhancement). `critAlerts` computed but not shown in table; available in data object. Sort **EXPLOITED** pushes active exploitation to top regardless of CVSS. Intelligence → Vuln Intel (Vulnerability Intel screen) joins three data sources: `ASSETS` from static asset registry (each with `cves[]`), merged CVE metadata from `CVE_DB` and `EXTENDED_CVE_DB`, and live alerts matching asset IPs on `sourceIp` or `destIp`. Exploitation flag `exploited: true` when asset-linked alerts include any critical or high severity, heuristic detection overlap, not malware sandbox confirmation. Header stats (TOTAL CVEs, **CRITICAL**, **ACTIVE EXPLOIT**) and filters/sorts (**CVSS**, **PRIORITY**, **EXPLOITED**, **ALERTS**) help patch teams queue work; sidebar toggles between aggregate **STRIDE BREAKDOWN** / **CVSS DISTRIBUTION** and per-row **CVE DETAIL**.

### Why this matters

Patch teams have finite windows; ordering prevents spending weekend on CVSS 7 internal print server while CVSS 10 edge device actively exploited.

### Step-by-step walkthrough

1. Click sort **PRIORITY** after initial CVSS sort.
2. Cross-reference **EXPLOITED** YES rows: should jump queue.
3. Read remediation panel SLA suggestion.
4. Assign change ticket starting top 5 rows.
5. Re-run after patch to confirm **EXPLOITED** clears (alerts resolved).

### Common questions

Not explicit column. Infer from asset tags in inventory module.

#### CVSS 10 but low priority number?

Low asset criticality in data, verify asset classification.

#### Compensating controls considered?

Not in score; manual note in change record.

#### Emergency change process?

### Analyst workflow under pressure

Hand top three PRIORITY+EXPLOITED rows to infrastructure lead within first hour. Use the house analogy from the module intro in executive meetings: CVE rows are unlocked windows; alerts on asset IPs are burglars rattling those windows; threat actors live in Threat Intel IP cards. Zero-day unpublished flaws will not appear until listed in DB constants: compensating controls belong in Case Manager notes and external WAF/runbooks, not a wizard here. After patching real infrastructure, resolve related alerts in Alert Manager and confirm **EXPLOITED** clears on refresh. Avoid false comfort if alerts were cleared without patching.

### Edge cases and gotchas

Orphan CVEs use `patchPriority: Math.round(info.cvss)` without criticality divisor. Progress bar width `patchPriority * 10` % may exceed 100 visually capped by CSS container. Priority score uses `Math.round(cveInfo.cvss * asset.criticality / 10)` for asset-linked rows; orphan CVEs from extended DB use `Math.round(info.cvss)` without criticality divisor, explain ranking shifts when Asset shows Multiple / Unknown. Remediation panel suggests SLAs: patch within 24h if CVSS ≥9, 7 days if ≥7, else next cycle; organisational change windows still apply. STRIDE column values (Elevation of Privilege, Spoofing, etc.) and MITRE tactic codes (**TA0004**, **TA0001**) guide architects toward control families without replacing WAF/EDR tooling. NAT can break IP-to-asset matching, false-negative **EXPLOITED**. `critAlerts` computed but not shown in table. STRIDE sidebar bars are not clickable filters. Row hover handlers may briefly override selection highlight: cosmetic. Extended CVE entries include realistic 2024 names (e.g., PAN-OS **CVE-2024-3400**) for training realism. Patch prioritisation here blends CVSS with asset criticality but does not yet encode internet exposure as an explicit column. Cross-check Infrastructure → Asset Inventory tags before accepting sort order as gospel. The **EXPLOITED** flag means high/critical alerts touched the asset IP, not that malware was confirmed on disk. Use Case Manager notes to record compensating controls when remediation text insists on patching immediately but change freeze prevents it.
