---
module: Alert Manager
sidebar: Monitor → Alert Manager
section: Monitor
subsection: Bulk actions and alert fatigue
last_updated: 2026-05-23
---

# Bulk actions and alert fatigue

**Part of:** Monitor → Alert Manager
**One-sentence focus:** Checkbox selection and ACK ALL NEW handle volume during storms, with policy guardrails because bulk ACK hides unreviewed criticals.

### What you are looking at

Header [ ACK ALL NEW ] affects all new alerts globally. Row checkboxes + bulk bar [ ACK ] / [ RESOLVE ] affect selection only. [ CLEAR ALL ] wipes all alerts (admin). Export buttons dump entire alert array unfiltered by selection. Bulk actions are like selecting multiple emails and marking read, handling volume that one-click-at-a-time cannot sustain during a phishing wave.

### What is happening underneath

`selected` state as `Set` of alert IDs. `toggleAll` selects all filtered rows, not entire database. Bulk ACK calls `acknowledgeAlert` per id then clears selection. `acknowledgeAll` maps all `status === 'new'` without selection. Permissions: ACK/resolve need write; clear needs admin.

### Why this matters

Alert fatigue during DDoS or scan storms, without bulk, queue grows faster than humans click. Risk: bulk ACK without review hides un triaged criticals; operational policy must gate usage.

### Step-by-step walkthrough

1. Filter **NEW** + severity **HIGH**.
2. Shift-click range via individual checkboxes (manual multi-select).
3. Confirm bulk bar count matches selection.
4. Click [ ACK ]: selection clears, statuses update.
5. Alternatively header [ ACK ALL NEW ] without selection; confirm dialog absent (immediate action).
6. Export before [ CLEAR ALL ].
7. [ CANCEL ] clears selection without status change.

### Common questions

#### Does ACK ALL NEW respect filters?

No, global all new alerts in system; dangerous during partial triage.

#### Can I bulk resolve without ACK?

Yes. [ RESOLVE ] works on any non-resolved selected.

#### Is there undo?

No; revert would need manual status API change unavailable in UI.

#### Bulk export selected only?

Not implemented, export always full alert set.

### Analyst workflow under pressure

Bulk ACK low-confidence medium scans after spot-check, never bulk ACK criticals. Selection-based resolve after mass false positive from known scanner IP after block.

### Edge cases and gotchas

Select all only selects filtered rows; hidden new alerts remain. Tier1 cannot bulk mutate; buttons no-op silently.

> **Technical note:** Checkbox `accent-matrix` styled; native input, no indeterminate state for partial page select across pagination (no pagination).

`toggleAll` selects all filtered rows, not the entire alert database, hidden new alerts outside current filters remain unselected. Header [ ACK ALL NEW ] ignores filters and acknowledges every `status === 'new'` alert globally; use only at shift start with manager approval. Bulk [ RESOLVE ] works on any non-resolved selection without requiring prior ACK. Export buttons dump the entire alert array regardless of checkbox selection; there is no "export selected only" in v4. Mid-storm workflow: filter HIGH severity noise, bulk ACK after spot-check, keep NEW tab open for fresh criticals.
