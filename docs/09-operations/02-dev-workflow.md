﻿# Operator workflow

Day-to-day use of the published HABIBI-SIEM dashboard for SOC analysts and administrators. This page assumes the hosted documentation deployment, not a local developer tree.

## Access

Open the published dashboard from the documentation site landing page. Sign in with the role your instructor assigned: tier1 for read-only triage practice, tier2 for acknowledge and watchlist labs, tier3 or manager for rules and audit tasks, auditor for export-only review.

Start at **Monitor → Overview** for situational awareness before opening deep modules.

## Typical shift loop

| Phase | Actions |
|-------|---------|
| Start of shift | Check Overview KPIs, Pipeline Health throughput, and open critical alerts in Alert Manager |
| Triage | Acknowledge or resolve alerts; escalate correlated clusters to Incidents or Case Manager |
| Investigate | Pivot to Threat Hunt, Event Graph, or Timeline using source IP and rule names from alerts |
| Respond | Run SOAR enrichment, add IOCs to watchlist when tier allows, follow playbook steps in Incidents |
| Report | Export from Reports or review Executive View before stand-ups |
| Handover | Document open incidents in Case Manager notes; do not rely on browser-only state |

## Role-aware behaviour

Tier 1 analysts read alerts and may export reports but cannot mutate SOC state. Tier 2 can acknowledge, use watchlist, and create cases. Tier 3 and manager roles adjust rules, read audit logs, clear alerts, and configure threat API keys. Auditors read and export only.

See [RBAC design](../08-security/02-rbac-deep-dive.md) for the full permission map.

## Validation and security testing

Use the pentest write-ups with scripted HTTP against the running dashboard to verify RBAC and CSRF behaviour. Expect 403 when tier1 attempts watchlist or SOAR writes. Retest after instructor announces a hardening patch.

## Empty environment drills

If Overview is zero across the class, run Simulate Campaign once per row, then split into ingest groups using Log Ingestion sample cards. Pipeline Health should show validation success before debating broken detection.

## Common operator mistakes

Mixing tier accounts in one browser profile causes wrong 403 conclusions. Forgetting CSRF after long idle looks like RBAC failure. Clearing resolved alerts before screenshots ruins grading evidence.

## Related guides

- [Overview guide](../../guides/monitor/overview/INDEX.md)
- [Alert manager guide](../../guides/monitor/alert-manager/INDEX.md)
- [Troubleshooting](08-troubleshooting.md)
- [System overview](../02-architecture/00-system-overview.md)
