---
module: Vulnerability Intel
sidebar: Intelligence → Vuln Intel
section: Intelligence
subsection: Zero-day vs n-day
last_updated: 2026-05-23
---

# Zero-day vs n-day

**Part of:** Intelligence → Vuln Intel
**One-sentence focus:** CVE data mapped to asset inventory with prioritisation and exploitation heuristics.

![Vulnerability Intel main view](../../../screenshots/guides/intelligence-vuln-intel.png)

### What you are looking at

All listed CVEs are n-day (published IDs). **ACTIVE EXPLOIT** shows **ACTIVE** red label when detections overlap; simulates n-day under active attack. No **ZERO-DAY** badge exists.

### What is happening underneath

Zero-day = no CVE yet; would not appear until vendor disclosure. Options during wait: WAF rules, disable service, network isolate, documented in remediation text generically ("Apply vendor patch immediately") not compensating control wizard. Intelligence → Vuln Intel (Vulnerability Intel screen) joins three data sources: `ASSETS` from static asset registry (each with `cves[]`), merged CVE metadata from `CVE_DB` and `EXTENDED_CVE_DB`, and live alerts matching asset IPs on `sourceIp` or `destIp`. Exploitation flag `exploited: true` when asset-linked alerts include any critical or high severity; heuristic detection overlap, not malware sandbox confirmation. Header stats (TOTAL CVEs, **CRITICAL**, **ACTIVE EXPLOIT**) and filters/sorts (**CVSS**, **PRIORITY**, **EXPLOITED**, **ALERTS**) help patch teams queue work; sidebar toggles between aggregate **STRIDE BREAKDOWN** / **CVSS DISTRIBUTION** and per-row **CVE DETAIL**.

### Why this matters

Media hype focuses zero-days; most breaches exploit n-days unpatched for months: this module trains n-day prioritisation.

### Step-by-step walkthrough

1. Distinguish unpublished vuln (not here) vs listed CVE without patch (vendor pending).
2. For ACTIVE n-day, implement network block/WAF from Incidents/SOAR.
3. Document compensating controls in Case Manager notes.
4. Monitor vendor advisory feeds externally.

### Common questions

None. Use incident response until CVE assigned.

#### CISA KEV catalog integration?

Not wired, would boost priority if added.

#### Patch available but not deployed?

Classic n-day risk; priority column highlights. Not buttoned: manual WAF rule suggestion in remediation prose only.

### How an analyst uses this during an active incident

If exploit active but patch testing incomplete, escalate compensating controls via change emergency ticket referencing CVE detail pane. Use the house analogy from the module intro in executive meetings: CVE rows are unlocked windows; alerts on asset IPs are burglars rattling those windows; threat actors live in Threat Intel IP cards. Zero-day unpublished flaws will not appear until listed in DB constants. Compensating controls belong in Case Manager notes and external WAF/runbooks, not a wizard here. After patching real infrastructure, resolve related alerts in Alert Manager and confirm **EXPLOITED** clears on refresh, avoid false comfort if alerts were cleared without patching.

### Edge cases and gotchas

Simulated alerts may mark exploited without true compromise; validate with forensics. Extended CVE DB includes 2024 high-profile names for realism. Priority score uses `Math.round(cveInfo.cvss * asset.criticality / 10)` for asset-linked rows; orphan CVEs from extended DB use `Math.round(info.cvss)` without criticality divisor: explain ranking shifts when Asset shows Multiple / Unknown. Remediation panel suggests SLAs: patch within 24h if CVSS ≥9, 7 days if ≥7, else next cycle. Organisational change windows still apply. STRIDE column values (Elevation of Privilege, Spoofing, etc.) and MITRE tactic codes (**TA0004**, **TA0001**) guide architects toward control families without replacing WAF/EDR tooling. NAT can break IP-to-asset matching, false-negative **EXPLOITED**. `critAlerts` computed but not shown in table. STRIDE sidebar bars are not clickable filters. Row hover handlers may briefly override selection highlight, cosmetic. Extended CVE entries include realistic 2024 names (e.g., PAN-OS **CVE-2024-3400**) for training realism. Patch prioritisation here blends CVSS with asset criticality but does not yet encode internet exposure as an explicit column; cross-check Infrastructure → Asset Inventory tags before accepting sort order as gospel. The **EXPLOITED** flag means high/critical alerts touched the asset IP, not that malware was confirmed on disk. Use Case Manager notes to record compensating controls when remediation text insists on patching immediately but change freeze prevents it.
