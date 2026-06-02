﻿# Time-window rules; counting events in δt

Some detections only make sense over time. Brute-force isn't one failed login, it's many from the same source inside a short interval, so the rule counts events in a rolling window and fires when the count crosses a threshold. Rapid-requests works the same way against request volume. The window has to be wide enough to catch the pattern but tight enough that a normal burst doesn't trip it.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
