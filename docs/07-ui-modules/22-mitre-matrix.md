﻿# MITRE ATT&CK matrix

HABIBI-SIEM exposes this capability under **Configure → MITRE Matrix**. Matrix maps enabled detection rules to ATT&CK techniques for coverage conversations.

## What you see on screen

Heat-coloured cells by tactic column; hover shows technique names tied to rules that fired or are available.

## How data moves through the dashboard

Mapping comes from rule metadata bundled with detection definitions. Hits increase emphasis on cells linked to active rules.

## Day-to-day operator workflow

Use in executive briefings to show detection gaps when entire columns stay pale. Enable more rules before claiming full coverage.

## Edge cases and false trails

Matrix shows rule intent, not live attacker technique confirmation. Disabled rules still appear as available but not firing.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Rules Engine](../../guides/configure/rules-engine/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
