// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

const PAGE = '/playground/json-explorer/';

// ── Smoke ─────────────────────────────────────────────────────────────────────
test.describe('JSON Explorer — smoke', () => {
    test('page loads with correct title', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page).toHaveTitle(/JSON Explorer/i);
    });

    test('page heading is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('h1')).toContainText('JSON Explorer');
    });

    test('nav bar is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('nav').first()).toBeVisible();
    });

    test('primary toolbar buttons are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnParse')).toBeVisible();
        await expect(page.locator('#btnFormat')).toBeVisible();
        await expect(page.locator('#btnMinify')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('no unhandled JS errors on load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(PAGE);
        await page.waitForLoadState('networkidle');
        expect(errors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'))).toHaveLength(0);
    });
});

// ── Features ──────────────────────────────────────────────────────────────────
test.describe('JSON Explorer — features', () => {

    // ── Parse ────────────────────────────────────────────────────────────────
    test('parsing valid object JSON shows tree', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"name":"Alice","age":30}');
        await page.click('#btnParse');
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    test('parsing valid array JSON shows tree', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '[1,2,3]');
        await page.click('#btnParse');
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    test('valid JSON shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"ok":true}');
        await page.click('#btnParse');
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toContainText('Valid JSON');
    });

    test('invalid JSON shows error banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{bad json}');
        await page.click('#btnParse');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText('Invalid JSON');
    });

    test('empty input shows error banner, no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d); d.dismiss(); });
        await page.goto(PAGE);
        await page.fill('#jsonInput', '');
        await page.click('#btnParse');
        await expect(page.locator('#errorBanner')).toBeVisible();
        expect(dialogs).toHaveLength(0);
    });

    test('Ctrl+Enter keyboard shortcut triggers parse', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"ctrl":true}');
        await page.locator('#jsonInput').press('Control+Enter');
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    // ── Tree structure ────────────────────────────────────────────────────────
    test('tree shows string values with cyan keys', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"city":"London"}');
        await page.click('#btnParse');
        const key = page.locator('.t-key').first();
        await expect(key).toContainText('city');
        const val = page.locator('.t-str').first();
        await expect(val).toContainText('London');
    });

    test('tree shows number values', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"count":42}');
        await page.click('#btnParse');
        await expect(page.locator('.t-num').first()).toContainText('42');
    });

    test('tree shows boolean values', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"flag":true}');
        await page.click('#btnParse');
        await expect(page.locator('.t-bool').first()).toContainText('true');
    });

    test('tree shows null values', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"data":null}');
        await page.click('#btnParse');
        await expect(page.locator('.t-null').first()).toContainText('null');
    });

    test('tree shows object brace and key count', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1,"b":2}');
        await page.click('#btnParse');
        await expect(page.locator('.t-size').first()).toContainText('2 keys');
    });

    test('tree shows array bracket and item count', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '[10,20,30]');
        await page.click('#btnParse');
        await expect(page.locator('.t-size').first()).toContainText('3 items');
    });

    test('nested objects render child nodes', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"outer":{"inner":"val"}}');
        await page.click('#btnParse');
        const keys = page.locator('.t-key');
        await expect(keys).toHaveCount(2); // outer + inner
    });

    // ── Toggle collapse / expand ──────────────────────────────────────────────
    test('clicking toggle collapses a node', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":{"b":1}}');
        await page.click('#btnParse');
        const toggle = page.locator('.tree-toggle').first();
        await toggle.click();
        const children = page.locator('.tree-children').first();
        await expect(children).toHaveClass(/collapsed/);
    });

    test('clicking toggle again expands a node', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":{"b":1}}');
        await page.click('#btnParse');
        const toggle = page.locator('.tree-toggle').first();
        await toggle.click(); // collapse
        await toggle.click(); // expand
        const children = page.locator('.tree-children').first();
        await expect(children).not.toHaveClass(/collapsed/);
    });

    test('Expand All button expands all nodes', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":{"b":{"c":1}}}');
        await page.click('#btnParse');
        // Collapse first
        await page.click('#btnCollapseAll');
        // Then expand
        await page.click('#btnExpandAll');
        const collapsed = page.locator('.tree-children.collapsed');
        await expect(collapsed).toHaveCount(0);
    });

    test('Collapse All button collapses nested nodes', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":{"b":{"c":1}}}');
        await page.click('#btnParse');
        await page.click('#btnCollapseAll');
        // At least some children should be collapsed
        const collapsed = page.locator('.tree-children.collapsed');
        const count = await collapsed.count();
        expect(count).toBeGreaterThan(0);
    });

    // ── Format / Minify ───────────────────────────────────────────────────────
    test('Format button pretty-prints the JSON input', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1,"b":2}');
        await page.click('#btnFormat');
        const val = await page.locator('#jsonInput').inputValue();
        expect(val).toContain('\n');
        expect(val).toContain('  ');
    });

    test('Minify button removes whitespace', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{\n  "a": 1,\n  "b": 2\n}');
        await page.click('#btnMinify');
        const val = await page.locator('#jsonInput').inputValue();
        expect(val).not.toContain('\n');
        expect(val).toBe('{"a":1,"b":2}');
    });

    test('Format shows success banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"x":1}');
        await page.click('#btnFormat');
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('Format on invalid JSON shows error banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', 'not json');
        await page.click('#btnFormat');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    // ── Search ────────────────────────────────────────────────────────────────
    test('search highlights matching rows', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"city":"London","country":"UK"}');
        await page.click('#btnParse');
        await page.fill('#searchInput', 'city');
        await page.waitForTimeout(400);
        const highlighted = page.locator('.tree-row.highlighted');
        const count = await highlighted.count();
        expect(count).toBeGreaterThan(0);
    });

    test('search count updates after typing', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1,"b":2}');
        await page.click('#btnParse');
        await page.fill('#searchInput', 'a');
        await page.waitForTimeout(400);
        const text = await page.locator('#searchCount').textContent();
        expect(text).toMatch(/match/i);
    });

    test('clearing search removes highlights', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"x":99}');
        await page.click('#btnParse');
        await page.fill('#searchInput', 'x');
        await page.waitForTimeout(400);
        await page.fill('#searchInput', '');
        await page.waitForTimeout(400);
        const highlighted = page.locator('.tree-row.highlighted');
        await expect(highlighted).toHaveCount(0);
    });

    // ── Examples ─────────────────────────────────────────────────────────────
    test('loading person example fills input and renders tree', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'person');
        await page.waitForTimeout(300);
        const val = await page.locator('#jsonInput').inputValue();
        expect(val).toContain('Alice');
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    test('loading array example renders tree', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'array');
        await page.waitForTimeout(300);
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    test('loading api example shows nested data', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'api');
        await page.waitForTimeout(300);
        await expect(page.locator('.t-key').first()).toBeVisible();
    });

    test('example select resets to placeholder after load', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'config');
        await page.waitForTimeout(300);
        const val = await page.locator('#exampleSelect').inputValue();
        expect(val).toBe('');
    });

    // ── Clear ─────────────────────────────────────────────────────────────────
    test('Clear button empties input', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1}');
        await page.click('#btnClear');
        expect(await page.locator('#jsonInput').inputValue()).toBe('');
    });

    test('Clear button removes tree', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1}');
        await page.click('#btnParse');
        await page.click('#btnClear');
        await expect(page.locator('.tree-root')).toHaveCount(0);
    });

    test('Clear shows empty placeholder', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1}');
        await page.click('#btnParse');
        await page.click('#btnClear');
        await expect(page.locator('#treeEmpty')).toBeVisible();
    });

    // ── Status bar ────────────────────────────────────────────────────────────
    test('status bar shows node count after parse', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":1,"b":2}');
        await page.click('#btnParse');
        const nodes = await page.locator('#statNodes').textContent();
        expect(parseInt(nodes.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    test('status bar shows depth after parse', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"a":{"b":{"c":1}}}');
        await page.click('#btnParse');
        const depth = parseInt(await page.locator('#statDepth').textContent());
        expect(depth).toBeGreaterThan(1);
    });

    test('status bar shows type: object', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"x":1}');
        await page.click('#btnParse');
        await expect(page.locator('#statType')).toContainText('object');
    });

    test('status bar shows type: array', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '[1,2,3]');
        await page.click('#btnParse');
        await expect(page.locator('#statType')).toContainText('array');
    });

    test('char count updates on input', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"hello":"world"}');
        const chars = await page.locator('#statChars').textContent();
        expect(parseInt(chars.replace(/,/g, ''))).toBeGreaterThan(0);
    });

    // ── Copy ─────────────────────────────────────────────────────────────────
    test('Copy JSON shows toast', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"test":true}');
        await page.click('#btnCopy');
        await expect(page.locator('#toast')).toBeVisible();
    });

    test('Copy on empty shows toast', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '');
        await page.click('#btnCopy');
        await expect(page.locator('#toast')).toBeVisible();
    });

    // ── localStorage ─────────────────────────────────────────────────────────
    test('content persists across page reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"persist":"yes"}');
        await page.waitForTimeout(1000); // debounced save
        await page.reload();
        await page.waitForLoadState('networkidle');
        const val = await page.locator('#jsonInput').inputValue();
        expect(val).toContain('persist');
    });

    test('tree restored after reload with saved content', async ({ page }) => {
        await page.goto(PAGE);
        await page.fill('#jsonInput', '{"restored":true}');
        await page.click('#btnParse');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.tree-root')).toBeVisible();
    });

    // ── Mobile tabs ───────────────────────────────────────────────────────────
    test.describe('mobile tabs', () => {
        test.use({ viewport: { width: 480, height: 800 } });

        test('mobile tab buttons visible on narrow viewport', async ({ page }) => {
            await page.goto(PAGE);
            await expect(page.locator('#tabInput')).toBeVisible();
            await expect(page.locator('#tabOutput')).toBeVisible();
        });

        test('clicking Tree tab shows output pane', async ({ page }) => {
            await page.goto(PAGE);
            await page.click('#tabOutput');
            await expect(page.locator('#paneOutput')).toBeVisible();
        });

        test('clicking Input tab shows input pane', async ({ page }) => {
            await page.goto(PAGE);
            await page.click('#tabOutput');
            await page.click('#tabInput');
            await expect(page.locator('#paneInput')).toBeVisible();
        });
    });

    // ── Breadcrumb navigation ─────────────────────────────────────────────────
    test('breadcrumb shows correct current page', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('.breadcrumb .current')).toContainText('JSON Explorer');
    });

    test('breadcrumb Playgrounds link points to /playground/', async ({ page }) => {
        await page.goto(PAGE);
        const href = await page.locator('.breadcrumb a').nth(1).getAttribute('href');
        expect(href).toContain('playground');
    });
});
