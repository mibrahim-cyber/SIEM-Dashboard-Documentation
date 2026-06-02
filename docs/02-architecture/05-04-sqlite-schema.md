﻿# SQLite schema

Tables in `data/siem.db`: users, alerts, audit log, watchlist, threat API keys.

better-sqlite3 opens the file synchronously, which fits a single-node lab where every query runs in-process and there's no network round trip to a database server. The users table holds the bcrypt hash and role; alerts record the rule that fired, the severity, the source IP, and a timestamp; the audit log captures who did what on the write routes. Watchlist rows feed the SOAR auto-block checks, and the threat-key table keeps the AbuseIPDB and VirusTotal keys on the server so they never reach the browser. Sessions live in their own table managed by connect-sqlite3.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
