﻿# RBAC design

Access control is enforced on the server, never in the browser. The five roles run from tier1 (read-only) up through tier2 and tier3 to manager (full) and auditor (export-only), and the middleware reads the role out of the session before a handler runs. A write route declares the capability it needs, like `canWrite` or `canAdmin`, and anything short of that gets a 403. Because the check never trusts a client-supplied role, editing the request body can't escalate privileges. Those deny paths are part of what the pentest plan retests.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
