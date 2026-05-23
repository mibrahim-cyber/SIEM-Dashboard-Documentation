---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Post-incident review
last_updated: 2026-05-23
---

# Post-incident review

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

Post-incident activity is implied rather than formalised: marking **RESOLVED**, completing all playbook steps (progress bar at 100%), and leaving notes like "root cause: weak password policy" or "tuning: raise brute-force threshold for service account." There is no Lessons Learned dropdown, no link to create a detection rule, and no export button on this screen.

### What is happening underneath

Feedback loops exit manually: analysts tune rules in Configure → Rules Engine, adjust correlation windows in the correlation engine, or extend playbooks in `PLAYBOOK` constant. SOAR effectiveness metrics appear indirectly in SOAR log length and MTTR estimates from Analytics, not wired from Incidents. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected; watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger, typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today; analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened: document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Organisations that never close the loop repeat the same incidents. Post-incident review converts pain into improved detections, updated playbooks, and training scenarios. Simulate Campaign can replay variants after tuning.

### Step-by-step walkthrough

1. Before **RESOLVED**, verify all playbook steps checked or explicitly waived in notes.
2. Document root cause, impact, and timeline in **ANALYST NOTES**.
3. Copy summary into Case Manager and close case status resolved.
4. If false positive, tune rule in Rules Engine, if true positive gap, author new rule or correlation.
5. Update SOAR playbook definitions if automated steps failed.
6. Optionally re-run Simulate Campaign to validate detections.

### Common questions

#### Where do lessons learned live permanently?

Case Manager notes (persisted) or external GRC tools, not Incidents alone.

#### Can I export the incident timeline?

No native export; screenshot or manual copy from notes and Alert Manager.

#### How do findings feed playbooks?

Developers edit `PLAYBOOK` or SOAR `PLAYBOOKS` arrays in platform configuration; there is no in-UI playbook editor.

#### Does RESOLVED stop new alerts from the same IP?

No. New alerts create new clusters/incidents unless source is watchlisted/blocked.

### How an analyst uses this during an active incident

After containment, the analyst schedules a blameless review, attaches findings to the case, and files engineering tickets; using Incidents notes as draft material before **RESOLVED**. Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

Marking **RESOLVED** without review loses accountability. Local notes lost on refresh destroy lessons learned if not copied. **DISMISSED** should not substitute for documented false-positive analysis.
