// ============================================================
//  base64.spec.js — Tests for /tools/base64/ Base64 Encoder/Decoder
//
//  Tier classification (see ci.yml):
//    smoke   — page loads, toolbar visible, nav links
//              always run on main push (pre-deploy gate)
//    features — full feature & edge-case coverage
//               path-triggered: runs when tools/base64/** or
//               tests/base64.spec.js changes, AND always on main
// ============================================================

const { test, expect } = require('@playwright/test');

// ── Smoke (pre-deploy gate) ──────────────────────────────────
test.describe('Base64 Encoder/Decoder — smoke', () => {

  test('loads without JS or CSP errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 140));
    });
    await page.goto('/tools/base64/');
    await page.waitForLoadState('networkidle');
    expect(errors, `Errors on load: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('nav bar and back-links render', async ({ page }) => {
    await page.goto('/tools/base64/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href*="tools"]').first()).toBeVisible();
  });

  test('all primary toolbar buttons are visible', async ({ page }) => {
    await page.goto('/tools/base64/');
    for (const id of ['#btnEncode', '#btnDecode', '#btnUrlSafe',
                       '#btnSample', '#btnSwap', '#btnClear']) {
      await expect(page.locator(id)).toBeVisible();
    }
  });

});

// ── Features (path-triggered + pre-deploy) ──────────────────
test.describe('Base64 Encoder/Decoder — features', () => {

  // ── Sample ─────────────────────────────────────────────────

  test('Sample button loads example text and encodes it', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.click('#btnSample');
    const inputVal  = await page.locator('#inputArea').inputValue();
    const outputVal = await page.locator('#outputArea').inputValue();
    expect(inputVal.trim()).toBeTruthy();
    expect(outputVal.trim()).toBeTruthy();
    await expect(page.locator('#successBanner')).toBeVisible();
  });

  // ── Encode ─────────────────────────────────────────────────

  test('Encode produces correct Base64 for plain ASCII text', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    const output = await page.locator('#outputArea').inputValue();
    // btoa('Hello') === 'SGVsbG8='
    expect(output.trim()).toBe('SGVsbG8=');
    await expect(page.locator('#successBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('Encode on empty input shows toast, not an alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', '');
    await page.click('#btnEncode');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  // ── Decode ─────────────────────────────────────────────────

  test('Decode converts Base64 back to original text', async ({ page }) => {
    await page.goto('/tools/base64/');
    // SGVsbG8= is Base64 for 'Hello'
    await page.fill('#inputArea', 'SGVsbG8=');
    await page.click('#btnDecode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output.trim()).toBe('Hello');
    await expect(page.locator('#successBanner')).toBeVisible();
  });

  test('Decode shows inline error banner (not alert) for invalid Base64', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'this is !@# not valid base64 !!!');
    await page.click('#btnDecode');
    await expect(page.locator('#errorBanner')).toBeVisible();
    expect(await page.locator('#outputArea').inputValue()).toBe('');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
  });

  test('Decode on empty input shows toast, not an alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', '');
    await page.click('#btnDecode');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  // ── URL-Safe mode ───────────────────────────────────────────

  test('URL-Safe toggle button becomes active when clicked', async ({ page }) => {
    await page.goto('/tools/base64/');
    const btn = page.locator('#btnUrlSafe');
    await expect(btn).not.toHaveClass(/active/);
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  });

  test('URL-Safe encode replaces / with _ and + with -', async ({ page }) => {
    await page.goto('/tools/base64/');
    // 'Hello?' encodes to 'SGVsbG8/' in standard; 'SGVsbG8_' in URL-safe
    await page.click('#btnUrlSafe');
    await page.fill('#inputArea', 'Hello?');
    await page.click('#btnEncode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).not.toContain('/');
    expect(output).toContain('_');
    expect(output.trim()).toBe('SGVsbG8_');
  });

  test('URL-Safe decode accepts - and _ characters', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.click('#btnUrlSafe');
    // 'SGVsbG8_' is URL-safe Base64 for 'Hello?'
    await page.fill('#inputArea', 'SGVsbG8_');
    await page.click('#btnDecode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output.trim()).toBe('Hello?');
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('Status bar shows URL-Safe encoding label when mode is active', async ({ page }) => {
    await page.goto('/tools/base64/');
    await expect(page.locator('#statEnc')).toHaveText('Standard');
    await page.click('#btnUrlSafe');
    await expect(page.locator('#statEnc')).toHaveText('URL-Safe');
  });

  // ── Swap ───────────────────────────────────────────────────

  test('Swap button exchanges input and output pane contents', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    const encoded = await page.locator('#outputArea').inputValue();
    await page.click('#btnSwap');
    const newInput = await page.locator('#inputArea').inputValue();
    const newOutput = await page.locator('#outputArea').inputValue();
    expect(newInput.trim()).toBe(encoded.trim());
    expect(newOutput.trim()).toBe('Hello');
  });

  // ── Clear ──────────────────────────────────────────────────

  test('Clear: confirm clears both panes', async ({ page }) => {
    await page.goto('/tools/base64/');
    page.on('dialog', d => d.accept());
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    await page.click('#btnClear');
    expect(await page.locator('#inputArea').inputValue()).toBe('');
    expect(await page.locator('#outputArea').inputValue()).toBe('');
  });

  test('Clear: cancel preserves content', async ({ page }) => {
    await page.goto('/tools/base64/');
    page.on('dialog', d => d.dismiss());
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    await page.click('#btnClear');
    expect(await page.locator('#inputArea').inputValue()).toBe('Hello');
    expect(await page.locator('#outputArea').inputValue()).not.toBe('');
  });

  // ── Download ───────────────────────────────────────────────

  test('Download saves output as base64.txt', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnDownload'),
    ]);
    expect(download.suggestedFilename()).toBe('base64.txt');
  });

  // ── Status bar ─────────────────────────────────────────────

  test('Status bar updates mode and byte sizes after encode', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'Hello');
    await page.click('#btnEncode');
    await expect(page.locator('#statMode')).toHaveText('Encode');
    // Input is 5 bytes (H-e-l-l-o), output is 8 bytes (SGVsbG8=)
    const inStat = await page.locator('#statIn').textContent();
    const outStat = await page.locator('#statOut').textContent();
    expect(inStat).not.toBe('—');
    expect(outStat).not.toBe('—');
  });

  // ── Auto-save ──────────────────────────────────────────────

  test('Auto-save: encoded result restores after page reload', async ({ page }) => {
    await page.goto('/tools/base64/');
    await page.fill('#inputArea', 'AutoSave Test');
    await page.click('#btnEncode');
    // Wait for debounced save (800ms)
    await page.waitForTimeout(1200);
    await page.reload();
    await page.waitForLoadState('networkidle');
    const inputVal = await page.locator('#inputArea').inputValue();
    expect(inputVal).toBe('AutoSave Test');
  });

  // ── Mobile tabs ────────────────────────────────────────────

  test('Mobile: Output tab shows output pane, hides input pane', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/base64/');
    await page.click('#tabOutput');
    await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
  });

  test('Mobile: Input tab shows input pane, hides output pane', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/base64/');
    await page.click('#tabOutput');
    await page.click('#tabInput');
    await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
  });

  // ── Edge cases ─────────────────────────────────────────────

  test('Encodes and decodes Unicode text (emoji, non-ASCII) correctly', async ({ page }) => {
    await page.goto('/tools/base64/');
    const text = 'こんにちは 🌟 Ünïcödé';
    await page.fill('#inputArea', text);
    await page.click('#btnEncode');
    const encoded = await page.locator('#outputArea').inputValue();
    expect(encoded.trim()).toBeTruthy();
    // Round-trip: swap encoded → input, decode, check output = original
    await page.click('#btnSwap');
    await page.click('#btnDecode');
    const decoded = await page.locator('#outputArea').inputValue();
    expect(decoded.trim()).toBe(text);
  });

  test('Decode strips padding and decodes un-padded Base64', async ({ page }) => {
    await page.goto('/tools/base64/');
    // SGVsbG8 (no =) is still valid Base64 for 'Hello' when padding is restored
    await page.fill('#inputArea', 'SGVsbG8');
    await page.click('#btnDecode');
    const output = await page.locator('#outputArea').inputValue();
    expect(output.trim()).toBe('Hello');
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

});
