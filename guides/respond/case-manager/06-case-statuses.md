---
module: Case Manager
sidebar: Respond → Cases
section: Respond
subsection: Case statuses
last_updated: 2026-05-23
---

# Case statuses

**Part of:** Respond → Cases
**One-sentence focus:** Long-running investigation containers with persistent notes, ownership, and lifecycle status.

![Case Manager main view](../../../screenshots/guides/respond-case-manager.png)

### What you are looking at

Status dropdown options: **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED**, **CLOSED** (uppercase labels from value strings). List filter includes escalated but not closed. Colours: open/escalated critical red, in-progress high orange, resolved neon green, closed grey `#5a7080`.

### What is happening underneath

Status strings lowercase with hyphen for `in-progress`. No validation transitions (can jump open → closed). Pending External from enterprise ITSM not in enum. Respond → Case Manager (Case Manager screen) exists because alerts are volatile, incidents are correlated views with ephemeral scratchpad notes, and investigations that survive legal review need durable records. Cases persist through `api.saveCase` with fields `id`, `alertId`, `title`, `status`, `priority`, `assignee`, `notes[]`, `createdAt`, `updatedAt`, and `tags[]`. The UI exposes title, status, priority, assignee, and append-only notes; tags and related alert linking are partially implemented in data but not fully rendered. Treat the 320px list column as your investigation inbox: border colour encodes priority; status chips filter **OPEN**, **IN-PROGRESS**, **ESCALATED**, **RESOLVED** while **CLOSED** exists in the model but lacks a filter chip; auditors searching closed work must select **RESOLVED** or browse unfiltered.

### Why this matters

Consistent status vocabulary aligns SOC with ITSM and executive reporting. Missing Pending External may force misuse of escalated.

### Step-by-step walkthrough

1. **OPEN** on create.
2. **IN-PROGRESS** when first analyst touches evidence.
3. **ESCALATED** when Tier 2/3 or legal engaged.
4. **RESOLVED** when technical remediation complete.
5. **CLOSED** for administrative archive (optional distinction from resolved).

### Common questions

#### What's difference between resolved and closed?

Organisation-defined, software treats both as non-open for partial stats.

#### Is escalated filter visible in stats strip?

No; only OPEN, IN PROG, RESOLVED counts.

#### Can I reopen closed cases?

#### False positive closure?

Use resolved with note "FP: rule tuned" unless you add custom status.

### How an analyst uses this during an active incident

Shift handover updates status so next team knows in-progress vs waiting escalated. Creation flows through **+ NEW** modal calling `createCase(null, title)`. there is no alert picker despite `createCase(alertId, title)` supporting linkage. Default priority is high; assignees draw from a static roster (alice.chen, bob.martin, carol.white, dave.singh, unassigned). Notes append with `{ text, ts: Date.now(), author: 'analyst' }`; author is a literal string, not session username, production hardening should map authenticated identity. Each `updateCase` patch refreshes `updatedAt`, giving a coarse timeline for compliance even without a dedicated history tab. Single assignee dropdown forces teams to denote secondary contributors in note prefixes. Server saves occur on each update without websockets; another analyst's notes appear after refresh, not live. Concurrent note appends spread `selectedCase.notes` then append: race conditions possible if two tabs add simultaneously; operational workaround is verbal coordination on bridge. For evidence chain, never edit prior notes (UI prevents edits anyway); append corrections. Reference SOAR log timestamps, Alert Manager exports, and Live Feed pulls explicitly in note text until attachment support exists. Cases are the investigation binder that survives browser restarts because `api.saveCase` persists JSON server-side. Until the UI renders `relatedAlerts` or accepts `alertId` in the create modal, paste alert identifiers and IPs into the first note deliberately. Status vocabulary should match your ITSM tool definitions in runbooks even though the software allows arbitrary transitions like open directly to closed.

### Edge cases and gotchas

Filter hiding closed cases confuses auditors searching closed investigations. Uppercase display from `.toUpperCase()` on values with hyphens shows **IN-PROGRESS** correctly. Open a case within thirty minutes of any P1 bridge call. Use Incidents for tactical playbook execution; use Case Manager for chronology, evidence references, executive summaries, and closure language. The `relatedAlerts` memo matches `alertId` or shared `sourceIp`, but modal create does not set `sourceIp` on the case object. Paste IP and alert IDs into notes until UI linking ships. For false positives, still consider a short case or structured note: "FP, tuned rule XYZ" creates audit trail that Incidents **DISMISSED** override does not persist.
