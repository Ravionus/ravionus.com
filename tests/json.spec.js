// ============================================================
//  json.spec.js — Tests for /tools/json/ JSON Formatter
//
//  Tier classification (see ci.yml):
//    smoke   — page loads, toolbar visible, nav links
//              always run on main push (pre-deploy gate)
//    features — full feature & edge-case coverage
//               path-triggered: runs when tools/json/** or
//               tests/json.spec.js changes, AND always on main
// ============================================================

const { test, expect } = require('@playwright/test');

// ── Smoke (pre-deploy gate) ──────────────────────────────────
test.describe('JSON Formatter — smoke', () => {

  test('loads without JS or CSP errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 140));
    });
    await page.goto('/tools/json/');
    await page.waitForLoadState('networkidle');
    expect(errors, `Errors on load: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('nav bar and back-links render', async ({ page }) => {
    await page.goto('/tools/json/');
    await expect(page.locator('nav')).toBeVisible();
    // Has at least one link back to the tools index
    await expect(page.locator('a[href*="tools"]').first()).toBeVisible();
  });

  test('all primary toolbar buttons are visible', async ({ page }) => {
    await page.goto('/tools/json/');
    for (const id of ['#btnFormat', '#btnMinify', '#btnValidate',
                       '#btnSample', '#btnSortKeys', '#btnClear']) {
      await expect(page.locator(id)).toBeVisible();
    }
  });

});

// ── Features (path-triggered + pre-deploy) ──────────────────
test.describe('JSON Formatter — features', () => {

  // ── Sample ─────────────────────────────────────────────────

  test('Sample button loads example JSON and renders output', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.click('#btnSample');
    const inputVal  = await page.locator('#inputArea').inputValue();
    const outputVal = await page.locator('#outputArea').inputValue();
    expect(inputVal.trim()).toBeTruthy();
    expect(outputVal.trim()).toBeTruthy();
    await expect(page.locator('#validBanner')).toBeVisible();
  });

  // ── Format ─────────────────────────────────────────────────

  test('Format pretty-prints valid JSON with default 2-space indent', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"a":1,"b":[1,2,3]}');
    await page.click('#btnFormat');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toContain('  "a": 1');
    expect(output.split('\n').length).toBeGreaterThan(3);
    await expect(page.locator('#validBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('Format shows inline error banner (not alert) for invalid JSON', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{bad:json}');
    await page.click('#btnFormat');
    await expect(page.locator('#errorBanner')).toBeVisible();
    expect(await page.locator('#outputArea').inputValue()).toBe('');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
  });

  test('Format on empty input shows toast, not an alert', async ({ page }) => {
    const dialogs = [];
    page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
    await page.goto('/tools/json/');
    await page.evaluate(() => { document.getElementById('inputArea').value = ''; });
    await page.click('#btnFormat');
    expect(dialogs, 'unexpected alert/confirm').toHaveLength(0);
    await expect(page.locator('#toast')).toHaveClass(/show/);
  });

  // ── Minify ─────────────────────────────────────────────────

  test('Minify compresses multi-line JSON to a single line', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{\n  "key": "value",\n  "num": 42\n}');
    await page.click('#btnMinify');
    const output = await page.locator('#outputArea').inputValue();
    expect(output.trim().split('\n')).toHaveLength(1);
    expect(output).toContain('"key"');
    await expect(page.locator('#validBanner')).toBeVisible();
  });

  // ── Validate ───────────────────────────────────────────────

  test('Validate shows valid banner for correct JSON', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"valid":true,"count":3}');
    await page.click('#btnValidate');
    await expect(page.locator('#validBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('Validate shows error banner for invalid JSON', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{ "key": undefined }');
    await page.click('#btnValidate');
    await expect(page.locator('#errorBanner')).toBeVisible();
    await expect(page.locator('#validBanner')).not.toBeVisible();
  });

  // ── Sort Keys ──────────────────────────────────────────────

  test('Sort Keys reorders object keys alphabetically', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"z":3,"a":1,"m":2}');
    await page.click('#btnSortKeys');
    const inputVal = await page.locator('#inputArea').inputValue();
    const parsed   = JSON.parse(inputVal);
    const keys     = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  // ── Indent selector ────────────────────────────────────────

  test('Indent selector: 4-space option produces wider indentation', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"a":1}');
    await page.selectOption('#indentSelect', '4');
    await page.click('#btnFormat');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toContain('    "a"');   // 4 spaces before key
  });

  // ── Tree view ──────────────────────────────────────────────

  test('Tree view renders collapsible toggles after formatting', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"name":"Ravi","scores":[10,20,30]}');
    await page.click('#btnFormat');
    await expect(page.locator('.j-toggle').first()).toBeVisible();
  });

  test('Clicking a tree toggle collapses the node', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"a":{"b":1,"c":2}}');
    await page.click('#btnFormat');
    await page.locator('.j-toggle').first().click();
    await expect(page.locator('.j-collapsible.collapsed').first()).toBeAttached();
  });

  test('Collapse All / Expand All buttons toggle all tree nodes', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"x":{"y":1},"z":{"w":2}}');
    await page.click('#btnFormat');

    await page.click('#btnCollapseAll');
    const collapsedCount = await page.locator('.j-collapsible.collapsed').count();
    expect(collapsedCount).toBeGreaterThan(0);

    await page.click('#btnExpandAll');
    await expect(page.locator('.j-collapsible.collapsed')).toHaveCount(0);
  });

  // ── Status bar ─────────────────────────────────────────────

  test('Status bar shows Valid status and correct key count', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"x":1,"y":2}');
    await page.click('#btnFormat');
    await expect(page.locator('#statStatus')).toHaveClass(/stat-ok/);
    const keys = await page.locator('#statKeys').textContent();
    expect(Number(keys.replace(/,/g, ''))).toBe(2);
  });

  test('Status bar shows Invalid status on bad input', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', 'not json at all');
    await page.click('#btnValidate');
    await expect(page.locator('#statStatus')).toHaveClass(/stat-err/);
  });

  // ── Clear ──────────────────────────────────────────────────

  test('Clear (confirmed) empties input, output, and restores tree placeholder', async ({ page }) => {
    page.on('dialog', d => d.accept());
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"clear":"me"}');
    await page.click('#btnFormat');
    await page.click('#btnClear');
    await expect(page.locator('#inputArea')).toHaveValue('');
    await expect(page.locator('#outputArea')).toHaveValue('');
    await expect(page.locator('#treePlaceholder')).toBeVisible();
  });

  test('Clear (cancelled) preserves existing content', async ({ page }) => {
    page.on('dialog', d => d.dismiss());
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"keep":"this"}');
    await page.click('#btnClear');
    await expect(page.locator('#inputArea')).toHaveValue('{"keep":"this"}');
  });

  // ── Auto-save ──────────────────────────────────────────────

  test('formatted output is restored from localStorage after reload', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '{"persist":true,"session":1}');
    await page.click('#btnFormat');
    await page.waitForTimeout(1200);   // 800ms debounce + buffer
    await page.reload();
    await expect(page.locator('#outputArea')).not.toHaveValue('');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toContain('"persist"');
    await expect(page.locator('#validBanner')).toBeVisible();
  });

  // ── Mobile tabs ────────────────────────────────────────────

  test('Input tab shows only the input pane', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/json/');
    await page.click('#tabInput');
    await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneTree')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
  });

  test('Tree tab shows only the tree pane', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/json/');
    await page.click('#tabTree');
    await expect(page.locator('#paneTree')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
  });

  test('Output tab shows only the output pane', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/tools/json/');
    await page.click('#tabOutput');
    await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
    await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    await expect(page.locator('#paneTree')).not.toHaveClass(/mob-visible/);
  });

  // ── Edge cases ─────────────────────────────────────────────

  test('deeply nested JSON formats without error', async ({ page }) => {
    const deep = JSON.stringify({ l1: { l2: { l3: { l4: { l5: 'deep' } } } } });
    await page.goto('/tools/json/');
    await page.fill('#inputArea', deep);
    await page.click('#btnFormat');
    await expect(page.locator('#validBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).not.toBeVisible();
  });

  test('JSON array at root level formats and renders tree correctly', async ({ page }) => {
    await page.goto('/tools/json/');
    await page.fill('#inputArea', '[1,"two",true,null,{"nested":3}]');
    await page.click('#btnFormat');
    const output = await page.locator('#outputArea').inputValue();
    expect(output).toContain('"two"');
    expect(output).toContain('null');
    await expect(page.locator('#validBanner')).toBeVisible();
  });

  test('XSS in JSON string values is shown as text in tree, not executed', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const payload = JSON.stringify({ hack: '<img src=x onerror="throw new Error(\'xss\')">' });
    await page.goto('/tools/json/');
    await page.fill('#inputArea', payload);
    await page.click('#btnFormat');
    await page.waitForTimeout(200);
    expect(errors, 'XSS payload was executed in tree view').toHaveLength(0);
    const treeHtml = await page.locator('#treeView').innerHTML();
    expect(treeHtml).not.toContain('<img src=x');
  });

});
