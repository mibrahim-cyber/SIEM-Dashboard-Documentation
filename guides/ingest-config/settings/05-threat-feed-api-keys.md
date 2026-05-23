---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Threat feed API key management
last_updated: 2026-05-23
---

# Threat feed API key management

**Part of:** Ingest & Config → Settings
**One-sentence focus:** AbuseIPDB and VirusTotal key storage, masking, test, and save workflows.

### What you are looking at

Admin-capable users see THREAT INTELLIGENCE (SERVER-SIDE), a card containing two rows: AbuseIPDB API Key and VirusTotal API Key. Each row uses `MaskedInput`: a password-style field (toggle **SHOW** / **HIDE**), placeholder Stored on server only…, and a hint badge **CONFIGURED** or not set driven by `threatConfigured` state from the server's `configured` object. Below each field sits **TEST CONNECTION** (shows TESTING… while in flight) and inline result text: green success text message or orange failure text reason. A full-width primary button reads **SAVE API KEYS**, flipping to **SAVED TO SERVER** for two seconds after successful PUT. Non-admin users never see this card, the section is wrapped in `{canAdmin && (...)}`. There is no field for Shodan, OTX, or custom feeds in Settings; only these two vendors are wired in threat lookup service.

### What is happening underneath

On mount when `canAdmin` is true, `api.getThreatSettings()` hits `GET /api/admin/settings/threat`. Server `getThreatKeys()` merges env vars and decrypted SQLite settings, then returns masked strings (`••••••••` + last four chars) plus `configured: { abuseipdb, virustotal }`. Client pre-fills inputs when values start with `••` so operators see partial confirmation without plaintext.

**SAVE API KEYS** calls `saveKeys()`:

```javascript
await api.saveThreatSettings({
 abuseipdb: abuseKey.startsWith('••') ? undefined: abuseKey,
 virustotal: vtKey.startsWith('••') ? undefined: vtKey,
});
```
Server PUT `/api/admin/settings/threat` writes only defined non-mask strings via `setSetting('abuseipdb_key',...)` / `setSetting('virustotal_key',...)`, encrypting values, then audits `THREAT_KEYS_UPDATED`. Undefined fields preserve existing secrets.

**TEST CONNECTION** posts to `/api/threat/test/abuseipdb` or `/api/threat/test/virustotal` with CSRF + admin permission. `testAbuseIPDB()` queries AbuseIPDB check API for `8.8.8.8`; `testVirusTotal()` queries VT v3 IP endpoint for `8.8.8.8`. Results audit as `THREAT_TEST` with provider name and message. Runtime lookups for SOC automation use `checkAbuseIPDB()` via `/api/threat/ip/:ip` from `soarCheckIp` in the SIEM context pipeline, not from Settings directly. Daily quota: `THREAT_DAILY_LIMIT` env (default 500) counts lookups in threat lookup service; tests count toward quota. Cache TTL 60s per IP for AbuseIPDB responses.

### Why this matters

Threat keys open up automated SOAR reputation checks on high/critical external alerts. Without AbuseIPDB configured, `checkAbuseIPDB` returns not configured on server and auto-watchlist logic skips meaningful scores; Settings is the operational onboarding step after deployment. Keeping keys server-side prevents leakage via browser devtools and allows rotation in one DB location rather than every analyst laptop. Test-before-save validates network egress and key validity before campaigns, reducing false confidence from typos. Masked display supports confirmation without exposing full secrets on shoulder-surfed NOC screens.

### Step-by-step walkthrough

1. Log in as `manager` or tier3 user with admin rights.
2. Open Settings → THREAT INTELLIGENCE (SERVER-SIDE).
3. Paste AbuseIPDB key into first field (or leave masked if already configured).
4. Click **TEST CONNECTION** beside AbuseIPDB; wait for a successful AbuseIPDB connection message or an error.
5. Repeat for VirusTotal key and its test button.
6. Click **SAVE API KEYS** once both fields are correct; confirm **SAVED TO SERVER** flash.
7. Navigate to Respond → SOAR Console or trigger high-severity alert; verify `IP_LOOKUP` SOAR entries succeed.
8. Optional: set keys via env vars instead and confirm UI still shows **CONFIGURED** on reload.

### Common questions

#### Do I need both keys?

No. AbuseIPDB drives IP reputation for SOAR auto-watchlist; VirusTotal is optional secondary testing. Each configures independently.

#### Will saving empty strings delete keys?

Empty plaintext saves are skipped server-side: only non-empty strings that do not start with `••` update settings.

#### Why test against 8.8.8.8?

Hardcoded benign Google DNS IP in `testAbuseIPDB` / `testVirusTotal`. standard practice to verify API reachability without querying malicious indicators.

#### Can tier 2 analysts test connections without seeing keys?

No. Test endpoints require admin permission same as save.

#### Where do keys appear in audit log?

`THREAT_KEYS_UPDATED` on save; `THREAT_TEST` with provider and message on each test, view via `GET /api/audit` (admin API, no Settings UI panel yet).

### Operational use during containment

Before a red-team exercise, the SOC manager enters keys, tests both providers, saves, then runs Simulate Campaign; confirming SOAR auto-scoring fires. During live incidents, analysts do not revisit Settings; they rely on SOAR Console lookups proxied through stored keys. If lookups fail with HTTP 502, on-call admin reopens Settings, runs **TEST CONNECTION**, and rotates keys if vendor revoked them. Threat intel outage does not stop alert ingestion: only enrichment and auto-watchlist thresholds.

### Edge cases and gotchas

`setThreatConfigured` after save uses `Boolean(abuseKey)` on client strings. Masked `••••` values count as configured even if save sent undefined for unchanged fields. VT and AbuseIPDB rate limits return HTTP errors surfaced in test messages. Keys in `.env` override DB, UI saves may appear ignored if env takes precedence. No key versioning or rollback UI; restore from DB backup if wrong key saved. VirusTotal test uses v3 API: legacy v2 keys fail.

> **Technical note:** Encryption uses `SESSION_SECRET`; rotating secret without re-encrypting settings rows breaks key decryption. Plan secret rotation carefully.
