﻿# Backup SIEM DB

Because everything lives in one SQLite file, a backup is just a copy of `data/siem.db`. The safe way is SQLite's online backup, or copying the file while the server is stopped, so you don't catch it mid-write. That single file carries the users, alerts, audit log, and watchlist, so one copy restores the whole state. Keep the copy out of the web root and out of the repo.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/pipeline-health/INDEX.md)
