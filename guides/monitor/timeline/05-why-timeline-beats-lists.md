---
module: Attack Timeline
sidebar: Monitor → Timeline
section: Monitor
subsection: Why visualising attacks as a timeline is more useful than a flat list
last_updated: 2026-05-23
---

# Why visualising attacks as a timeline is more useful than a flat list

**Part of:** Monitor → Attack Timeline
**One-sentence focus:** Spatial layout exploits pattern recognition for burst detection faster than scrolling a sorted alert table.

### What you are looking at

Same Timeline view contrasted mentally with Alert Manager table, rows sorted by time column but without spatial lane separation or duration bands. Human pattern recognition evolved for spatial layouts, constellation shapes versus alphabetised star lists. Timeline exploits spatial memory; tables exploit sortable columns. Each wins in different cognitive tasks.

### What is happening underneath

Table views (`AlertManager`) sort by timestamp descending in text. Timeline preserves timestamp on X while adding Y dimension for group key, doubling information bandwidth per pixel. Incident bands add third encoding (duration). Cognitive psychology literature (Gestalt proximity, similarity) explains faster burst detection when dots cluster visually.

### Why this matters

Alert fatigue degrades textual processing speed after hundreds of rows. Timeline answers burst vs slow-burn questions instantly; flat list requires mental plotting.

### Step-by-step walkthrough

1. Generate 20+ alerts mixed IPs.
2. Open Alert Manager: scroll table.
3. Open Timeline **GROUP: IP** to compare time to identify dominant IP burst.
4. Switch **GROUP: SEVERITY**, see if criticals clumped or spread.
5. Return to table for ACK actions; use Timeline for story, Manager for work.
6. Present Timeline screenshot to non-technical manager.
7. Document insight table alone would miss.

### Common questions

#### Should I replace alert manager with timeline?

No; complementary. Timeline for analysis; Manager for bulk ACK/RES/export.

#### Does timeline update live?

Yes when alerts state changes. React re-render recomputes lanes.

#### Can executives read this?

Easier than logs, still needs analyst narration for dots meaning.

#### What about colour-blind viewers?

Severity uses both colour and position context; pair with right panel numeric breakdown.

### Operational use during containment

Opens Timeline first for story, Manager second for queue hygiene. Screenshot Timeline for Slack situational awareness.

### Edge cases and gotchas

Too many lanes collapse readability; apply **SEV** filter. Identical timestamps across many lanes looks like vertical line; zoom window smaller.

> **Technical note:** No alternate list view inside Attack Timeline screen, toggle apps via sidebar navigation. Alert Manager sorts by `timestamp` descending in text; excellent for triage actions but poor for burst detection. Timeline adds a Y dimension: same timestamp on different IPs appears as parallel dots on separate lanes, instantly revealing coordinated activity versus a single noisy host. War-room practice: project Timeline with **GROUP: IP** during standups, then switch to Alert Manager for ACK/RES work. The two views are complementary, not interchangeable; Timeline tells the story, Manager for queue hygiene. Colour-blind team members should pair dot colours with the numeric **SEVERITY BREAKDOWN** panel on the right.
