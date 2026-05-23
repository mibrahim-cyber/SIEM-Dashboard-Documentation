---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: The difference between an alert and a case
last_updated: 2026-05-23
---

# The difference between an alert and a case

**Part of:** Monitor → Alert Manager
**One-sentence focus:** Alerts are the detection queue; cases in Respond → Case Manager are human-opened investigation binders that may reference alert UUIDs.

### What you are looking at

Alert Manager handles alerts only, no Create Case button. Cases live in Respond → Case Manager with fields title, status, priority, assignee, notes, linked alertId. Alerts are individual fire alarms; cases are the investigation binder that may reference multiple alarms, witness statements, and final disposition.

### What is happening underneath

`createCase(alertId, title)` in the SIEM context pipeline writes case to SQLite via `api.saveCase`. Case stores optional single `alertId` reference, not automatic on alert creation. Hierarchy: many logs → fewer alerts → fewer incidents (correlation) → optional case (human decision). Manager resolves alerts; cases track longitudinal investigation.

### Why this matters

Closing all alerts without case record loses narrative for legal/compliance. Escalation criteria should document when alert volume/complexity triggers case.

### Step-by-step walkthrough

1. Triage in Alert Manager, ACK critical set.
2. Decide escalation; multi-technique campaign warrants case.
3. Open Respond → Case Manager: create case referencing alert UUID.
4. Continue resolving alerts as subtasks complete.
5. Keep case open until post-incident review done.
6. Close case status separately from alert RES.
7. Export alerts JSON attached to case notes externally.

### Common questions

#### Can one case link many alerts?

Current `createCase` single alertId; link additional via notes manually.

#### Does resolving alerts close case?

#### Should every alert become a case?

No, noise alerts resolve without case; P1 campaigns need case.

#### Where is incident vs case?

Incidents computed ephemeral; cases persisted investigations.

### How an analyst uses this during an active incident

Creates case within 15m of confirmed breach, uses Manager for queue hygiene while case holds executive summary.

### Edge cases and gotchas

Tier1 may lack case write; check `canWrite`. Alert clear admin wipes alerts but cases may orphan references.

> **Technical note:** Future enhancement: multi-alert case linking table in SQLite normalised schema.

`createCase(alertId, title)` in the SIEM context pipeline writes to SQLite via `api.saveCase` with a single optional `alertId` reference. Escalation criteria: multi-technique campaign, critical severity cluster, or business asset impact. Hierarchy: many logs → fewer alerts → fewer computed incidents → optional human case. Closing all alerts without a case record loses longitudinal narrative for legal review. Admin **CLEAR ALL** wipes alerts but may orphan case `alertId` references; export before cleanup and update case notes with preserved UUIDs.
