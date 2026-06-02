﻿# App shell

Sidebar layout, module chrome, and header controls shared across views.

The shell in `App.jsx` holds the collapsible sidebar, the top bar with the page title and quick actions, and the slot where the active module renders. The sidebar lists the modules in groups; clicking one sets `activeTab`, which swaps the component shown in the main area. Because the chrome stays mounted while only the inner view changes, switching modules is instant and leaves scroll position and state where the user left them.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
