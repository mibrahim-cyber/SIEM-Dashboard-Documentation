---
module: Incident Response
sidebar: Respond → Incidents
section: Respond
subsection: Containment actions
last_updated: 2026-05-23
---

# Containment actions

**Part of:** Respond → Incidents
**One-sentence focus:** Group related alerts into concrete incidents with playbooks, status tracking, and analyst notes.

![Incident Response main view](../../../screenshots/guides/respond-incidents.png)

### What you are looking at

Incident Response itself does not expose **BLOCK IP** buttons. Containment is described in playbook text ("Block source IP at firewall", "Isolate affected web server from DB") while executable blocking lives in Respond → SOAR Console, Intelligence → IOC Watchlist, and automatic watchlisting when AbuseIPDB score exceeds **75** (`SOAR_BLOCK_THRESHOLD`). The SOAR sidebar footer in SOAR Console clarifies watchlist only, not firewall enforced. From Incidents, analysts copy **SOURCE IP** and pivot to those modules.

### What is happening underneath

the block-IP action in the SIEM context pipeline calls `api.addWatchlist(ip, reason, score)`, updates `blockedIps` Set, and pushes a SOAR log entry with action WATCHLIST_ADD, `enforcement: 'watchlist_only'`. Auto-block triggers when `soarCheckIp` returns `abuseConfidenceScore > SOAR_THRESHOLD` (75) and `isPublic`, or CISA-listed. Alerts from blocked IPs can move to status watchlisted. Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI; containment is manual cross-navigation today. The Respond → Incidents view in Incidents screen is deliberately split into a triage queue and a detail workspace because SOC psychology research consistently shows that mixing list management with deep analysis in one scrolling canvas increases mis-clicks during high-stress events. When you filter by **CRITICAL** or sort by **ALERTS**, you are manipulating filtered and sorted list over the `incidents` array that `the SIEM context pipeline` derives from incident correlation in the correlation engine. That derivation runs on every alert mutation, which means incident counts can change while you have a card selected, watch the detail header if the underlying cluster grows because new alerts arrived from the same `sourceIp` within the sixty-second `IP_WINDOW_MS`. For executives, explain incidents as "attack folders" and alerts as "individual alarms inside the folder"; for engineers, cite the exact clustering key (`sourceIp` + temporal proximity) and note that category-based cross-IP correlation remains commented out in source.

Shift handover should never rely on Incidents notes alone. The Incidents screen stores `notes` and playbook `steps` in component-local local screen state keyed by incident id; refreshing the browser or opening a second workstation does not retrieve a colleague's narrative. Pair this module with Case Manager the moment materiality thresholds trigger; typically any sustained **ACTIVE** **CRITICAL** incident, any incident touching crown-jewel assets in Asset Inventory, or any incident requiring legal/comms coordination. Copy **SOURCE IP**, **TRIGGERED RULES**, and playbook completion percentage into the case title or first note so downstream readers can reconstruct context without re-running correlation logic mentally.

Incidents screen imports `acknowledgeAlert` and `resolveAlert` from context but does not wire them in the UI today: analysts must reconcile Alert Manager lifecycle manually. Playbook progress bars in the list view use default playbook length, not category-specific length, until the incident is opened. Document this in analyst onboarding to prevent false confidence. Auto contained status from correlation after sixty seconds of quiet is not human closure; train teams to distinguish engine quiet from verified remediation. When extending the platform, persist `notes`/`steps` through the same API patterns as `updateCase`, and consider rendering `alertIds` in the detail pane for forensic traceability.

### Why this matters

Executives often assume "block in SIEM" means firewall drop. Here it means internal watchlist correlation and analyst visibility, a critical distinction for risk acceptance. Misunderstanding leads to false confidence that attack traffic stopped when only UI flagging occurred.

### Step-by-step walkthrough

1. From incident detail, copy **SOURCE IP**.
2. Open SOAR Console → Active Threats or Manual Lookup.
3. Click **LOOKUP** to run AbuseIPDB via server proxy; review confidence bar.
4. Click **BLOCK IP** or **EXECUTE CONTAINMENT** if score exceeds threshold.
5. Confirm **BLOCKED** badge and SOAR log entry WATCHLIST_ADD.
6. Optionally add the IP to IOC Watchlist with TLP and threat description.
7. Return to Incidents; mark playbook block step complete; set **CONTAINED**.

### Common questions

#### Does blocking here stop traffic?

Not automatically. Enforcement is watchlist-only unless you integrate external firewalls using the watchlist API.

#### Will blocking affect internal IPs?

Analysts can manually block any IP, but auto-SOAR skips RFC1918 on ingest.

#### Where is the audit trail for blocks?

SOAR Console → SOAR Audit Log table columns **TIME**, **ACTION**, **TARGET**, **SCORE**, **DETAILS**.

#### Can I undo a block?

Use watchlist removal via API/`unblockIp`, not exposed prominently in Incidents UI.

### What analysts do when the pager fires

Containment within minutes: lookup IP, block if intel supports it, document in incident notes, verify alert volume drops. If score is below threshold, escalate for manual firewall change while using watchlist as interim visibility. Run three drills weekly in lab: (1) Simulate Campaign → filter **CRITICAL** → complete full playbook in `PLAYBOOK` constant for detected category via `detectPlaybookType()` → status **CONTAINED** → SOAR block → status **RESOLVED**; (2) deliberate refresh mid-investigation to feel notes loss and reinforce Case Manager habit; (3) two-browser test where analysts compare `statusOverride` divergence while shared engine status still reflects alert recency. Time each drill; mature SOCs often target under eight minutes from campaign start to first documented containment note plus SOAR log entry.

### Edge cases and gotchas

Mock AbuseIPDB in demo may always return high scores for known bad demo IPs: test carefully before training executives. Blocking without lookup can watchlist benign IPs (CDN, partner VPN). `acknowledgeAlert`/`resolveAlert` unused in Incidents. Resolve alerts separately).
