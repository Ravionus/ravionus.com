// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/qr/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('QR Code Generator — smoke', () => {
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
        await expect(page).toHaveTitle(/QR Code.*Ravionus|Ravionus.*QR/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('primary toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnGenerate')).toBeVisible();
        await expect(page.locator('#btnDownloadPng')).toBeVisible();
        await expect(page.locator('#btnDownloadSvg')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions QR', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('QR');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('QR Code Generator — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Default state ─────────────────────────────────────────────────────────

    test('canvas is hidden and placeholder visible on load', async ({ page }) => {
        await expect(page.locator('#qrCanvas')).toBeHidden();
        await expect(page.locator('#qrPlaceholder')).toBeVisible();
    });

    test('ECC selector defaults to M', async ({ page }) => {
        const val = await page.locator('#selectEcc').inputValue();
        expect(val).toBe('M');
    });

    test('version selector defaults to auto', async ({ page }) => {
        const val = await page.locator('#selectVersion').inputValue();
        expect(val).toBe('auto');
    });

    // ── Generate ──────────────────────────────────────────────────────────────

    test('generates QR for a URL — canvas becomes visible', async ({ page }) => {
        await page.fill('#inputText', 'https://ravionus.com');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        await expect(page.locator('#qrPlaceholder')).toBeHidden();
    });

    test('generates QR for plain text', async ({ page }) => {
        await page.fill('#inputText', 'Hello, World!');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
    });

    test('canvas has non-zero dimensions after generation', async ({ page }) => {
        await page.fill('#inputText', 'test');
        await page.click('#btnGenerate');
        const w = await page.locator('#qrCanvas').getAttribute('width');
        expect(parseInt(w || '0')).toBeGreaterThan(0);
    });

    test('status bar shows version after generation', async ({ page }) => {
        await page.fill('#inputText', 'https://example.com');
        await page.click('#btnGenerate');
        const v = await page.locator('#statVersion').textContent();
        expect(v).not.toBe('—');
        expect(parseInt(v || '0')).toBeGreaterThanOrEqual(1);
    });

    test('status bar shows module size after generation', async ({ page }) => {
        await page.fill('#inputText', 'hello');
        await page.click('#btnGenerate');
        const m = await page.locator('#statModules').textContent();
        expect(m).toMatch(/\d+×\d+/);
    });

    test('qr meta label shows version and ECC info', async ({ page }) => {
        await page.fill('#inputText', 'hello');
        await page.click('#btnGenerate');
        const meta = await page.locator('#qrMeta').textContent();
        expect(meta).toMatch(/Version \d+/i);
        expect(meta).toMatch(/ECC/i);
    });

    // ── Empty input ───────────────────────────────────────────────────────────

    test('empty input shows error banner — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnGenerate');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    // ── ECC levels ────────────────────────────────────────────────────────────

    test('ECC level L generates a QR code', async ({ page }) => {
        await page.selectOption('#selectEcc', 'L');
        await page.fill('#inputText', 'hello');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        const ecc = await page.locator('#statEcc').textContent();
        expect(ecc).toBe('L');
    });

    test('ECC level Q generates a QR code', async ({ page }) => {
        await page.selectOption('#selectEcc', 'Q');
        await page.fill('#inputText', 'hello');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        const ecc = await page.locator('#statEcc').textContent();
        expect(ecc).toBe('Q');
    });

    test('ECC level H generates a QR code', async ({ page }) => {
        await page.selectOption('#selectEcc', 'H');
        await page.fill('#inputText', 'hello');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        const ecc = await page.locator('#statEcc').textContent();
        expect(ecc).toBe('H');
    });

    // ── Explicit version ──────────────────────────────────────────────────────

    test('explicit version 1 generates a QR code for short text', async ({ page }) => {
        await page.selectOption('#selectVersion', '1');
        await page.fill('#inputText', 'hi');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        const v = await page.locator('#statVersion').textContent();
        expect(v).toBe('1');
    });

    test('too-long text for version 1 shows error banner', async ({ page }) => {
        await page.selectOption('#selectVersion', '1');
        // Version 1 / M max is 16 data codewords = max ~14 bytes
        await page.fill('#inputText', 'This text is way too long for version 1 QR code ECC M mode');
        await page.click('#btnGenerate');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    // ── Char counter ──────────────────────────────────────────────────────────

    test('char counter updates as user types', async ({ page }) => {
        await page.fill('#inputText', 'hello');
        await page.locator('#inputText').dispatchEvent('input');
        const chars = await page.locator('#statChars').textContent();
        expect(chars).toBe('5');
    });

    // ── Colours ───────────────────────────────────────────────────────────────

    test('colour pickers sync with hex inputs', async ({ page }) => {
        await page.fill('#colorFg', '#ff0000');
        await page.locator('#colorFg').dispatchEvent('input');
        const pickerVal = await page.locator('#colorFgPicker').inputValue();
        expect(pickerVal.toLowerCase()).toBe('#ff0000');
    });

    // ── Size slider ───────────────────────────────────────────────────────────

    test('size slider updates label', async ({ page }) => {
        await page.locator('#sizeRange').fill('384');
        await page.locator('#sizeRange').dispatchEvent('input');
        const label = await page.locator('#sizeLabel').textContent();
        expect(label).toContain('384');
    });

    // ── Download buttons (no dialog) ──────────────────────────────────────────

    test('Download PNG with no QR shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownloadPng');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Download SVG with no QR shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownloadSvg');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Clear button ──────────────────────────────────────────────────────────

    test('Clear empties input and hides canvas', async ({ page }) => {
        await page.fill('#inputText', 'https://example.com');
        await page.click('#btnGenerate');
        await expect(page.locator('#qrCanvas')).toBeVisible();
        await page.click('#btnClear');
        const val = await page.locator('#inputText').inputValue();
        expect(val).toBe('');
        await expect(page.locator('#qrCanvas')).toBeHidden();
        await expect(page.locator('#qrPlaceholder')).toBeVisible();
    });

    test('Clear resets char counter to 0', async ({ page }) => {
        await page.fill('#inputText', 'some text');
        await page.locator('#inputText').dispatchEvent('input');
        await page.click('#btnClear');
        const chars = await page.locator('#statChars').textContent();
        expect(chars).toBe('0');
    });

    test('Clear hides error banner', async ({ page }) => {
        await page.click('#btnGenerate'); // triggers empty-input error
        await expect(page.locator('#errorBanner')).toBeVisible();
        await page.click('#btnClear');
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    // ── localStorage round-trip ───────────────────────────────────────────────

    test('localStorage: input and ECC persist across reload', async ({ page }) => {
        await page.selectOption('#selectEcc', 'H');
        await page.fill('#inputText', 'persist-me');
        await page.locator('#inputText').dispatchEvent('input');
        await page.waitForTimeout(1000); // wait for debounced save
        await page.reload();
        const val = await page.locator('#inputText').inputValue();
        const ecc = await page.locator('#selectEcc').inputValue();
        expect(val).toBe('persist-me');
        expect(ecc).toBe('H');
    });

    // ── Ctrl+Enter generates ──────────────────────────────────────────────────

    test('Ctrl+Enter in textarea triggers generate', async ({ page }) => {
        await page.fill('#inputText', 'ctrl-enter-test');
        await page.locator('#inputText').press('Control+Enter');
        await expect(page.locator('#qrCanvas')).toBeVisible();
    });
});
