// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = 'http://localhost:3000/tools/formatter/index.html';

/** Wait for js-beautify CDN scripts to initialise */
/** @param {import('@playwright/test').Page} page */
async function waitForReady(page) {
    await page.waitForSelector('body[data-ready="true"]', { timeout: 10_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Smoke', () => {
    test('loads without JS or CSP errors', async ({ page }) => {
        const errors = /** @type {string[]} */ ([]);
        page.on('pageerror',  e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto(PAGE);
        await page.waitForTimeout(800); // allow CDN scripts time to load
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('nav breadcrumb and links are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.getByRole('link', { name: /Dev Tools/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Learn/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Tools/i }).first()).toBeVisible();
    });

    test('toolbar buttons are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnFormat')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnCopy')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('CDN scripts load and data-ready is set', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        const ready = await page.getAttribute('body', 'data-ready');
        expect(ready).toBe('true');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JavaScript formatting
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — JavaScript', () => {
    test('formats valid JavaScript and shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('function foo(){return 1;}');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('output contains indented code', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('function foo(){if(true){return 1;}}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output).toContain('\n');
        expect(output.length).toBeGreaterThan(30);
    });

    test('minified JS on one line expands to multiple lines', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        const minified = 'var x=1;var y=2;var z=x+y;console.log(z);';
        await page.locator('#inputArea').fill(minified);
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output.split('\n').length).toBeGreaterThan(1);
    });

    test('Ctrl+Enter triggers format', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('function x(){return 42;}');
        await page.locator('#inputArea').press('Control+Enter');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// HTML formatting
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — HTML', () => {
    test('formats valid HTML and shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="html"]').click();
        await page.locator('#inputArea').fill('<html><head><title>T</title></head><body><p>Hello</p></body></html>');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('HTML output contains indented elements', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="html"]').click();
        await page.locator('#inputArea').fill('<div><ul><li>one</li><li>two</li></ul></div>');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output.split('\n').length).toBeGreaterThan(2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// CSS formatting
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — CSS', () => {
    test('formats valid CSS and shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="css"]').click();
        await page.locator('#inputArea').fill('body{margin:0;padding:0;background:#fff}.container{max-width:1200px}');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('minified CSS expands to multiple lines', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="css"]').click();
        await page.locator('#inputArea').fill('a{color:red}b{color:blue}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output.split('\n').length).toBeGreaterThan(2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSON formatting
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — JSON', () => {
    test('formats valid JSON and shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="json"]').click();
        await page.locator('#inputArea').fill('{"name":"Alice","age":30,"active":true}');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('formatted JSON output has correct structure', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="json"]').click();
        await page.locator('#inputArea').fill('{"a":1,"b":[1,2,3]}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output).toContain('"a"');
        expect(output.split('\n').length).toBeGreaterThan(2);
    });

    test('invalid JSON shows error banner', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="json"]').click();
        await page.locator('#inputArea').fill('{invalid: json, here}');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toBeHidden();
    });

    test('deeply nested JSON formats correctly', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="json"]').click();
        const nested = JSON.stringify({ a: { b: { c: { d: { e: 'deep' } } } } });
        await page.locator('#inputArea').fill(nested);
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        const output = await page.locator('#outputArea').inputValue();
        expect(output.split('\n').length).toBeGreaterThan(5);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Empty input
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Empty input', () => {
    test('empty input shows info banner, not error', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#infoBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Language switching
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Language switching', () => {
    test('JS language is selected by default', async ({ page }) => {
        await page.goto(PAGE);
        const jsBtn = page.locator('[data-lang="js"]');
        await expect(jsBtn).toHaveClass(/active/);
        await expect(page.locator('#statLang')).toHaveText('JavaScript');
    });

    test('switching to HTML updates label and status', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('[data-lang="html"]').click();
        await expect(page.locator('#inputLabel')).toHaveText('HTML Source');
        await expect(page.locator('#statLang')).toHaveText('HTML');
    });

    test('switching to CSS updates label', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('[data-lang="css"]').click();
        await expect(page.locator('#inputLabel')).toHaveText('CSS Source');
    });

    test('switching to JSON hides brace style options', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#braceGroup')).toBeVisible();
        await page.locator('[data-lang="json"]').click();
        await expect(page.locator('#braceGroup')).toBeHidden();
    });

    test('brace style group visible for JS and hidden for CSS', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('[data-lang="css"]').click();
        await expect(page.locator('#braceGroup')).toBeHidden();
        await page.locator('[data-lang="js"]').click();
        await expect(page.locator('#braceGroup')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Options', () => {
    test('4-space indent option produces wider indentation', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        // Format with 2 spaces first
        await page.locator('[data-indent="2"]').click();
        await page.locator('#inputArea').fill('function f(){return 1;}');
        await page.locator('#btnFormat').click();
        const out2 = await page.locator('#outputArea').inputValue();

        // Now 4 spaces
        await page.locator('[data-indent="4"]').click();
        await page.locator('#inputArea').fill('function f(){return 1;}');
        await page.locator('#btnFormat').click();
        const out4 = await page.locator('#outputArea').inputValue();

        expect(out4.length).toBeGreaterThanOrEqual(out2.length);
    });

    test('Tab indent uses tab character in output', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-indent="tab"]').click();
        await page.locator('#inputArea').fill('function f(){if(x){return 1;}}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        expect(output).toContain('\t');
    });

    test('expand brace style puts opening brace on new line', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-brace="expand"]').click();
        await page.locator('#inputArea').fill('function f(){return 1;}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#outputArea').inputValue();
        // Expand style: brace on its own line after function
        expect(output).toMatch(/\n\s*\{/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sample
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Sample', () => {
    test('sample button fills input with JS code', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const input = await page.locator('#inputArea').inputValue();
        expect(input.length).toBeGreaterThan(20);
    });

    test('sample for CSS fills CSS code', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('[data-lang="css"]').click();
        await page.locator('#btnSample').click();
        const input = await page.locator('#inputArea').inputValue();
        expect(input).toMatch(/\{/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Clear', () => {
    test('clear with confirmation empties both panes', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('some code');
        await page.locator('#btnFormat').click();
        page.on('dialog', d => d.accept());
        await page.locator('#btnClear').click();
        expect(await page.locator('#inputArea').inputValue()).toBe('');
        expect(await page.locator('#outputArea').inputValue()).toBe('');
    });

    test('cancel on clear dialog keeps content', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('keep this');
        page.on('dialog', d => d.dismiss());
        await page.locator('#btnClear').click();
        expect(await page.locator('#inputArea').inputValue()).toBe('keep this');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Download', () => {
    test('download creates .js file when JS is formatted', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('var x = 1;');
        await page.locator('#btnFormat').click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#btnDownload').click()
        ]);
        expect(download.suggestedFilename()).toBe('formatted.js');
    });

    test('download creates .json file when JSON is formatted', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('[data-lang="json"]').click();
        await page.locator('#inputArea').fill('{"x":1}');
        await page.locator('#btnFormat').click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#btnDownload').click()
        ]);
        expect(download.suggestedFilename()).toBe('formatted.json');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save / restore
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Auto-save', () => {
    test('input content persists after page reload', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('function saved(){}');
        await page.waitForTimeout(1000); // wait for save debounce
        await page.reload();
        await page.waitForTimeout(300);
        expect(await page.locator('#inputArea').inputValue()).toBe('function saved(){}');
    });

    test('language selection persists after reload', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('p{color:red}');
        await page.locator('[data-lang="css"]').click();
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForTimeout(300);
        await expect(page.locator('[data-lang="css"]')).toHaveClass(/active/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Status bar', () => {
    test('status bar shows language name', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#statLang')).toHaveText('JavaScript');
    });

    test('status bar shows line count after format', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('function a(){}');
        await page.locator('#btnFormat').click();
        const output = await page.locator('#statOutput').textContent();
        expect(output).toMatch(/\d+ lines?/);
    });

    test('status shows Formatted after successful format', async ({ page }) => {
        await page.goto(PAGE);
        await waitForReady(page);
        await page.locator('#inputArea').fill('var x = 1;');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#statStatus')).toHaveText('Formatted');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mobile tabs
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Code Formatter — Mobile tabs', () => {
    test('mobile tabs are visible at narrow viewport', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await expect(page.locator('.mobile-tabs')).toBeVisible();
    });

    test('Output tab shows formatted pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await page.locator('#tabOutput').click();
        await expect(page.locator('#paneOutput')).toBeVisible();
    });

    test('Input tab returns to source pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await page.locator('#tabOutput').click();
        await page.locator('#tabInput').click();
        await expect(page.locator('#paneInput')).toBeVisible();
    });
});
