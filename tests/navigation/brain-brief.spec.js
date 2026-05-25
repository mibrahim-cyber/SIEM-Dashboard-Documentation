// @ts-check
const { test, expect } = require('@playwright/test');
const { dismissOverlays } = require('./helpers');

test.describe('Brain map brief navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      try {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          regs.forEach(function (r) { r.unregister(); });
        });
      } catch (_) { /* */ }
    });
    await page.goto('/brain/index.html');
    await dismissOverlays(page);
    await page.waitForFunction(
      () => window.siemDeck && window.siemDeck.briefsLoaded === true,
      null,
      { timeout: 60000 }
    );
  });

  test('navigateToModule opens brief for Alert Manager', async ({ page }) => {
    await page.evaluate(() => {
      window.siemDeck.navigateToModule('Alert Manager');
    });
    await expect(page.locator('#deck-brief.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#deck-brief-title')).toContainText('Alert Manager');
  });

  test('deck-brief-go href points to read.html with md path', async ({ page }) => {
    await page.evaluate(() => {
      window.siemDeck.navigateToModule('Alert Manager');
    });
    await expect(page.locator('#deck-brief.on')).toBeVisible({ timeout: 10000 });
    const href = await page.locator('#deck-brief-go').getAttribute('href');
    expect(href).toMatch(/read\.html/);
    expect(href).toMatch(/\.md/);
  });

  test('related module button updates brief title', async ({ page }) => {
    await page.evaluate(() => {
      window.siemDeck.navigateToModule('Alert Manager');
    });
    await expect(page.locator('#deck-brief.on')).toBeVisible({ timeout: 10000 });
    const relatedBtn = page.locator('#deck-brief-related-list button').first();
    if ((await relatedBtn.count()) === 0) test.skip();
    const relatedLabel = (await relatedBtn.textContent()) || '';
    await relatedBtn.click();
    await expect(page.locator('#deck-brief-title')).toContainText(relatedLabel.trim());
  });

  test('rapid module switches show latest title', async ({ page }) => {
    const labels = ['Dashboard', 'Alert Manager', 'DetectionEngine'];
    for (const label of labels) {
      await page.evaluate((l) => {
        window.siemDeck.navigateToModule(l);
      }, label);
      await page.waitForTimeout(300);
    }
    await expect(page.locator('#deck-brief-title')).toContainText('DetectionEngine');
  });

  test('experience orbit tile loads game module', async ({ page }) => {
    const tile = page.locator('#deck-experience-orbit a').first();
    await expect(tile).toBeVisible({ timeout: 10000 });
    const href = await tile.getAttribute('href');
    expect(href).toMatch(/experience-modules/);
    await page.goto(href);
    await page.waitForURL(/experience-modules/, { timeout: 20000 });
  });
});
