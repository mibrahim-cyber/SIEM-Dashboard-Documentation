---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: The incident record
last_updated: 2026-05-23
---

# The incident record

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

Selecting an incident reveals a structured record. **INC-XXXXXXXX** is a display ID derived from `selectedInc.id.slice(0, 8)`; not necessarily the full internal `inc-{alertUuid}` string. Status buttons (**ACTIVE**, **CONTAINED**, **RESOLVED**, **DISMISSED**) sit top-right. The metadata grid shows **SOURCE IP**, colour-coded **SEVERITY**, numeric **ALERT COUNT**, and locale-formatted **FIRST SEEN** / **LAST SEEN** times (time-only, not full date in the grid). The playbook section header reads // PLAYBOOK: {TYPE} where type is **BRUTE FORCE**, **SQL INJECTION**, **XSS**, or **DEFAULT**. Completion reads **N/M COMPLETE** with a horizontal progress bar. The right column lists // ATTACK CATEGORIES as bordered tags and // TRIGGERED RULES as bullet lines prefixed with em dash. **ANALYST NOTES** is a multi-line text area with placeholder "Enter investigation notes..."

There is no assignee dropdown, linked case ID, or attachment upload in this component; those live in Case Manager or would require backend extensions.

### What is happening underneath

Incident objects from correlation contain: `id`, `sourceIp`, `alertIds[]`, `alertCount`, `severity`, `categories[]` (from `matchedRules[].category`), `ruleNames[]`, `firstSeen`, `lastSeen`, `status` (active | contained). The UI merges `statusOverride[selected]` when rendering. Playbook type comes from `detectPlaybookType()` scanning categories for substrings "brute", "sql", "xss". Steps come from the static `PLAYBOOK` object in the component, six steps per attack type. Notes and steps are keyed by incident id in React local screen state objects; they are not persisted to SQLite via `api.saveCase` or similar. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected; watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger: typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today. Analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened, document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Incident records are the shared narrative during response. Missing fields (assignee, evidence links) mean teams must complement this view with Case Manager for long-running investigations. Understanding which fields are authoritative (correlation-derived) vs ephemeral (notes) prevents false confidence during audits; you cannot reconstruct notes after refresh today.

### Step-by-step walkthrough

1. Select an incident and photograph or export key fields for your ticket system if required by policy.
2. Copy **SOURCE IP** into SOAR Console → Manual Lookup for enrichment.
3. Read every **TRIGGERED RULES** line; cross-check in Alert Manager using IP search.
4. Map **ATTACK CATEGORIES** to playbook type and verify the suggested steps fit your environment.
5. Document findings in **ANALYST NOTES** before changing status to **RESOLVED**.
6. If the record lacks needed metadata (asset name, user account), pivot to Infrastructure → Asset Inventory using the IP.

### Common questions

#### Where is the incident title field?

There is none in this module. Incidents are identified by IP and truncated ID. Human-readable titles belong in Case Manager when you create a case.

#### Can I see the individual alert IDs in this view?

Not in the UI. `alertIds` exists in data but is not rendered. Use Alert Manager filtered by sourceIp and time window.

#### Who is assigned to this incident?

Assignee management lives in Case Manager, which provides assignee dropdowns (alice.chen, bob.martin, etc.). The Incidents view focuses on triage and playbook execution.

#### Do notes save to the database?

No. Notes are in-memory only in the current React implementation.

### What analysts do when the pager fires

The analyst treats the detail pane as a running log: categories confirm hypothesis, rules cite detection logic for leadership briefings, notes capture commands executed. Before declaring **RESOLVED**, they ensure notes mention verification steps (e.g., "no new alerts from IP in 30 minutes"). Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

**FIRST SEEN** / **LAST SEEN** use `toLocaleTimeString()` without date: cross-midnight incidents look ambiguous. **DISMISSED** is UI-only and may not match compliance definitions of "closed." Playbook steps are generic; production SOCs replace them with runbooks stored in Confluence or ServiceNow.
