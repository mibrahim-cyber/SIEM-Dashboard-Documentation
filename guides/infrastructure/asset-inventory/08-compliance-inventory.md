---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 08-compliance-inventory.md
title: "Asset inventory and compliance"
last_updated: 2026-05-23
---

# Asset inventory and compliance

**Sidebar path:** Infrastructure → Asset Inventory

## Asset inventory and compliance

### What you are looking at

For compliance reviewers, Asset Inventory provides a structured evidence surface: enumerated infrastructure (**TOTAL ASSETS**), vulnerability exposure (CRITICAL CVEs, per-asset CVE cards with CVSS and names), monitoring effectiveness (**AT RISK**, **STATUS** badges), and enforcement state (**BLOCKED**). The detail panel's tag pills (`critical`, `auth`, `data`, `public`) support scope discussions for frameworks requiring asset classification. PCI scoped systems, SOX financial dependencies, HIPAA data stores. The read-only table format suits auditor walkthroughs alongside Reporting → Reports exports. Compliance audits resemble building fire inspections: inspectors want a room list (inventory), sprinkler test dates (patch/CVE status), and alarm logs (alert correlation). HABIBI-SIEM supplies the room list and alarm correlation; patch dates are implied by CVE presence, not patch timestamps.

### What is happening underneath

Compliance-relevant data sources in this module: static `ASSETS` (scope boundary), `CVE_DB` (known weakness catalogue), live `alerts` (control effectiveness signal), `blockedIps` (enforcement action). Missing compliance fields: asset owner, last patch date, encryption status, data classification level, audit log of inventory changes. Risk score formula is SOC-weighted, not CVSS-only or compliance-scoring-model (CCSS) aligned. RBAC from the authentication layer gates write actions elsewhere but Asset Inventory is viewable to all authenticated roles including auditor. Export for evidence packs uses Monitor → Overview export or Reporting modules, not Asset Inventory-native export buttons.

> **Technical note:** Auditor role (`canExport: true`, `canWrite: false`) can view Asset Inventory for read-only compliance review without mutating alert or SOAR state.

### Why this matters

Regulators and frameworks (ISO 27001 A.8 asset management, PCI Req. 2.4 inventory, NIS2 asset identification) require demonstrable asset knowledge. Auditors ask: "How do you know what you protect?" and "Show critical vulnerabilities on in-scope systems." Without inventory-to-vulnerability mapping, organisations fail audits despite having a SIEM. This screen demonstrates the integration point between CMDB/vulnerability data and SOC operations, even in demo form.

### Step-by-step walkthrough

1. Sign in as Compliance Auditor role and open Asset Inventory, confirm read access without edit controls.
2. Record **TOTAL ASSETS** and list criticality-9+ systems for scope documentation.
3. Filter **CVES** and export screenshot evidence of CVE IDs, CVSS scores, and affected product names from detail panels.
4. Filter **CRITICAL** criticality assets and map to compliance scope (e.g., `PROD-DB-01` for data protection).
5. After simulated attack, capture **AT RISK** and **COMPROMISED** states as detective control evidence.
6. Note **BLOCKED** count after SOAR action; enforcement control evidence.
7. Cross-reference with Intelligence → Vuln Intel for deeper CVE narrative if available.
8. Identify gaps for auditor honesty: no ownership fields, static CVE data, no patch SLA timestamps: document as demo limitations.

### Common questions

#### Is this sufficient evidence for PCI DSS 11.2 vulnerability scanning?

It demonstrates correlation of known CVEs to scoped assets but lacks scan dates, authenticated vs external scan distinction, and quarterly rhythm proof. Pair with actual scanner exports; use HABIBI for SOC correlation storytelling in training environments.

#### Can auditors export this table directly?

No dedicated export button exists on Asset Inventory. Use browser screenshot, Reporting → Reports, or Overview JSON EXPORT for machine-readable alert evidence. CMDB export remains authoritative for inventory lists.

#### How do tags support compliance classification?

Tags like `data`, `auth`, `public` hint at control applicability. `public` assets imply internet exposure requiring WAF/monitoring controls. Tags are not a formal data classification label in this demo.

#### Does CLEAN status satisfy continuous monitoring requirements?

It indicates no current correlated alerts, not uninterrupted monitoring coverage. Compliance requires proof of log collection per asset, verify via Monitor → Pipeline Health and ingestion config, not STATUS alone.

### How an analyst uses this during active incident

During incidents with compliance reporting obligations (breach notification timelines), the analyst captures Asset Inventory screenshots showing which in-scope assets were **COMPROMISED**, associated CVEs that may have been exploited, and criticality ratings for impact assessment. They record **PROD-MAIL-01** (Exchange, CVE-2021-26855 ProxyLogon) differently from dev assets for regulatory materiality. Post-incident compliance packets combine this view with case manager timelines.

### Edge cases and gotchas

Static demo CVEs may not match installed versions; auditors must verify applicability. CRITICAL CVEs counts assets with max CVSS ≥ 9, not count of CVE records. Risk score is not a compliance risk register score. Decommissioned assets absent from registry may still hold regulated data on disk; lifecycle gaps break compliance. Simulated alerts (**SIM** badge on Overview) should be excluded from regulatory evidence; filter or clear before exports.
Framework crosswalk examples help compliance officers use this screen: ISO 27001 Annex A.8.1 requires inventory of information and associated assets, the **TOTAL ASSETS** counter and typed rows satisfy the "inventory exists" story in training labs. NIST CSF ID.AM-1 asks for physical devices and software platforms identified; **TYPE** and **OS** sub-lines address that literally. For GDPR Article 32 security of processing, **PROD-DB-01** tagged `data` demonstrates where personal data might live, though the demo lacks DPIA links. Evidence packaging should sequence screenshots: (1) full table with filters **ALL**, (2) **CRITICAL** criticality filter, (3) **CVES** filter with detail panel open on Log4Shell, (4) post-simulation **AT RISK** state, (5) Overview export JSON snippet showing alert-to-IP linkage. Include a written caveat that HABIBI uses static CVE intelligence; production programmes must show scanner integration dates. Auditor role login proves read-only segregation of duties: compliance staff can view inventory without SOAR block capability unless given tier2 write elsewhere.
