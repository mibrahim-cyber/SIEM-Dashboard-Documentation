﻿# Styling system

Tailwind config, dark SOC palette, severity colour tokens, shared layout utilities.

Styling is Tailwind plus a set of CSS custom properties for the things Tailwind shouldn't own, like the severity colours and the surface shades. Severity maps to fixed tokens for critical, high, medium, and low, so an alert reads the same wherever it shows up. Layout leans on a few shared utility classes for the card and panel chrome. Holding the palette in variables means the whole theme shifts from one place.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
