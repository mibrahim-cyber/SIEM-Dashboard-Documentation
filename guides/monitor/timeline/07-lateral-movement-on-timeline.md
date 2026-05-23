---
module: Attack Timeline
sidebar: Monitor → Timeline
section: Monitor
subsection: Lateral movement detection on the timeline
last_updated: 2026-05-23
---

# Lateral movement detection on the timeline

**Part of:** Monitor → Attack Timeline
**One-sentence focus:** Pivoting appears as new IP lanes or escalating rule categories over time, analysts infer paths without drawn edges between hosts.

### What you are looking at

Lateral movement appears as sequential dots across **GROUP: IP** lanes if attacker pivots IPs, or escalating rule categories over time on one IP (privilege-escalation, command-exec after auth). Simulate campaign includes `privilege-escalation` and `data-exfil` steps for demo narrative. Lateral movement is a burglar entering one apartment, stealing a master key, and opening neighbouring units, each new room is a new host/IP in network terms.

### What is happening underneath

Detection rules for privilege escalation and suspicious internal connections fire alerts plotted like any other. Timeline does not draw edges between IPs, analyst infers lateral path by comparing lane timestamps manually. Network Map / Event Graph modules provide graph edges; Timeline provides chronology.

### Step-by-step walkthrough

1. Simulate campaign through privilege-escalation phase.
2. **GROUP: RULE**; note escalation lane appears after brute-force lane time-wise.
3. **GROUP: IP**: if multi-IP ingest available, look for dots appearing sequentially on different lanes same minute.
4. Click escalation dot; capture log details.
5. Cross-navigate Investigate → Network Map if enabled.
6. Document sequence for incident report.
7. Contain host tied to latest lane activity.

### Common questions

#### Does timeline draw arrows between hosts?

No, dots only. Use Event Graph for edges.

#### What rules signal lateral movement?

Check `privilege-escalation`, `command-exec`, internal port-scan rules in Rules Engine.

#### Can internal IPs appear?

Yes; internal ranges get lower threat scores but still plot.

#### How do I distinguish scan from lateral?

Rule category and log `eventType` in selected panel; context decision.

### Using this view during live response

Hunts for new IP lanes appearing after initial compromise lane within 1 HR window; classic pivot indicator. Combines with **TOP ATTACKERS** on Overview.

### Edge cases and gotchas

Single IP proxy masks lateral hosts behind one lane. Time window too narrow hides slow lateral (expand to **6 HR**).

> **Technical note:** Lateral movement detection accuracy depends on agent coverage, Timeline only visualizes existing alerts. Lateral movement on Timeline appears as sequential activity across **GROUP: IP** lanes (new host lanes appearing after initial compromise) or as escalating rule categories on a single IP lane (auth failures followed by privilege-escalation dots). There are no drawn edges between hosts; analysts infer pivot paths by comparing lane timestamps manually. Expand **WINDOW** to **6 HR** for slow pivot campaigns; the default **1 HR** may hide gaps longer than sixty minutes between stages. Combine Timeline IP lanes with Overview **TOP ATTACKERS** to prioritise containment on the host showing the latest activity.
