// @ts-check
const { test, expect } = require('@playwright/test');
const {
  DECK_PAGES,
  waitDeckNavReady,
  deckChevron,
  triggerDeckNav,
  chevronsEnabled,
} = require('./helpers');

test.describe('Deck wing navigation', () => {
  for (const entry of DECK_PAGES) {
    test(`single right hop from ${entry.pageId}`, async ({ page }) => {
      await page.goto(`/${entry.path}`);
      await waitDeckNavReady(page);
      const right = deckChevron(page, 'right');
      if ((await right.count()) === 0) return;
      const before = page.url();
      await Promise.all([
        page.waitForURL((url) => url.href !== before, {
          timeout: 25000,
          waitUntil: 'load',
        }),
        triggerDeckNav(page, 'right'),
      ]);
      await waitDeckNavReady(page);
      await expect(page.locator('html')).toHaveAttribute('data-deck-page', /.+/);
      expect(await chevronsEnabled(page)).toBeTruthy();
    });
  }

  test('landing: right then left returns to landing', async ({ page }) => {
    await page.goto('/index.html');
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/\/brain(\/|$)/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'right'),
    ]);
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/\/left(\.html)?/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'left'),
    ]);
    await expect(page.locator('html')).toHaveAttribute('data-deck-page', 'left');
  });

  test('terminal: left from first experience goes to hub', async ({ page }) => {
    await page.goto('/terminal.html');
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/\/brain(\/|$)/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'left'),
    ]);
    await expect(page.locator('html')).toHaveAttribute('data-deck-page', 'brain');
  });

  test('resonance: right from last experience goes to hub', async ({ page }) => {
    await page.goto('/resonance.html');
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/\/brain(\/|$)/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'right'),
    ]);
  });

  test('rapid right clicks do not leave chevrons disabled', async ({ page }) => {
    await page.goto('/cipher.html');
    await waitDeckNavReady(page);
    const right = deckChevron(page, 'right');
    await right.click({ clickCount: 3, delay: 50, force: true });
    await page.waitForTimeout(1500);
    if (page.url().includes('cipher.html')) {
      expect(await chevronsEnabled(page)).toBeTruthy();
      await expect(page.locator('#deck-nav-wipe.active')).toHaveCount(0);
    }
  });

  test('nested game3d: right hop resolves without 404', async ({ page }) => {
    await page.goto('/experience-modules/game3-network/index.html');
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/game4-cipher/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'right'),
    ]);
    await expect(page.locator('html')).toHaveAttribute('data-deck-page', 'cipher-3d');
  });

  test('browser back restores working chevrons', async ({ page }) => {
    await page.goto('/sim.html');
    await waitDeckNavReady(page);
    await Promise.all([
      page.waitForURL(/intercept/, { timeout: 25000, waitUntil: 'load' }),
      triggerDeckNav(page, 'right'),
    ]);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/sim(\.html)?/, { timeout: 25000 });
    await page.waitForTimeout(300);
    await waitDeckNavReady(page);
    expect(await chevronsEnabled(page)).toBeTruthy();
  });
});
