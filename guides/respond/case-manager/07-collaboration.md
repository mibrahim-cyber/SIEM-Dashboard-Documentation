---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: Collaboration
last_updated: 2026-05-23
---

# Collaboration

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Single assignee dropdown; no multi-owner. Notes stack chronologically without threading or @mentions. Any writer can add notes and change status; no field-level lock.

### What is happening underneath

Last write wins on case patches. Real-time collaboration would need websockets; current model is optimistic save to API on each update. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes, tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip; auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Major incidents need parallel tasks (malware analysis vs comms). Single assignee is limiting: teams use notes to @name manually in text.

### Step-by-step walkthrough

1. Assign primary owner in **ASSIGNEE**.
2. Secondary analysts add notes prefixed with initials.
3. Shift change: new assignee selected; handover note required.
4. Escalation: status escalated plus note tagging Tier 3.

### Common questions

#### Can two assignees be set?

No. The assignee field is single-select; teams record secondary contributors in note prefixes or open a peer case.

#### Are notes real-time for other users?

Only after refresh, and only if another user has already saved to the server. The demo has no live sync, so coordinate verbally on the bridge for anything urgent.

### Analyst workflow under pressure

Bridge call scribe adds notes live; owner field tells who answers executive questions. Creation flows through **+ NEW** modal calling `createCase(null, title)`; there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username: production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets. Another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append, race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists. Cases are the investigation binder that survives browser restarts because `api.saveCase` persists JSON server-side. Until the UI renders `relatedAlerts` or accepts `alertId` in the create modal, paste alert identifiers and IPs into the first note deliberately. Status vocabulary should match your ITSM tool definitions in runbooks even though the software allows arbitrary transitions like open directly to closed.

### Edge cases and gotchas

Concurrent edits may overwrite if two analysts update different fields simultaneously; last patch wins entirely on case object in naive implementations; here each `updateCase` merges at field level for notes array spread. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object: paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP. tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
