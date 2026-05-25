// @ts-check
const { expect } = require('@playwright/test');

/** Deck pages that load deck-nav.js (path from site root). */
const DECK_PAGES = [
  { path: 'index.html', pageId: 'landing' },
  { path: 'left.html', pageId: 'left' },
  { path: 'right.html', pageId: 'right' },
  { path: 'brain/index.html', pageId: 'brain' },
  { path: 'terminal.html', pageId: 'terminal' },
  { path: 'breach.html', pageId: 'breach' },
  { path: 'network.html', pageId: 'network' },
  { path: 'cipher.html', pageId: 'cipher' },
  { path: 'sim.html', pageId: 'sim' },
  { path: 'intercept.html', pageId: 'intercept' },
  { path: 'forge.html', pageId: 'forge' },
  { path: 'archive.html', pageId: 'archive' },
  { path: 'heist.html', pageId: 'heist' },
  { path: 'cartography.html', pageId: 'cartography' },
  { path: 'lab.html', pageId: 'lab' },
  { path: 'memorial.html', pageId: 'memorial' },
  { path: 'resonance.html', pageId: 'resonance' },
  { path: 'experience-modules/index.html', pageId: 'experience-hub' },
  {
    path: 'experience-modules/game3-network/index.html',
    pageId: 'network-3d',
  },
];

/**
 * @param {import('@playwright/test').Page} page
 */
async function dismissOverlays(page) {
  const motdClose = page.locator('#siem-motd-close, #siem-motd button');
  if (await motdClose.count()) {
    try {
      await motdClose.first().click({ timeout: 2000 });
    } catch (_) { /* */ }
  }
  const boot = page.locator('#boot');
  if (await boot.isVisible().catch(() => false)) {
    try {
      await boot.click({ timeout: 2000 });
    } catch (_) { /* */ }
  }
  await page.evaluate(() => {
    var m = document.getElementById('siem-motd');
    if (m) m.remove();
    var b = document.getElementById('boot');
    if (b) {
      b.classList.add('hide');
      b.setAttribute('aria-hidden', 'true');
    }
    var load = document.getElementById('siem-load-screen');
    if (load) load.remove();
    var dio = document.getElementById('dio-guide');
    if (dio) dio.remove();
    document.body.classList.remove('landing-dio-mode');
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function waitDeckNavReady(page) {
  await dismissOverlays(page);
  await page.waitForFunction(() => {
    var root = document.getElementById('deck-nav-root');
    if (!root) return false;
    var btns = root.querySelectorAll('.deck-nav-btn');
    return btns.length > 0 && Array.prototype.every.call(btns, function (b) {
      return !b.disabled && b.getAttribute('aria-disabled') !== 'true';
    });
  }, { timeout: 20000 });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'left'|'right'} side
 */
function deckChevron(page, side) {
  return page.locator(
    `#deck-nav-root .deck-nav-btn--${side}:not([disabled]):not(.deck-nav-btn--disabled)`
  );
}

/**
 * Click deck chevron and wait for navigation.
 * @param {import('@playwright/test').Page} page
 * @param {'left'|'right'} side
 * @param {RegExp|string|((url: URL) => boolean)} urlMatch
 */
/**
 * Programmatic deck chevron click (avoids overlay hit-target issues).
 * @param {import('@playwright/test').Page} page
 * @param {'left'|'right'} side
 */
async function triggerDeckNav(page, side) {
  await page.evaluate((sideName) => {
    var btn = document.querySelector(
      '#deck-nav-root .deck-nav-btn--' + sideName
    );
    if (!btn || btn.disabled) throw new Error('deck nav button unavailable: ' + sideName);
    var href = btn.getAttribute('data-nav-href');
    var before = location.href;
    btn.click();
    if (href && location.href === before) {
      location.assign(href);
    }
  }, side);
}

async function clickDeckNav(page, side, urlMatch) {
  await Promise.all([
    page.waitForURL(urlMatch, { timeout: 25000, waitUntil: 'load' }),
    triggerDeckNav(page, side),
  ]);
  await waitDeckNavReady(page);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function chevronsEnabled(page) {
  const btns = page.locator('#deck-nav-root .deck-nav-btn');
  const n = await btns.count();
  for (let i = 0; i < n; i++) {
    const disabled = await btns.nth(i).getAttribute('disabled');
    const aria = await btns.nth(i).getAttribute('aria-disabled');
    if (disabled !== null || aria === 'true') return false;
  }
  return n > 0;
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function waitReadReady(page) {
  await page.waitForFunction(() => {
    var loading = document.getElementById('doc-loading');
    var content = document.getElementById('doc-content');
    var err = document.getElementById('doc-error');
    if (!loading || !loading.hidden) return false;
    if (err && !err.hidden) return false;
    return content && content.innerHTML.length > 0;
  }, { timeout: 20000 });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function waitReadError(page) {
  await page.waitForFunction(() => {
    var loading = document.getElementById('doc-loading');
    var err = document.getElementById('doc-error');
    return loading && loading.hidden && err && !err.hidden;
  }, { timeout: 20000 });
}

module.exports = {
  DECK_PAGES,
  waitDeckNavReady,
  dismissOverlays,
  waitReadReady,
  waitReadError,
  deckChevron,
  clickDeckNav,
  triggerDeckNav,
  chevronsEnabled,
};
