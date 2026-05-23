---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Live feed during the first 5 minutes of an incident
last_updated: 2026-05-23
---

# Live feed during the first 5 minutes of an incident

**Part of:** Monitor → Live Feed
**One-sentence focus:** The first five minutes after a critical alert are when analysts filter by IP, pause the stream, and capture evidence before buffer rotation.

### What you are looking at

The same Live Feed UI described above, toolbar, stream/table, detail panel, becomes the primary temporal lens immediately after an Overview alert or critical toast. Analysts typically split screen: Overview left, Live Feed right, or dual monitors. The first five minutes after a breach alarm are like the golden hour in emergency medicine, actions taken immediately disproportionately affect outcome. Live Feed is the triage nurse's initial vitals check before the surgeon arrives.

### What is happening underneath

Workflow loop: alert on Overview → copy `sourceIp` → filter Live Feed → pause within 1–2 minutes → inspect event type sequence → cross-open AlertDetailModal for rule names → optional SOAR lookup. Data path: shared `the SIEM context pipeline` means alert's embedded `log` object should match a row in buffer if still retained; old alerts after buffer rollover may lack matching live row; analyst relies on modal log section.

### Why this matters

Mean time to detect means nothing without mean time to understand. Five-minute discipline prevents premature IP blocks on wrong host, missed parallel attackers, and lost evidence before buffer wrap.

### Step-by-step walkthrough

1. Minute 0–1: Open Live Feed; confirm LIVE status; filter alert IP.
2. Minute 1–2: Identify first event timestamp for attacker in detail panel ISO time.
3. Minute 2–3: Event pill filter for dominant type; note precursors (scan before exploit).
4. Minute 3–4: Pause; capture screenshots; copy unique fields (user agents, URLs).
5. Minute 4–5: Decide escalate/block/hunt; switch to Timeline or Alert Manager for broader context.

### Common questions

#### What if the IP filter shows nothing?

Buffer may have rotated; check alert modal log JSON. Re-ingest if needed for demo. Attacker may spoof IP appearing only in alerts from aggregated rule.

#### Should I block the IP immediately?

Use Live Feed to confirm malicious pattern density first; then IOC Watchlist via SOAR path. Avoid blocking shared NAT based on one line.

#### How do I involve tier2?

Export detail fields, pause screenshot, and Overview alert ID; tier2 continues continues in Threat Hunt with hypothesis.

#### Is five minutes arbitrary?

Aligns with common SOC playbooks for initial containment decisions before formal incident declaration.

### How an analyst uses this during an active incident

This section is the playbook itself, filter, pause, sequence, document, escalate. Experienced analysts pre-enable pause hotkey muscle memory and disable auto-scroll before sharing screen.

### Edge cases and gotchas

Concurrent analysts filtering different IPs see different subsets from same buffer; coordinate verbally. Simulated traffic mixed with real; watch `_simulated` in detail. Clock skew between log timestamp and alert timestamp if validation adjusted time.

> **Technical note:** Link alert→log via shared `alert.log` reference in modal when buffer row gone; do not assume Live Feed always retains birth record. Experienced analysts pre-position Live Feed on a secondary monitor before shifts start, with auto-scroll enabled and pause muscle memory ready. When Overview fires a critical toast, the workflow is: copy `sourceIp` from toast text, switch to Live Feed, paste into filter, confirm event-type sequence (scan before auth before exfil), pause, screenshot, copy unique fields from **LOG DETAIL**, then escalate with alert UUID and ISO timestamp from the detail panel. If the buffer has rotated past the birth event, `AlertDetailModal` on Overview still embeds the original `log` object, do not assume Live Feed always retains the first line of an attack. Cross-reference modal log JSON with filtered feed rows when both exist.
