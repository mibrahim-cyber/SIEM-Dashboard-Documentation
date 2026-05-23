---
module: Vulnerability Intel
sidebar: Intelligence → Vuln Intel
section: Intelligence
subsection: Compensating controls
last_updated: 2026-05-23
---

# Compensating controls

**Part of:** Intelligence → Vuln Intel
**One-sentence focus:** CVE data mapped to asset inventory with prioritisation and exploitation heuristics.

![Vulnerability Intel main view](../../../screenshots/guides/intelligence-vuln-intel.png)

### What you are looking at

Detail **REMEDIATION** amber box: textual guidance only; "Apply vendor patch immediately" with SLA by CVSS. No compensating control checklist UI.

### What is happening underneath

Legacy systems, change freeze, or no vendor fix require ISO 27001 Annex A control documentation; outside React scope. STRIDE column hints control type (Spoofing → auth controls, Elevation → hardening). Intelligence → Vuln Intel (Vulnerability Intel screen) joins three data sources: `ASSETS` from static asset registry (each with `cves[]`), merged CVE metadata from `CVE_DB` and `EXTENDED_CVE_DB`, and live alerts matching asset IPs on `sourceIp` or `destIp`. Exploitation flag `exploited: true` when asset-linked alerts include any critical or high severity, heuristic detection overlap, not malware sandbox confirmation. Header stats (TOTAL CVEs, **CRITICAL**, **ACTIVE EXPLOIT**) and filters/sorts (**CVSS**, **PRIORITY**, **EXPLOITED**, **ALERTS**) help patch teams queue work; sidebar toggles between aggregate **STRIDE BREAKDOWN** / **CVSS DISTRIBUTION** and per-row **CVE DETAIL**.

### Why this matters

Auditors accept delayed patch if compensating controls documented and risk accepted by management.

### Step-by-step walkthrough

1. Identify CVE on unpatchable legacy asset.
2. Document network segmentation isolating asset.
3. Note enhanced monitoring rules targeting that IP.
4. Record risk acceptance sign-off externally.
5. Track **EXPLOITED** flag, if YES, intensify controls.

### Common questions

#### Where log compensating controls?

Case Manager notes or GRC tool: not Vuln Intel.

#### STRIDE helps how?

Maps to control families for architects.

#### WAF rule link?

Configure in external WAF.No button.

#### Change freeze exception?

### Using this view during live response

Propose segmentation within 2 hours if patch cannot land within SLA in remediation box. Use the house analogy from the module intro in executive meetings: CVE rows are unlocked windows; alerts on asset IPs are burglars rattling those windows; threat actors live in Threat Intel IP cards. Zero-day unpublished flaws will not appear until listed in DB constants, compensating controls belong in Case Manager notes and external WAF/runbooks, not a wizard here. After patching real infrastructure, resolve related alerts in Alert Manager and confirm **EXPLOITED** clears on refresh; avoid false comfort if alerts were cleared without patching.

### Edge cases and gotchas

Remediation text always says "Apply vendor patch" even when impossible: analyst must override narrative in tickets. Priority score uses `Math.round(cveInfo.cvss * asset.criticality / 10)` for asset-linked rows; orphan CVEs from extended DB use `Math.round(info.cvss)` without criticality divisor. Explain ranking shifts when Asset shows Multiple / Unknown. Remediation panel suggests SLAs: patch within 24h if CVSS ≥9, 7 days if ≥7, else next cycle, organisational change windows still apply. STRIDE column values (Elevation of Privilege, Spoofing, etc.) and MITRE tactic codes (**TA0004**, **TA0001**) guide architects toward control families without replacing WAF/EDR tooling. NAT can break IP-to-asset matching, false-negative **EXPLOITED**. `critAlerts` computed but not shown in table. STRIDE sidebar bars are not clickable filters. Row hover handlers may briefly override selection highlight; cosmetic. Extended CVE entries include realistic 2024 names (e.g., PAN-OS **CVE-2024-3400**) for training realism. Patch prioritisation here blends CVSS with asset criticality but does not yet encode internet exposure as an explicit column: cross-check Infrastructure → Asset Inventory tags before accepting sort order as gospel. The **EXPLOITED** flag means high/critical alerts touched the asset IP, not that malware was confirmed on disk. Use Case Manager notes to record compensating controls when remediation text insists on patching immediately but change freeze prevents it.
