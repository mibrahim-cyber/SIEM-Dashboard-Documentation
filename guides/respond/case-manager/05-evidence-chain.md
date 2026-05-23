---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: The evidence chain
last_updated: 2026-05-23
---

# The evidence chain

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Notes provide partial chain: who (analyst string), when (`toLocaleString()` on `ts`), what (`text`). No hash, source system, or tamper seal. SOAR log complements for automated actions. Alert Manager retains raw alert payloads.

### What is happening underneath

`api.saveCase` persists case JSON. Integrity depends on backend audit controls; not shown in React. For legal proceedings, organisations export notes + alerts + SOAR log + raw logs from Live Feed. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes; tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip, auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Courts ask whether evidence was altered. Timestamped notes with persistent storage beat Incidents' in-memory scratchpad.

### Step-by-step walkthrough

1. On evidence collection, add note: "Exported logs alert IDs X,Y from Live Feed at [time]."
2. Reference SOAR log entry IDs for blocks.
3. Avoid editing prior notes; append corrections instead (UI allows only add, not edit: good for custody).
4. On closure, final note summarises exhibits.

### Common questions

#### Can notes be deleted?

Not via UI. append-only in practice.

#### Is author authenticated?

Displayed as static analyst, should map to session user in production.

#### What about file attachments?

Out of scope; link to DLP/EV store.

#### Does case lock when closed?

No lock: status can revert from dropdown.

### What analysts do when the pager fires

Forensics lead dictates note format for chain of custody; case becomes exhibit index. Creation flows through **+ NEW** modal calling `createCase(null, title)`. there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username, production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets; another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append: race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists. Cases are the investigation binder that survives browser restarts because `api.saveCase` persists JSON server-side. Until the UI renders `relatedAlerts` or accepts `alertId` in the create modal, paste alert identifiers and IPs into the first note deliberately. Status vocabulary should match your ITSM tool definitions in runbooks even though the software allows arbitrary transitions like open directly to closed.

### Edge cases and gotchas

Static author undermines legal weight. No export button. Clock skew on client timestamps. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object. Paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP, tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
