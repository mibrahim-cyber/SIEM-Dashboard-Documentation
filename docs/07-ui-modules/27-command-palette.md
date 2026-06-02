﻿# Command palette

HABIBI-SIEM exposes this capability under **Global (keyboard)**. Command palette offers quick navigation and actions for power users without mouse traversal.

## What you see on screen

Modal search lists routes, simulate actions, and theme toggles depending on version. Keyboard shortcut opens palette.

## How data moves through the dashboard

Routes map to React router paths; actions invoke the same handlers as sidebar buttons.

## Day-to-day operator workflow

Teach keyboard-first triage in timed drills. Use palette to jump to Log Ingestion during parser troubleshooting.

## Edge cases and false trails

Palette actions respect same RBAC as buttons; denied actions should not appear or should error clearly. Focus trap issues can occur if modal left open.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Overview](../../guides/monitor/overview/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
