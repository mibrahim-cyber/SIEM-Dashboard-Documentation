﻿# False positive tuning

A rule that cries wolf gets ignored, so tuning is part of writing one. The usual levers are narrowing what a rule matches, leaning on dedup to collapse repeats, raising a time-window threshold, or scoping a noisy rule to the right log source. sql-injection is the classic example: an internal app with apostrophes in its query strings can spike hits, so you tune it rather than turn it off. None of this replaces fixing the underlying issue in the application.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
