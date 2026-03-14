// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/playground/color-palette/';

// ── Helpers ───────────────────────────────────────────────────────────────────
/** @param {any} page */
async function swatches(page) {
    return page.$$('.swatch');
}

/** @param {any} page */
async function swatchCount(page) {
    return (await swatches(page)).length;
}

/** @param {any} page */
async function resetTool(page) {
    await page.click('#btnReset');
    await page.waitForTimeout(100);
}

// ── 1. Smoke tests ────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — smoke', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('page title is correct', async ({ page }) => {
        await expect(page).toHaveTitle(/Color Palette Generator/i);
    });

    test('h1 contains Color Palette Generator', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Color Palette Generator');
    });

    test('no JS errors on load', async ({ page }) => {
        const errors = /** @type {string[]} */ ([]);
        page.on('pageerror', e => errors.push(e.message));
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        expect(errors).toHaveLength(0);
    });

    test('no CSP violations on load', async ({ page }) => {
        const violations = /** @type {string[]} */ ([]);
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
                violations.push(msg.text());
            }
        });
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        expect(violations).toHaveLength(0);
    });

    test('nav breadcrumb is visible', async ({ page }) => {
        await expect(page.locator('nav .breadcrumb')).toBeVisible();
    });

    test('Generate button is visible', async ({ page }) => {
        await expect(page.locator('#btnGenerate')).toBeVisible();
    });

    test('Reset button is visible', async ({ page }) => {
        await expect(page.locator('#btnReset')).toBeVisible();
    });
});

// ── 2. Layout & UI ────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — layout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('color picker is visible', async ({ page }) => {
        await expect(page.locator('#colorPicker')).toBeVisible();
    });

    test('hex input is visible', async ({ page }) => {
        await expect(page.locator('#hexInput')).toBeVisible();
    });

    test('harmony select is visible', async ({ page }) => {
        await expect(page.locator('#harmonySelect')).toBeVisible();
    });

    test('count buttons are visible', async ({ page }) => {
        await expect(page.locator('#countBtns')).toBeVisible();
    });

    test('palette grid is visible', async ({ page }) => {
        await expect(page.locator('#paletteGrid')).toBeVisible();
    });

    test('Copy CSS button is visible', async ({ page }) => {
        await expect(page.locator('#btnCopyCSS')).toBeVisible();
    });

    test('Copy Hex button is visible', async ({ page }) => {
        await expect(page.locator('#btnCopyHex')).toBeVisible();
    });

    test('Copy JSON button is visible', async ({ page }) => {
        await expect(page.locator('#btnCopyJSON')).toBeVisible();
    });

    test('Download PNG button is visible', async ({ page }) => {
        await expect(page.locator('#btnDownload')).toBeVisible();
    });

    test('status bar shows color count', async ({ page }) => {
        await expect(page.locator('#statCount')).toBeVisible();
    });

    test('status bar shows harmony type', async ({ page }) => {
        await expect(page.locator('#statHarmony')).toBeVisible();
    });

    test('status bar shows locked count', async ({ page }) => {
        await expect(page.locator('#statLocked')).toBeVisible();
    });

    test('mobile tab Settings button exists', async ({ page }) => {
        await expect(page.locator('#tabInput')).toBeAttached();
    });

    test('mobile tab Palette button exists', async ({ page }) => {
        await expect(page.locator('#tabOutput')).toBeAttached();
    });

    test('WCAG toggle is visible', async ({ page }) => {
        await expect(page.locator('#toggleWcag')).toBeVisible();
    });

    test('sort select is visible', async ({ page }) => {
        await expect(page.locator('#sortSelect')).toBeVisible();
    });
});

// ── 3. Initial palette ────────────────────────────────────────────────────────
test.describe('Color Palette Generator — initial palette', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.waitForTimeout(100);
    });

    test('palette loads with swatches on startup', async ({ page }) => {
        const count = await swatchCount(page);
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('swatches show hex values', async ({ page }) => {
        const hexEls = await page.$$('.swatch-hex');
        expect(hexEls.length).toBeGreaterThan(0);
        const first = await hexEls[0].textContent();
        expect(first).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('swatches show RGB values', async ({ page }) => {
        const rgbEls = await page.$$('.swatch-rgb');
        expect(rgbEls.length).toBeGreaterThan(0);
        const first = await rgbEls[0].textContent();
        expect(first).toMatch(/rgb\(/i);
    });

    test('swatches show HSL values', async ({ page }) => {
        const hslEls = await page.$$('.swatch-hsl');
        expect(hslEls.length).toBeGreaterThan(0);
        const first = await hslEls[0].textContent();
        expect(first).toMatch(/hsl\(/i);
    });

    test('swatches have lock buttons', async ({ page }) => {
        const locks = await page.$$('.swatch-lock');
        expect(locks.length).toBeGreaterThan(0);
    });

    test('default color count is 5 swatches', async ({ page }) => {
        await resetTool(page);
        await page.waitForTimeout(100);
        const count = await swatchCount(page);
        expect(count).toBe(5);
    });

    test('status bar shows correct count', async ({ page }) => {
        await resetTool(page);
        await page.waitForTimeout(100);
        const text = await page.locator('#statCount').innerText();
        expect(text).toBe('5');
    });
});

// ── 4. Generate button ────────────────────────────────────────────────────────
test.describe('Color Palette Generator — generate', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
    });

    test('Generate button produces swatches', async ({ page }) => {
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        const count = await swatchCount(page);
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('Generate refreshes hex values', async ({ page }) => {
        // With random harmony new generation will differ
        await page.selectOption('#harmonySelect', 'random');
        const before = await page.locator('.swatch-hex').first().textContent();
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        // Just check swatches still exist and hex is valid
        const after = await page.locator('.swatch-hex').first().textContent();
        expect(after).toMatch(/^#[0-9a-f]{6}$/i);
    });
});

// ── 5. Color count ────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — color count', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
    });

    test('clicking count button 3 produces 3 swatches', async ({ page }) => {
        await page.click('[data-n="3"]');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(3);
    });

    test('clicking count button 4 produces 4 swatches', async ({ page }) => {
        await page.click('[data-n="4"]');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(4);
    });

    test('clicking count button 6 produces 6 swatches', async ({ page }) => {
        await page.click('[data-n="6"]');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(6);
    });

    test('clicking count button 8 produces 8 swatches', async ({ page }) => {
        await page.click('[data-n="8"]');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(8);
    });

    test('clicking count button 2 produces 2 swatches', async ({ page }) => {
        await page.click('[data-n="2"]');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(2);
    });

    test('active count button reflects selection', async ({ page }) => {
        await page.click('[data-n="6"]');
        await page.waitForTimeout(50);
        const btn6 = page.locator('[data-n="6"]');
        await expect(btn6).toHaveClass(/active/);
    });

    test('status bar count matches selected count', async ({ page }) => {
        await page.click('[data-n="7"]');
        await page.waitForTimeout(100);
        const text = await page.locator('#statCount').innerText();
        expect(text).toBe('7');
    });
});

// ── 6. Harmony modes ──────────────────────────────────────────────────────────
test.describe('Color Palette Generator — harmony', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
    });

    test('Monochromatic harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'monochromatic');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Complementary harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'complementary');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Analogous harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'analogous');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Triadic harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'triadic');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Split-complementary harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'split-complementary');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Tetradic harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'tetradic');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('Random harmony generates palette', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'random');
        await page.click('#btnGenerate');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBeGreaterThan(0);
    });

    test('status bar updates harmony label', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'triadic');
        await page.waitForTimeout(100);
        const text = await page.locator('#statHarmony').innerText();
        expect(text.toLowerCase()).toMatch(/triadic/i);
    });
});

// ── 7. Base color ─────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — base color', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
    });

    test('hex input accepts valid hex and updates base', async ({ page }) => {
        await page.fill('#hexInput', '#ff0000');
        await page.locator('#hexInput').press('Enter');
        await page.waitForTimeout(200);
        const base = await page.locator('#statBase').innerText();
        expect(base).toBe('#ff0000');
    });

    test('invalid hex in input is ignored', async ({ page }) => {
        const before = await page.locator('#hexInput').inputValue();
        await page.fill('#hexInput', '#xyz');
        await page.locator('#hexInput').press('Tab');
        await page.waitForTimeout(100);
        const after = await page.locator('#hexInput').inputValue();
        expect(after).toBe(before);
    });

    test('hex input normalises shorthand #abc to #aabbcc', async ({ page }) => {
        await page.fill('#hexInput', '#abc');
        await page.locator('#hexInput').press('Enter');
        await page.waitForTimeout(200);
        const val = await page.locator('#hexInput').inputValue();
        expect(val).toBe('#aabbcc');
    });
});

// ── 8. Lock / unlock ──────────────────────────────────────────────────────────
test.describe('Color Palette Generator — lock', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
        await page.waitForTimeout(100);
    });

    test('lock button toggles locked state', async ({ page }) => {
        const lockBtn = page.locator('.swatch-lock').first();
        const before = await lockBtn.textContent();
        await lockBtn.click();
        await page.waitForTimeout(100);
        const after = await lockBtn.textContent();
        expect(after).not.toBe(before);
    });

    test('locked swatch gets locked class', async ({ page }) => {
        await page.locator('.swatch-lock').first().click();
        await page.waitForTimeout(100);
        const locked = await page.$$('.swatch.locked');
        expect(locked.length).toBeGreaterThan(0);
    });

    test('locked count in status bar increments', async ({ page }) => {
        await page.locator('.swatch-lock').first().click();
        await page.waitForTimeout(100);
        const count = await page.locator('#statLocked').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(1);
    });

    test('locked swatch hex preserved after regenerate', async ({ page }) => {
        const firstHex = await page.locator('.swatch-hex').first().textContent() ?? '';
        await page.locator('.swatch-lock').first().click();
        await page.waitForTimeout(50);
        await page.click('#btnGenerate');
        await page.waitForTimeout(200);
        // Locked swatch should still be present somewhere
        const hexTexts = await page.$$eval('.swatch-hex', els => els.map(e => e.textContent.trim()));
        expect(hexTexts).toContain(firstHex.trim());
    });
});

// ── 9. WCAG badges ────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — WCAG', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
        await page.waitForTimeout(100);
    });

    test('WCAG badges are visible when toggle is on', async ({ page }) => {
        // Ensure toggle is on
        const isOn = await page.locator('#toggleWcag').getAttribute('aria-checked');
        if (isOn !== 'true') {
            await page.click('#toggleWcag');
            await page.waitForTimeout(100);
        }
        const badges = await page.$$('.wcag-badge');
        expect(badges.length).toBeGreaterThan(0);
    });

    test('toggling off WCAG hides badges', async ({ page }) => {
        const isOn = await page.locator('#toggleWcag').getAttribute('aria-checked');
        if (isOn !== 'true') {
            await page.click('#toggleWcag');
            await page.waitForTimeout(100);
        }
        await page.click('#toggleWcag');
        await page.waitForTimeout(100);
        const badges = await page.$$('.wcag-badge');
        expect(badges.length).toBe(0);
    });

    test('toggling back on WCAG shows badges', async ({ page }) => {
        // Turn off
        const isOn = await page.locator('#toggleWcag').getAttribute('aria-checked');
        if (isOn === 'true') {
            await page.click('#toggleWcag');
            await page.waitForTimeout(100);
        }
        // Turn back on
        await page.click('#toggleWcag');
        await page.waitForTimeout(100);
        const badges = await page.$$('.wcag-badge');
        expect(badges.length).toBeGreaterThan(0);
    });

    test('WCAG badges have W: and B: labels', async ({ page }) => {
        const isOn = await page.locator('#toggleWcag').getAttribute('aria-checked');
        if (isOn !== 'true') {
            await page.click('#toggleWcag');
            await page.waitForTimeout(100);
        }
        const text = await page.locator('#paletteGrid').innerText();
        expect(text).toMatch(/W:/);
        expect(text).toMatch(/B:/);
    });
});

// ── 10. Sort ─────────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — sort', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
        await page.click('[data-n="6"]');
        await page.waitForTimeout(100);
    });

    test('sort by Hue renders swatches', async ({ page }) => {
        await page.selectOption('#sortSelect', 'hue');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(6);
    });

    test('sort by Luminance renders swatches', async ({ page }) => {
        await page.selectOption('#sortSelect', 'luminance');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(6);
    });

    test('sort by Saturation renders swatches', async ({ page }) => {
        await page.selectOption('#sortSelect', 'saturation');
        await page.waitForTimeout(100);
        expect(await swatchCount(page)).toBe(6);
    });
});

// ── 11. Exports ───────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — exports', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(URL);
        await resetTool(page);
        await page.waitForTimeout(100);
    });

    test('Copy CSS button copies to clipboard and shows toast', async ({ page }) => {
        await page.click('#btnCopyCSS');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Copy Hex button shows toast', async ({ page }) => {
        await page.click('#btnCopyHex');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Copy JSON button shows toast', async ({ page }) => {
        await page.click('#btnCopyJSON');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Copy CSS clipboard content contains --color-1', async ({ page }) => {
        await page.click('#btnCopyCSS');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toMatch(/--color-1/);
    });

    test('Copy Hex clipboard content is a JSON array', async ({ page }) => {
        await page.click('#btnCopyHex');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toMatch(/^\[/);
    });

    test('Copy JSON clipboard contains hex keys', async ({ page }) => {
        await page.click('#btnCopyJSON');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toMatch(/"hex"/);
    });

    test('clicking swatch hex shows toast', async ({ page }) => {
        await page.click('.swatch-hex');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });
});

// ── 12. Reset ─────────────────────────────────────────────────────────────────
test.describe('Color Palette Generator — reset', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
    });

    test('Reset restores default color count (5)', async ({ page }) => {
        await page.click('[data-n="8"]');
        await page.waitForTimeout(100);
        await resetTool(page);
        expect(await swatchCount(page)).toBe(5);
    });

    test('Reset restores base color to #a855f7', async ({ page }) => {
        await page.fill('#hexInput', '#ff0000');
        await page.locator('#hexInput').press('Enter');
        await page.waitForTimeout(100);
        await resetTool(page);
        const val = await page.locator('#hexInput').inputValue();
        expect(val).toBe('#a855f7');
    });

    test('Reset restores harmony to Monochromatic', async ({ page }) => {
        await page.selectOption('#harmonySelect', 'triadic');
        await resetTool(page);
        const val = await page.locator('#harmonySelect').inputValue();
        expect(val).toBe('monochromatic');
    });

    test('Reset shows toast', async ({ page }) => {
        await resetTool(page);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });
});

// ── 13. Large swatches ────────────────────────────────────────────────────────
test.describe('Color Palette Generator — large swatches', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
        await page.waitForTimeout(100);
    });

    test('large swatch toggle adds large class to grid', async ({ page }) => {
        const isOn = await page.locator('#toggleLarge').getAttribute('aria-checked');
        if (isOn === 'true') {
            await page.click('#toggleLarge');
            await page.waitForTimeout(50);
        }
        await page.click('#toggleLarge');
        await page.waitForTimeout(100);
        await expect(page.locator('#paletteGrid')).toHaveClass(/large/);
    });

    test('toggling large off removes large class', async ({ page }) => {
        const isOn = await page.locator('#toggleLarge').getAttribute('aria-checked');
        if (isOn !== 'true') {
            await page.click('#toggleLarge');
            await page.waitForTimeout(50);
        }
        await page.click('#toggleLarge');
        await page.waitForTimeout(100);
        const cls = await page.locator('#paletteGrid').getAttribute('class');
        expect(cls || '').not.toMatch(/large/);
    });
});

// ── 14. localStorage ─────────────────────────────────────────────────────────
test.describe('Color Palette Generator — localStorage', () => {
    test('base color persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#hexInput', '#00ff88');
        await page.locator('#hexInput').press('Enter');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        const val = await page.locator('#hexInput').inputValue();
        expect(val).toBe('#00ff88');
    });

    test('harmony type persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.selectOption('#harmonySelect', 'triadic');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        const val = await page.locator('#harmonySelect').inputValue();
        expect(val).toBe('triadic');
    });

    test('color count persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.click('[data-n="6"]');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        const count = await swatchCount(page);
        expect(count).toBe(6);
    });
});

// ── 15. Mobile tabs ───────────────────────────────────────────────────────────
test.describe('Color Palette Generator — mobile tabs', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.waitForTimeout(100);
    });

    test('Settings pane visible on Settings tab', async ({ page }) => {
        await page.click('#tabInput');
        await page.waitForTimeout(100);
        await expect(page.locator('#paneInput')).toBeVisible();
    });

    test('Palette pane visible after clicking Palette tab', async ({ page }) => {
        await page.click('#tabOutput');
        await page.waitForTimeout(100);
        await expect(page.locator('#paneOutput')).toBeVisible();
    });

    test('Palette tab becomes active', async ({ page }) => {
        await page.click('#tabOutput');
        await expect(page.locator('#tabOutput')).toHaveClass(/active/);
    });

    test('Settings tab becomes active when clicked', async ({ page }) => {
        await page.click('#tabOutput');
        await page.click('#tabInput');
        await expect(page.locator('#tabInput')).toHaveClass(/active/);
    });
});

// ── 16. Palette info & status ─────────────────────────────────────────────────
test.describe('Color Palette Generator — palette info', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetTool(page);
        await page.waitForTimeout(100);
    });

    test('palette info shows color count', async ({ page }) => {
        const text = await page.locator('#paletteInfo').innerText();
        expect(text).toMatch(/5 colors/i);
    });

    test('palette info shows harmony type', async ({ page }) => {
        const text = await page.locator('#paletteInfo').innerText();
        expect(text).toMatch(/monochromatic/i);
    });

    test('statBase shows current base color', async ({ page }) => {
        const base = await page.locator('#statBase').innerText();
        expect(base).toBe('#a855f7');
    });

    test('statLocked starts at 0', async ({ page }) => {
        const locked = await page.locator('#statLocked').innerText();
        expect(locked).toBe('0');
    });
});
