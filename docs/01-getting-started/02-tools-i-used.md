﻿# Operator toolchain

The stack stays small on purpose so it runs on one laptop with no extra services to stand up. The frontend is React built with Vite; the backend is Node and Express, with better-sqlite3 for storage and express-session for auth. bcrypt hashes passwords and connect-sqlite3 persists sessions into the same database file. Threat enrichment calls the AbuseIPDB and VirusTotal APIs through a local cache, and geolocation comes from MaxMind's GeoLite2 city database. Playwright drives the end-to-end tests.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
