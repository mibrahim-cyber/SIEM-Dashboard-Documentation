---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: Case fields
last_updated: 2026-05-23
---

# Case fields

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Detail header shows title, Created timestamp, priority badge. Control row: **STATUS** select, **ASSIGNEE** select, **PRIORITY** select. Notes section ANALYST NOTES (N) lists cards with author analyst, timestamp, text. No visible fields for description, tags UI, external ticket, attachments, or linked incidents, though `tags` exists in object.

### What is happening underneath

Case schema from `createCase`: `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, `tags[]`. Notes appended via `updateCase` with `{ text, ts: Date.now(), author: 'analyst' }`. `relatedAlerts` computed but not rendered in the UI; missed UI opportunity. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes, tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip; auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Complete case records reduce handover friction. Missing rendered related alerts means analysts must manually pivot to Alert Manager.

### Step-by-step walkthrough

1. Select case from list.
2. Set **STATUS** to in-progress when investigation starts.
3. Assign **ASSIGNEE** to named analyst.
4. Adjust **PRIORITY** if impact grows.
5. Add notes documenting evidence IDs and actions.
6. Search Alert Manager by IP from title for related alerts (manual link).

### Common questions

#### Where is description field?

Only title: use first note as description.

#### Can I attach PCAP files?

Not in UI. reference external evidence store in notes.

#### What are tags for?

Data model only, no tag editor shipped. Not implemented; note ticket ID in free text.

### Operational use during containment

Every major action gets a note; status and assignee kept current for shift lead visibility. Creation flows through **+ NEW** modal calling `createCase(null, title)`: there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username. Production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets, another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append; race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists. Cases are the investigation binder that survives browser restarts because `api.saveCase` persists JSON server-side. Until the UI renders `relatedAlerts` or accepts `alertId` in the create modal, paste alert identifiers and IPs into the first note deliberately. Status vocabulary should match your ITSM tool definitions in runbooks even though the software allows arbitrary transitions like open directly to closed.

### Edge cases and gotchas

Author always literal analyst: not session username. Priority badge uses CSS `badge-${priority}`. Selecting case toggles off if clicking same row again. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object. Paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP, tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
