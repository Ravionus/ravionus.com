// ============================================================
//  markdown.spec.js — Tests for /playground/markdown/
//
//  Tier classification (see ci.yml):
//    smoke   — page loads, panes present, no errors
//              always run on main push (pre-deploy gate)
//    features — full feature & security coverage
//               path-triggered: runs when playground/markdown/**
//               or tests/markdown.spec.js changes, AND always on main
// ============================================================

const { test, expect } = require('@playwright/test');

// ── Smoke (pre-deploy gate) ──────────────────────────────────
test.describe('Markdown Preview — smoke', () => {

  test('loads without JS or CSP errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 140));
    });
    await page.goto('/playground/markdown/');
    await page.waitForLoadState('networkidle');
    expect(errors, `Errors on load: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('nav bar renders', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('editor and preview panes are present', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await expect(page.locator('#editorPane')).toBeVisible();
    await expect(page.locator('#previewPane')).toBeVisible();
  });

});

// ── Features (path-triggered + pre-deploy) ──────────────────
test.describe('Markdown Preview — features', () => {

  // ── Default content ────────────────────────────────────────

  test('default content loads and preview renders on fresh page', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.evaluate(() => localStorage.removeItem('ravionus_playground_markdown'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    const editorVal = await page.locator('#editor').inputValue();
    expect(editorVal.trim()).toBeTruthy();
    await expect(page.locator('#previewContent')).toBeVisible();
    const html = await page.locator('#previewContent').innerHTML();
    expect(html).toContain('<h1');
  });

  test('empty editor shows placeholder and hides preview content', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '');
    await page.waitForTimeout(300);   // 150ms debounce + buffer
    await expect(page.locator('#previewEmpty')).toBeVisible();
    await expect(page.locator('#previewContent')).toHaveCSS('display', 'none');
  });

  test('typing markdown renders HTML live in the preview pane', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '# Hello World\n\nThis is **bold** text.');
    await page.waitForTimeout(300);
    await expect(page.locator('#previewContent')).toBeVisible();
    const html = await page.locator('#previewContent').innerHTML();
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>');
  });

  // ── Toolbar ────────────────────────────────────────────────

  test('Bold button wraps selected text in **…**', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'hello world');
    await page.evaluate(() =>
      document.getElementById('editor').setSelectionRange(0, 5)
    );
    await page.click('[data-action="bold"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('**hello**');
  });

  test('Italic button wraps selected text in *…*', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'italic test');
    await page.evaluate(() =>
      document.getElementById('editor').setSelectionRange(0, 6)
    );
    await page.click('[data-action="italic"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('*italic*');
  });

  test('H1 button inserts # heading prefix on the current line', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'My Title');
    await page.click('[data-action="h1"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('# ');
  });

  test('Code block button inserts ``` fences', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '');
    await page.click('[data-action="codeblock"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('```');
  });

  test('Bullet list button inserts - list prefix', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'Item');
    await page.click('[data-action="ul"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('- ');
  });

  test('Table button inserts a markdown table template', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '');
    await page.click('[data-action="table"]');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('| Column 1');
    expect(val).toContain('|----------|');
  });

  test('Keyboard shortcut Ctrl+B inserts bold formatting', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'shortcut');
    await page.evaluate(() =>
      document.getElementById('editor').setSelectionRange(0, 8)
    );
    await page.keyboard.press('Control+b');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('**shortcut**');
  });

  test('Keyboard shortcut Ctrl+I inserts italic formatting', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'italic');
    await page.evaluate(() =>
      document.getElementById('editor').setSelectionRange(0, 6)
    );
    await page.keyboard.press('Control+i');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('*italic*');
  });

  // ── Status bar ─────────────────────────────────────────────

  test('Status bar updates word, char, and line counts on input', async ({ page }) => {
    await page.goto('/playground/markdown/');
    // 'one two three\nfour five' = 5 words, 23 chars, 2 lines
    await page.fill('#editor', 'one two three\nfour five');
    await page.waitForTimeout(200);
    const words = await page.locator('#statWords').textContent();
    const chars = await page.locator('#statChars').textContent();
    const lines = await page.locator('#statLines').textContent();
    expect(Number(words.replace(/,/g, ''))).toBe(5);
    expect(Number(chars.replace(/,/g, ''))).toBe(23);
    expect(Number(lines.replace(/,/g, ''))).toBe(2);
  });

  // ── Download ───────────────────────────────────────────────

  test('Download button triggers a .md file download', async ({ page }) => {
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '# Download Test');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#downloadBtn'),
    ]);
    expect(download.suggestedFilename()).toBe('document.md');
  });

  // ── Clear ──────────────────────────────────────────────────

  test('Clear (confirmed) empties the editor and shows placeholder', async ({ page }) => {
    page.on('dialog', d => d.accept());
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '# Not empty');
    await page.click('#clearBtn');
    await expect(page.locator('#editor')).toHaveValue('');
    await page.waitForTimeout(250);
    await expect(page.locator('#previewEmpty')).toBeVisible();
  });

  test('Clear (cancelled) retains the current content', async ({ page }) => {
    page.on('dialog', d => d.dismiss());
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '# Keep me');
    await page.click('#clearBtn');
    const val = await page.locator('#editor').inputValue();
    expect(val).toContain('# Keep me');
  });

  // ── Auto-save ──────────────────────────────────────────────

  test('editor content is saved to localStorage and restored after reload', async ({ page }) => {
    await page.goto('/playground/markdown/');
    const content = '# Auto-save Test\n\nThis should persist.';
    await page.fill('#editor', content);
    await page.waitForTimeout(1500);   // 1000ms SAVE_DELAY_MS + buffer
    await page.reload();
    await page.waitForLoadState('networkidle');
    const restoredVal = await page.locator('#editor').inputValue();
    expect(restoredVal).toContain('Auto-save Test');
  });

  // ── Mobile tabs ────────────────────────────────────────────

  test('Preview tab switches to preview pane on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/playground/markdown/');
    await page.click('#tabPreview');
    await expect(page.locator('#previewPane')).toHaveClass(/mob-visible/);
    await expect(page.locator('#editorPane')).not.toHaveClass(/mob-visible/);
  });

  test('Edit tab switches back to editor pane on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 700 });
    await page.goto('/playground/markdown/');
    await page.click('#tabPreview');
    await page.click('#tabEdit');
    await expect(page.locator('#editorPane')).toHaveClass(/mob-visible/);
    await expect(page.locator('#previewPane')).not.toHaveClass(/mob-visible/);
  });

  // ── XSS / Security ─────────────────────────────────────────

  test('javascript: href in markdown link is not rendered as executable link', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '[click me](javascript:throw new Error("xss"))');
    await page.waitForTimeout(300);
    // The real security concern: no anchor should have a javascript: href
    // (marked v7+ renders these as plain text; DOMPurify strips them if left as href)
    const jsHrefs = await page.locator('#previewContent a[href^="javascript"]').count();
    expect(jsHrefs, 'found executable javascript: href in preview').toBe(0);
    expect(errors, 'XSS executed via javascript: link').toHaveLength(0);
  });

  test('script tags in markdown are stripped from rendered preview', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/playground/markdown/');
    await page.fill('#editor', 'Normal text\n\n<script>throw new Error("md-xss")</script>');
    await page.waitForTimeout(300);
    expect(errors, 'script executed in preview').toHaveLength(0);
    const html = await page.locator('#previewContent').innerHTML();
    expect(html).not.toContain('<script>');
  });

  test('HTML attribute injection in markdown is sanitized', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/playground/markdown/');
    await page.fill('#editor', '<img src=x onerror="throw new Error(\'attr-xss\')">');
    await page.waitForTimeout(300);
    expect(errors, 'onerror attribute executed').toHaveLength(0);
  });

});
