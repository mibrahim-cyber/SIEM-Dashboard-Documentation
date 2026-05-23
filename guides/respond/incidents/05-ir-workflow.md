---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Incident response workflow
last_updated: 2026-05-23
---

# Incident response workflow

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

The Incidents module supports the middle phases of NIST-style response; triage through containment documentation; visually encoded as status buttons and playbook checklists. Detection happens upstream in Monitor and Alert Manager. Triage is the left-list filtering and selection. Containment aligns with playbook steps like "Block source IP at firewall" and status **CONTAINED**. Eradication and Recovery appear as later playbook items ("Patch vulnerable input field", "Reset credentials"). Post-Incident Review is partially represented by **ANALYST NOTES** and **RESOLVED** status but there is no dedicated lessons-learned form.

### What is happening underneath

Workflow state splits across systems: alerts detected by the detection engine's `processLogs()` routine, high/critical external IPs triggering `soarCheckIp` automatically, incidents materialised on the next React render via `useMemo(() => correlateAlerts(alerts))`, and analyst actions stored locally. Blocking happens in SOAR (`blockIp` → watchlist API), not inside Incidents screen, though playbook text tells analysts to block. Case creation is a separate `createCase()` path. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected; watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger: typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today. Analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened, document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Regulators and cyber insurers ask for documented phases. A UI that jumps straight from alert to "close" without containment steps trains bad habits. Playbooks encode institutional memory so junior analysts do not skip isolation before forensics.

### Step-by-step walkthrough

1. Detection: Confirm alerts exist (Overview KPIs or Alert Manager).
2. Triage: Open Incidents; filter severity; pick **ACTIVE** incident.
3. Analysis: Read rules/categories; add notes on hypothesis.
4. Containment: Execute playbook steps 1–3; set status **CONTAINED**; block IP in SOAR if applicable.
5. Eradication: Complete patch/credential steps in playbook.
6. Recovery: Monitor for recurrence; set **RESOLVED** when clean.
7. Review: Transfer notes to Case Manager or external ticket; feed tuning requests to Rules Engine.

### Common questions

#### Does the dashboard enforce an order for playbook steps?

No. Steps toggle in any order. The numbered list is advisory.

#### Can I skip containment and mark RESOLVED?

Yes; the UI allows it. Policy should forbid that; the software does not.

#### Where is post-incident review stored?

Only in **ANALYST NOTES** unless you export manually or create a case.

#### How does simulate campaign fit the workflow?

It injects realistic attack logs, producing alerts and incidents so you can practice the full workflow without production traffic.

### Analyst workflow under pressure

Hour zero: triage **ACTIVE** list. Hour one: containment steps checked, SOAR block applied, status **CONTAINED**. Hours two–four: eradication/recovery steps, coordination via notes. Day two: **RESOLVED**, case updated, rule tuning ticket filed. Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

Playbook for **DEFAULT** is generic: specialised attacks (ransomware, BEC) may need manual steps. Status **DISMISSED** is not the same as false-positive closure in Alert Manager. Concurrent analysts editing the same incident overwrite each other's local notes. No locking.
