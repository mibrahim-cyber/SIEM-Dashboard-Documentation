---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Sound alerts and notification settings
last_updated: 2026-05-23
---

# Sound alerts and notification settings

**Part of:** Ingest & Config → Settings
**One-sentence focus:** soundEnabled, Web Audio beeps, and critical-only audible paging.

### What you are looking at

Under **DETECTION PREFERENCES**, the Sound Alerts row presents a checkbox bound to `soundEnabled` with label text Beep on critical alert. The checkbox uses native HTML input styling inside a flex label with pointer cursor, no volume slider, sound picker, or snooze timer. When enabled, nothing visible changes on the Settings page itself; audible feedback fires only when the detection pipeline ingests a new alert whose severity equals critical elsewhere in the app (Overview, Live Feed, simulated campaigns, etc.). The tone is a brief square-wave chirp, not a spoken announcement, not a custom WAV file from your SOC branding kit. Sound Alerts sits adjacent to Alert Deduplication in the same card, operators often configure both together for noisy environments. Unlike enterprise paging integrations (PagerDuty, Opsgenie, Slack webhooks), this control is entirely local to the browser tab running the dashboard. There is no Settings panel for routing critical audio to SMS or email; those channels would require separate SOAR or notification service work outside Module 27.

### What is happening underneath

`soundEnabled` is dashboard state in the shared dashboard provider: `const [soundEnabled, setSoundEnabled] = useState(false)` with setter exported through context. Settings screen wires `<input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />`. A ref `soundRef` mirrors state so the async log processing callback reads current value without stale closures: `useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled])`. When logs process, after deduplication, the pipeline runs:

```javascript
deduped.filter((a) => a.severity === 'critical').forEach((a) => {
 criticalHandlerRef.current?.(a);
 if (soundRef.current) beep();
});
```
The local `beep()` function creates a Web Audio API oscillator at 880 Hz square wave, 0.3s duration, gain ramp 0.1 → 0.001. Failures are swallowed in empty catch; browsers without AudioContext or autoplay restrictions may silently no-op. Only critical severities trigger audio: high alerts do not beep even if sound is enabled. Multiple critical alerts in one batch each call `beep()` sequentially. Can overlap harshly. There is no server persistence or per-user sound preference in SQLite; reloading defaults to unchecked. `onCritical` handler registration allows other components to hook critical events separately from audio.

### Why this matters

Audio paging is controversial in open-plan SOCs, Settings centralises opt-in so new hires do not surprise the floor during Simulate Campaign. Critical-only scope matches paging policies that ignore medium noise. Because sound is client-side, each workstation configures independently: the manager's machine can beep while the air-gapped review station stays mute. Training programmes should explicitly demo the checkbox so analysts associate the chirp with critical severity rather than every red badge in the UI; Alert Manager renders high and critical with similar urgency colours, but only critical triggers audio. Understanding Web Audio limitations explains "I enabled sound but heard nothing" reports: browser tab muted, autoplay policy, or remote desktop audio redirection. Security awareness teams should note that audio alerts are not logged to `audit_log`; an analyst who disables sound after a critical fires leaves no server-side record of that preference change, which can complicate after-action reviews that ask "why did nobody respond to the beep?"

### Step-by-step walkthrough

1. Open Settings → **DETECTION PREFERENCES**.
2. Check Beep on critical alert.
3. Navigate to Monitor → Overview (or stay elsewhere. Ingest is global).
4. Run Simulate Campaign or ingest logs that trigger a critical rule (e.g. SQL injection paths).
5. Listen for a short 880 Hz tone when critical alerts land.
6. Uncheck the box; repeat simulation, confirm silence.
7. Test with only high severity alerts; confirm no beep.
8. Refresh browser: checkbox resets unchecked; re-enable if desired.

### Common questions

#### Why do high-severity alerts not beep?

Product choice: only `severity === 'critical'` invokes `beep()`. Tune rules if high should page equally.

#### Is sound enabled for all users on this server?

No. Each browser session holds its own `soundEnabled` state. Not shared across users or machines.

#### Does deduplication affect beeping?

Dedupe runs before the critical loop, suppressed duplicates never reach the beep branch. One burst may beep once if only one critical survives dedupe.

#### Can I change the beep frequency or duration?

Not via Settings. Requires configuration change in `beep()` inside the SIEM context pipeline.

#### Does settings show a test sound button?

No. Trigger a test critical via simulation instead.

### What analysts do when the pager fires

Night-shift analyst enables sound when headcount is low; day-shift disables it during executive tours. During tabletop exercises, facilitator enables beeps so participants notice injection of critical events without staring at Live Feed. If beeps flood during worm scenarios, analyst enables deduplication or disables sound rather than muting OS volume globally. Incident commander documents in runbook that audio is non-authoritative; visual queues in Alert Manager remain source of truth. When pairing sound with Simulate Campaign, wait for SQL-injection phase logs: those often carry critical severity and produce the most reliable test chirp. Wall-mounted NOC displays running the dashboard should keep sound off by default to avoid duplicate beeps from multiple operators' sessions unless only one browser controls audio policy for the room.

### Edge cases and gotchas

Browser autoplay policy may block audio until user gesture. Clicking the checkbox counts, but first beep after cold load might still fail on some browsers. Remote desktop sessions often drop Web Audio output. `beep()` uses `window.AudioContext`, multiple rapid criticals spawn overlapping contexts without cleanup; minor memory churn only. Headless E2E tests never hear beeps. Sound does not fire for historical alerts loaded from DB on login: only newly processed ingest events.

> **Technical note:** Incidents detailed notes critical beeps originate from ingest, not Incidents module. Settings is the sole user-facing toggle.
