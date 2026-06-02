﻿# Hooks used across views

HABIBI-SIEM UI modules share implementation patterns documented here for coursework extensions.

## Purpose

Effects load initial alert lists on mount and subscribe to polling intervals where auto-refresh is enabled. Memoization guards expensive graph and heatmap calculations when alert arrays are large.

## Runtime behavior

Custom hooks may wrap fetch helpers that attach CSRF headers automatically. Authentication context supplies role gates for conditional render of SOAR buttons.

## Operator and developer notes

Avoid duplicate fetch on strict mode double mount by relying on context cache when possible. Clearing intervals on unmount prevents memory leaks during long lab days.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Siem context pipeline](../04-frontend/04-siem-context-pipeline.md)
- [UI modules overview](../07-ui-modules/01-dashboard.md)
