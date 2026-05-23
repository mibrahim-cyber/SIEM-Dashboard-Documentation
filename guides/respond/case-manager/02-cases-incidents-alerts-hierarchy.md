---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: Cases vs incidents vs alerts
last_updated: 2026-05-23
---

# Cases vs incidents vs alerts

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Case Manager uses a 320px left column for the case list and a flexible right workspace. Header **CASE MANAGER** includes **+ NEW** button. Status filter chips: **ALL**, **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** (note **CLOSED** exists in data model but not filter chip). Stats strip shows **OPEN**, **IN PROG**, **RESOLVED** counts. Each list row displays title, status (colour-coded), assignee, note count, created date, and left border colour by priority (critical red through low). Empty state: No cases; create one from an alert. Alerts are atomic detections in Alert Manager. Incidents in Respond → Incidents are auto-correlated alert clusters by IP/time. Cases here are manually created containers that survive refresh via `api.saveCase`.

### What is happening underneath

`createCase(alertId, title)` builds `{ id: uuid, alertId, title, status: 'open', priority: 'high', assignee: '', notes: [], createdAt, updatedAt, tags: [] }`. The modal passes `null` alertId for manual cases. `updateCase` merges patches and persists. `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but `sourceIp` is not set on create in modal flow, limiting auto-linking unless extended. Incidents are ephemeral correlation views; cases are SQLite-backed records. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes, tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip; auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Alert fatigue buries signal. Incidents help tactical response but evaporate notes on refresh. Cases are the investigation binder for legal, HR, and multi-week APT hunts: explaining why SOC platforms always separate "ticket" from "detection."

### Step-by-step walkthrough

1. From a critical alert, note alert ID and IP (Alert Manager).
2. Open Case Manager → **+ NEW**.
3. Enter title, priority, assignee; click **CREATE**.
4. Compare with Incidents view for same IP. incident is live cluster, case is your record.
5. Add notes as investigation proceeds.
6. Set status in-progress → resolved when done.

### Common questions

#### Is a case automatically created when incidents appear?

No. Analysts must click **+ NEW** or integrate via future automation.

#### Can one case link multiple incidents?

Not explicitly, use title/tags and notes to reference multiple IPs/incidents.

#### Which object do executives care about?

Cases and incident reports for material breaches; raw alert counts for operations.

#### Where do alerts live vs cases?

Alerts in alert store; cases reference optional single `alertId`.

### Analyst workflow under pressure

Open case within 30 minutes of P1 declaration; use Incidents for playbook; use Case Manager for chronology and handover. Creation flows through **+ NEW** modal calling `createCase(null, title)`; there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username: production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets. Another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append, race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists.

### Edge cases and gotchas

Manual create ignores alert context unless you paste into title. Incident notes do not sync to cases. Filter omits closed status though dropdown includes it. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object; paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP: tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
