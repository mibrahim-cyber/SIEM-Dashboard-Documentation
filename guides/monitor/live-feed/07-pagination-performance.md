---
module: Live Feed
sidebar: Monitor → Live Feed
section: Monitor
subsection: Pagination vs infinite scroll
last_updated: 2026-05-23
---

# Pagination vs infinite scroll

**Part of:** Monitor → Live Feed
**One-sentence focus:** Live Feed renders the full filtered buffer with auto-scroll to the tail, a conveyor-belt model for real-time monitoring.

### What you are looking at

Live Feed uses scrollable overflow (`overflow-y-auto`) with all filtered rows rendered in DOM, classic infinite scroll pattern without "Load more" button. **AUTO-SCROLL ON** pins viewport to bottom on new data. Buffer stats show fill level bar toward cap. Infinite scroll is like standing on a moving walkway reading a conveyor belt of packages, new boxes arrive at the end and the belt moves you along. Pagination is numbered shelves where you explicitly walk to shelf 3. Live Feed chose the conveyor model for operational tail-following.

### What is happening underneath

No virtualisation library; `filtered.map` renders every row. Performance bound by filtered length (max ~500). `scrollIntoView` on bottom sentinel ref triggers smooth scroll. Table view sticky header (`sticky top-0`) keeps columns visible while scrolling. No page numbers, no offset API; pure client array. At high volume, browser repaint cost grows linearly; EPS spikes may lag UI slightly. Buffer cap truncates head; oldest events fall off, mimicking sliding window retention not paginated archive.

### Why this matters

Pagination aids deep historical research; tail-following aids real-time monitoring. Wrong pattern choice causes analysts to miss live events (stuck on page 1) or miss context (scroll overload). Capacity planning must account for render-all strategy.

### Step-by-step walkthrough

1. Ingest >100 events, observe scroll length grow.
2. Keep **AUTO-SCROLL ON**; viewport stays at newest.
3. Scroll up manually: read history while live continues.
4. Turn **AUTO-SCROLL OFF**; investigate mid-buffer without jump.
5. Pause, scroll without fighting auto-scroll.
6. Switch table view; test sticky header while scrolling.
7. Watch Buffer size approach cap: note oldest events vanish.

### Common questions

#### How many events can I see at once?

Up to raw buffer cap (~500 stored, UI references 300 in bar). Filtering reduces rendered subset.

#### Can I jump to a timestamp?

No built-in jump; scroll manually or filter IP narrow set.

#### Will live feed slow my browser?

Possible beyond few thousand DOM nodes if cap increased in code. Current cap keeps demo laptop-safe.

#### Why not paginate for performance?

Real-time SOC UX prioritises continuous tail. HABIBI-SIEM defers deep history to exports and Timeline/Alert Manager.

### What analysts do when the pager fires

Auto-scroll on until pause; auto-scroll off when reviewing last 50 lines before containment decision. Table view for sharing screen with manager, clearer columns. Expect head truncation; save critical lines to case notes early.

### Edge cases and gotchas

Smooth scroll during high EPS fights user manual scroll; pause first. Selected row highlight lost if filtered out. No "new events above" indicator when scrolled up; analyst must notice counter changes.

> **Technical note:** Consider virtualised list (`react-window`) if buffer cap rises in future versions, current implementation optimises simplicity for college-scale demo volumes. Live Feed deliberately avoids pagination because SOC tail-following requires continuous visibility of the newest events. The `bottomRef` sentinel triggers `scrollIntoView({ behavior: 'smooth' })` when `autoScroll` is true and new logs arrive; analysts scrolled up in history will not be jumped unless they re-enable auto-scroll or manually return to the bottom. Table view adds a sticky header (`sticky top-0`) so column labels remain visible during long scroll sessions. Performance is bounded by `MAX_RAW_LOGS = 500` in the SIEM context pipeline; the UI stats panel references 300 as a visual denominator, but the actual slice cap follows the context constant.
