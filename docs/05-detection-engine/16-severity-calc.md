﻿# Severity calculation

Severity assignment: rule default, MITRE tier weighting, and escalation when multiple rules fire.

Each rule carries a default severity, so sql-injection, data-exfil, and priv-esc start at critical while rapid-requests or unusual-port start at medium. When more than one rule matches the same event, the highest severity wins instead of stacking, and that winning rule is what the alert gets labelled with. The MITRE tier feeds the weighting, so techniques deeper in an attack carry more. The aim is a stable, explainable level an analyst can trust, not an opaque score.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
