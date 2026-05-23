---
module: Attack Timeline
sidebar: Monitor → Timeline
section: Monitor
subsection: Mapping raw events onto kill chain phases
last_updated: 2026-05-23
---

# Mapping raw events onto kill chain phases

**Part of:** Monitor → Attack Timeline
**One-sentence focus:** Rule categories and simulate-campaign ordering let analysts infer kill-chain phases from lane sequence when grouping by RULE.

### What you are looking at

With **GROUP: RULE**, each lane label shows first matched rule name (truncated); event count beneath. Dots colour by alert severity (critical red, high orange, medium yellow, low green). Switch **GROUP: SEVERITY** to see temporal distribution of severity tiers. Mapping events to phases is like sorting clothes into laundry bins, lights, darks, delicates, based on fabric type rules, not reading every garment label by hand. Detection rules are the bin labels; alerts landing in bins suggest kill-chain stage.

### What is happening underneath

Each alert's `matchedRules[0]` primary rule links to `detectionRules` entry with `category`, `stride`, optional `mitre` object. Simulate campaign ordering intentionally sends brute-force before sql/xss before exfil, when plotted, left-to-right dot sequence mirrors staged narrative. Engine does not compute phase transitions; human or exported report interprets. `filtered` alerts = time window ∩ severity filter before lane grouping.

### Why this matters

Automatic phase tagging reduces analyst cognitive load during IR reports. Even manual mapping via rule names beats unstructured alert lists for explaining "they tried passwords, then SQLi, then exfil."

### Step-by-step walkthrough

1. Run Simulate Campaign on Overview.
2. Open Timeline **GROUP: RULE**.
3. Identify lanes appearing in time order left-to-right.
4. Click latest exfil dot: read fields in selected panel.
5. Compare to **GROUP: IP**; same dots reorganised by actor.
6. Cross-check AlertDetailModal MITRE lines for tactic names.
7. Document phase narrative for incident ticket.

### Common questions

#### Can one dot represent multiple rules?

One alert can include multiple matched rules but lane grouping uses `matchedRules[0]?.ruleName` only, secondary matches hidden in lane assignment.

#### What if rules overlap categories?

Lane count merges by chosen group key; overlapping categories appear as separate lanes only when grouping by rule name.

#### Do simulated alerts map differently?

Same mechanics; `simulated` flag visible in detail panel JSON, not on dot glyph.

#### How are multi-IP attacks shown?

**GROUP: IP** creates parallel lanes; phase story splits per actor unless correlation band links time span.

### Operational use during containment

Analyst narrates phases aloud while pointing at Timeline in war room: "Scanning 14:02, auth 14:04, exfil 14:07." Rule grouping validates detection coverage gaps; empty lane where exfil expected means tuning needed.

### Edge cases and gotchas

Unknown rule fallback string `'unknown'` lane if matchedRules empty, rare but breaks narrative. Clock skew across sources not visible; all timestamps client-normalized ms.

> **Technical note:** Phase mapping quality equals rule taxonomy quality; garbage categories, garbage story. Lane assignment uses `matchedRules[0]?.ruleName` when **GROUP: RULE** is selected; secondary rule matches on the same alert do not create additional lanes. This is a display simplification: the full rule list remains in `AlertDetailModal`. When teaching phase mapping, open the modal on a selected dot to read MITRE technique lines alongside the lane label. Simulate campaign timing (0ms brute-force, 1500ms SQLi, 3000ms XSS, 4500ms brute-force repeat, 5500ms exfil, 6500ms privilege-escalation) produces a left-to-right narrative on **GROUP: RULE** that instructors can point to while explaining detection coverage across the kill chain.
