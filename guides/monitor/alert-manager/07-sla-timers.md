---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: SLA timers and compliance
last_updated: 2026-05-23
---

# SLA timers and compliance

**Part of:** Monitor → Alert Manager
**One-sentence focus:** v4 Alert Manager does not render SLA countdowns, compliance teams measure time-to-ack from exported timestamps and audit logs.

### What you are looking at

HABIBI-SIEM Alert Manager does not display SLA timers, time-to-acknowledge countdowns, or breach indicators in v4. Spec references ISO 27001 / SOC2 timing targets as industry context, operational tracking must be external or future enhancement. SLA timers are pizza delivery guarantees, if not delivered in 30 minutes, escalation triggers. SOC SLAs similarly bound time to first human action on critical alerts.

### What is happening underneath

No `slaDueAt` field on alerts in the dashboard. Proxy metrics: `timestamp` on alert vs current clock manually compared; `status === 'new'` duration untracked automatically. Export CSV enables offline SLA spreadsheet calculation. Audit API may timestamp status changes server-side; check `docs/03-backend/10-audit-logging.md` for mutation logs enabling retro SLA proof.

### Why this matters

Compliance frameworks ask for evidence of timely response; absence of UI timers does not remove obligation, shifts measurement burden to process/tools.

### Step-by-step walkthrough

1. Export CSV with ISO timestamps periodically.
2. Compute (ack_time - created_time) in spreadsheet for critical subset.
3. Define org SLA externally (e.g. critical 15m ack).
4. Flag breaches in case management manually.
5. Use Overview **UNREAD** count as queue depth SLA proxy.
6. Request engineering backlog item for timer UI if audit gap.
7. Document workaround in SOC runbook.

### Common questions

#### Will SLAs be added?

Not in current React components; product gap vs enterprise SIEM.

#### Does tier1 have slower SLA?

RBAC does not encode SLA, role-based assignment policy is organisational.

#### What ISO control needs this?

A.16.1.5 incident response timing evidence; process not tool-dependent.

#### Can SOAR enforce SLA?

SOAR log timestamps actions; not SLA clock on alert row.

### Analyst workflow under pressure

Manual watch on critical NEW rows oldest first; verbal escalation at 10m untouched critical. Post-incident SLA review from exported CSV.

### Edge cases and gotchas

Do not claim tool-enforced SLA in audits without verifying features. Clock skew affects manual SLA math, use UTC ISO fields.

> **Technical note:** Implementing SLA would require `firstAckAt` persisted on status transition in `updateStatus`. Implementing SLA timers in a future version would require persisting `firstAckAt` on status transition inside `updateStatus`. Today, audit API mutation logs may timestamp server-side changes; check backend audit documentation for retro SLA proof. ISO 27001 A.16.1.5 incident response timing evidence is process-dependent, not tool-dependent. Operational workaround: sort Alert Manager by **TIME** ascending on NEW + CRITICAL filter, verbally escalate any row older than ten minutes untouched. Post-incident, compute (ack_time − created_time) in spreadsheet from CSV export.
