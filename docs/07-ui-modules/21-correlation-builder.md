﻿# Correlation builder

HABIBI-SIEM exposes this capability under **Configure → Correlation Builder**. Correlation builder lets you prototype multi-event patterns and STRIDE matrix views for advanced labs.

## What you see on screen

Pattern editor, test panel, and matrix tab show how categories interact. Custom rules may live in memory only.

## How data moves through the dashboard

Evaluated patterns supplement built-in incident clustering when enabled. Testing uses sample events without committing to production persistence.

## Day-to-day operator workflow

Test patterns against Simulate Campaign output before demo day. Use matrix view to explain defense coverage gaps to stakeholders.

## Edge cases and false trails

Unsaved custom rules disappear on refresh. Complex patterns can over-match small datasets and create giant incidents.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Correlation Builder](../../guides/configure/correlation-builder/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
