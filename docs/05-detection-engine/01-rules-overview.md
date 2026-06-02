﻿# Detection rules overview

The engine ships with ten rules, each tied to a STRIDE category and a MITRE technique. Three are critical (sql-injection, data-exfil, priv-esc), four are high (brute-force, xss, file-tampering, off-hours), and three are medium (rapid-requests, unusual-port, sensitive-path). Each rule is a small, self-contained check that reads normalized event fields and returns a match or nothing. The per-rule pages cover what each one fires on and how to tune it.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
