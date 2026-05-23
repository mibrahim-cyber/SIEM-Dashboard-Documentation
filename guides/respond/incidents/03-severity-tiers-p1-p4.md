---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Incident severity tiers P1–P4
last_updated: 2026-05-23
---

# Incident severity tiers P1–P4

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

Severity appears in three places on this screen: filter chips (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**), colour-coded text on each list card (critical red `#ff0040`, high orange `#ff6600`, medium amber `#ffaa00`, low blue `#00aaff`), and the **SEVERITY** field in the detail header. The UI does not label incidents P1–P4 explicitly; instead it inherits the highest severity among clustered alerts. The stats bar counts **ACTIVE** incidents regardless of severity, so a flood of medium incidents can inflate **TOTAL** without matching executive P1 definitions. For stakeholders, treat **CRITICAL** incidents as P1-equivalent: immediate war-room response. **HIGH** maps to P2, **MEDIUM** to P3, **LOW** to P4/informational, though the dashboard does not enforce SLA timers on this view.

### What is happening underneath

`highestSeverity()` in the correlation engine compares alert severities using order `{ critical: 0, high: 1, medium: 2, low: 3 }` and picks the numerically smallest (most severe). Incident severity is therefore not averaged; it reflects the worst single alert in the cluster. Simulate Campaign and rules engine assign severities per rule definition (brute-force often high, SQL injection critical, etc.). There is no separate incident priority field; severity is the sole escalatory signal in this module. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected, watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger; typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today: analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened. Document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Enterprise IR frameworks (NIST SP 800-61, SANS) define tiered response: P1 might require CISO notification within fifteen minutes; P4 might be next-business-day. Mapping rule severities to those tiers lets compliance officers trace dashboard colours to contractual obligations. Because this UI inherits alert severity, tuning false-positive-heavy rules directly mislabels incident urgency, operations and detection engineering must stay aligned.

### Step-by-step walkthrough

1. After opening Incidents, click **CRITICAL** filter to isolate P1-equivalent work.
2. Compare **ACTIVE** count with Alert Manager's critical queue; they should correlate but are not identical counts.
3. Open the highest alertCount incident (sort **ALERTS**) to find sustained attacks.
4. Read severity in the detail pane, if it seems low for the business impact, check whether individual alerts were under-tuned.
5. Document executive notification in **ANALYST NOTES** when severity is critical and status remains **ACTIVE** beyond your runbook threshold.
6. Clear filter to **ALL** before shift handover so incoming analysts see the full picture.

### Common questions

#### Does the dashboard send pages or emails when critical incidents appear?

Not from the Incidents module itself. Critical alerts trigger optional audio beeps on ingest (`beep()` in the SIEM context pipeline), but Incidents has no notification panel. Integrations would live in Settings or external SOAR.

#### What response time should we expect for each colour?

That is an organisational policy, not a hardcoded timer here. Industry guidance often cites fifteen minutes to acknowledge P1 and four hours to contain; this UI gives you the severity label and timestamps (**FIRST SEEN**, **LAST SEEN**) to measure your own performance.

#### Can one incident contain both critical and low alerts?

Yes. The incident displays critical because the engine takes the maximum severity. Lower-severity alerts in the same sixty-second IP window are folded in silently.

#### Why filter by severity if status already shows ACTIVE?

**ACTIVE** tells you the attack stream may still be ongoing; severity tells you how loudly to escalate. A low-severity active incident might wait; a critical active incident should not.

### What analysts do when the pager fires

The on-call analyst filters **CRITICAL**, sorts by **TIME**, and treats the top card as P1. They note **FIRST SEEN** for SLA start time and **LAST SEEN** to judge whether the attacker is still active (within ~60s ⇒ likely yes). If **ACTIVE** critical incidents exceed team capacity, they inform the incident commander and defer **MEDIUM** work: visible through the filter chips without leaving the module. Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

Dismissed incidents (`DISMISSED` status override) still count in **TOTAL** unless you track overrides separately). there is no dismissed counter in the stats bar. Severity filter hides incidents but does not change backend correlation. Demo data may produce many high brute-force incidents that are noisy but not business-critical; tune rules rather than ignoring the screen.
