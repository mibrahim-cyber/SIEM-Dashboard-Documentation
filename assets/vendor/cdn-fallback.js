/**
 * CDN fallback — logs failed script loads; pages remain functional with inline logic.
 */
(function () {
  'use strict';
  var failed = [];
  document.querySelectorAll('script[src*="cdn.jsdelivr"],script[src*="unpkg"],script[src*="esm.sh"]').forEach(function (el) {
    el.addEventListener('error', function () {
      failed.push(el.src);
      console.warn('[siem-cdn-fallback] CDN unavailable:', el.src);
    });
  });
  window.siemCdnFallback = { failed: failed };
})();
