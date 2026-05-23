---
module: Correlation Builder
sidebar: Configure → Correlation Builder
page: 03-correlation-builder-ui.md
title: "The correlation builder UI"
last_updated: 2026-05-23
---

# The correlation builder UI

**Sidebar path:** Configure → Correlation Builder

## Correlation builder UI elements

### What you are looking at

Correlation Builder screen uses a 260px left sidebar and flexible main panel. Sidebar elements: **CORRELATION RULES** title, **BUILDER** / **MATRIX** tab buttons, **+** create button, scrollable rule list entries showing rule name, enabled dot (green/grey), subline `{stride} · {n} cond · {hits} hits`, left severity colour border (3px). Main Builder view when rule selected: editable name input, Enabled checkbox, **DELETE** button, 4-column meta grid (Severity, **STRIDE**, Logic, Threshold), TIME WINDOW (seconds) number input, **DESCRIPTION** textarea, **CONDITIONS** section with **+ ADD**, per-condition row (logic label, field select, operator select, value input, remove **Remove**), **TEST AGAINST LIVE LOGS** button with `{alerts.length} events in memory` caption, test results panel. Empty state: gear icon, "Select a rule or create a new one", **+ NEW RULE**. Matrix view: **STRIDE RULE MATRIX** 3-column grid of STRIDE categories with mapped rule names. The Builder UI resembles a synthesiser patch bay: left channel list (rules), cable jacks (conditions), knobs (threshold, window), and a test speaker (live log test), you design the sound before pushing it to the main stage (detection engine).

### What is happening underneath

State hooks: `rules` array, `selected` rule id, `testResult`, `testRunning`, `tab`. `updateRule`, `updateCondition`, `addCondition`, `removeCondition` mutate via `useCallback`. `createRule()` appends `newRule()` template with UUID, default condition `event.outcome equals failure`. `deleteRule` filters array. Condition fields from `CONDITION_FIELDS` constant; operators from `CONDITION_OPS`; logic `AND`/`OR`. `matrixData` groups `rules.filter(r => r.stride === stride)` for six STRIDE options. `sevColor()` maps severity to hex colours for list borders. Styling uses inline styles and shared CSS classes (`btn`, `input`, `card`).

> **Technical note:** Initial rules clone `detectionRules.map(r => ({...r, id: r.id ?? crypto.randomUUID()}))`, engine rules may lack `conditions` until manually added in UI session.

### Why this matters

Analysts lost in correlation authoring need UI map, which control affects matching vs metadata only. Misidentifying Threshold vs **TEST** button wastes tuning cycles. Matrix tab supports ATT&CK/STRIDE coverage audits during purple-team planning.

### Step-by-step walkthrough

1. Click **BUILDER** tab; confirm active (primary button styling).
2. Click **+** in sidebar: new `New Rule` appears, auto-selected.
3. Edit name field inline; e.g., `Test Correlation Rule`.
4. Set Severity select to `critical`, **STRIDE** to `Tampering`, Logic to `AND`.
5. Set Threshold to `1`, **TIME WINDOW** to `60`.
6. Click **+ ADD** under conditions, second row appears with leading **AND** label.
7. Configure first condition: `event.outcome` `equals` `failure`.
8. Toggle Enabled checkbox; list dot turns green.
9. Click **MATRIX** tab: locate rule under STRIDE column; click name to jump back to Builder.

### Common questions

#### What does the green dot on the rule list mean?

`enabled: true`; visual only in Builder context, not engine runtime.

#### Why do some imported rules show 0 conditions?

`detectionRules` objects use detection logic functions without `conditions[]`, opening in Builder may show empty condition list until analyst adds rows.

#### Can I resize the sidebar?

Fixed 260px; not user-adjustable.

#### What happens on DELETE?

Removes rule from local `rules` state, if selected, clears selection and test results. Does not delete from detection rules catalog source.

### How an analyst uses this during active incident

Not primary incident UI; analyst uses Builder post-incident or during hunt preparation to draft correlation for observed TTP. They use **MATRIX** tab in planning meetings to show STRIDE gaps (empty Spoofing column) requesting new rule authorship.

### Edge cases and gotchas

Tab switch preserves rules but clears test result on reselect. Matrix 3-column grid wraps six STRIDE categories; two rows visually. Long rule names truncate in sidebar (`maxWidth:160`). DELETE is immediate without confirm dialog, misclick data loss. Keyboard and accessibility notes: condition remove buttons use X glyph; Enabled checkbox is native. Field dropdown includes fourteen options spanning ECS-like dotted paths and flat legacy names reflecting ingestion heterogeneity; authors must know which field populated for their log source. Operator regex accepts JavaScript regex strings; invalid patterns fail silently to non-match in test. Matrix tab grid uses repeat(3,1fr); six STRIDE categories wrap two rows visually. Empty matrix cells display No rules mapped, coverage gap visual for purple team planning. Clicking matrix rule name sets selected id and switches tab to builder; navigation shortcut for STRIDE review meetings without scrolling long sidebar list. Sidebar selection highlight uses rgba cyan background; selected rule persists across tab switches between Builder and Matrix until another rule clicked. Delete button danger styling without confirmation modal; train users to duplicate rule logic externally before destructive edits during workshops. Threshold number input min one prevents zero-threshold logical nonsense but does not validate threshold less than condition count semantics, classroom discussion topic. Description textarea rows two expandable vertically; encourage verbose operator notes for handoff to engineering implementing production check(). Workshop tip: duplicate existing shipped rule in Builder via manual condition entry to rebuild muscle memory on field names before authoring novel rule. Matrix tab screenshot fills STRIDE coverage slide for security programme status reports even when rules are demo catalogue.
