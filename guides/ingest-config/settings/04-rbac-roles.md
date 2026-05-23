---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: User roles and RBAC
last_updated: 2026-05-23
---

# User roles and RBAC

**Part of:** Ingest & Config → Settings
**One-sentence focus:** The five shipped roles and how Write, Admin, and Export flags gate UI sections.

### What you are looking at

The **ACCOUNT** card in Settings is the RBAC Rosetta Stone for the signed-in user. Your Role displays the friendly label from the `ROLES` map. Tier 1 Analyst, Tier 2 Analyst, Tier 3 Analyst, SOC Manager, or Compliance Auditor, drawn from `roles[currentRole].label`. Beneath it, a monospace line summarises three booleans: Write: yes/no · Admin: yes/no · Export: yes/no. These three flags predict behaviour across the entire dashboard, not only Settings: whether you can acknowledge alerts, save API keys, export CSV, or see **CLEAR ALL ALERTS**. The hint text Assigned by administrator, cannot be changed here reinforces that RBAC is provisioned, not self-service. Settings itself does not render a role picker or user-management grid; that would belong to a future admin module. Instead it reflects the effective permissions of the current session as computed at login.

### What is happening underneath

Client-side role definitions live in the SIEM context pipeline:

```javascript
export const ROLES = {
 tier1: { label: 'Tier 1 Analyst', level: 1, canWrite: false, canAdmin: false, canExport: true },
 tier2: { label: 'Tier 2 Analyst', level: 2, canWrite: true, canAdmin: false, canExport: true },
 tier3: { label: 'Tier 3 Analyst', level: 3, canWrite: true, canAdmin: true, canExport: true },
 manager: { label: 'SOC Manager', level: 4, canWrite: true, canAdmin: true, canExport: true },
 auditor: { label: 'Compliance Auditor', level: 1, canWrite: false, canAdmin: false, canExport: true },
};
```
Server-side server-side role permissions mirrors the same five roles with identical `canWrite`, `canAdmin`, `canExport` flags (without `level`). `requirePermission()` middleware enforces:

- write; alert mutations, watchlist, cases, log validation, SOAR entries
- admin; threat settings GET/PUT, threat tests, delete all alerts, audit log GET
- export, `api.logExport` audit trail for CSV/JSON/report downloads

Authentication context exposes `canWrite`, `canAdmin`, `canExport` from `user?.canWrite` etc., populated by `userPayload()` at login. `the SIEM context pipeline` re-exports the same three flags for convenience. Settings uses `canAdmin` to conditionally render threat intel and data management sections. Functions like `clearAlerts` double-check `if (!canAdmin) return` before calling `api.clearAlerts()`. Tier 1 and auditor share read-oriented posture: both lack write and admin, both retain export; auditors can download alert packages for compliance review without mutating SOC state. Tier 2 adds write for operational triage but stops short of admin. Tier 3 and manager are admin-equivalent in permission flags; `level` differs (3 vs 4) for display hierarchy only in the client map. Default seeded users (database layer): `manager` → manager role, `analyst1` → tier1, `analyst2` → tier2. No default tier3 or auditor account is seeded: create those manually when testing.

### Why this matters

Misunderstanding RBAC causes two failure modes: analysts assuming they "blocked" an attacker when write failed silently, and managers over-sharing admin credentials because Settings hides admin UI until login. Mapping each role to Settings-visible capabilities prevents audit findings like "Tier 1 operator cleared production alerts" when the UI and API both deny it. Export permission separation lets compliance pull evidence without write access.A common regulatory pattern. The three-flag model is coarse compared to enterprise IAM (no per-module grants), but it matches the middleware actually shipped. Documentation must reflect exact booleans, not hypothetical PAM integrations.

### Step-by-step walkthrough

1. Log in as `analyst1` (tier1); open Settings; confirm Write **no**, Admin **no**, Export **yes**.
2. Verify **THREAT INTELLIGENCE** and **DATA MANAGEMENT** sections are absent.
3. Log out; log in as `analyst2` (tier2); confirm Write **yes**, Admin **no**, Export **yes**.
4. Attempt **CLEAR ALL ALERTS**, section still hidden; keyboard shortcut C on Overview should no-op server-side.
5. Log in as `manager`; confirm Write **yes**, Admin **yes**, Export **yes** and both admin sections appear.
6. Create a DB user with role `tier3` or `auditor` and repeat visibility checks.
7. Cross-check Alert Manager: tier1 can view but not acknowledge if write-gated in components using `canWrite`.
8. Export alerts from Alert Manager as auditor; should succeed and call `api.logExport`.

### Common questions

#### What is the practical difference between tier3 and manager?

In permission flags, none: both have write, admin, and export. `level: 4` vs `level: 3` is informational for future UI sorting only.

#### Why can tier 1 export but not write?

Designed for read-only analysts who still need to pull CSV/JSON for tickets or management briefings without changing alert state.

#### Can an auditor configure threat API keys?

No. `requirePermission('admin')` blocks `/api/admin/settings/threat` even if someone manually crafted a request. Auditor lacks admin.

#### Where are roles assigned?

In the `users.role` column in SQLite at account creation time. Settings displays the result; it does not edit it.

#### Do RBAC checks happen on the client only?

No. Client gating improves UX; server middleware is authoritative. Bypass attempts return HTTP 403 with Insufficient permissions messages.

### What analysts do when the pager fires

Shift lead assigns workstations by role: Tier 1 on monitoring dashboards, Tier 2 on acknowledgment and cases, Tier 3/manager on watchlist and alert clearance. Before a manager executes **CLEAR ALL ALERTS** post-exercise, they open Settings to confirm Admin **yes** and verbally verify with the team, clearing is irreversible at DB level. Compliance auditor joins mid-incident read-only: Settings shows Export **yes** so they know CSV export is allowed, Write **no** so they will not attempt status changes that fail. Pen testers validate horizontal escalation by trying tier1 cookie against DELETE `/api/alerts`; expect 403.

### Edge cases and gotchas

Unknown role strings in DB fall back to tier1 via `roleMeta()`: a typo grants unintended export-only read. `level` field is ignored by server middleware. Components inconsistently gate on `canWrite` vs showing disabled buttons. Settings uses hide-for-admin pattern instead. Demo passwords in seed data are public; never use default accounts in production without rotation. Adding a sixth role requires role configuration on both dashboard and server of user rows.

> **Technical note:** Settings screen imports `ROLES` for labels but permissions come from the SIEM context pipeline's `canAdmin`, not re-computed from `ROLES[currentRole].canAdmin`; they should match if session is consistent.
