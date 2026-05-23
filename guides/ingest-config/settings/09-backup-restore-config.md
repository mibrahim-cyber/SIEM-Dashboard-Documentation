---
module: Settings
sidebar: Ingest & Config → Settings
section: Ingest & Config
subsection: Backup and restore of configuration
last_updated: 2026-05-23
---

# Backup and restore of configuration

**Part of:** Ingest & Config → Settings
**One-sentence focus:** Backing up siem.db, environment secrets, and MaxMind files with no restore UI.

### What you are looking at

Settings exposes minimal backup affordances, no Export Configuration or Restore from File buttons. The closest hints are the **DATA MANAGEMENT** footnote naming **`data/siem.db`**, the watchlisted IP counter (data surviving alert clears), and **ABOUT** text referencing SQLite persistence. Operators looking for one-click disaster recovery will not find it here; this section documents what must be done off-console. Geolocation status (**ACTIVE**, **SERVER UP**, **OFFLINE**) indirectly signals whether auxiliary MaxMind files exist beside the database, another non-DB dependency backup teams should capture. Threat keys display as configured but never export from UI, backup strategy must include DB file or env var documentation out-of-band.

### What is happening underneath

SQLite path resolves in the database layer:

```javascript
const DB_PATH = process.env.SIEM_DB_PATH || path.join(__dirname, '../data/siem.db');
```
Directory created on boot with WAL journal mode and foreign keys on. Tables: `users`, `alerts`, `watchlist`, `cases`, `soar_log`, `audit_log`, `settings` (encrypted API keys), `user_prefs` (unused in UI). Server state bootstrap `GET /api/state` reloads alerts, watchlist, cases, SOAR log on login; client merges into React.

### Why this matters

Ransomware playbooks and cloud migration both require knowing the single file that holds your SOC history. Settings users click destructive buttons: without backup culture, `ALERTS_CLEARED` becomes permanent evidence loss. Encrypted threat keys tie to `SESSION_SECRET`. restoring DB to host with wrong secret yields decrypt failures silently until TEST CONNECTION fails. Documenting no UI restore sets correct expectations for IT: this is operator-run file copy, not SaaS point-in-time recovery.

### Step-by-step walkthrough

1. Identify DB path: default `the SQLite database file` relative to server package.
2. Stop the SIEM Node server gracefully.
3. Copy `siem.db` to secure backup storage (`cp`, VSS, volume snapshot).
4. Export `.env` secrets via password manager, never commit to git.
5. Copy MaxMind `.mmdb` files if geo enrichment is mandatory.
6. Document client preferences separately; they are not in DB.
7. To restore: stop server, replace DB file, verify permissions, start server.
8. Log in as manager; open Settings → test threat connections; verify watchlist count and roles.

### Common questions

#### Can I restore only alerts without users?

SQLite selective table restore requires manual SQL attach/import: no wizard.

#### Does SIGN OUT affect backup?

No. Sessions are not stored in SQLite persistently beyond session store default (memory/Redis not used. MemoryStore in dev).

#### What about `dist/` frontend build?

Redeploy from source control; user data is server DB only in standard deployment.

#### Will backup include plaintext API keys?

Keys in DB are encrypted; env vars in backup `.env` may be plaintext, protect accordingly.

#### How to clone prod to lab?

Copy `siem.db` + `.env` with redacted keys; rotate secrets in lab; re-seed passwords if hashes copied.

### Analyst workflow under pressure

Before **CLEAR ALL ALERTS** post-exercise, manager triggers VM snapshot or copies `siem.db` to evidence share; Settings footnote is the reminder. During ransomware scare, IR team prioritises exfiltrating `siem.db` and audit table before wiping hosts. Compliance auditor asks where config lives: Settings ABOUT + DATA MANAGEMENT text guides them to filesystem not browser export. Shift handoff does not include backup. Operations runbook owns scheduled copies.

### Edge cases and gotchas

WAL mode creates `siem.db-wal` / `-shm`, copy all three files or checkpoint WAL before hot copy for consistency. Running backup while server writes risks partial state; prefer stop or `.backup` command. `user_prefs` empty means no sound/dedupe restore ever. Default dev users re-seed only on empty `users` table: restoring empty DB re-triggers seed warnings. Large alert volume grows DB unbounded. Monitor disk. No UI validation after restore, manual smoke test via Settings geo + threat test recommended.

> **Technical note:** Production static files served from `dist/` via Express; development uses Vite on 5173 proxying API; backup scope unchanged.

### Backup scope for full SOC restore:

1. **`siem.db`** (or custom `SIEM_DB_PATH`): authoritative for alerts, watchlist, cases, audit, encrypted settings keys, users/password hashes.
2. **`.env` / environment**. `SESSION_SECRET` (required to decrypt `_key` settings), `ABUSEIPDB_API_KEY`, `VIRUSTOTAL_API_KEY`, `SIEM_DB_PATH`, `PORT`, `HOST`, `CORS_ORIGIN`, `THREAT_DAILY_LIMIT`.
3. MaxMind GeoLite2 files, referenced by geo lookup service; without them geo status shows database missing.
4. Not in DB: client `soundEnabled`, `dedupeEnabled`, React incident notes, IOC watchlist in memory (`iocWatchlist` state); ephemeral.

### Restore procedure (operational, no UI):

1. Stop Express server (`npm` process on port 3001 default).
2. Copy backup `siem.db` into `data/` or set `SIEM_DB_PATH` to backup path.
3. Ensure `SESSION_SECRET` matches encryption epoch used when keys were saved: or re-enter API keys via Settings after restore with new secret.
4. Restart server; users re-login; sessions invalidated (new session cookies).
5. Verify geo DB files if maps required.

**CLEAR ALL ALERTS** is not backup. It deletes alert rows irreversibly without archive. Prefer filesystem snapshot or `sqlite3.backup` before exercises. No automated scheduler ships with HABIBI-SIEM, cron/Task Scheduler external.
