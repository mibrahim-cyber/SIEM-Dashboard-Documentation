---
module: Overview
sidebar: Monitor → Overview
section: Monitor
subsection: How the overview auto-refreshes
last_updated: 2026-05-23
---

# How the overview auto-refreshes

**Part of:** Monitor → Overview
**One-sentence focus:** Overview updates through dashboard state propagation when logs are processed, no polling button, but also no cross-client WebSocket push.

### What you are looking at

Overview feels live: new alerts slide into the feed top, header **LOGS** ticks up, **UNREAD** increments, incident banner may appear, toast pops on critical. There is no visible "Refresh" button or last-updated timestamp. Toggle [ SOUND: ON ] and [ DEDUPE: ON/OFF ] immediately affect subsequent alert behaviour. Compare it to a stock ticker board that updates when trades happen, not when you press F5 on a web page. You are watching a stream tied to events, not requesting snapshots on a schedule.

### What is happening underneath

HABIBI-SIEM uses dashboard state propagation, not polling. the shared dashboard provider holds canonical `alerts`, `rawLogs`, `logsProcessed`. When `processLogs()` completes, `setAlerts` triggers re-render of all the SIEM context pipeline consumers including Dashboard. `useEffect` on `[alerts]` refreshes stats via `setStats(getAlertStats())`. New alert scroll behaviour: `useEffect` on `[alerts.length]` sets `feedRef.scrollTop = 0`. Critical toast registers once via `onCritical()` effect. Server persistence: write roles call `api.saveAlerts()` debounced per batch; on reload, `api.getState()` rehydrates. Log ingestion sources: Log Ingestion UI, simulate campaign, mock generator hooks, all funnel to `processLogs()`. EPS updates every ingestion batch via sliding 5-second window (`EPS_WINDOW_MS`).

### Why this matters

Batch reporting (daily PDF) cannot catch an attacker moving in minutes. Real-time or near-real-time refresh determines mean time to detect. Conversely, absence of refresh when logs ingest indicates UI disconnect, a operational blind spot. Stakeholders evaluating SIEM maturity should ask: "How old can the newest alert be?" In HABIBI-SIEM, answer equals ingestion latency plus detection time, typically sub-second client-side after server validation.

### Step-by-step walkthrough

1. Open Overview in one browser window; open Ingest → Log Ingestion in another.
2. Submit a small batch of malicious test logs.
3. Watch **LOGS** increment without manual refresh.
4. Confirm new alert rows appear; feed scroll jumps to top.
5. Toggle **DEDUPE: ON**; ingest duplicate-pattern logs; observe fewer new rows.
6. Toggle **SOUND: ON**; trigger critical: hear beep once per critical alert batch item.
7. Reload page; alerts reappear from SQLite state (if write persisted).

### Common questions

#### Does overview use WebSockets?

No. State updates synchronously in the dashboard when `processLogs()` runs. Multi-analyst freshness depends on each client reloading or repeating actions that fetch state, there is no cross-client push in v4.

#### How fast is "real-time" here?

Client detection after validation is immediate. Bottlenecks: network to Express API, SQLite write, GeoIP batch lookup, AbuseIPDB async calls. Typical local demo: sub-second alert appearance.

#### Why did my colleague's overview not update?

They may be tier1 on a stale session without shared live state. Only persisted alerts sync via SQLite on reload. Two browsers both ingesting see updates only on the ingesting client unless the other refreshes.

#### Will auto-scroll interrupt my reading?

Feed scroll resets to top only when alert count increases, not on ack/resolve. Pausing is unnecessary on Overview; use Alert Manager for static table review.

### Operational use during containment

Analysts keep Overview visible on a secondary monitor while investigating in Live Feed or Timeline. They rely on toast + sound for critical breaks in focus. They watch **LOGS** derivative (rate of change) as a proxy for attack intensity spike. If updates stop during known attack, they escalate to pipeline investigation immediately; stale UI during active ops is P1.

### Edge cases and gotchas

Background browser tabs may throttle timers affecting simulate campaign and uptime clock, not alert state. `ready` gate shows "Loading SOC data…" until first `getState()` completes; metrics briefly blank. Critical handler overwrites if multiple components register `onCritical`, Dashboard owns it on Overview route. Dedupe toggle does not retroactively remove duplicate alerts already created.

> **Technical note:** `MAX_RAW_LOGS = 500` in the SIEM context pipeline caps memory; Overview alert list is not capped in UI but SQLite persists last 1000 alerts server-side.

### Multi-analyst and persistence semantics

Overview refresh semantics tie directly to HABIBI-SIEM's SQLite session model. When tier2 acknowledges an alert on Overview, `api.updateAlert` persists status; tier1 reloading the page sees updated status after `getState()` hydration. Without reload, both analysts share updates only if the action originated on their client; there is no WebSocket fan-out. Shift handover procedure: outgoing analyst exports CSV, incoming analyst refreshes browser before trusting **UNREAD** counts. The critical toast pipeline registers through `onCritical()` callback ref; only one consumer should register per route mount. Toast content includes rule name and IP from first matched rule, sufficient for initial pivot to Live Feed filter. If toast spam occurs during campaign, disable sound and rely on visual blink dot on new rows.

**LOGS** counter increments even when alerts deduped; proves ingestion alive when alert feed quiet. Pair with Pipeline Health EPS gauge for corroboration. **EXPAND** toggle state (`feedExpanded`) is stored locally; future layout modes may use it; document for developers reading Overview dashboard. Refresh latency budget for local demo: validate API round-trip (~10–50ms LAN), GeoIP batch lookup, detection engine synchronous pass, UI refresh; sub-second under normal load. Production deployment should measure at P95 with concurrent ingestors; Overview UI assumes single-browser operator scale from college project scope. The critical toast pipeline registers through `onCritical()` callback ref, Dashboard owns it on the Overview route. Toast content includes rule name and IP from the first matched rule. **LOGS** counter increments even when alerts are deduped; proving ingestion is alive when the alert feed is quiet. Pair with Pipeline Health EPS gauge for corroboration.
