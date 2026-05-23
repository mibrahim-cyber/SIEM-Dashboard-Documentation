# System overview

Browser-based SOC console for learning and demos; smaller than Splunk or Sentinel, but end-to-end: ingest, detection, alerts, SOAR actions, RBAC.

## two-process architecture

```
┌─────────────────────┐ ┌─────────────────────┐
│ React SPA (Vite) │ /api │ Express Server │
│ localhost:5173 │ ──────► │ localhost:3001 │
│ │ proxy │ │
│ - DetectionEngine │ │ - Session auth │
│ - UI components │ │ - SQLite CRUD │
│ - SiemContext │ │ - Threat/geo proxy │
└─────────────────────┘ └──────────┬──────────┘
 │
 ▼
 ┌─────────────────┐
 │ data/siem.db │
 │ GeoLite2.mmdb │
 └─────────────────┘
```
## why split frontend/backend?

1. **API keys stay server-side.** AbuseIPDB key never hits the browser.
2. **Shared state.** Multiple browser tabs could share SQLite (theoretically).
3. **Coursework.** Demonstrates client/server separation.

## main data flows

### alert creation
`Logs → validate → geo enrich → DetectionEngine → saveAlerts → SQLite → UI refresh`

### threat lookup
`High/Critical alert → soarCheckIp → /api/threat/ip → AbuseIPDB → maybe watchlist`

### auth
`Login → session cookie + CSRF → every write request checks both`

## what's client-only (not in DB)

- IOC watchlist component state
- Scheduler configs
- Correlation builder custom rules (prototype)
- Detection rule enable/disable toggles (until page refresh; rules live in memory)

Documented for coursework persistence-boundary questions.

## tech stack

| Layer | Tech |
|-------|------|
| UI | React 18, Vite, Tailwind |
| API | Express 4, express-session |
| DB | SQLite via better-sqlite3 |
| Auth | bcrypt + RBAC middleware |
| Intel | AbuseIPDB (server proxy), static THREAT_DB |
| Geo | MaxMind GeoLite2 offline |

See `brain/index.html` for the visual map of all modules.
