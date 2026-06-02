﻿# Server crypto

`server/crypto.js`: AES helpers for encrypting threat API keys stored in the database.

The threat API keys don't sit in plaintext in `siem.db`. `server/crypto.js` encrypts them with AES before they're written and decrypts them only when a lookup needs to make a call. The encryption key comes from the environment, not the database, so a leaked DB file on its own doesn't expose the keys. They're the one secret the server holds that an outside party would actually want, which is why they get this extra layer.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
