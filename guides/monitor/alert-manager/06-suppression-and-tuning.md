---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: Alert suppression and tuning
last_updated: 2026-05-23
---

# Alert suppression and tuning

**Part of:** Monitor → Alert Manager
**One-sentence focus:** Manager shows tuning outcomes; suppression itself happens in Rules Engine, dedupe toggle, and rule pause, not inline on each row.

### What you are looking at

Alert Manager lacks explicit suppression UI, tuning happens in Configure → Rules Engine (toggle rules, thresholds) and Overview [ DEDUPE: ON/OFF ], [ RULES: PAUSE ALL ]. Manager shows outcome of tuning as reduced incoming rows. Suppression is turning down a smoke detector sensitivity after false alarms from cooking, not removing the detector, adjusting when it screams.

### What is happening underneath

Rule tuning mutates `detectionRules[].enabled` and check logic; admin only. Dedupe suppresses duplicate alert records within 30s same IP+rule. Pause all rules stops new detections but existing alerts remain in Manager until cleared. No per-alert snooze or suppress ticket in SQLite schema v4.

### Why this matters

Feedback loop: false positives erode trust → analysts ignore Manager → real threats missed. Tuning must follow measured false positive rate from resolved alerts.

### Step-by-step walkthrough

1. Identify noisy rule name repeating in RULE(S) column.
2. Navigate Configure → Rules Engine: disable or adjust rule (admin).
3. Enable Overview dedupe during ops spikes.
4. Resolve false positive batch in Manager with documented reason externally.
5. Re-enable rule after exclusion list updated.
6. Monitor Manager NEW tab rate decrease.
7. Schedule retro review of paused rules.

### Common questions

#### Can I suppress one IP?

Use IOC watchlist enforcement modes; not suppress, escalates/block path. True suppression not in Manager.

#### Who can pause rules?

`canAdmin`, tier3/manager on Overview toggle.

#### Does resolving stop repeats?

New log events re-fire alerts if rule still matches; resolve is not suppression.

#### How to tune thresholds?

Edit rule source in the detection rules catalog or the Rules Engine UI; not Manager inline.

### Using this view during live response

Temporary dedupe on during campaign; coordinate with engineer disabling broken rule flooding Manager. Document tuning requests with example alert IDs exported JSON.

### Edge cases and gotchas

Pause all rules does not delete queue. Manager still full until cleared. Simulated alerts bypass some tuning realism.

> **Technical note:** Correlation engine separate from suppression, incidents still form from existing alerts. Feedback loop: identify noisy rule in RULE(S) column → Configure → Rules Engine disable or threshold adjust (admin) → resolve false-positive batch in Manager with external documentation → monitor NEW tab rate decrease. Overview [ RULES: PAUSE ALL ] stops new detections but existing Manager rows remain until cleared; do not interpret an empty NEW tab during pause as "environment clean."

Resolving an alert does not suppress future firings; identical log patterns re-create alerts if the rule remains enabled. True suppression requires rule tuning, dedupe, or ingest exclusion at the source.
