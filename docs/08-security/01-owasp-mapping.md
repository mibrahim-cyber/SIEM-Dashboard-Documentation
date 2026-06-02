﻿# OWASP top 10 mapping

The build is checked against the OWASP Top 10 instead of a vague "is it secure" question. Broken access control is answered by server-side RBAC, injection by whitelist validation and parameterized queries, and identification failures by bcrypt hashing with session regeneration on login. Security misconfiguration is covered by Helmet headers and a production CSP. The mapping doubles as the rubric the pentest prep tests against.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/ingest-config/settings/INDEX.md)
