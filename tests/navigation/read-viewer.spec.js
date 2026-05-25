// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { waitReadReady, waitReadError, dismissOverlays } = require('./helpers');

const manifestPath = path.join(
  __dirname,
  '../../assets/guides-manifest.json'
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

test.describe('read.html doc viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/read.html');
    await dismissOverlays(page);
  });

  test('default load shows content', async ({ page }) => {
    await waitReadReady(page);
    await expect(page.locator('#doc-error')).toBeHidden();
  });

  test('?doc= loads guide page (primary param)', async ({ page }) => {
    const target = 'guides/monitor/overview/01-how-to-use.md';
    await page.goto('/read.html#doc=' + encodeURIComponent(target));
    await waitReadReady(page);
    await expect(page.locator('#doc-path')).toContainText('01-how-to-use.md');
    await expect(page.locator('#doc-content h1')).toBeVisible();
  });


  test('?doc= loads architecture overview', async ({ page }) => {
    await page.goto(
      '/read.html#doc=' +
        encodeURIComponent('docs/02-architecture/00-system-overview.md')
    );
    await waitReadReady(page);
    await expect(page.locator('#doc-path')).toContainText('00-system-overview.md');
  });

  test('invalid path shows error panel', async ({ page }) => {
    await page.goto(
      '/read.html#doc=' + encodeURIComponent('does/not/exist.md')
    );
    await waitReadError(page);
    await expect(page.locator('#doc-error h2')).toContainText(
      /not available/i
    );
  });

  test('pager walks monitor/overview section in order', async ({ page }) => {
    const section = manifest.sections['monitor/overview'];
    const first = section.pages[0].file;
    await page.goto(
      '/read.html#doc=' +
        encodeURIComponent('guides/monitor/overview/' + first)
    );
    await dismissOverlays(page);
    await waitReadReady(page);

    for (let i = 1; i < section.pages.length; i++) {
      const nextFile = section.pages[i].file;
      await dismissOverlays(page);
      const nextLink = page.locator('.pager-link.next:not(.disabled)');
      await expect(nextLink).toBeVisible();
      const href = await nextLink.getAttribute('href');
      if (href && href.indexOf('#doc=') !== -1) {
        await page.goto(href);
      } else {
        await nextLink.click({ force: true });
      }
      await page.waitForFunction(
        (file) => decodeURIComponent(location.hash).indexOf(file) !== -1,
        nextFile,
        { timeout: 15000 }
      );
      await waitReadReady(page);
      await expect(page.locator('#doc-path')).toContainText(nextFile);
    }
  });

  test('disabled prev at section start does not navigate', async ({ page }) => {
    await page.goto(
      '/read.html#doc=' +
        encodeURIComponent('guides/monitor/overview/01-how-to-use.md')
    );
    await waitReadReady(page);
    const prev = page.locator('.pager-link.prev.disabled');
    await expect(prev).toBeVisible();
    const urlBefore = page.url();
    await prev.click({ force: true });
    expect(page.url()).toBe(urlBefore);
  });

  test('topbar links reach landing and brain', async ({ page }) => {
    await waitReadReady(page);
    await Promise.all([
      page.waitForURL(
        (url) => /\/(index\.html)?$/.test(url.pathname) || url.pathname === '/',
        { timeout: 25000, waitUntil: 'commit' }
      ),
      page.locator('.topbar a[data-nav="landing"]').click({ force: true }),
    ]);
    await page.goto('/read.html');
    await dismissOverlays(page);
    await waitReadReady(page);
    await Promise.all([
      page.waitForURL(/brain/, { timeout: 25000, waitUntil: 'commit' }),
      page.locator('.topbar a[data-nav="deck"]').click({ force: true }),
    ]);
  });

  test('refresh preserves current doc', async ({ page }) => {
    const doc = 'guides/monitor/live-feed/03-event-table-columns.md';
    await page.goto('/read.html#doc=' + encodeURIComponent(doc));
    await waitReadReady(page);
    await expect(page.locator('#doc-path')).toContainText('03-event-table-columns');
    await page.reload();
    await waitReadReady(page);
    await expect(page.locator('#doc-path')).toContainText('03-event-table-columns');
  });
});
