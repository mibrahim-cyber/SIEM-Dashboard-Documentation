---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 06-asset-lifecycle.md
title: "Asset lifecycle"
last_updated: 2026-05-23
---

# Asset lifecycle

**Sidebar path:** Infrastructure → Asset Inventory

## Asset lifecycle discovered→Decommissioned

### What you are looking at

The HABIBI-SIEM Asset Inventory UI does not display formal lifecycle stages such as Discovered, In Service, Maintenance, or Decommissioned. Instead, each asset row shows a operational **STATUS** badge computed from alert correlation: **CLEAN** (no linked alerts), **AT-RISK** (linked alerts, none critical), or **COMPROMISED** (at least one critical linked alert). These statuses resemble incident-time health states, not CMDB lifecycle states. The twelve demo assets appear perpetually "in service", there is no decommission button, archive view, or greyed-out retired hosts. Enterprise asset lifecycle is like a vehicle title history: discovered (first registered), active (on the road), garage (maintenance), scrapped (decommissioned). HABIBI-SIEM shows whether the car currently has crash damage (alert status), not whether it has been sold for parts.

### What is happening underneath

Lifecycle in the demo is implicit: assets exist in `ASSETS` from application load until removed from platform configuration. Dynamic status recalculates per render:

```
status = alertCount === 0 ? 'clean'
: any critical alert ? 'compromised'
: 'at-risk'
```
There is no state machine persisting transitions, no timestamps for discovery or retirement, and no API endpoints for lifecycle updates. When alerts are cleared via **CLEAR ALL** (admin) or resolved individually, assets may return to **CLEAN** if no alerts remain linked. Decommissioning in a full platform would set `lifecycle: 'decommissioned'`, stop expectation of monitoring, and exclude from compliance scope, none of which is implemented here.

> **Technical note:** Alert clearing resets detection engine hit counts but does not remove asset records. Lifecycle and alert-status are orthogonal dimensions in mature CMDBs; HABIBI collapses to alert-status only.

### Why this matters

Conflating lifecycle with compromise status causes operational errors. A decommissioned server should not appear **AT-RISK** because stale logs reference its old IP, yet many SOCs forget to retire assets. Conversely, a **CLEAN** production asset is not "safe forever"; it means no current alert correlation. Teaching both concepts; even when the UI only shows one; prepares analysts for enterprise tools where lifecycle gates patch schedules and monitoring baselines.

### Step-by-step walkthrough

1. Open Asset Inventory with zero alerts; all assets show **CLEAN** (lifecycle-active, operationally quiet).
2. Run Simulate Campaign, watch assets transition **CLEAN → AT-RISK** or **COMPROMISED** as alerts arrive.
3. Identify which assets hit **COMPROMISED** first; typically those matching critical-severity rule hits on their IPs.
4. Acknowledge and resolve alerts on Overview: statuses may revert when alert arrays no longer link (depending on clear vs resolve behaviour).
5. Map enterprise lifecycle stages mentally: all twelve demo assets are "In Service" in CMDB terms regardless of **STATUS** badge colour.
6. Discuss decommission workflow: in production, retire IP `10.0.0.21` (`PROD-WEB-02`) by CMDB ticket. HABIBI would require removing from `ASSETS`.
7. Compare **AT-RISK** asset during attack with post-incident **CLEAN**, same lifecycle stage (in service), different operational status.
8. Document for compliance: lifecycle evidence comes from CMDB exports, not this screen alone.

### Common questions

#### Where is the decommissioned filter?

It does not exist in HABIBI-SIEM. Retired assets would be removed from `ASSETS` or hidden by a future `lifecycle` field filter. Compliance teams should not infer retirement from **CLEAN** status.

#### Does COMPROMISED mean the asset should be decommissioned?

No; it means critical-severity alerts correlate to that IP now. Response may be containment, patching, or rebuild; not automatic retirement. Lifecycle retirement is a business decision after forensics.

#### Can an asset go from COMPROMISED back to CLEAN without remediation?

Yes, if alerts are cleared or resolved and no linked alerts remain. This is a monitoring artefact, not proof of eradication. Attackers may still have persistence; **CLEAN** only reflects current SIEM alert state.

#### How would discovered assets appear in a full implementation?

Discovery tools would create records with `lifecycle: 'discovered'`, pending validation. Analysts promote to `in_service` after owner assignment and criticality rating. HABIBI skips straight to `in_service` equivalent for all twelve records.

### How an analyst uses this during active incident

The analyst uses **STATUS** as a real-time health indicator, not lifecycle stage. **COMPROMISED** on `PROD-DB-01` triggers database isolation procedures regardless of whether the server was provisioned yesterday or five years ago. Post-incident, they recommend CMDB lifecycle update if rebuild replaces the host; a process outside this UI. They warn stakeholders that returning to **CLEAN** is necessary but not sufficient for closure.

### Edge cases and gotchas

**STATUS** ignores CVE exposure, a **CLEAN** asset may carry CVSS-10 flaws. No maintenance mode; planned downtime does not change badge. Clearing all alerts admin-side instantly resets statuses, potentially masking ongoing attacks if ingestion stopped rather than threat ended. Lifecycle timestamps for compliance audits are unavailable in this module. Governance teams often maintain a parallel lifecycle in ServiceNow or Jira Assets: Discovered when a scan finds a host, In Review when ownership is assigned, In Service when monitoring agents deploy, Maintenance during change windows, and Decommissioned when the device is wiped and network ports disabled. HABIBI-SIEM compresses that enterprise workflow into a single operational health dimension because the demo prioritises SOC triage speed over CMDB ceremony. When you present this module to auditors, explicitly map **CLEAN** to "no current correlated detection" rather than "approved for production"; a decommissioned server incorrectly still pinging DHCP could remain **CLEAN** here if no rules fire, which is why mature programmes reconcile CMDB retirement tickets against SIEM silence alerts. Shift handovers should record lifecycle context separately: if `PROD-WEB-02` is scheduled for decommission Friday, analysts note that **AT-RISK** alerts before Friday imply production impact, while alerts after Friday imply ghost traffic or incomplete network teardown. The enrichment layer does not read calendar metadata; only alert arrays, so human process closes the lifecycle gap the UI omits.
