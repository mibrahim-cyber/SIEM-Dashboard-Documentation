# FINALIZE — Complete every feature, document, game, and QoL item

**Model:** claude-opus-4-7  
**This is not a rebuild. This is a finalization pass.**  
Every feature that is documented, every guide that is written, every achievement that is registered — it must have a working, visible, non-placeholder implementation on the relevant page. After building, run all three checks in order. Then push.

---

## PART 1 — CRITICAL STUBS (build these first, they are broken or near-empty)

### 1A — trophy.html (currently 54 lines — STUB)

This page is the achievement room. The command palette routes here. It is currently a skeleton. Build the full thing.

**What trophy.html must be:**
A full achievement showcase page. The player has unlocked achievements across the site. This is where they see them all.

**Layout:**
- Dark full-screen page, background `#0a0618`
- Header: `MERIDIAN-7 · ACHIEVEMENT ROOM` with a count badge showing `X / 44 unlocked`
- Grid of achievement cards, 4 columns (responsive to 2 on mobile)

**Each achievement card:**
- Locked state: dark card, grey icon, blurred title, `???` for description
- Unlocked state: glowing border in accent color, clear title, description, unlock date
- Icon rendered large (emoji or SVG) in center
- Title below icon
- Short description below title
- Unlock timestamp bottom-right in monospace, grey

**All 44 achievements must be defined and renderable.** Load from `SiemCore.AchievementSystem.list()`. The full achievement IDs are:

```
visit_terminal, visit_breach, visit_network, visit_cipher, visit_sim,
visit_intercept, visit_forge, visit_archive, visit_heist, visit_cartography,
visit_lab, visit_memorial, visit_resonance, visit_signal, visit_warroom,
visit_brain, first_boot, explorer, palette_open, breach_win,
cipher_alpha, cipher_vault, egg_secret, egg_habibi, deck_transition,
nav-terminal, nav-breach, nav-network, nav-cipher, nav-sim,
nav-intercept, nav-forge, nav-archive, nav-heist, nav-cartography,
nav-lab, nav-memorial, nav-resonance, nav-right, nav-left,
nav-brain, nav-landing, nav-read, nav-trophy, nav-motd
```

**Progress section at top:**
- Total unlocked / 44
- Progress bar (fill with gradient `#6366f1 → #38bdf8`)
- Rarity breakdown: Common / Rare / Secret counts
- "Session eggs found: N" (from `SiemCore.SessionState.get('eggs', 0)`)

**Category tabs:** Navigation · Experiences · Secrets · Milestones  
Each tab filters the grid to that category.

**Animations:**
- On load: cards stagger in with `gsap.from({opacity:0, y:20, stagger:0.03})`
- Unlocked card hover: subtle glow pulse
- Locked cards: scanline overlay on each card

**Must load:** siem-core.js, palette.js, palette.css, deck-nav.css  
**Must call:** `SiemCore.bootPage('trophy')`, `SiemCore.AchievementSystem.check('nav-trophy')`  
**Minimum 400 lines.**

---

### 1B — motd.html (currently 49 lines — STUB)

This is the "Message of the Day" page — a cinematic welcome screen accessible from the command palette. Think of it as the site's own splash/lore page.

**What motd.html must be:**
A full-screen scrollable narrative page. Atmospheric. Like a classified briefing document.

**Content:**
- Top: `MERIDIAN-7 SYSTEM BROADCAST — CLASSIFICATION: INTERNAL`
- Date/time stamp (live)
- Section 1: SYSTEM STATUS — shows fake live stats: Active Rules: 847, Ingest Rate: 12,400 eps, Last Alert: CRIT brute-force 3 min ago, Cluster Health: NOMINAL — all animated to count up
- Section 2: TODAY'S THREAT BRIEF — a short paragraph about the current simulated threat landscape (static but well-written SOC content)
- Section 3: ANALYST NOTES — 3 short bulletin items with timestamps
- Section 4: NAVIGATION QUICK LINKS — grid of all 17 experience buttons, each linking to its page
- Section 5: KEYBOARD REFERENCE — table of all Ctrl+K commands and keyboard shortcuts

**Visual style:**
- CRT monospace aesthetic matching terminal.html
- Scanline overlay
- Green text on black, amber for warnings, red for critical items
- Typewriter animation on the header text (GSAP TextPlugin or JS interval)

**Minimum 300 lines.**

---

### 1C — left.html (currently 377 lines — WAR ROOM)

The War Room. This sits between the landing and Observation Deck in the navigation.

**Check what exists first.** If it is already a complete, functional page (tactical grid with real-time attack simulation, working controls, scoring), leave it alone.

**If it is thin or broken, it must have:**
- Real-time attack simulation canvas with a tactical grid
- A map divided into sectors (North, South, East, West, Core)
- Threats spawning at edges and moving toward Core
- Player can click sectors to deploy countermeasures (Firewall, IDS, Honeypot)
- Score counter tracking threats neutralized
- Wave system: Wave 1 has 3 threats, each wave increases count
- Event log strip showing threat names, vectors, and disposition
- Audio: Tone.js alert sounds gated behind user gesture
- Full HUD: wave number, score, active defenses, threat count
- Win/fail state when Core is breached

**Minimum 600 lines if it needs rebuilding.**

---

### 1D — read.html (currently 209 lines — DOCUMENTATION READER)

This is the markdown documentation reader. All 245 guide files and 137 docs pages route through it.

**What it must do:**
- Accept a `?path=` query parameter pointing to any `.md` file in the repo
- Fetch that file via `fetch(path)` and render it as HTML (use marked.js — it's already at `assets/marked.min.js`)
- Show a sidebar with the full navigation tree for the current guide section
- Show breadcrumb navigation: `Guides > Monitor > Alert Manager > Alert Lifecycle`
- Show prev/next buttons linking to adjacent guide pages in the same section
- Show a "Back to Observation Deck" link
- Table of contents extracted from headings and shown in a right rail
- Syntax highlighting for code blocks (inline styles, no extra lib needed — just monospace + dark bg)
- Print-friendly CSS that shows the doc content cleanly

**Layout:**
- Left sidebar (240px): section navigation tree, collapsible
- Center: doc content, max-width 680px, generous line-height
- Right rail (200px): table of contents from headings (hide on narrow viewport)

**Error state:** If path is invalid or file 404s, show a styled error with a list of popular docs to browse.

**Minimum 350 lines.**

---

## PART 2 — FEATURE COMPLETENESS (apply to existing pages)

These pages exist and mostly work but have specific documented features that must be present.

### 2A — brain/index.html (Observation Deck)

Verify these QoL features work from `assets/siem-qol.js`:
- `Ctrl+K` opens command palette with all entries populated
- Clicking "Achievements" in palette routes to `trophy.html`
- Clicking "MOTD" routes to `motd.html`
- The version badge (`v15.2.0`) is visible in bottom-right
- Clicking the version badge opens the changelog modal
- `?` key opens the keymap modal
- Cursor trail dots follow mouse movement
- The scroll progress bar appears on the page
- Mobile nav grid appears on viewport < 900px
- Offline banner appears when navigator.onLine is false

### 2B — terminal.html

These commands must work (check against the full list in REBUILD.md):
- Arrow up/down: navigate command history
- Tab: autocomplete filenames in current directory and known commands
- `Ctrl+L`: clear screen
- `alias`: lists `ll`, `alerts`, `crit`, `status`
- `jq . /opt/siem/config.json`: pretty-prints the JSON
- `find / -name "*.log"`: returns 8 paths
- `man grep`, `man tail`, `man siem`: formatted manual pages
- `echo $SIEM_SECRET`: triggers `egg_secret` achievement

### 2C — cipher.html

Verify every puzzle answer actually works:
- ALPHA: `MERIDIAN` (Caesar +3 decode of `PHULGLDA`)
- BETA: `NAIDIREM` reversed = `MERIDIAN` ✓
- GAMMA: `DETECTION` (Vigenère decode with key `KEY` of `VEQPGMER`)
- DELTA: `atob('TUVSSURJQU4=')` = `MERIDIAN` — verify this actually decodes correctly in JS
- EPSILON: ROT13 of `ZREVQVNA` = `MERIDIAN`
- ZETA: `MERIDIAN-VAULT-7`
- After all 6 solved: classified brief animates in at bottom

### 2D — breach.html

Verify:
- All 5 scenarios load and have distinct topologies
- Crown jewel node exists and is visually distinct (gold glow)
- Timer counts down, shows red when < 30s
- `breach_win` achievement fires when all 5 scenarios completed
- Share button calls `SiemCore` or `SiemShareCard` (graceful if unavailable)

### 2E — heist.html

Verify:
- All 3 levels are playable from start to finish
- Guard vision cones are visible and functional
- E key interacts with objectives when in range
- "SIEM ALERT" flash shows which rule caught the player when detected
- Win screen shows score (time taken)

### 2F — forge.html

Verify:
- Drag from library panel to canvas deposits a node
- Clicking canvas nodes selects them (highlighted)
- Monaco editor updates in real-time as blocks are added
- Export JSON copies to clipboard
- Live test panel shows rule matching against sample events

### 2G — cartography.html

Verify:
- Layer checkboxes actually filter arcs (uses `layerState[a.layer] !== false`)
- Clicking an arc shows detail panel on right
- Globe auto-rotates
- At least 15 arcs visible by default

### 2H — sim.html

Verify:
- `motionTween.progress(t/100)` is used (not `offset`) — already fixed
- All 6 missions selectable
- SIEM rule intercept panel updates per phase
- Phase timeline strip highlights current phase

### 2I — intercept.html

Verify:
- At least 5 sessions in the sidebar
- Entering the correct key reveals encrypted lines with animation
- IOC panel on right auto-detects IPs, domains, hashes from transcript text
- OMEGA session unlocks with `omega-master`

### 2J — resonance.html

Verify:
- Enable Audio button starts Tone.js after user gesture
- All 6 channel faders change volume
- Mute per channel works
- Three.js waveform animates in sync with audio output (Analyser node)

### 2K — archive.html

Verify:
- WASD/arrow keys move the camera through the corridor
- Clicking a drawer handle opens the overlay
- At least 5 distinct documents with real SOC content (not identical placeholder text)
- Esc closes the overlay

### 2L — memorial.html

Verify:
- Lenis smooth scroll enabled
- Progress bar at top moves as user scrolls
- ScrollTrigger animations fire for each chapter
- All 6 breaches have at least 3 paragraphs of content, a pull quote, and a SIEM detection analysis block

### 2M — network.html

Verify:
- Threat propagation actually spreads from compromised nodes
- Packet capture modal shows Wireshark-style table (not plain text list)
- Node click shows detail in right drawer
- Ambient Audio button works (Tone.js gated behind click)

### 2N — lab.html

Verify:
- At least 10 payloads in the left sidebar
- Each payload triggers a distinct SIEM rule in the xterm terminal
- After 3 identical payload types: correlation alert fires
- Chart.js bar chart updates per hit

---

## PART 3 — DOCUMENTATION COMPLETENESS

The 245 guides and 137 docs are markdown files. They must:
- Have no `[TODO]`, `[PLACEHOLDER]`, `[ADD CONTENT HERE]` text anywhere
- Every `INDEX.md` must have a complete table of contents with working relative links
- Every guide's `01-how-to-use.md` must have a step-by-step walkthrough with at least 5 numbered steps

**Run this check:** `grep -r "TODO\|PLACEHOLDER\|lorem ipsum\|coming soon" guides/ docs/ pentests/` — the result must be empty.

**The three pentest reports** (`pentests/pentest-01-broken-access-control.md`, `pentest-02-session-and-csrf.md`, `pentest-03-log-poisoning-and-input-abuse.md`) must each have:
- Executive summary (3–5 sentences)
- CVSS score
- Affected component
- Reproduction steps (numbered)
- Impact analysis
- Remediation recommendation
- Status (Resolved / Accepted Risk)

---

## PART 4 — THE TRIPLE CHECK

Run all three checks after building. Each check is a different type.

---

### CHECK 1 — INVENTORY CHECK (feature vs. implementation)

For every item in this list, verify it exists and works in the codebase. Answer YES or NO for each.

**Command Palette (Ctrl+K):**
- [ ] Opens on Ctrl+K
- [ ] Contains all 17 experience links
- [ ] Contains link to trophy.html (Achievements)
- [ ] Contains link to motd.html (MOTD)
- [ ] Contains link to read.html (Documentation)
- [ ] Search filters items
- [ ] Esc closes it
- [ ] Arrow keys navigate items
- [ ] Enter navigates to selected item

**Achievements:**
- [ ] All 44 achievement IDs are defined in siem-core.js ACH_DEFINITIONS
- [ ] trophy.html renders all achievements with locked/unlocked states
- [ ] Toast notification appears when achievement unlocks
- [ ] `explorer` achievement fires after visiting 10+ pages

**Experience pages — each must have:**
- [ ] `SiemCore.bootPage(id)` call
- [ ] `SiemCore.AchievementSystem.check('visit_id')` call
- [ ] `<div id="deck-nav-root">` present
- [ ] `deck-nav.js` loaded
- [ ] Left and right chevron navigation functional

**Games — each must have a win/fail state:**
- [ ] breach.html: CONTAINMENT ACHIEVED screen
- [ ] heist.html: DETECTED / ESCAPED screens
- [ ] cipher.html: OMEGA UNLOCKED classified brief

**Easter eggs (all must trigger their achievement):**
- [ ] `echo $SIEM_SECRET` in terminal → `egg_secret`
- [ ] `man habibi` in terminal → `egg_habibi`
- [ ] `history payload` in terminal → increments eggs
- [ ] `rm -rf /` in terminal → flavour response
- [ ] `fortune` in terminal → random proverb

**QoL (all must be functional on all pages):**
- [ ] Version badge visible bottom-right
- [ ] Keymap modal on `?` key
- [ ] Scroll progress bar on scrollable pages
- [ ] Mobile nav on viewport < 900px
- [ ] Offline banner on network disconnect
- [ ] Print stylesheet hides nav/UI chrome
- [ ] Reduced motion: all animations respect `prefers-reduced-motion`
- [ ] Cursor trail active on desktop

---

### CHECK 2 — INTEGRATION CHECK (cross-page links and data flow)

This checks that the site works as a connected system, not a collection of independent pages.

**Navigation ring:**
Run through the entire EXPERIENCE_CHAIN in order and verify each right chevron leads to the next page and each left chevron leads back:
`Observation Deck → Terminal → Breach → Ghost Network → Cipher → Simulation → Interrogation Room → Forge → Deep Archive → Heist → Cartography → Lab → Memorial → Resonance → Observation Deck`

**Command palette cross-links:**
- From any page, Ctrl+K → type "terminal" → Enter → lands on terminal.html
- From any page, Ctrl+K → type "trophy" → Enter → lands on trophy.html
- From brain/index.html, all module nodes in the wormhole link to their correct page

**Achievement persistence:**
- Unlock an achievement on one page (e.g. visit_terminal)
- Navigate to trophy.html
- The achievement shows as unlocked with the correct timestamp

**Read.html integration:**
- From brain/index.html, clicking a documentation node opens read.html with `?path=` pointing to the correct doc
- Prev/next buttons on read.html navigate through the correct guide section sequence
- Breadcrumb shows accurate path

**Guide index files:**
- Every `guides/SECTION/INDEX.md` — the links in it resolve to real files that exist

**Docs cross-references:**
- Any `[link text](../other-file.md)` in docs/ — the target file exists

---

### CHECK 3 — POLISH CHECK (visual and content quality)

This checks that nothing looks broken or unfinished to a human eye.

**Content quality:**
- No visible `[object Object]` anywhere
- No `undefined` text in any UI element
- No empty panels or sections (every panel has at least placeholder data on load)
- No `console.error` output in browser devtools (check by reading the code for obvious errors)
- No HTML entity mistakes (`&amp;amp;` double-encoding etc.)

**Visual consistency:**
- Every page uses the correct font family (`"IBM Plex Mono", Consolas, monospace`)
- Every page header has consistent height and border styling
- Dark backgrounds: only `#020617`, `#0a0618`, `#0a0408`, `#030a04` — no stray `#000000` or `#111111` backgrounds
- Accent colors used consistently: blue for info, amber for warning, red for critical, green for success, violet for special
- No unstyled `<button>` elements — all buttons have font, padding, background, border
- No layout overflow — no horizontal scrollbar on any page at 1280px viewport width

**Error states:**
- 404.html and 500.html are styled consistently with the rest of the site (dark bg, monospace font, navigation back to home)
- read.html gracefully handles a missing `?path=` parameter

**Mobile (< 900px):**
- Mobile nav bar is present and links to 4 key pages
- No text overflow on experience page headers
- Canvas pages (breach, network, forge) have a "Best viewed on desktop" notice if viewport < 600px wide

**Documentation:**
- No guide file ends mid-sentence
- No guide file references a UI element that doesn't exist in the actual dashboard
- Pull quotes and callout blocks are styled (not raw `> ` blockquotes with no styling)

---

## PART 5 — AI CHECKER PASS

After completing parts 1–4 and all three checks, run this automated review. For each file listed, read it fully and answer:

1. Does any function contain `// TODO` or `// FIXME`?
2. Is there any `console.log` (not `console.warn` or error handling) left in production code?
3. Is there any obviously fake or placeholder text (e.g. "Lorem ipsum", "Test content", "Coming soon", "Add your content here")?
4. Is there any interactive element (button, input, slider) that has no event handler and does nothing when clicked?
5. Does the file have any obvious JS syntax errors (unclosed brackets, undefined variables referenced before declaration)?

**Files to AI-check:**
```
trophy.html
motd.html
read.html
left.html
terminal.html
breach.html
network.html
cipher.html
sim.html
intercept.html
forge.html
archive.html
heist.html
cartography.html
lab.html
memorial.html
resonance.html
right.html
brain/index.html
index.html
assets/siem-core.js
assets/siem-qol.js
assets/terminal-shell.js
assets/deck-nav.js
assets/palette.js
```

For any file that fails a check, fix it before proceeding to push.

---

## PART 6 — PUSH

Once all checks pass with no failures:

```bash
git add -A
git commit -m "."
git push origin main
```

Do not push if any check has a NO or a failing item. Fix it first.

---

## Global rules (same as REBUILD.md — apply everywhere)

1. `new FitAddon.FitAddon()` — never `new FitAddon()`
2. `new WebLinksAddon.WebLinksAddon()` — never `new WebLinksAddon()`
3. All `Tone.start()` inside user gesture handlers only
4. All CDN URLs `https://` — no `//cdn` protocol-relative
5. No `alert()` calls
6. No `console.log` in production paths
7. Canvas elements must have resize handler
8. Every page: siem-core.js → palette.js → [page scripts] → deck-nav.js load order
9. `<div id="deck-nav-root">` before deck-nav.js script tag
10. No placeholder text. No skeleton content. No "coming soon".
