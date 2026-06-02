﻿# MITRE mapping

Alongside STRIDE, each rule points at a MITRE ATT&CK technique, so an alert says not just what tripped but where it sits in an attacker's playbook. sql-injection maps to T1190, exploiting a public-facing application; brute-force lands under credential access; priv-esc under privilege escalation. The MITRE Matrix view reads these mappings to light up the techniques the current alerts touch. It keeps the rules grounded in a shared vocabulary instead of ad-hoc labels.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
