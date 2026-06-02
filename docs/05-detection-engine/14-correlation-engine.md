﻿# Correlation engine (stub)

Short pointer: full write-up in [15-correlation-engine.md](15-correlation-engine.md). Groups alerts by source IP within a 60-second window.

Correlation runs after the per-event rules. It takes the stream of individual alerts and groups the ones sharing a source IP inside a 60-second window, so one noisy attacker shows up as a single story instead of twenty separate rows. The worked example and the rest of the detail live in the full write-up.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
