// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/playground/base-converter/';

// ── 1. Smoke ─────────────────────────────────────────────────────────────────
test.describe('Base Converter — smoke', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('page title contains Base Converter', async ({ page }) => {
        await expect(page).toHaveTitle(/Base Converter/i);
    });

    test('h1 contains Base Converter', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Base Converter');
    });

    test('no JS errors on load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        expect(errors).toHaveLength(0);
    });

    test('no CSP violations on load', async ({ page }) => {
        const violations = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('Content Security Policy'))
                violations.push(msg.text());
        });
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        expect(violations).toHaveLength(0);
    });

    test('nav breadcrumb is visible', async ({ page }) => {
        await expect(page.locator('nav .breadcrumb')).toBeVisible();
    });

    test('Convert button is visible', async ({ page }) => {
        await expect(page.locator('#btnConvert')).toBeVisible();
    });

    test('value input is visible', async ({ page }) => {
        await expect(page.locator('#valueInput')).toBeVisible();
    });

    test('fromBase select is visible', async ({ page }) => {
        await expect(page.locator('#fromBase')).toBeVisible();
    });

    test('Clear button is visible', async ({ page }) => {
        await expect(page.locator('#btnClear')).toBeVisible();
    });
});

// ── 2. Core conversion — decimal ─────────────────────────────────────────────
test.describe('Base Converter — decimal conversions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('255 decimal → binary FF0 pattern', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const bin = await page.locator('#result-2').textContent();
        expect(bin).toBe('11111111');
    });

    test('255 decimal → octal 377', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-8').textContent()).toBe('377');
    });

    test('255 decimal → hex FF', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-16').textContent()).toBe('FF');
    });

    test('255 decimal stays 255', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('255');
    });

    test('0 converts to 0 in all bases', async ({ page }) => {
        await page.fill('#valueInput', '0');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-2').textContent()).toBe('0');
        expect(await page.locator('#result-16').textContent()).toBe('0');
    });

    test('1 converts correctly', async ({ page }) => {
        await page.fill('#valueInput', '1');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-2').textContent()).toBe('1');
        expect(await page.locator('#result-8').textContent()).toBe('1');
        expect(await page.locator('#result-16').textContent()).toBe('1');
    });

    test('42 decimal → binary 101010', async ({ page }) => {
        await page.fill('#valueInput', '42');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-2').textContent()).toBe('101010');
    });

    test('1000 decimal → hex 3E8', async ({ page }) => {
        await page.fill('#valueInput', '1000');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-16').textContent()).toBe('3E8');
    });

    test('success banner shows after convert', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ── 3. Binary input ───────────────────────────────────────────────────────────
test.describe('Base Converter — binary input', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('11111111 binary → decimal 255', async ({ page }) => {
        await page.fill('#valueInput', '11111111');
        await page.selectOption('#fromBase', '2');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('255');
    });

    test('101010 binary → decimal 42', async ({ page }) => {
        await page.fill('#valueInput', '101010');
        await page.selectOption('#fromBase', '2');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('42');
    });

    test('1 binary → decimal 1', async ({ page }) => {
        await page.fill('#valueInput', '1');
        await page.selectOption('#fromBase', '2');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('1');
    });

    test('invalid binary input shows error', async ({ page }) => {
        await page.fill('#valueInput', '11211');
        await page.selectOption('#fromBase', '2');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ── 4. Hex input ─────────────────────────────────────────────────────────────
test.describe('Base Converter — hex input', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('FF hex → decimal 255', async ({ page }) => {
        await page.fill('#valueInput', 'FF');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('255');
    });

    test('ff hex (lowercase) → decimal 255', async ({ page }) => {
        await page.fill('#valueInput', 'ff');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('255');
    });

    test('DEAD hex → binary', async ({ page }) => {
        await page.fill('#valueInput', 'DEAD');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const dec = await page.locator('#result-10').textContent();
        expect(Number(dec)).toBe(0xDEAD);
    });

    test('3E8 hex → decimal 1000', async ({ page }) => {
        await page.fill('#valueInput', '3E8');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('1000');
    });

    test('invalid hex input shows error', async ({ page }) => {
        await page.fill('#valueInput', 'GHI');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ── 5. Octal input ───────────────────────────────────────────────────────────
test.describe('Base Converter — octal input', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('377 octal → decimal 255', async ({ page }) => {
        await page.fill('#valueInput', '377');
        await page.selectOption('#fromBase', '8');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('255');
    });

    test('10 octal → decimal 8', async ({ page }) => {
        await page.fill('#valueInput', '10');
        await page.selectOption('#fromBase', '8');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-10').textContent()).toBe('8');
    });

    test('invalid octal input shows error', async ({ page }) => {
        await page.fill('#valueInput', '89');
        await page.selectOption('#fromBase', '8');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ── 6. Custom base ────────────────────────────────────────────────────────────
test.describe('Base Converter — custom base', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('custom base 5: 255 decimal → base-5', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.fill('#customBase', '5');
        await page.click('#btnCustom');
        await page.waitForTimeout(100);
        const val = await page.locator('#customResult').textContent();
        expect(val).toBe('2010');
    });

    test('custom base 3: 10 decimal → 101', async ({ page }) => {
        await page.fill('#valueInput', '10');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.fill('#customBase', '3');
        await page.click('#btnCustom');
        await page.waitForTimeout(100);
        const val = await page.locator('#customResult').textContent();
        expect(val).toBe('101');
    });

    test('custom base 36: 255 decimal → 73', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.fill('#customBase', '36');
        await page.click('#btnCustom');
        await page.waitForTimeout(100);
        const val = await page.locator('#customResult').textContent();
        expect(val).toBe('73');
    });

    test('custom base 16 matches hex result', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.fill('#customBase', '16');
        await page.click('#btnCustom');
        await page.waitForTimeout(100);
        const custom = await page.locator('#customResult').textContent();
        const hex    = await page.locator('#result-16').textContent();
        expect(custom).toBe(hex);
    });
});

// ── 7. Bit-width representations ────────────────────────────────────────────
test.describe('Base Converter — bit widths', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('255 shows 8-bit = 11111111', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#bit8val').textContent()).toBe('11111111');
    });

    test('255 shows 16-bit padded', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const v = await page.locator('#bit16val').textContent();
        expect(v).toBe('0000000011111111');
    });

    test('1 shows 8-bit = 00000001', async ({ page }) => {
        await page.fill('#valueInput', '1');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#bit8val').textContent()).toBe('00000001');
    });

    test('0 shows 8-bit = 00000000', async ({ page }) => {
        await page.fill('#valueInput', '0');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#bit8val').textContent()).toBe('00000000');
    });

    test('65535 shows 16-bit = 1111111111111111', async ({ page }) => {
        await page.fill('#valueInput', '65535');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#bit16val').textContent()).toBe('1111111111111111');
    });

    test('large value has 32-bit representation', async ({ page }) => {
        await page.fill('#valueInput', '4294967295');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const v = await page.locator('#bit32val').textContent();
        expect(v).toBe('11111111111111111111111111111111');
    });

    test('256 shows 8-bit as > 8-bit overflow', async ({ page }) => {
        await page.fill('#valueInput', '256');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const v = await page.locator('#bit8val').textContent();
        expect(v).toContain('8');
    });
});

// ── 8. Error handling ─────────────────────────────────────────────────────────
test.describe('Base Converter — error handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('empty input shows error banner', async ({ page }) => {
        await page.fill('#valueInput', '');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('no alert() dialogs fired on invalid input', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.fill('#valueInput', 'invalid!@#');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(dialogs).toHaveLength(0);
    });

    test('letters in decimal base show error', async ({ page }) => {
        await page.fill('#valueInput', 'abc');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('special chars show error', async ({ page }) => {
        await page.fill('#valueInput', '12!34');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ── 9. Toolbar actions ────────────────────────────────────────────────────────
test.describe('Base Converter — toolbar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Random sample loads a valid number and converts', async ({ page }) => {
        await page.click('#btnSample');
        await page.waitForTimeout(100);
        const val = await page.locator('#result-10').textContent();
        expect(Number(val)).toBeGreaterThan(0);
    });

    test('Clear empties the input', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnClear');
        await page.waitForTimeout(100);
        expect(await page.locator('#valueInput').inputValue()).toBe('');
    });

    test('Clear resets results to dash', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.click('#btnClear');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-2').textContent()).toBe('—');
        expect(await page.locator('#result-16').textContent()).toBe('—');
    });

    test('Clear shows toast', async ({ page }) => {
        await page.click('#btnClear');
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Enter key triggers convert', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.locator('#valueInput').press('Enter');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-16').textContent()).toBe('FF');
    });

    test('second Convert button (input row) also converts', async ({ page }) => {
        await page.fill('#valueInput', '10');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert2');
        await page.waitForTimeout(100);
        expect(await page.locator('#result-2').textContent()).toBe('1010');
    });
});

// ── 10. Clipboard ─────────────────────────────────────────────────────────────
test.describe('Base Converter — clipboard', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('clicking decimal result card copies to clipboard', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.click('#card-dec');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toBe('255');
    });

    test('clicking hex result card copies to clipboard', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.click('#card-hex');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toBe('FF');
    });

    test('Copy Decimal button copies decimal value', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.click('#btnCopy');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toBe('255');
    });

    test('Copy Decimal with no result shows error banner', async ({ page }) => {
        await page.click('#btnCopy');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('copy shows toast', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        await page.click('#card-bin');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });
});

// ── 11. Status bar ────────────────────────────────────────────────────────────
test.describe('Base Converter — status bar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('status shows decimal value after convert', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#statDec').textContent()).toBe('255');
    });

    test('status shows source base', async ({ page }) => {
        await page.fill('#valueInput', 'FF');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#statBase').textContent()).toContain('16');
    });

    test('status bit count is non-empty after convert', async ({ page }) => {
        await page.fill('#valueInput', '255');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        expect(await page.locator('#statBits').textContent()).toBeTruthy();
    });
});

// ── 12. localStorage ─────────────────────────────────────────────────────────
test.describe('Base Converter — localStorage', () => {
    test('input value persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(300);
        expect(await page.locator('#valueInput').inputValue()).toBe('255');
    });

    test('fromBase persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#valueInput', 'FF');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(300);
        expect(await page.locator('#fromBase').inputValue()).toBe('16');
    });

    test('results auto-restore on reload', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#valueInput', '255');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(300);
        expect(await page.locator('#result-16').textContent()).toBe('FF');
    });
});

// ── 13. Cross-base round-trip ─────────────────────────────────────────────────
test.describe('Base Converter — round-trip', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('hex → decimal yields same as binary → decimal for 255', async ({ page }) => {
        // hex path
        await page.fill('#valueInput', 'FF');
        await page.selectOption('#fromBase', '16');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const fromHex = await page.locator('#result-10').textContent();

        // binary path
        await page.fill('#valueInput', '11111111');
        await page.selectOption('#fromBase', '2');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const fromBin = await page.locator('#result-10').textContent();

        expect(fromHex).toBe(fromBin);
        expect(fromHex).toBe('255');
    });

    test('octal → decimal matches decimal → binary for 8', async ({ page }) => {
        await page.fill('#valueInput', '10');
        await page.selectOption('#fromBase', '8');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const dec = await page.locator('#result-10').textContent();
        const bin = await page.locator('#result-2').textContent();
        expect(dec).toBe('8');
        expect(bin).toBe('1000');
    });

    test('base 36 → decimal 35 = Z', async ({ page }) => {
        await page.fill('#valueInput', '35');
        await page.selectOption('#fromBase', '10');
        await page.click('#btnConvert');
        await page.waitForTimeout(100);
        const b36 = await page.locator('#result-36').textContent();
        expect(b36).toBe('Z');
    });
});
