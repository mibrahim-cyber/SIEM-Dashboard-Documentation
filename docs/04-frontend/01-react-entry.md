﻿# React entry

`main.jsx` mounts the React tree; `App.jsx` wraps the providers and renders the active view.

`main.jsx` is tiny: it grabs the root node and renders `App`. `App.jsx` wraps everything in the `AuthProvider` and `SiemProvider`, shows the login screen until there's a session, then renders the dashboard shell. There's no router; the visible module is whichever component the current tab maps to. Putting the providers at the top means every view shares the same auth and SIEM state.

## Related material

- [System overview](../02-architecture/00-system-overview.md)
- [Guide index](../../guides/monitor/overview/INDEX.md)
