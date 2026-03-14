// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/lorem/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('Lorem Ipsum Generator — smoke', () => {
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
        await expect(page).toHaveTitle(/Lorem.*Ravionus|Ravionus.*Lorem/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('all toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnGenerate')).toBeVisible();
        await expect(page.locator('#btnCopy')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Lorem', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Lorem');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('Lorem Ipsum Generator — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Generate output ───────────────────────────────────────────────────────

    test('generate button produces visible non-empty text', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#outputArea')).toBeVisible();
        const text = await page.locator('#outputArea').inputValue();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('default mode is paragraphs', async ({ page }) => {
        const checked = await page.locator('input[name="loremUnit"]:checked').getAttribute('value');
        expect(checked).toBe('paragraphs');
    });

    test('generates 3 paragraphs by default (separated by blank lines)', async ({ page }) => {
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        const parts = text.split(/\n\n+/).filter(s => s.trim().length > 0);
        expect(parts).toHaveLength(3);
    });

    test('sentences mode generates one sentence per line', async ({ page }) => {
        await page.locator('input[name="loremUnit"][value="sentences"]').check();
        await page.fill('#countInput', '5');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        const lines = text.split('\n').filter(s => s.trim().length > 0);
        expect(lines).toHaveLength(5);
    });

    test('words mode generates correct number of words', async ({ page }) => {
        await page.locator('input[name="loremUnit"][value="words"]').check();
        await page.fill('#countInput', '50');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        const words = text.trim().split(/\s+/).filter(Boolean);
        expect(words).toHaveLength(50);
    });

    test('changing count to 5 paragraphs generates 5 paragraphs', async ({ page }) => {
        await page.fill('#countInput', '5');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        const parts = text.split(/\n\n+/).filter(s => s.trim().length > 0);
        expect(parts).toHaveLength(5);
    });

    test('"Start with Lorem ipsum" option: first paragraph begins with Lorem ipsum', async ({ page }) => {
        await page.check('#chkLoremStart');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        expect(text.trim().toLowerCase()).toMatch(/^lorem ipsum/);
    });

    test('"Start with Lorem ipsum" unchecked: output may not start with Lorem ipsum', async ({ page }) => {
        await page.uncheck('#chkLoremStart');
        // Generate 1 paragraph — we just confirm it produces text without throwing
        await page.fill('#countInput', '1');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('"Wrap in <p> tags" option wraps paragraphs in HTML p tags', async ({ page }) => {
        await page.check('#chkHtmlTags');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        expect(text).toMatch(/^<p>/);
        expect(text).toMatch(/<\/p>$/);
    });

    test('"Wrap in <p> tags" adds a <p> block per paragraph', async ({ page }) => {
        await page.check('#chkHtmlTags');
        await page.fill('#countInput', '3');
        await page.click('#btnGenerate');
        const text = await page.locator('#outputArea').inputValue();
        const tags = text.match(/<p>/g) || [];
        expect(tags).toHaveLength(3);
    });

    // ── Stats ─────────────────────────────────────────────────────────────────

    test('word count stat updates after generation', async ({ page }) => {
        await page.locator('input[name="loremUnit"][value="words"]').check();
        await page.fill('#countInput', '30');
        await page.click('#btnGenerate');
        await expect(page.locator('#statWords')).toHaveText('30');
    });

    test('sentence count stat is non-zero after generating sentences', async ({ page }) => {
        await page.locator('input[name="loremUnit"][value="sentences"]').check();
        await page.fill('#countInput', '5');
        await page.click('#btnGenerate');
        const sents = await page.locator('#statSents').textContent();
        expect(parseInt(sents || '0')).toBeGreaterThan(0);
    });

    test('char count stat is non-zero after generation', async ({ page }) => {
        await page.click('#btnGenerate');
        const chars = await page.locator('#statChars').textContent();
        expect(parseInt(chars || '0')).toBeGreaterThan(0);
    });

    // ── Clear / Placeholder ───────────────────────────────────────────────────

    test('clear removes output and shows placeholder', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#outputArea')).toBeVisible();
        await page.click('#btnClear');
        await expect(page.locator('#outputArea')).toBeHidden();
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
    });

    test('clear resets all stats to 0', async ({ page }) => {
        await page.click('#btnGenerate');
        await page.click('#btnClear');
        await expect(page.locator('#statWords')).toHaveText('0');
        await expect(page.locator('#statChars')).toHaveText('0');
    });

    test('copy without output shows toast — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopy');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download without output shows toast — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownload');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download with output triggers a file download', async ({ page }) => {
        await page.click('#btnGenerate');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownload')
        ]);
        expect(download.suggestedFilename()).toMatch(/lorem-ipsum.*\.txt$/);
    });

    test('download with html tags option uses .html extension', async ({ page }) => {
        await page.check('#chkHtmlTags');
        await page.click('#btnGenerate');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownload')
        ]);
        expect(download.suggestedFilename()).toMatch(/lorem-ipsum.*\.html$/);
    });

    // ── Persistence ───────────────────────────────────────────────────────────

    test('localStorage restores generated text on reload', async ({ page }) => {
        await page.check('#chkLoremStart');
        await page.click('#btnGenerate');
        const before = await page.locator('#outputArea').inputValue();
        await page.reload();
        const after = await page.locator('#outputArea').inputValue();
        expect(after).toBe(before);
    });

    test('localStorage restores count input on reload', async ({ page }) => {
        await page.fill('#countInput', '7');
        await page.click('#btnGenerate');
        await page.reload();
        await expect(page.locator('#countInput')).toHaveValue('7');
    });

    test('localStorage restores selected unit on reload', async ({ page }) => {
        await page.locator('input[name="loremUnit"][value="sentences"]').check();
        await page.fill('#countInput', '5');
        await page.click('#btnGenerate');
        await page.reload();
        const unit = await page.locator('input[name="loremUnit"]:checked').getAttribute('value');
        expect(unit).toBe('sentences');
    });

    test('localStorage restores html-tags toggle on reload', async ({ page }) => {
        await page.check('#chkHtmlTags');
        await page.click('#btnGenerate');
        await page.reload();
        await expect(page.locator('#chkHtmlTags')).toBeChecked();
    });
});
