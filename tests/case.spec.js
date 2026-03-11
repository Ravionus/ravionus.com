// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/case/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('Case Converter — smoke', () => {
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
        await expect(page).toHaveTitle(/Case.*Ravionus|Ravionus.*Case/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('all toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnCopyAll')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Case', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Case');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('Case Converter — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Layout ────────────────────────────────────────────────────────────────

    test('placeholder is visible before any input', async ({ page }) => {
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
        await expect(page.locator('#caseGrid')).toBeHidden();
    });

    test('typing text shows the conversion grid', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#caseGrid')).toBeVisible();
        await expect(page.locator('#outputPlaceholder')).toBeHidden();
    });

    test('clearing input hides the grid and shows placeholder', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#caseGrid')).toBeVisible();
        await page.fill('#inputArea', '');
        await page.locator('#inputArea').dispatchEvent('input');
        await expect(page.locator('#caseGrid')).toBeHidden();
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
    });

    test('12 conversion cards are rendered', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('.case-card')).toHaveCount(12);
    });

    // ── Conversion accuracy ───────────────────────────────────────────────────

    test('UPPERCASE: "hello world" → "HELLO WORLD"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-upper')).toHaveText('HELLO WORLD');
    });

    test('lowercase: "HELLO WORLD" → "hello world"', async ({ page }) => {
        await page.fill('#inputArea', 'HELLO WORLD');
        await expect(page.locator('#case-lower')).toHaveText('hello world');
    });

    test('Title Case: "hello world" → "Hello World"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-title')).toHaveText('Hello World');
    });

    test('Sentence case: "hello world" → "Hello world"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-sentence')).toHaveText('Hello world');
    });

    test('camelCase: "hello world" → "helloWorld"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-camel')).toHaveText('helloWorld');
    });

    test('PascalCase: "hello world" → "HelloWorld"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-pascal')).toHaveText('HelloWorld');
    });

    test('snake_case: "hello world" → "hello_world"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-snake')).toHaveText('hello_world');
    });

    test('SCREAMING_SNAKE_CASE: "hello world" → "HELLO_WORLD"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-screaming')).toHaveText('HELLO_WORLD');
    });

    test('kebab-case: "hello world" → "hello-world"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-kebab')).toHaveText('hello-world');
    });

    test('dot.case: "hello world" → "hello.world"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-dot')).toHaveText('hello.world');
    });

    test('aLtErNaTiNg CaSe: "hello world" → "HeLlO wOrLd"', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#case-alt')).toHaveText('HeLlO wOrLd');
    });

    test('iNVERTED cASE: "Hello World" → "hELLO wORLD"', async ({ page }) => {
        await page.fill('#inputArea', 'Hello World');
        await expect(page.locator('#case-invert')).toHaveText('hELLO wORLD');
    });

    // ── camelCase / snake_case input normalization ────────────────────────────

    test('camelCase input is split and re-converted correctly', async ({ page }) => {
        await page.fill('#inputArea', 'helloWorld');
        // Should split into ["hello", "world"] and snake_case = "hello_world"
        await expect(page.locator('#case-snake')).toHaveText('hello_world');
    });

    test('snake_case input is split and re-converted correctly', async ({ page }) => {
        await page.fill('#inputArea', 'hello_world_foo');
        await expect(page.locator('#case-camel')).toHaveText('helloWorldFoo');
    });

    // ── Toolbar ───────────────────────────────────────────────────────────────

    test('Copy All without input shows warning toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopyAll');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Download without input shows warning toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownload');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Download with input triggers a .txt file download', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownload')
        ]);
        expect(download.suggestedFilename()).toMatch(/case-converter.*\.txt$/);
    });

    test('Clear button empties input and restores placeholder', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#caseGrid')).toBeVisible();
        await page.click('#btnClear');
        await expect(page.locator('#inputArea')).toHaveValue('');
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
    });

    test('copy individual card shows toast — no dialog', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.fill('#inputArea', 'hello world');
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.locator('[data-case-id="upper"] .copy-btn').click();
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Stats ─────────────────────────────────────────────────────────────────

    test('character count updates after input', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await expect(page.locator('#statChars')).toHaveText('11');
    });

    test('word count updates after input', async ({ page }) => {
        await page.fill('#inputArea', 'hello world foo');
        await expect(page.locator('#statWords')).toHaveText('3');
    });

    test('stats reset to 0 after clear', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await page.click('#btnClear');
        await expect(page.locator('#statChars')).toHaveText('0');
        await expect(page.locator('#statWords')).toHaveText('0');
    });

    // ── Persistence ───────────────────────────────────────────────────────────

    test('localStorage restores input text on reload', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await page.reload();
        await expect(page.locator('#inputArea')).toHaveValue('hello world');
    });

    test('localStorage restores conversions on reload', async ({ page }) => {
        await page.fill('#inputArea', 'hello world');
        await page.reload();
        await expect(page.locator('#case-snake')).toHaveText('hello_world');
    });

    // ── Mobile tab switching ──────────────────────────────────────────────────

    test('mobile tab switching shows/hides panes', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(URL);
        // Input pane is visible by default
        await expect(page.locator('#paneInput')).toBeVisible();
        // Click Output tab
        await page.click('#tabOutput');
        await expect(page.locator('#paneInput')).toBeHidden();
        await expect(page.locator('#paneOutput')).toBeVisible();
        // Click Input tab again
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toBeVisible();
        await expect(page.locator('#paneOutput')).toBeHidden();
    });
});
