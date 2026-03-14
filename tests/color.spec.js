// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/color/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('Color Converter — smoke', () => {
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
        await expect(page).toHaveTitle(/Color.*Ravionus|Ravionus.*Color/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('all toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnRandom')).toBeVisible();
        await expect(page.locator('#btnCopyAll')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Color', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Color');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('Color Converter — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Default state ─────────────────────────────────────────────────────────

    test('loads with default purple color (#a855f7)', async ({ page }) => {
        const hexVal = await page.locator('#inputHex').inputValue();
        expect(hexVal.toLowerCase()).toBe('#a855f7');
    });

    test('big swatch is visible on load', async ({ page }) => {
        await expect(page.locator('#bigSwatch')).toBeVisible();
    });

    test('9 shade swatches are rendered on load', async ({ page }) => {
        await expect(page.locator('.shade-swatch')).toHaveCount(9);
    });

    test('status bar shows HEX value on load', async ({ page }) => {
        const hexStat = await page.locator('#statHex').textContent();
        expect(hexStat?.toLowerCase()).toBe('#a855f7');
    });

    // ── Conversions from HEX input ─────────────────────────────────────────

    test('entering #ff0000 sets RGB to rgb(255, 0, 0)', async ({ page }) => {
        await page.fill('#inputHex', '#ff0000');
        await page.locator('#inputHex').dispatchEvent('input');
        await expect(page.locator('#inputRgb')).toHaveValue('rgb(255, 0, 0)');
    });

    test('entering #ff0000 sets HSL with hue 0', async ({ page }) => {
        await page.fill('#inputHex', '#ff0000');
        await page.locator('#inputHex').dispatchEvent('input');
        const hsl = await page.locator('#inputHsl').inputValue();
        expect(hsl).toMatch(/^hsl\(0/);
    });

    test('entering #ffffff sets all channels to max', async ({ page }) => {
        await page.fill('#inputHex', '#ffffff');
        await page.locator('#inputHex').dispatchEvent('input');
        await expect(page.locator('#inputRgb')).toHaveValue('rgb(255, 255, 255)');
    });

    test('entering #000000 sets all channels to zero', async ({ page }) => {
        await page.fill('#inputHex', '#000000');
        await page.locator('#inputHex').dispatchEvent('input');
        await expect(page.locator('#inputRgb')).toHaveValue('rgb(0, 0, 0)');
    });

    // ── Conversions from RGB input ─────────────────────────────────────────

    test('entering rgb(0, 128, 0) sets HEX to #008000', async ({ page }) => {
        await page.fill('#inputRgb', 'rgb(0, 128, 0)');
        await page.locator('#inputRgb').dispatchEvent('input');
        await expect(page.locator('#inputHex')).toHaveValue('#008000');
    });

    test('entering rgb(0, 0, 255) sets HSV hue to 240', async ({ page }) => {
        await page.fill('#inputRgb', 'rgb(0, 0, 255)');
        await page.locator('#inputRgb').dispatchEvent('input');
        const hsv = await page.locator('#inputHsv').inputValue();
        expect(hsv).toMatch(/^hsv\(240/);
    });

    // ── Conversions from HSL input ─────────────────────────────────────────

    test('entering hsl(120, 100%, 50%) sets HEX close to #00ff00', async ({ page }) => {
        await page.fill('#inputHsl', 'hsl(120, 100%, 50%)');
        await page.locator('#inputHsl').dispatchEvent('input');
        const hex = await page.locator('#inputHex').inputValue();
        expect(hex.toLowerCase()).toBe('#00ff00');
    });

    // ── Conversions from HSV input ─────────────────────────────────────────

    test('entering hsv(0, 100%, 100%) sets HEX to #ff0000', async ({ page }) => {
        await page.fill('#inputHsv', 'hsv(0, 100%, 100%)');
        await page.locator('#inputHsv').dispatchEvent('input');
        const hex = await page.locator('#inputHex').inputValue();
        expect(hex.toLowerCase()).toBe('#ff0000');
    });

    // ── Invalid input ──────────────────────────────────────────────────────

    test('invalid HEX shows error banner — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.fill('#inputHex', 'notacolor');
        await page.locator('#inputHex').dispatchEvent('input');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('invalid HEX adds error class to input', async ({ page }) => {
        await page.fill('#inputHex', 'zzzzzz');
        await page.locator('#inputHex').dispatchEvent('input');
        const cls = await page.locator('#inputHex').getAttribute('class');
        expect(cls).toContain('error');
    });

    // ── Random button ──────────────────────────────────────────────────────

    test('Random Color button changes the HEX value', async ({ page }) => {
        const before = await page.locator('#inputHex').inputValue();
        // Click multiple times until value changes (unlikely to pick same random color twice)
        let changed = false;
        for (let i = 0; i < 5; i++) {
            await page.click('#btnRandom');
            const after = await page.locator('#inputHex').inputValue();
            if (after.toLowerCase() !== before.toLowerCase()) { changed = true; break; }
        }
        expect(changed).toBe(true);
    });

    test('Random Color button clears error state', async ({ page }) => {
        await page.fill('#inputHex', 'gggggg');
        await page.locator('#inputHex').dispatchEvent('input');
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
        await page.click('#btnRandom');
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

    // ── Reset button ───────────────────────────────────────────────────────

    test('Reset button restores default purple #a855f7', async ({ page }) => {
        await page.fill('#inputHex', '#ff0000');
        await page.locator('#inputHex').dispatchEvent('input');
        await page.click('#btnClear');
        const hex = await page.locator('#inputHex').inputValue();
        expect(hex.toLowerCase()).toBe('#a855f7');
    });

    // ── Copy All ───────────────────────────────────────────────────────────

    test('Copy All shows toast — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopyAll');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    // ── Shade swatches ─────────────────────────────────────────────────────

    test('clicking a shade swatch updates the HEX input', async ({ page }) => {
        const before = await page.locator('#inputHex').inputValue();
        await page.locator('.shade-swatch').first().click();
        const after = await page.locator('#inputHex').inputValue();
        expect(after.toLowerCase()).not.toBe(before.toLowerCase());
    });

    // ── Contrast row ───────────────────────────────────────────────────────

    test('contrast badges are rendered with ratio values', async ({ page }) => {
        await expect(page.locator('.contrast-badge')).toHaveCount(2);
        // Each badge should contain ":1"
        const texts = await page.locator('.cb-value').allTextContents();
        texts.forEach(t => expect(t).toMatch(/[\d.]+:1/));
    });

    // ── localStorage ──────────────────────────────────────────────────────

    test('localStorage restores the last color on reload', async ({ page }) => {
        await page.fill('#inputHex', '#ff6600');
        await page.locator('#inputHex').dispatchEvent('input');
        // wait for debounced save
        await page.waitForTimeout(1000);
        await page.reload();
        const restored = await page.locator('#inputHex').inputValue();
        expect(restored.toLowerCase()).toBe('#ff6600');
    });

    // ── Mobile tab switching ───────────────────────────────────────────────

    test('mobile tab switching shows/hides panes', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(URL);
        await expect(page.locator('#paneInput')).toBeVisible();
        await page.click('#tabOutput');
        await expect(page.locator('#paneInput')).toBeHidden();
        await expect(page.locator('#paneOutput')).toBeVisible();
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toBeVisible();
        await expect(page.locator('#paneOutput')).toBeHidden();
    });
});
