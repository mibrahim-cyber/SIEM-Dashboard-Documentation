---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 04-asset-record-fields.md
title: "Every field in an asset record"
last_updated: 2026-05-23
---

# Every field in an asset record

**Sidebar path:** Infrastructure → Asset Inventory

## Every field in an asset record

### What you are looking at

Each asset exposes fields across the table row and the **ASSET DETAIL** side panel. Table columns: **ASSET** (name + OS sub-line), **TYPE**, **IP**, **CRITICALITY** (progress bar + `N/10` with colour from `getCriticalityLabel`), CVEs (count and max CVSS, red if max ≥ 9, orange if ≥ 7), **ALERTS** (count or em dash; critical count appended as `(N!)` in red), **RISK** (0–100 bar coloured red ≥ 70, orange ≥ 40, green below), **STATUS** (**CLEAN**, **AT-RISK**, **COMPROMISED**). Detail panel fields: IP Address, Criticality (numeric + label), risk score (`N/100`), Alert Count, Status, tag pills, and expandable KNOWN CVEs cards showing CVE ID, CVSS score, and vulnerability name from `CVE_DB`. Imagine a personnel file drawer: the folder spine shows name and department (table row), but the full dossier inside lists home address, clearance level, training certificates, and disciplinary flags (detail panel). Analysts skim spines for urgency; investigators open folders for evidence.

### What is happening underneath

Static fields from static asset registry: `id`, `name`, `type`, `ip`, `criticality`, `os`, `tags[]`, `cves[]`. CVE enrichment: for each CVE ID, `CVE_DB[cveId]` supplies `{ cvss, name, affected }`. `totalCvss` sums all CVSS values; `maxCvss` takes the highest, the table displays max, not sum. Alert enrichment: filters `alerts` where IP or hostname matches. RiskScore formula weights criticality base (`× 6`), critical alerts (`× 8` each), high alerts (`× 4` each), and max CVSS (`× 2`), capped at 100. isBlocked: `blockedIps.has(a.ip)` from SOAR actions. Status: derived enum, not stored. CritLevel: computed label/colour pair for display consistency between table and detail.

> **Technical note:** CVE cards in the detail panel use a red border when `cvss >= 9` (`rgba(255,45,85,0.3)`), otherwise default border. Missing CVE DB entries show CVSS as `?`.

### Why this matters

Field semantics determine whether two analysts agree on prioritisation. If one interprets **RISK** as purely vulnerability-based and another as alert-driven, they split investigations unnecessarily. Documenting each field prevents the common failure mode where CVE count drives patch tickets while **STATUS** and **ALERTS**, live attack indicators; are ignored. Compliance auditors also ask for field definitions: "criticality" must be defensible, not arbitrary.

### Step-by-step walkthrough

1. Select `PROD-WEB-01` and read IP Address `10.0.0.20`: anchor for firewall and DNS lookups.
2. Note Criticality `8/10. HIGH`, business tier, not yet CRITICAL band (9+).
3. Compare risk score against the **RISK** bar in the table; they must match; discrepancies indicate stale selection.
4. Read Alert Count: if zero, **STATUS** should be **CLEAN**, if non-zero without criticals, **AT-RISK**.
5. Expand KNOWN CVEs: `CVE-2023-44487` (CVSS 7.5, HTTP/2 Rapid Reset) and `CVE-2021-44228` (CVSS 10, Log4Shell); max CVSS 10 drives the red CVE column.
6. Review tags `public` and `internet`, explain why this asset appears in external attack paths.
7. Select `PROD-DC-01`: criticality `10/10; CRITICAL`, two CVEs with max 9.8: compare risk score formula contribution from criticality alone (60 points base).
8. Select an asset with alerts during simulation; verify **ALERTS** column `(N!)` critical suffix matches critAlerts in enrichment.
9. Check **BLOCKED** header stat against `isBlocked`; block the asset IP in SOAR and confirm counter increments.

### Common questions

#### Why does risk score show 100 for some assets but the bar is not full red?

The bar width is `${riskScore}%`, at exactly 100 it should fill completely. If visual rounding makes it appear short, check browser zoom. Colour thresholds: ≥ 70 red, ≥ 40 orange, else green. An asset at 100 is always red.

#### What does max CVSS in the CVE column mean when multiple CVEs exist?

The table shows `{count} (max: {maxCvss})`; e.g., `2 (max: 10)` for `PROD-WEB-01`. Sorting by **CVES** uses array length, not max CVSS. An asset with one CVSS-10 flaw sorts lower than an asset with three CVSS-5 flaws when sorting by count; use judgment or the detail panel for severity.

#### Are tags used for filtering?

Not in the current UI. Tags display only in the detail panel. Filters operate on criticality threshold, alert presence, and CVE presence. Tags are metadata for human interpretation and future feature hooks.

#### Where is the OS field in the table?

OS renders as a secondary line under the asset name in the **ASSET** column (`fontSize: 9`, muted colour `#3a5570`). It is easy to miss; open detail panel for explicit confirmation when OS version drives patch decisions.

### How an analyst uses this during active incident

The analyst treats field combinations as decision triggers. **COMPROMISED** + criticality 10 + CVE-2023-23397 on `PROD-DC-01` = immediate isolation discussion. **AT-RISK** + high alert count + tags `public` = check WAF and web logs. Risk score jump after simulation confirms enrichment is live, they record before/after scores in the case timeline. CVE cards supply CVE IDs for Intelligence → Vuln Intel cross-reference. Alert Count versus Overview total alerts clarifies whether one asset dominates the campaign.

### Edge cases and gotchas

CVE IDs in `cves[]` without `CVE_DB` entries still count in length but show `CVSS ?` in detail. `totalCvss` is computed but not displayed; do not infer it from UI. Alert count includes all severities; only criticals get the `(N!)` suffix. DestIp matching is implemented in enrichment but many demo alerts only populate `sourceIp`. Risk formula double-counts severity (both in status logic and score) by design for emphasis.
