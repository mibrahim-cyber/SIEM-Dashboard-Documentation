﻿# Stateful vs stateless rules

Stateless rules judge one event on its own, like sql-injection spotting a bad payload in a single request. Stateful rules need memory of what came before, like brute-force counting failures or correlation grouping by IP. The split matters for performance and testing: a stateless rule is trivial to replay against a sample, while a stateful one depends on the order and timing of the events feeding it.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
