﻿# Alert dedupe logic

How `DetectionEngine` suppresses repeat alerts for the same rule and source within a cooldown window.

Dedup runs before an alert is kept. The engine checks the recent alerts in `engineRef.current.alerts` for the same source IP and rule id within the last 30 seconds, and if it finds one it drops the new alert rather than adding a duplicate. That stops a single scanner hammering one endpoint from filling the feed with hundreds of identical rows a second. It's separate from correlation: dedup removes exact repeats, correlation groups different alerts that happen to share an IP.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/configure/rules-engine/INDEX.md)
