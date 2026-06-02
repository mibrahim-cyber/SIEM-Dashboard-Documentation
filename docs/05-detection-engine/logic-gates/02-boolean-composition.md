﻿# Boolean composition; how rule checks combine

Most rules are a single condition, but some need more than one signal before they fire. Those join their checks with plain boolean logic: AND when every condition has to hold, OR when any one is enough. Keeping the composition explicit means you can read a rule and know exactly what makes it trigger, which matters when you're explaining a false positive or tightening a noisy rule.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
