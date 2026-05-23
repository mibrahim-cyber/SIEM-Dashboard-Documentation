---
module: Attack Timeline
sidebar: Monitor → Timeline
section: Monitor
subsection: The timeline visualisation
last_updated: 2026-05-23
---

# The timeline visualisation

**Part of:** Monitor → Attack Timeline
**One-sentence focus:** The SVG canvas maps time to X-axis pixels, grouping keys to lanes, and severity to dot colour with incident bands behind.

### What you are looking at

SVG `viewBox` width 900px, dynamic height from lane count (`LANE_H=28`, `LANE_GAP=4`, `HEADER_H=32`). X-axis tick labels format HH:MM:SS for windows ≤1 HR else month/day HH:MM. Dots radius 5px, expand to 7px hover/select with glow filter. Lane labels right-aligned at `LABEL_W=130`. **NOW** line at `SVG_W - 20`. The chart is a musical score: time is horizontal staff, each instrument (lane) has its own line, notes (dots) mark when that instrument played. Loudness is not shown, severity colour substitutes for dynamics.

### What is happening underneath

`toX(ts)` linear maps timestamp to pixel: `LABEL_W + ((ts - minTime) / range) * INNER_W`. `minTime = now - window.ms` unless **ALL** (min of alert timestamps or now-60s). Hover state `hovered` alert id; click toggles `selected`. Detail panel prefers selected over hovered. Severity breakdown bars computed from `filtered` set independent of lanes.

### Why this matters

Visual encoding uses pre-attentive processing: colour and position beat table scanning for temporal pattern detection. Misread axis (UTC vs local) causes wrong containment timing, fmtTime uses local timezone.

### Step-by-step walkthrough

1. Hover dot; watch radius enlarge and stem highlight.
2. Click dot: border panel shows **SELECTED EVENT** fields.
3. Click again; deselect.
4. Scroll SVG container vertically if many lanes overflow viewport.
5. Compare tick labels to Overview alert times for same ID.
6. Observe **NOW** line vs latest dot, recency check.
7. Resize browser; SVG scales width 100%, minWidth 600.

### Common questions

#### Why are dots stacked vertically on same timestamp?

Multiple alerts same ms same lane overlap; hover carefully to select intended id.

#### Can I zoom a sub-range?

Only preset windows; no drag-zoom in v4.

#### What do incident bands mean visually?

Translucent rects spanning firstSeen–lastSeen for correlated incident, background context behind dots.

#### Why green NOW line?

Cosmetic anchor for "current time"; dashed `#00ff88` per theme.

### Operational use during containment

Projection in team standup; pointer follows dot clusters. Narrow **WINDOW** to exclude stale overnight noise. Severity panel validates whether recent dots skew critical.

### Edge cases and gotchas

Single alert range zero; division still works. Very long rule names truncate in lane label, hover does not show tooltip full name. SVG horizontal scroll on narrow screens.

> **Technical note:** `svgRef` captured but no pan/zoom handlers attached; static scale only. The SVG uses `viewBox="0 0 900 {dynamicHeight}"` with `LANE_H=28`, `LANE_GAP=4`, and `LABEL_W=130` for right-aligned lane labels truncated at 16 characters plus ellipsis. Dots use radius 5px, expanding to 7px on hover/select with an SVG glow filter. `toX(ts)` linearly maps timestamps: `LABEL_W + ((ts - minTime) / range) * INNER_W`. Incident bands render as translucent rectangles spanning `firstSeen` to `lastSeen` for correlated incidents whose `firstSeen >= minTime`. They sit behind event dots, giving background context for sustained activity versus isolated spikes. Severity breakdown bars in the right panel compute independently from lane layout; useful when too many lanes make the canvas unreadable.
