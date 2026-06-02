﻿# Props and state patterns

HABIBI-SIEM UI modules share implementation patterns documented here for coursework extensions.

## Purpose

Shared UI modules rely on props for presentation and local state for ephemeral filters. Long-lived security data (alerts, incidents, rules) lives in the central SIEM context provider so sibling views stay synchronized without prop drilling across the entire tree.

## Runtime behavior

When a child view updates alert status, it calls context mutators that optimistically adjust UI then confirm with API responses. Failed writes roll back or show error toasts depending on module.

## Operator and developer notes

Document which fields are controlled vs uncontrolled when writing custom coursework extensions. Misplaced state causes Overview and Alert Manager to disagree until refresh.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Siem context pipeline](../04-frontend/04-siem-context-pipeline.md)
- [UI modules overview](../07-ui-modules/01-dashboard.md)
