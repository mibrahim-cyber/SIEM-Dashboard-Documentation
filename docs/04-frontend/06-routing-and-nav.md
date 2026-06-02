﻿# Routing and nav

Navigation is tab state in `App.jsx`, not a router; the sidebar swaps which module renders.

There's no React Router here. `App.jsx` keeps an `activeTab` string in state (it starts on `overview`), and `handleNavigate` just sets it. The sidebar and the command palette both call that to change views, and a lookup table maps each tab id to its component and page title. For a single-window SOC console where shareable URLs aren't the point, this keeps navigation in one place and state in memory.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
