// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/syntax/`;

// ── Smoke tests ───────────────────────────────────────────────────────────────
test.describe('Syntax Highlighter — smoke', () => {
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
        await expect(page).toHaveTitle(/Syntax Highlighter.*Ravionus|Ravionus.*Syntax/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('primary toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnHighlight')).toBeVisible();
        await expect(page.locator('#btnCopyHtml')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Syntax', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Syntax');
    });
});

// ── Feature tests ─────────────────────────────────────────────────────────────
test.describe('Syntax Highlighter — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Default state ─────────────────────────────────────────────────────────

    test('language selector defaults to JavaScript', async ({ page }) => {
        const val = await page.locator('#langSelect').inputValue();
        expect(val).toBe('javascript');
    });

    test('theme selector defaults to dark (empty value)', async ({ page }) => {
        const val = await page.locator('#themeSelect').inputValue();
        expect(val).toBe('');
    });

    test('source code textarea is empty on fresh load', async ({ page }) => {
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('');
    });

    test('char counter starts at 0', async ({ page }) => {
        const chars = await page.locator('#statChars').textContent();
        expect(chars).toBe('0');
    });

    // ── Highlight core feature ────────────────────────────────────────────────

    test('highlights JavaScript code — output pane shows spans', async ({ page }) => {
        await page.fill('#codeInput', 'const x = 42;\nconsole.log(x);');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('<span');
        expect(html).toContain('hl-');
    });

    test('keywords get hl-keyword class', async ({ page }) => {
        await page.fill('#codeInput', 'const x = 1;');
        await page.click('#btnHighlight');
        const span = page.locator('#highlightOutput .hl-keyword').first();
        await expect(span).toBeVisible();
        await expect(span).toContainText('const');
    });

    test('string literals get hl-string class', async ({ page }) => {
        await page.fill('#codeInput', 'const s = "hello world";');
        await page.click('#btnHighlight');
        const span = page.locator('#highlightOutput .hl-string').first();
        await expect(span).toBeVisible();
    });

    test('comments get hl-comment class', async ({ page }) => {
        await page.fill('#codeInput', '// this is a comment\nconst x = 1;');
        await page.click('#btnHighlight');
        const span = page.locator('#highlightOutput .hl-comment').first();
        await expect(span).toBeVisible();
    });

    test('numbers get hl-number class', async ({ page }) => {
        await page.fill('#codeInput', 'const n = 3.14;');
        await page.click('#btnHighlight');
        const span = page.locator('#highlightOutput .hl-number').first();
        await expect(span).toBeVisible();
    });

    // ── Language switching ────────────────────────────────────────────────────

    test('Python code highlights keywords', async ({ page }) => {
        await page.selectOption('#langSelect', 'python');
        await page.fill('#codeInput', 'def greet(name):\n    return f"Hello, {name}"');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-keyword');
    });

    test('HTML code highlights tags', async ({ page }) => {
        await page.selectOption('#langSelect', 'html');
        await page.fill('#codeInput', '<h1 class="title">Hello</h1>');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-tag');
    });

    test('CSS code highlights properties', async ({ page }) => {
        await page.selectOption('#langSelect', 'css');
        await page.fill('#codeInput', '.card { color: red; padding: 1rem; }');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-');
    });

    test('JSON code highlights string keys', async ({ page }) => {
        await page.selectOption('#langSelect', 'json');
        await page.fill('#codeInput', '{"key": "value", "count": 42}');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-string');
    });

    test('SQL code highlights SELECT keyword', async ({ page }) => {
        await page.selectOption('#langSelect', 'sql');
        await page.fill('#codeInput', 'SELECT id, name FROM users WHERE active = 1;');
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-keyword');
    });

    // ── Theme switching ───────────────────────────────────────────────────────

    test('switching to Monokai theme applies body class', async ({ page }) => {
        await page.selectOption('#themeSelect', 'monokai');
        const cls = await page.locator('body').getAttribute('class');
        expect(cls).toContain('theme-monokai');
    });

    test('switching to GitHub Light theme applied body class', async ({ page }) => {
        await page.selectOption('#themeSelect', 'github');
        const cls = await page.locator('body').getAttribute('class');
        expect(cls).toContain('theme-github');
    });

    test('theme status bar updates when theme changes', async ({ page }) => {
        await page.selectOption('#themeSelect', 'monokai');
        const theme = await page.locator('#statTheme').textContent();
        expect(theme?.toLowerCase()).toContain('monokai');
    });

    // ── Empty input ───────────────────────────────────────────────────────────

    test('empty input shows error banner — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnHighlight');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    // ── Status bar ────────────────────────────────────────────────────────────

    test('char counter updates as user types', async ({ page }) => {
        await page.fill('#codeInput', 'hello');
        await page.locator('#codeInput').dispatchEvent('input');
        const chars = await page.locator('#statChars').textContent();
        expect(parseInt(chars || '0')).toBe(5);
    });

    test('line counter updates on multiline input', async ({ page }) => {
        await page.fill('#codeInput', 'line1\nline2\nline3');
        await page.locator('#codeInput').dispatchEvent('input');
        const lines = await page.locator('#statLines').textContent();
        expect(parseInt(lines || '0')).toBe(3);
    });

    test('language status updated after toggling language select', async ({ page }) => {
        await page.selectOption('#langSelect', 'python');
        await page.locator('#langSelect').dispatchEvent('change');
        const lang = await page.locator('#statLang').textContent();
        expect(lang?.toLowerCase()).toContain('python');
    });

    // ── Load example ──────────────────────────────────────────────────────────

    test('Load example fills textarea with JS code', async ({ page }) => {
        await page.click('#btnPasteExample');
        const val = await page.locator('#codeInput').inputValue();
        expect(val.length).toBeGreaterThan(10);
    });

    test('Load example for Python loads Python snippet', async ({ page }) => {
        await page.selectOption('#langSelect', 'python');
        await page.click('#btnPasteExample');
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toContain('def ');
    });

    // ── Line numbers ──────────────────────────────────────────────────────────

    test('line numbers toggle shows numbers in output', async ({ page }) => {
        await page.fill('#codeInput', 'const a = 1;\nconst b = 2;');
        await page.click('#btnHighlight');
        await page.click('#btnLineNumbers');
        // re-highlight
        await page.click('#btnHighlight');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('1');
    });

    // ── Copy HTML button (no dialog) ──────────────────────────────────────────

    test('Copy HTML with no highlighted output shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopyHtml');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Copy Text with no input shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopyText');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Clear button ──────────────────────────────────────────────────────────

    test('Clear empties input and clears output', async ({ page }) => {
        await page.fill('#codeInput', 'const x = 1;');
        await page.click('#btnHighlight');
        await page.click('#btnClear');
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toBe('');
    });

    test('Clear hides error banner', async ({ page }) => {
        await page.click('#btnHighlight'); // triggers empty-input error
        await expect(page.locator('#errorBanner')).toBeVisible();
        await page.click('#btnClear');
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('Clear resets char counter to 0', async ({ page }) => {
        await page.fill('#codeInput', 'some code here');
        await page.locator('#codeInput').dispatchEvent('input');
        await page.click('#btnClear');
        const chars = await page.locator('#statChars').textContent();
        expect(chars).toBe('0');
    });

    // ── Ctrl+Enter shortcut ───────────────────────────────────────────────────

    test('Ctrl+Enter in textarea triggers highlight', async ({ page }) => {
        await page.fill('#codeInput', 'const x = 1;');
        await page.locator('#codeInput').press('Control+Enter');
        const html = await page.locator('#highlightOutput').innerHTML();
        expect(html).toContain('hl-');
    });

    // ── localStorage round-trip ───────────────────────────────────────────────

    test('localStorage: input and language persist across reload', async ({ page }) => {
        await page.selectOption('#langSelect', 'python');
        await page.fill('#codeInput', 'def hello(): pass');
        await page.locator('#codeInput').dispatchEvent('input');
        await page.waitForTimeout(1000); // debounce
        await page.reload();
        const val  = await page.locator('#codeInput').inputValue();
        const lang = await page.locator('#langSelect').inputValue();
        expect(val).toBe('def hello(): pass');
        expect(lang).toBe('python');
    });

    test('localStorage: theme persists across reload', async ({ page }) => {
        await page.selectOption('#themeSelect', 'solarized');
        await page.locator('#themeSelect').dispatchEvent('change');
        await page.waitForTimeout(1000);
        await page.reload();
        const theme = await page.locator('#themeSelect').inputValue();
        expect(theme).toBe('solarized');
    });

    // ── Mobile tab switching ──────────────────────────────────────────────────

    test('mobile Output tab shows output pane', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.goto(URL);
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    });

    test('mobile Input tab shows input pane', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.goto(URL);
        await page.click('#tabOutput');
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
    });
});
