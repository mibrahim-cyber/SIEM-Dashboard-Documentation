﻿# Server RBAC: roles and permissions

There are five roles: tier1 is read-only, tier2 can write, tier3 can write and administer, manager has full access, and auditor can only export. The check runs on the server against the role stored in the session, so editing a request in the browser can't hand someone extra rights. Each write route names the capability it needs, such as `canWrite` or `canAdmin`, and the middleware turns away anything the current role doesn't carry. Read routes stay open to any signed-in user.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/log-ingestion/04-validate-endpoint.md)
