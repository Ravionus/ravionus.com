// ─────────────────────────────────────────────────────────────────────────────
// Diff Checker — Playwright E2E tests
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');

// ── Smoke tests (pre-deploy gate) ────────────────────────────────────────────
test.describe('Diff Checker — smoke', () => {

  test('loads without JS or CSP console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 140));
    });
    await page.goto('/tools/diff/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('nav bar and back-links render', async ({ page }) => {
    await page.goto('/tools/diff/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.nav-logo')).toHaveText('Ravionus');
    await expect(page.locator('.nav-breadcrumb .current')).toHaveText('Diff Checker');
  });

  test('all primary toolbar buttons are visible', async ({ page }) => {
    await page.goto('/tools/diff/');
    for (const id of ['#btnCompare', '#btnSwap', '#btnSample', '#btnDownload', '#btnClear']) {
      await expect(page.locator(id)).toBeVisible();
    }
  });

  test('h1 heading is present for SEO', async ({ page }) => {
    await page.goto('/tools/diff/');
    await expect(page.locator('h1')).toHaveText('Diff Checker');
  });

});

// ── Feature tests (path-triggered) ──────────────────────────────────────────
test.describe('Diff Checker — features', () => {

  test('Compare identical texts shows success banner', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'same\ntext');
    await page.fill('#inputB', 'same\ntext');
    await page.click('#btnCompare');
    await expect(page.locator('#successBanner')).toHaveClass(/visible/);
    await expect(page.locator('#successBanner')).toContainText('identical');
  });

  test('Compare different texts shows diff output with adds and removes', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'line1\nline2\nline3');
    await page.fill('#inputB', 'line1\nchanged\nline3');
    await page.click('#btnCompare');
    await expect(page.locator('#paneDiff')).toHaveClass(/visible/);
    // Should have at least one add and one remove line
    await expect(page.locator('.diff-line.remove')).toHaveCount(1);
    await expect(page.locator('.diff-line.add')).toHaveCount(1);
    // Equal lines should include line1 and line3
    const equalLines = page.locator('.diff-line.equal .diff-text');
    await expect(equalLines).toHaveCount(2);
  });

  test('Compare with one empty input still works', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'hello\nworld');
    await page.fill('#inputB', '');
    await page.click('#btnCompare');
    await expect(page.locator('#paneDiff')).toHaveClass(/visible/);
    await expect(page.locator('.diff-line.remove')).toHaveCount(2);
  });

  test('Both empty shows toast, not alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/diff/');
    await page.click('#btnCompare');
    expect(dialogs).toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  test('Swap exchanges the two texts', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'alpha');
    await page.fill('#inputB', 'beta');
    await page.click('#btnSwap');
    expect(await page.locator('#inputA').inputValue()).toBe('beta');
    expect(await page.locator('#inputB').inputValue()).toBe('alpha');
  });

  test('Sample loads example texts into both panes', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.click('#btnSample');
    const a = await page.locator('#inputA').inputValue();
    const b = await page.locator('#inputB').inputValue();
    expect(a.length).toBeGreaterThan(10);
    expect(b.length).toBeGreaterThan(10);
    expect(a).not.toBe(b);
  });

  test('Clear resets inputs and hides diff', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'x');
    await page.fill('#inputB', 'y');
    await page.click('#btnCompare');
    await expect(page.locator('#paneDiff')).toHaveClass(/visible/);
    await page.click('#btnClear');
    expect(await page.locator('#inputA').inputValue()).toBe('');
    expect(await page.locator('#inputB').inputValue()).toBe('');
    await expect(page.locator('#paneDiff')).not.toHaveClass(/visible/);
  });

  test('Download produces a file after Compare', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'old');
    await page.fill('#inputB', 'new');
    await page.click('#btnCompare');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnDownload'),
    ]);
    expect(download.suggestedFilename()).toBe('diff.txt');
  });

  test('Download without compare shows toast', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.click('#btnDownload');
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText('Compare first');
  });

  test('localStorage auto-save round-trip', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'saved-original');
    await page.fill('#inputB', 'saved-modified');
    // Wait for debounced save
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(await page.locator('#inputA').inputValue()).toBe('saved-original');
    expect(await page.locator('#inputB').inputValue()).toBe('saved-modified');
  });

  test('status bar updates line counts on input', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'a\nb\nc');
    await expect(page.locator('#statLinesA')).toHaveText('3');
    await page.fill('#inputB', 'x\ny');
    await expect(page.locator('#statLinesB')).toHaveText('2');
  });

  test('status bar shows add/remove counts after compare', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'keep\nremove-me');
    await page.fill('#inputB', 'keep\nadd-me');
    await page.click('#btnCompare');
    await expect(page.locator('#statAdded')).toHaveText('1');
    await expect(page.locator('#statRemoved')).toHaveText('1');
  });

  test('mobile tab switching shows correct panes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tools/diff/');
    // Original tab is active by default
    await expect(page.locator('#paneA')).toHaveClass(/mob-visible/);
    // Switch to Modified
    await page.click('#tabModified');
    await expect(page.locator('#paneB')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneA')).not.toHaveClass(/mob-visible/);
    // Switch to Diff
    await page.click('#tabDiff');
    await expect(page.locator('#paneDiff')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneB')).not.toHaveClass(/mob-visible/);
  });

  test('multi-line diff produces correct line numbers', async ({ page }) => {
    await page.goto('/tools/diff/');
    await page.fill('#inputA', 'a\nb\nc\nd\ne');
    await page.fill('#inputB', 'a\nB\nc\nD\ne');
    await page.click('#btnCompare');
    // b→B and d→D are changes; a, c, e are equal
    const removes = page.locator('.diff-line.remove');
    const adds    = page.locator('.diff-line.add');
    await expect(removes).toHaveCount(2);
    await expect(adds).toHaveCount(2);
  });

});
