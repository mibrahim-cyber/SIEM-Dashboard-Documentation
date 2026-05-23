# CDN vendor fallbacks

If jsDelivr or unpkg CDNs fail, `assets/vendor/cdn-fallback.js` logs the failure.
Pages keep working via inline MVP logic; optional libraries degrade gracefully.

For fully offline deploys, download vendor bundles into this folder and swap script `src` paths.
