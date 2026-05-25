// @ts-check
const { test, expect } = require('@playwright/test');
const {
  waitDeckNavReady,
  deckChevron,
  chevronsEnabled,
  dismissOverlays,
  waitReadReady,
} = require('./helpers');

test.describe('Navigation stress', () => {
  test('rapid L-R-L within debounce window', async ({ page }) => {
    await page.goto('/forge.html');
    await waitDeckNavReady(page);
    const url0 = page.url();
    const right = deckChevron(page, 'right');
    const left = deckChevron(page, 'left');
    if ((await right.count()) === 0) return;
    await right.click({ force: true });
    await left.click({ force: true, delay: 100 });
    await page.waitForTimeout(2000);
    expect(page.url()).toBeTruthy();
    if (page.url().includes('forge.html')) {
      expect(await chevronsEnabled(page)).toBeTruthy();
    }
  });

  test('reload after navigation clears wipe layer', async ({ page }) => {
    await page.goto('/lab.html');
    await waitDeckNavReady(page);
    await deckChevron(page, 'right').click({ force: true });
    await page.waitForTimeout(300);
    await page.reload();
    await waitDeckNavReady(page);
    await expect(page.locator('#deck-nav-wipe.active')).toHaveCount(0);
    expect(await chevronsEnabled(page)).toBeTruthy();
  });

  test('palette from brain reaches landing', async ({ page }) => {
    await page.goto('/brain/index.html');
    await dismissOverlays(page);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+k');
    await expect(page.locator('#siem-palette-overlay.siem-palette--open')).toBeVisible({
      timeout: 5000,
    });
    const item = page.locator('.siem-palette-item-label', { hasText: 'Approach Vector' });
    await item.first().click();
    await page.waitForURL(
      (url) => url.pathname === '/' || /index\.html$/.test(url.pathname),
      { timeout: 20000, waitUntil: 'commit' }
    );
  });

  test('palette from nested game reaches Observation Deck', async ({ page }) => {
    await page.goto('/experience-modules/game2-breach/index.html');
    await waitDeckNavReady(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('#siem-palette-overlay.siem-palette--open')).toBeVisible({
      timeout: 5000,
    });
    const item = page.locator('.siem-palette-item-label', { hasText: 'Observation Deck' });
    await item.first().click();
    await page.waitForURL(/brain/, { timeout: 20000 });
  });

  test('read pager double-click settles on valid doc', async ({ page }) => {
    await page.goto(
      '/read.html#doc=' +
        encodeURIComponent('guides/monitor/overview/01-how-to-use.md')
    );
    await dismissOverlays(page);
    await waitReadReady(page);
    const next = page.locator('.pager-link.next:not(.disabled)');
    if ((await next.count()) === 0) return;
    await next.dblclick();
    await page.waitForLoadState('load');
    await waitReadReady(page);
    await expect(page.locator('#doc-error')).toBeHidden();
    await expect(page.locator('#doc-path')).toContainText(/\.md$/);
  });
});
