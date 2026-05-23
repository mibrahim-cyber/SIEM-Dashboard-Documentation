---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: The alert lifecycle
last_updated: 2026-05-23
---

# The alert lifecycle

**Part of:** Monitor → Alert Manager
**One-sentence focus:** Alert Manager implements new → acknowledged → resolved transitions with bulk actions, RBAC gates, and SQLite persistence.

![Alert Manager main view](../../../screenshots/guides/monitor-alert-manager.png)

### What you are looking at

Header strip: `>> ALERT MANAGER // FULL ALERT LIFECYCLE MANAGEMENT`. Record counter `{filtered}/{total} RECORDS`. Action buttons: [ EXPORT CSV ], [ EXPORT JSON ], [ ACK ALL NEW ], [ CLEAR ALL ]. Filter panel with search `> SEARCH IP / RULE / SEVERITY...`, status tabs **ALL / NEW / ACKNOWLEDGED / RESOLVED** with counts, severity chips. Table columns: checkbox, **TIME**, **SEVERITY**, **SOURCE IP**, RULE(S), **STATUS**, **ACTIONS** with **ACK** / **RES** buttons. Bulk bar appears when rows selected: `{N} SELECTED`, [ ACK ], [ RESOLVE ], [ CANCEL ]. Lifecycle here is a hospital patient chart status, admitted (new), seen by nurse (acknowledged), treated and discharged (resolved). HABIBI-SIEM implements three statuses in UI: `new`, `acknowledged`, `resolved`. There is no separate `investigating` or `false positive` enum, false positive is operational meaning applied to resolved alerts in notes outside system.

### What is happening underneath

Status transitions via `updateStatus(id, status)` in the SIEM context pipeline; requires `canWrite`. Persists to dashboard state and `api.updateAlert()` + `api.saveAlerts()` SQLite sync. Overview uses same functions on compact rows. Additional statuses exist in data model (`watchlisted` from SOAR auto-block) but Alert Manager table displays uppercase status text without special watchlisted workflow buttons. Resolved rows render `opacity-40`.

### Why this matters

Without lifecycle discipline, teams double-triage alerts or miss unowned new items. Acknowledged means "someone owns this"; resolved means "closed with outcome." Auditors trace response maturity through status histograms.

### Step-by-step walkthrough

1. Open Monitor → Alert Manager.
2. Click **NEW** tab: work oldest critical first (sort **SEVERITY** column).
3. Click **ACK** on owned row; status becomes ACKNOWLEDGED.
4. After investigation, click **RES**. RESOLVED fades row.
5. Select multiple checkboxes, bulk [ ACK ] or [ RESOLVE ].
6. Use [ ACK ALL NEW ] at shift start for obvious noise (with caution).
7. Admin [ CLEAR ALL ] only after export for lab reset.

### Common questions

#### What is the difference between ACK and RES?

ACK = triage ownership; RES = closed investigation. You may ACK without RES while waiting for vendor patch.

#### Can I reopen resolved alerts?

No UI reopen in v4; would require manual status patch via API/database (not exposed).

#### Is there a false positive button?

Not dedicated; resolve and document in external case notes.

#### Who can clear all alerts?

`clearAlerts` requires `canAdmin` (tier3/manager roles.

### Operational use during containment

Sort by severity desc, bulk ACK everything under investigation to silence duplicate toasts, keep NEW tab for fresh attacker activity. Export CSV mid-incident before mass resolve for record.

### Edge cases and gotchas

Bulk ACK iterates selected IDs sequentially, race if concurrent editors. Resolved still exported unless cleared. Watchlisted alerts may show nonstandard status strings from SOAR path.

> **Technical note:** Status stored lowercase internally, displayed `.toUpperCase()` in table. Alert Manager header reads `>> ALERT MANAGER // FULL ALERT LIFECYCLE MANAGEMENT` with a live `{filtered}/{total} RECORDS` counter. Status transitions call `updateStatus(id, status)` in the SIEM context pipeline, which requires `canWrite` (tier2+). `clearAlerts` requires `canAdmin` (tier3/manager). Tier1 and auditor roles can view and export but cannot mutate alert state; restricted actions no-op silently in the UI while the SQLite backend also enforces permissions on API routes. Resolved rows render at 40% opacity (`opacity-40` in Alert Manager screen); they remain in exports and counts until cleared. Watchlisted status from SOAR auto-block may appear as nonstandard status strings; treat these as enriched lifecycle states requiring SOAR console review.
