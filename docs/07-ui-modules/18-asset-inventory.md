﻿# Asset inventory

HABIBI-SIEM exposes this capability under **Infrastructure → Asset Inventory**. Asset inventory lists hosts, owners, criticality, and lifecycle state for tying alerts back to business context.

## What you see on screen

Table and detail panes show hostname, IP, role tags, and last seen alert time when available.

## How data moves through the dashboard

Assets can be seeded; alert source IPs may auto-link when strings match. No CMDB sync is required for class use.

## Day-to-day operator workflow

Mark crown-jewel assets before running ransomware-themed campaigns. Use mismatched names to teach why CMDB hygiene matters.

## Edge cases and false trails

Stale last-seen times mean no recent alerts referencing that hostname string. Manual assets without alerts still appear for process drills.

## Links to deeper walkthroughs

Operators who need click-by-click screenshots and field-by-field explanations should start at the module guide index below. Architecture and security topics (sessions, CSRF, RBAC) live in the docs tree and apply across modules.

## Related guides

- Module guide index: [Asset Inventory](../../guides/infrastructure/asset-inventory/INDEX.md)
- Platform context: [System overview](../02-architecture/00-system-overview.md)
