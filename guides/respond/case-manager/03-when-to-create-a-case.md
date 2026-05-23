---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: When to create a case
last_updated: 2026-05-23
---

# When to create a case

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Creation entry points: **+ NEW** in list header, **+ CREATE CASE** in empty detail pane, and modal **CREATE CASE** with fields Case Title, Priority dropdown (critical–low), Assignee dropdown (alice.chen, bob.martin, carol.white, dave.singh, unassigned). No "link alert" picker in modal; `createCase(null, title)` only.

### What is happening underneath

`canWrite` RBAC required. Default priority high on new cases. Assignee saved via immediate `updateCase` after create. Organisational criteria (materiality, regulatory trigger) are procedural; not enforced in code. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes, tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip; auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Case proliferation creates backlog; under-creation loses audit trail. Teams define thresholds: "any critical external compromise" or "any HR-relevant insider case."

### Step-by-step walkthrough

1. Evaluate alert severity and asset criticality (Asset Inventory).
2. If threshold met, open Case Manager immediately.
3. Title format example: "CRIT-2026-0523 Brute force 203.0.113.45".
4. Set priority critical for P1; assign owner.
5. Start notes with detection source and time.

### Common questions

#### Who can create cases?

Users with write permission (`canWrite`).

#### Must I link an alert?

Optional `alertId` parameter exists in API but UI always passes null: link manually in notes.

#### Can I create from incidents view?

Not directly. Copy IP/title and switch modules.

#### What about false positives?

Create case only if investigation needed; close as false positive with notes.

### How an analyst uses this during an active incident

Incident commander says "open a case" within first bridge call; assignee becomes single point of contact. Creation flows through **+ NEW** modal calling `createCase(null, title)`, there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username; production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets: another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append. Race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists. Cases are the investigation binder that survives browser restarts because `api.saveCase` persists JSON server-side. Until the UI renders `relatedAlerts` or accepts `alertId` in the create modal, paste alert identifiers and IPs into the first note deliberately. Status vocabulary should match your ITSM tool definitions in runbooks even though the software allows arbitrary transitions like open directly to closed.

### Edge cases and gotchas

Empty title blocks create silently (`if (newCase.title.trim())`). Default assignee unassigned in modal vs empty string in API object. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object, paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP; tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
