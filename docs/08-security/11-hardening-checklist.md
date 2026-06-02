﻿# Hardening checklist

This is the short list to run before treating a deploy as safe: secrets set in the environment and validated at startup, demo accounts rotated or removed, the production CSP and Helmet headers on, rate limits active, and the database file backed up and kept out of the web root. It also covers reconfirming the RBAC deny paths and CSRF enforcement with a quick retest after any middleware change. It's meant to be boring and repeatable, which is the whole point of a checklist.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
