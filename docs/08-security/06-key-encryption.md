﻿# Key encryption

The one secret the app stores on a user's behalf is the set of threat-intel API keys, and those don't sit in the database in the clear. `server/crypto.js` encrypts them with AES before writing and decrypts only at the moment a lookup needs them. The encryption key lives in the environment, not in `siem.db`, so a copy of the database file on its own doesn't hand over the keys. It's defense in depth for the highest-value data the server keeps.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
