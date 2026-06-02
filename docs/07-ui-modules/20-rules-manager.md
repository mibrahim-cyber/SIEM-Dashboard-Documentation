﻿# Rules manager

HABIBI-SIEM exposes this capability under **Configure → Rules Engine**. Rules manager toggles detections, shows hit counts, and exposes MITRE mapping for each bundled rule.

## What you see on screen

Cards per rule show severity, category, description, MITRE technique, enable switch, and hit bar share.

## How data moves through the dashboard

Detection engine evaluates enabled rules on each ingested event batch. Disabling a rule stops new matches immediately; hits reset on full reload in teaching builds.

## Day-to-day operator workflow

Disable noisy rules during parser debugging, then re-enable systematically. Read MITRE blocks before mapping to ATT&CK matrix view.

## Edge cases and false trails

Toggle state may not persist to database; document enabled set in lab notes. Hit percentages divide by total hits; one dominant rule skews bars.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Rules Engine](../../guides/configure/rules-engine/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
