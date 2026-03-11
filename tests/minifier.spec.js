// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/minifier/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('Minifier — smoke', () => {
    /** @type {string[]} */
    let errors;

    test.beforeEach(async ({ page }) => {
        errors = [];
        page.on('pageerror',  e => errors.push(e.message));
        page.on('console',    m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto(URL);
    });

    test.afterEach(() => {
        const real = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('ERR_FILE_NOT_FOUND') &&
            !e.includes('net::ERR')
        );
        expect(real).toHaveLength(0);
    });

    test('page loads with correct title and no JS/CSP errors', async ({ page }) => {
        await expect(page).toHaveTitle(/Minifier.*Ravionus|Ravionus.*Minifier/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('all primary toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnMinify')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnCopy')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Minifier', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Minifier');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('Minifier — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Language tabs ─────────────────────────────────────────────────────────

    test('JSON tab is active by default', async ({ page }) => {
        const activeTab = page.locator('.lang-tab.active');
        await expect(activeTab).toHaveText('JSON');
    });

    test('clicking CSS tab activates it', async ({ page }) => {
        await page.click('#tabCss');
        await expect(page.locator('#tabCss')).toHaveClass(/active/);
        await expect(page.locator('#tabJson')).not.toHaveClass(/active/);
        await expect(page.locator('#statLang')).toHaveText('CSS');
    });

    test('clicking HTML tab activates it', async ({ page }) => {
        await page.click('#tabHtml');
        await expect(page.locator('#tabHtml')).toHaveClass(/active/);
        await expect(page.locator('#statLang')).toHaveText('HTML');
    });

    test('clicking JS tab activates it', async ({ page }) => {
        await page.click('#tabJs');
        await expect(page.locator('#tabJs')).toHaveClass(/active/);
        await expect(page.locator('#statLang')).toHaveText('JS');
    });

    // ── JSON minification ─────────────────────────────────────────────────────

    test('minifies valid JSON — removes whitespace', async ({ page }) => {
        await page.click('#tabJson');
        await page.fill('#inputArea', '{\n  "foo": 1,\n  "bar": "baz"\n}');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toBe('{"foo":1,"bar":"baz"}');
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('invalid JSON shows error banner — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#tabJson');
        await page.fill('#inputArea', '{not valid json}');
        await page.click('#btnMinify');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toBeHidden();
    });

    test('JSON minification preserves nested arrays and objects', async ({ page }) => {
        await page.click('#tabJson');
        const input = '{\n  "arr": [1, 2, 3],\n  "nested": {\n    "x": true\n  }\n}';
        await page.fill('#inputArea', input);
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toBe('{"arr":[1,2,3],"nested":{"x":true}}');
    });

    // ── CSS minification ──────────────────────────────────────────────────────

    test('minifies CSS — removes comments and collapses whitespace', async ({ page }) => {
        await page.click('#tabCss');
        await page.fill('#inputArea', '/* comment */\nbody {\n  margin: 0;\n  padding: 0;\n}');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toContain('/* comment */');
        expect(out).not.toContain('\n');
        expect(out).toContain('body');
        expect(out).toContain('margin:0');
    });

    test('CSS minification removes space around braces and colons', async ({ page }) => {
        await page.click('#tabCss');
        await page.fill('#inputArea', 'h1 { color : red ; font-size : 16px ; }');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toMatch(/\s{2,}/);
        expect(out).toContain('h1{');
    });

    test('CSS minification removes trailing semicolon before }', async ({ page }) => {
        await page.click('#tabCss');
        await page.fill('#inputArea', 'a { color: blue; }');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toBe('a{color:blue}');
    });

    // ── HTML minification ─────────────────────────────────────────────────────

    test('minifies HTML — removes comments and collapses whitespace', async ({ page }) => {
        await page.click('#tabHtml');
        await page.fill('#inputArea', '<!-- comment -->\n<div>\n  <p>Hello</p>\n</div>');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toContain('<!-- comment -->');
        expect(out).toContain('<div>');
        expect(out).toContain('<p>Hello</p>');
    });

    test('HTML minification collapses whitespace between tags', async ({ page }) => {
        await page.click('#tabHtml');
        await page.fill('#inputArea', '<ul>\n    <li>One</li>\n    <li>Two</li>\n</ul>');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toContain('    ');
    });

    // ── JS minification ───────────────────────────────────────────────────────

    test('minifies JS — removes line comments', async ({ page }) => {
        await page.click('#tabJs');
        await page.fill('#inputArea', '// This is a comment\nvar x = 1;');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toContain('// This is a comment');
        expect(out).toContain('var');
    });

    test('minifies JS — removes block comments', async ({ page }) => {
        await page.click('#tabJs');
        await page.fill('#inputArea', '/* block comment */\nfunction f(){return 1;}');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).not.toContain('block comment');
        expect(out).toContain('function');
    });

    test('JS minification preserves string contents', async ({ page }) => {
        await page.click('#tabJs');
        await page.fill('#inputArea', 'var s = "hello world";');
        await page.click('#btnMinify');
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toContain('"hello world"');
    });

    // ── Sample button ─────────────────────────────────────────────────────────

    test('Sample button populates input with JSON sample', async ({ page }) => {
        await page.click('#tabJson');
        await page.click('#btnSample');
        const val = await page.locator('#inputArea').inputValue();
        expect(val.length).toBeGreaterThan(10);
        expect(val).toContain('"name"');
    });

    test('Sample button populates input with CSS sample', async ({ page }) => {
        await page.click('#tabCss');
        await page.click('#btnSample');
        const val = await page.locator('#inputArea').inputValue();
        expect(val.length).toBeGreaterThan(10);
        expect(val).toContain('body');
    });

    test('Sample button populates input with HTML sample', async ({ page }) => {
        await page.click('#tabHtml');
        await page.click('#btnSample');
        const val = await page.locator('#inputArea').inputValue();
        expect(val).toContain('<html');
    });

    test('Sample button populates input with JS sample', async ({ page }) => {
        await page.click('#tabJs');
        await page.click('#btnSample');
        const val = await page.locator('#inputArea').inputValue();
        expect(val).toContain('function');
    });

    // ── Empty input ───────────────────────────────────────────────────────────

    test('minifying empty input shows error — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnMinify');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    // ── Clear button ──────────────────────────────────────────────────────────

    test('Clear button empties both panes', async ({ page }) => {
        await page.fill('#inputArea', '{"a":1}');
        await page.click('#btnMinify');
        await page.click('#btnClear');
        const inVal  = await page.locator('#inputArea').inputValue();
        const outVal = await page.locator('#outputArea').inputValue();
        expect(inVal).toBe('');
        expect(outVal).toBe('');
    });

    test('Clear button hides banners', async ({ page }) => {
        await page.fill('#inputArea', '{bad}');
        await page.click('#btnMinify');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await page.click('#btnClear');
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    // ── Copy button ───────────────────────────────────────────────────────────

    test('Copy with no output shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopy');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Copy after minifying shows success toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.fill('#inputArea', '{"x":1}');
        await page.click('#btnMinify');
        await page.click('#btnCopy');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Download button ───────────────────────────────────────────────────────

    test('Download with no output shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownload');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Status bar ────────────────────────────────────────────────────────────

    test('status bar shows input byte size after typing', async ({ page }) => {
        await page.fill('#inputArea', '{"a":1}');
        await page.locator('#inputArea').dispatchEvent('input');
        const inStat = await page.locator('#statIn').textContent();
        expect(inStat).not.toBe('0 B');
    });

    test('status bar shows output byte size after minifying', async ({ page }) => {
        await page.fill('#inputArea', '{\n  "foo": 1\n}');
        await page.click('#btnMinify');
        const outStat = await page.locator('#statOut').textContent();
        expect(outStat).not.toBe('0 B');
    });

    // ── localStorage round-trip ───────────────────────────────────────────────

    test('localStorage: input and language persist across reload', async ({ page }) => {
        await page.click('#tabCss');
        await page.fill('#inputArea', 'body { margin: 0; }');
        await page.locator('#inputArea').dispatchEvent('input');
        await page.waitForTimeout(1000); // wait for debounced save
        await page.reload();
        const val  = await page.locator('#inputArea').inputValue();
        const lang = await page.locator('#statLang').textContent();
        expect(val).toBe('body { margin: 0; }');
        expect(lang).toBe('CSS');
    });

    // ── Mobile tabs ───────────────────────────────────────────────────────────

    test('mobile: clicking Output tab shows output pane', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.goto(URL);
        await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    });

    test('mobile: clicking Input tab restores input pane', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.goto(URL);
        await page.click('#tabOutput');
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
    });

    // ── Reduction percentage ──────────────────────────────────────────────────

    test('success banner shows reduction percentage', async ({ page }) => {
        await page.click('#tabJson');
        await page.fill('#inputArea', '{\n  "key": "value"\n}');
        await page.click('#btnMinify');
        const msg = await page.locator('#successBanner').textContent();
        expect(msg).toMatch(/%/);
        expect(msg).toMatch(/reduction/i);
    });

    // ── JS warning note ───────────────────────────────────────────────────────

    test('JS minification success banner mentions best-effort', async ({ page }) => {
        await page.click('#tabJs');
        await page.fill('#inputArea', 'var x = 1;');
        await page.click('#btnMinify');
        const msg = await page.locator('#successBanner').textContent();
        expect(msg).toMatch(/best-effort/i);
    });
});
