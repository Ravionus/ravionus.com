// ============================================================
//  url.spec.js — Tests for /tools/url/ URL Encoder/Decoder
//
//  Tier classification (see ci.yml):
//    smoke   — page loads, toolbar visible, nav links
//              always run on main push (pre-deploy gate)
//    features — full feature & edge-case coverage
//               path-triggered: runs when tools/url/** or
//               tests/url.spec.js changes, AND always on main
// ============================================================

const { test, expect } = require('@playwright/test');

// ── Smoke (pre-deploy gate) ──────────────────────────────────
test.describe('URL Encoder/Decoder — smoke', () => {

  test('loads without JS or CSP errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 140));
    });
    await page.goto('/tools/url/');
    await page.waitForLoadState('networkidle');
    expect(errors, `Errors on load: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('nav bar and back-links render', async ({ page }) => {
    await page.goto('/tools/url/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href*="tools"]').first()).toBeVisible();
  });

  test('all primary toolbar buttons are visible', async ({ page }) => {
    await page.goto('/tools/url/');
    for (const id of ['#btnEncode', '#btnDecode', '#btnParse',
                       '#btnModeToggle', '#btnSample', '#btnClear']) {
      await expect(page.locator(id)).toBeVisible();
    }
  });

});

// ── Features (path-triggered + pre-deploy) ──────────────────
test.describe('URL Encoder/Decoder — features', () => {

  // ── Encode ─────────────────────────────────────────────────

  test('Encode component mode: space → %20, & → %26, = → %3D', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'hello world &=');
    await page.click('#btnEncode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toContain('%20'); // space
    expect(output).toContain('%26'); // &
    expect(output).toContain('%3D'); // =
    await expect(page.locator('#successBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
  });

  test('Encode empty input shows toast, not an alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/url/');
    await page.fill('#inputArea', '');
    await page.click('#btnEncode');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  // ── Decode ─────────────────────────────────────────────────

  test('Decode component mode: %20 → space, %26 → &', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'hello%20world%20%26%20more');
    await page.click('#btnDecode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toBe('hello world & more');
    await expect(page.locator('#successBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('Decode invalid percent-encoding shows error banner, not alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/url/');
    await page.fill('#inputArea', '%ZZ is not valid');
    await page.click('#btnDecode');
    await expect(page.locator('#errorBanner')).toBeVisible();
    expect(await page.locator('#outputArea').inputValue()).toBe('');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
  });

  test('Decode empty input shows toast, not an alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/url/');
    await page.fill('#inputArea', '');
    await page.click('#btnDecode');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  // ── Parse ───────────────────────────────────────────────────

  test('Parse URL shows protocol, hostname, pathname, and hash', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'https://example.com/api/data?key=val#section');
    await page.click('#btnParse');
    await expect(page.locator('#parsePlaceholder')).not.toBeVisible();
    const parseText = await page.locator('#parseView').textContent();
    expect(parseText).toContain('https:');
    expect(parseText).toContain('example.com');
    expect(parseText).toContain('/api/data');
    expect(parseText).toContain('#section');
    await expect(page.locator('#successBanner')).toBeVisible();
  });

  test('Parse URL shows decoded query parameters', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'https://example.com/search?q=hello%20world&page=2');
    await page.click('#btnParse');
    await expect(page.locator('#parsePlaceholder')).not.toBeVisible();
    const parseText = await page.locator('#parseView').textContent();
    // URLSearchParams decodes %20 to space and shows key+value
    expect(parseText).toContain('q');
    expect(parseText).toContain('hello world'); // decoded
    expect(parseText).toContain('page');
    expect(parseText).toContain('2');
  });

  test('Parse invalid URL shows error banner', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'not-a-valid-url');
    await page.click('#btnParse');
    await expect(page.locator('#errorBanner')).toBeVisible();
    // Placeholder should still be visible (no parse data)
    await expect(page.locator('#parsePlaceholder')).toBeVisible();
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
  });

  // ── Full URI mode ───────────────────────────────────────────

  test('Full URI mode toggle button becomes active when clicked', async ({ page }) => {
    await page.goto('/tools/url/');
    const btn = page.locator('#btnModeToggle');
    await expect(btn).not.toHaveClass(/active/);
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  });

  test('Full URI mode: Encode preserves URL structure characters', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.click('#btnModeToggle'); // switch to Full URI
    await page.fill('#inputArea', 'https://example.com/path?q=hello world');
    await page.click('#btnEncode');
    const output = await page.locator('#outputArea').inputValue();
    // encodeURI preserves :, //, ?, = — but encodes space
    expect(output).toContain('https://');
    expect(output).toContain('?q=');
    expect(output).toContain('%20');   // space is encoded
    expect(output).not.toContain('%3A'); // : is NOT encoded
    expect(output).not.toContain('%2F'); // / is NOT encoded
  });

  test('Status bar shows Full URI encoding label when mode is active', async ({ page }) => {
    await page.goto('/tools/url/');
    await expect(page.locator('#statEnc')).toHaveText('Component');
    await page.click('#btnModeToggle');
    await expect(page.locator('#statEnc')).toHaveText('Full URI');
  });

  // ── Sample ─────────────────────────────────────────────────

  test('Sample loads a URL and auto-parses it', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.click('#btnSample');
    const inputVal = await page.locator('#inputArea').inputValue();
    expect(inputVal.trim()).toBeTruthy();
    // Sample auto-parses → placeholder should be hidden
    await expect(page.locator('#parsePlaceholder')).not.toBeVisible();
    await expect(page.locator('#successBanner')).toBeVisible();
  });

  // ── Swap ───────────────────────────────────────────────────

  test('Swap button exchanges input and output pane contents', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'hello world');
    await page.click('#btnEncode');
    const encoded = await page.locator('#outputArea').inputValue();
    await page.click('#btnSwap');
    const newInput  = await page.locator('#inputArea').inputValue();
    const newOutput = await page.locator('#outputArea').inputValue();
    expect(newInput.trim()).toBe(encoded.trim());
    expect(newOutput.trim()).toBe('hello world');
  });

  // ── Clear ──────────────────────────────────────────────────

  test('Clear: confirm clears both panes and parse view', async ({ page }) => {
    await page.goto('/tools/url/');
    page.on('dialog', d => d.accept());
    await page.fill('#inputArea', 'hello world');
    await page.click('#btnEncode');
    await page.click('#btnClear');
    expect(await page.locator('#inputArea').inputValue()).toBe('');
    expect(await page.locator('#outputArea').inputValue()).toBe('');
    await expect(page.locator('#parsePlaceholder')).toBeVisible();
  });

  test('Clear: cancel preserves content', async ({ page }) => {
    await page.goto('/tools/url/');
    page.on('dialog', d => d.dismiss());
    await page.fill('#inputArea', 'hello world');
    await page.click('#btnEncode');
    await page.click('#btnClear');
    expect(await page.locator('#inputArea').inputValue()).toBe('hello world');
    expect(await page.locator('#outputArea').inputValue()).not.toBe('');
  });

  // ── Download ───────────────────────────────────────────────

  test('Download saves output as url-output.txt', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'hello world');
    await page.click('#btnEncode');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnDownload'),
    ]);
    expect(download.suggestedFilename()).toBe('url-output.txt');
  });

  // ── Status bar ─────────────────────────────────────────────

  test('Status bar updates mode and byte sizes after encode', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'hello world');
    await page.click('#btnEncode');
    await expect(page.locator('#statMode')).toHaveText('Encode');
    const inStat  = await page.locator('#statIn').textContent();
    const outStat = await page.locator('#statOut').textContent();
    expect(inStat).not.toBe('—');
    expect(outStat).not.toBe('—');
  });

  // ── Auto-save ──────────────────────────────────────────────

  test('Auto-save: encoded result restores after page reload', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', 'AutoSave Test Value');
    await page.click('#btnEncode');
    // Wait for debounced save (800 ms)
    await page.waitForTimeout(1200);
    await page.reload();
    await page.waitForLoadState('networkidle');
    const inputVal = await page.locator('#inputArea').inputValue();
    expect(inputVal).toBe('AutoSave Test Value');
  });

  // ── Mobile tabs ────────────────────────────────────────────

  test('Mobile: Parsed tab shows parse pane only', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/url/');
    await page.click('#tabParsed');
    await expect(page.locator('#paneParsed')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
  });

  test('Mobile: Output tab shows output pane only', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/url/');
    await page.click('#tabOutput');
    await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneParsed')).not.toHaveClass(/mob-visible/);
  });

  test('Mobile: Input tab shows input pane only', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/url/');
    await page.click('#tabOutput');
    await page.click('#tabInput');
    await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneParsed')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
  });

  // ── Edge cases ─────────────────────────────────────────────

  test('Edge case: Unicode and emoji characters are percent-encoded', async ({ page }) => {
    await page.goto('/tools/url/');
    await page.fill('#inputArea', '🚀 こんにちは café');
    await page.click('#btnEncode');
    const output = await page.locator('#outputArea').inputValue();
    // Output must contain percent-encoded sequences
    expect(output).toMatch(/%[0-9A-Fa-f]{2}/);
    // Raw emoji / multibyte chars should not appear in the output
    expect(output).not.toContain('🚀');
    expect(output).not.toContain('こ');
    await expect(page.locator('#successBanner')).toBeVisible();
  });

  test('Encode + Decode round-trip preserves original value', async ({ page }) => {
    await page.goto('/tools/url/');
    const original = 'Hello World & <special> = chars? yes!';
    await page.fill('#inputArea', original);
    await page.click('#btnEncode');
    // Move encoded string to input, then decode
    await page.click('#btnSwap');
    await page.click('#btnDecode');
    const decoded = await page.locator('#outputArea').inputValue();
    expect(decoded.trim()).toBe(original);
  });

});
