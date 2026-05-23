# Complete Site Specification — Master Checklist

Status: `[ ]` pending · `[~]` partial · `[x]` done

## Existing Deck (maintain)
- [x] index.html — landing / approach vector
- [x] brain/index.html — observation deck (15 modes + 10 v2 features)
- [x] left.html — War Room
- [x] right.html — Signal Room (6 tuning modes)
- [x] deck-nav.js / deck-nav.css — wing navigation
- [x] read.html — markdown viewer

## PAGE 1 — terminal.html — THE TERMINAL
- [x] xterm.js 5.3.0 + fit + web-links CDN
- [x] CRT visual identity (phosphor gradient, scanlines, chromatic text-shadow)
- [x] Header bar (36px, LED, UTC, version)
- [x] xterm theme + font config
- [x] In-memory filesystem (home, var/log/siem, etc, opt, proc)
- [x] alerts.log 2000+ seeded lines
- [x] Commands: ls, cat (pager), grep, ssh, nmap, tail -f, sudo, ps, top, curl, python3
- [x] Easter eggs (whoami, SIEM_SECRET, man habibi, rm -rf, history payload, fortune)
- [x] Boot sequence + MOTD

## PAGE 2 — breach.html — THE BREACH
- [x] Tone.js + GSAP + matter.js CDN
- [x] 12-node network topology (3 zones)
- [x] 5 attack scenarios
- [x] Click interactions (isolate, IDS, flush, double-click line, right-click menu)
- [x] Scoring HUD + end game screen
- [x] Ambient background traffic

## PAGE 3 — network.html — THE GHOST NETWORK
- [x] D3 force graph + starfield + optional Three.js
- [x] 45 nodes, packet particles, EventEngine
- [x] Node detail drawer
- [x] Wireshark-style packet capture modal
- [x] Ambient audio mode (Tone.js)

## PAGE 4 — cipher.html — THE CIPHER
- [x] GSAP TextPlugin + howler.js
- [x] Vault SVG + 6 chambers (ALPHA–ZETA puzzles)
- [x] Solved-state animations

## PAGE 5 — sim.html — THE SIMULATION
- [x] GSAP MotionPath + D3 + Tone.js
- [x] Scenario selection grid (6 missions)
- [x] Phase animations (6 phases)
- [x] Narrator callouts + playback scrubber

## PAGE 6 — intercept.html — THE INTERROGATION ROOM
- [x] Typed.js + howler + GSAP
- [x] 5 conversation sessions + tooltips
- [x] DECRYPT TRAFFIC mechanic
- [x] Session sidebar + SESSION-OMEGA lock

## PAGE 7 — forge.html — THE FORGE
- [x] interact.js + D3 + Monaco + Fuse.js
- [x] Component library drag-drop
- [x] Connection bezier drawing
- [x] Properties panel + live test console
- [x] JSON export via Monaco

## PAGE 8 — archive.html — THE DEEP ARCHIVE
- [x] Three.js 3D library room
- [x] Filing cabinet drawers + reading overlay
- [x] Keyboard aisle navigation + lenis scroll

## PAGE 9 — heist.html — THE HEIST
- [x] Kaboom.js stealth game
- [x] Detection rules as mechanics
- [x] Death screen education links

## PAGE 10 — cartography.html — THE CARTOGRAPHY
- [x] Globe.gl + threat feed arcs
- [x] 7 toggle layers + country drawer

## PAGE 11 — lab.html — THE LAB
- [x] Split target app + SIEM monitor
- [x] xterm log stream + Chart.js metrics
- [x] Payload library sidebar

## PAGE 12 — memorial.html — THE MEMORIAL
- [x] GSAP ScrollTrigger + lenis
- [x] 6 breach scroll narratives

## PAGE 13 — resonance.html — THE RESONANCE
- [x] Tone.js 6-channel mixing board
- [x] Three.js waveform + composer mode

## QoL FEATURES (22)
- [x] 1 Global command palette (Ctrl+K) — palette.js
- [x] 2 Persistent session state (sessionStorage)
- [x] 3 Achievement system (24) + trophy.html
- [x] 4 Enhanced deck-nav transitions (WIPE/GLITCH/DISSOLVE)
- [x] 5 motd.html daily briefing modal
- [x] 6 prefers-reduced-motion global
- [x] 7 Deep-link hash URLs
- [x] 8 Keyboard map overlay (?)
- [x] 9 Loading screen system
- [x] 10 Error pages 404.html / 500.html
- [x] 11 Site-wide ambient audio bus
- [x] 12 Mobile layouts (<900px)
- [x] 13 Print stylesheet
- [x] 14 Page progress indicator
- [x] 15 Easter egg counter badge
- [x] 16 Session time display
- [x] 17 Cross-page BroadcastChannel notifications
- [x] 18 Service worker offline (sw.js)
- [x] 19 Keyboard focus / a11y
- [x] 20 Share card generator
- [x] 21 Cursor trail system
- [x] 22 Version badge changelog modal

## GLOBAL
- [x] assets/siem-core.js (EventEngine, AmbientAudio, Achievements, SessionState, Palette, Broadcast)
- [x] CDN fallbacks in assets/vendor/
- [x] Canvas visibility pausing + DPR cap + adaptive quality
- [x] Integrity script for new pages
- [x] QA audit (5 passes) + fix pass
- [x] Lighthouse / performance budget

## Verification passes
- [x] Checklist pass 1 (build audit)
- [x] Checklist pass 2 (2× scan)
- [x] QA bug report
- [x] Critical/high fixes applied
