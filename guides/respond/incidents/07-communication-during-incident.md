---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Communication during an incident
last_updated: 2026-05-23
---

# Communication during an incident

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

During a multi-analyst shift, the incident detail pane is the closest thing to a shared whiteboard: status buttons show consensus on phase, playbook checkmarks show task division ("you take steps 1–3, I take 4–6"), and **ANALYST NOTES** holds narrative. There is no real-time co-editing indicator, @mention, or chat thread, unlike enterprise tools (Slack, Teams) or Case Manager notes with author stamps.

### What is happening underneath

All collaboration state is local to each browser session. Two analysts viewing the same incident see the same correlated data from the SIEM context pipeline but different notes/steps unless they refresh after the other's edits, which still would not sync. Cases persisted via `api.saveCase` offer durable notes with `{ text, ts, author: 'analyst' }` structure, preferred for handover. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected; watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger: typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today. Analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened, document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Incident command breaks down when two teams act on different assumptions. A shared source of truth prevents duplicate blocks, conflicting containment (one team isolates a host another team needs for imaging), and gaps in executive briefing. This module's ephemerality is a gap teams must fill with Case Manager or external tickets.

### Step-by-step walkthrough

1. Primary analyst selects incident and begins notes with "Lead: [name], start time".
2. Secondary analyst opens same IP in Alert Manager for live alert stream.
3. For durable handover, create a case in Case Manager linking the same IP/title.
4. Copy critical notes from Incidents into case notes before shift end.
5. Use consistent status vocabulary (**CONTAINED** vs **RESOLVED**) in verbal stand-ups matching button labels.

### Common questions

#### Can two analysts see each other's notes in real time?

No. Notes are per-browser session state.

#### Is there an incident commander field?

Not in this UI. Use Case Manager assignee or external runbook.

#### How do executives get updates?

Export notes manually or use Reporting → Executive View KPIs, not incident-specific briefings from this pane.

#### Does status sync across users?

Correlated active/contained from engine syncs via shared alerts; statusOverride is local only.

### How an analyst uses this during an active incident

Team lead keeps Incidents open on the wallboard for **ACTIVE** count; analysts verbally coordinate playbook steps; scribe copies final notes into Case Manager hourly. Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

Refresh loses notes: save early and often externally. **TIMESTAMP** button appends `\n[time] ` only; it does not auto-save. Video wall showing Incidents does not show private notes typed on another workstation.
