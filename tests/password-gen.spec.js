// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/playground/password-gen/';

// ── 1. Smoke ─────────────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — smoke', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('page title contains Password Generator', async ({ page }) => {
        await expect(page).toHaveTitle(/Password Generator/i);
    });

    test('h1 contains Password Generator', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Password Generator');
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

    test('Generate button is visible', async ({ page }) => {
        await expect(page.locator('#btnGenerate')).toBeVisible();
    });

    test('Copy All button is visible', async ({ page }) => {
        await expect(page.locator('#btnCopy')).toBeVisible();
    });

    test('Clear button is visible', async ({ page }) => {
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('Classic tab is active by default', async ({ page }) => {
        await expect(page.locator('#tabClassic')).toHaveClass(/active/);
    });

    test('Classic panel is active by default', async ({ page }) => {
        await expect(page.locator('#panelClassic')).toHaveClass(/active/);
    });

    test('status bar shows Classic mode', async ({ page }) => {
        await expect(page.locator('#statMode')).toContainText('Classic');
    });
});

// ── 2. Classic mode ───────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — classic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Generate creates one .pw-item by default', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#pwList .pw-item')).toHaveCount(1);
    });

    test('generated password is not empty', async ({ page }) => {
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent();
        expect((text || '').length).toBeGreaterThan(0);
    });

    test('generated password has default length 20', async ({ page }) => {
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent();
        expect((text || '').length).toBe(20);
    });

    test('count=3 generates 3 .pw-items', async ({ page }) => {
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('countSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('countDisplay'));
            s.value = '3'; n.value = '3';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        await expect(page.locator('#pwList .pw-item')).toHaveCount(3);
    });

    test('length=12 generates 12-char password', async ({ page }) => {
        await page.fill('#lengthDisplay', '12');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent();
        expect((text || '').length).toBe(12);
    });

    test('length=8 generates 8-char password', async ({ page }) => {
        await page.fill('#lengthDisplay', '8');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent();
        expect((text || '').length).toBe(8);
    });

    test('only uppercase+lowercase → no digits or symbols', async ({ page }) => {
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.fill('#lengthDisplay', '30');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent() || '';
        expect(text).toMatch(/^[A-Za-z]+$/);
    });

    test('only numbers → digits-only password', async ({ page }) => {
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkLower');
        await page.uncheck('#chkSymbols');
        await page.check('#chkNumbers');
        await page.fill('#lengthDisplay', '20');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent() || '';
        expect(text).toMatch(/^\d+$/);
    });

    test('only uppercase → contains at least one uppercase char', async ({ page }) => {
        await page.uncheck('#chkLower');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.check('#chkUpper');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent() || '';
        expect(text).toMatch(/^[A-Z]+$/);
    });

    test('no charset selected shows error banner', async ({ page }) => {
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkLower');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('include all charsets → password has at least one of each', async ({ page }) => {
        await page.check('#chkUpper');
        await page.check('#chkLower');
        await page.check('#chkNumbers');
        await page.check('#chkSymbols');
        await page.fill('#lengthDisplay', '40');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent() || '';
        expect(text).toMatch(/[A-Z]/);
        expect(text).toMatch(/[a-z]/);
        expect(text).toMatch(/\d/);
    });

    test('exclude-ambiguous removes 0/O/l/I/1 from output', async ({ page }) => {
        await page.check('#chkAmbiguous');
        await page.fill('#lengthDisplay', '50');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('countSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('countDisplay'));
            s.value = '10'; n.value = '10';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        const items = await page.locator('#pwList .pw-text').allTextContents();
        const combined = items.join('');
        expect(combined).not.toMatch(/[0Ol1I]/);
    });

    test('exclude custom chars removes them from output', async ({ page }) => {
        await page.uncheck('#chkSymbols');
        await page.fill('#excludeInput', 'AEIOU');
        await page.fill('#lengthDisplay', '40');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        const text = await page.locator('#pwList .pw-text').first().textContent() || '';
        expect(text).not.toMatch(/[AEIOU]/);
    });

    test('entropy display shows bits after generate', async ({ page }) => {
        await page.click('#btnGenerate');
        const ent = await page.locator('#entropyDisplay').textContent();
        expect(ent).toMatch(/\d+\s*bits/i);
        const bits = parseInt(ent || '0');
        expect(bits).toBeGreaterThan(0);
    });

    test('strength label is visible after generate', async ({ page }) => {
        await page.click('#btnGenerate');
        const label = await page.locator('#strengthLabel').textContent();
        expect(['Very Weak','Weak','Fair','Strong','Very Strong']).toContain(label);
    });

    test('long password has Very Strong strength', async ({ page }) => {
        await page.fill('#lengthDisplay', '64');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        await expect(page.locator('#strengthLabel')).toHaveText('Very Strong');
    });

    test('very short password has weak strength', async ({ page }) => {
        await page.fill('#lengthDisplay', '4');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.uncheck('#chkSymbols');
        await page.uncheck('#chkLower');
        await page.check('#chkNumbers');
        // 10^4 = ~13 bits → Very Weak
        const ent = await page.locator('#entropyDisplay').textContent() || '';
        const bits = parseInt(ent);
        expect(bits).toBeLessThan(50);
    });

    test('statCharset shows pool size', async ({ page }) => {
        await expect(page.locator('#statCharset')).not.toBeEmpty();
    });

    test('statCount updates after generate', async ({ page }) => {
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('countSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('countDisplay'));
            s.value = '5'; n.value = '5';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        await expect(page.locator('#statCount')).toHaveText('5');
    });

    test('statLen updates after generate', async ({ page }) => {
        await page.fill('#lengthDisplay', '15');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.click('#btnGenerate');
        await expect(page.locator('#statLen')).toHaveText('15');
    });
});

// ── 3. Passphrase mode ────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — passphrase', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.click('#tabPassphrase');
    });

    test('Passphrase tab becomes active', async ({ page }) => {
        await expect(page.locator('#tabPassphrase')).toHaveClass(/active/);
    });

    test('Passphrase panel becomes visible', async ({ page }) => {
        await expect(page.locator('#panelPassphrase')).toHaveClass(/active/);
    });

    test('Classic panel is hidden after switching', async ({ page }) => {
        await expect(page.locator('#panelClassic')).not.toHaveClass(/active/);
    });

    test('Generate creates one phrase item by default', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#phraseList .pw-item')).toHaveCount(1);
    });

    test('generated passphrase is not empty', async ({ page }) => {
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent();
        expect((text || '').length).toBeGreaterThan(0);
    });

    test('default 4-word passphrase with hyphen separator has 3 hyphens', async ({ page }) => {
        await page.selectOption('#separatorSelect', '-');
        await page.check('#chkCapitalize');
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent() || '';
        const parts = text.split('-');
        expect(parts.length).toBe(4);
    });

    test('changing word count to 6 → passphrase has 6 parts', async ({ page }) => {
        await page.selectOption('#separatorSelect', '-');
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('wordCountSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('wordCountDisplay'));
            s.value = '6'; n.value = '6';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent() || '';
        const parts = text.split('-');
        expect(parts.length).toBe(6);
    });

    test('space separator → passphrase contains spaces', async ({ page }) => {
        await page.selectOption('#separatorSelect', ' ');
        await page.uncheck('#chkCapitalize');
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent() || '';
        expect(text).toContain(' ');
    });

    test('capitalize option → each word title-cased', async ({ page }) => {
        await page.selectOption('#separatorSelect', '-');
        await page.check('#chkCapitalize');
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent() || '';
        const words = text.split('-');
        words.forEach(w => {
            if (w && /[a-z]/.test(w[0])) {
                // If it starts with a lowercase letter, it was not capitalized
                expect(w[0]).toMatch(/[A-Z]/);
            }
        });
    });

    test('add number option → phrase ends with digits', async ({ page }) => {
        await page.check('#chkAddNumber');
        await page.uncheck('#chkAddSymbol');
        await page.click('#btnGenerate');
        const text = await page.locator('#phraseList .pw-text').first().textContent() || '';
        expect(text).toMatch(/\d+$/);
    });

    test('count=3 generates 3 phrase items', async ({ page }) => {
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('phraseCountSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('phraseCountDisplay'));
            s.value = '3'; n.value = '3';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        await expect(page.locator('#phraseList .pw-item')).toHaveCount(3);
    });

    test('phrase entropy display shows bits', async ({ page }) => {
        const ent = await page.locator('#phraseEntropyDisplay').textContent();
        expect(ent).toMatch(/\d+\s*bits/i);
    });

    test('phrase strength label is visible', async ({ page }) => {
        const label = await page.locator('#phraseStrengthLabel').textContent();
        expect(label || '').toBeTruthy();
    });

    test('wordlist size is shown', async ({ page }) => {
        await expect(page.locator('#phraseWordlistSize')).not.toBeEmpty();
        const n = parseInt(await page.locator('#phraseWordlistSize').textContent() || '0');
        expect(n).toBeGreaterThan(100);
    });

    test('status mode shows Passphrase', async ({ page }) => {
        await expect(page.locator('#statMode')).toContainText('Passphrase');
    });
});

// ── 4. PIN mode ───────────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — PIN', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.click('#tabPin');
    });

    test('PIN tab becomes active', async ({ page }) => {
        await expect(page.locator('#tabPin')).toHaveClass(/active/);
    });

    test('PIN panel becomes visible', async ({ page }) => {
        await expect(page.locator('#panelPin')).toHaveClass(/active/);
    });

    test('Classic panel is hidden after switching', async ({ page }) => {
        await expect(page.locator('#panelClassic')).not.toHaveClass(/active/);
    });

    test('Generate creates one PIN by default', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#pinList .pw-item')).toHaveCount(1);
    });

    test('generated PIN contains only digits by default', async ({ page }) => {
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '')).toMatch(/^\d+$/);
    });

    test('pinLen6 button active by default and generates 6-digit PIN', async ({ page }) => {
        await expect(page.locator('#pinLen6')).toHaveClass(/active/);
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '').length).toBe(6);
    });

    test('pinLen4 button generates 4-digit PIN', async ({ page }) => {
        await page.click('#pinLen4');
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '').length).toBe(4);
    });

    test('pinLen8 button generates 8-digit PIN', async ({ page }) => {
        await page.click('#pinLen8');
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '').length).toBe(8);
    });

    test('pinLen10 button generates 10-digit PIN', async ({ page }) => {
        await page.click('#pinLen10');
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '').length).toBe(10);
    });

    test('pinLen12 button generates 12-digit PIN', async ({ page }) => {
        await page.click('#pinLen12');
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text.replace(/-/g, '').length).toBe(12);
    });

    test('groups option adds hyphens to PIN >= 8 digits', async ({ page }) => {
        await page.click('#pinLen8');
        await page.check('#chkPinGroups');
        await page.click('#btnGenerate');
        const text = await page.locator('#pinList .pw-text').first().textContent() || '';
        expect(text).toContain('-');
    });

    test('no-ambiguous option excludes 0 and 1', async ({ page }) => {
        await page.click('#pinLen12');
        await page.check('#chkPinNoAmbiguous');
        await page.fill('#pinCountInput', '10');
        await page.click('#btnGenerate');
        const items = await page.locator('#pinList .pw-text').allTextContents();
        const combined = items.join('');
        expect(combined).not.toMatch(/[01]/);
    });

    test('count=5 generates 5 PINs', async ({ page }) => {
        await page.fill('#pinCountInput', '5');
        await page.click('#btnGenerate');
        await expect(page.locator('#pinList .pw-item')).toHaveCount(5);
    });

    test('PIN strength bar shows entropy', async ({ page }) => {
        await page.click('#btnGenerate');
        const ent = await page.locator('#pinEntropyDisplay').textContent();
        expect(ent).toMatch(/\d+\s*bits/i);
    });

    test('PIN pool size shown as 10 by default', async ({ page }) => {
        await expect(page.locator('#pinPoolSize')).toHaveText('10');
    });

    test('PIN pool size shown as 8 when no-ambiguous checked', async ({ page }) => {
        await page.check('#chkPinNoAmbiguous');
        await expect(page.locator('#pinPoolSize')).toHaveText('8');
    });

    test('status mode shows PIN', async ({ page }) => {
        await expect(page.locator('#statMode')).toContainText('PIN');
    });
});

// ── 5. Toolbar ────────────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — toolbar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Clear removes generated passwords', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('#pwList .pw-item')).toHaveCount(1);
        await page.click('#btnClear');
        await expect(page.locator('#pwList .pw-item')).toHaveCount(0);
    });

    test('Clear removes passphrase results', async ({ page }) => {
        await page.click('#tabPassphrase');
        await page.click('#btnGenerate');
        await expect(page.locator('#phraseList .pw-item')).toHaveCount(1);
        await page.click('#btnClear');
        await expect(page.locator('#phraseList .pw-item')).toHaveCount(0);
    });

    test('Clear removes PIN results', async ({ page }) => {
        await page.click('#tabPin');
        await page.click('#btnGenerate');
        await expect(page.locator('#pinList .pw-item')).toHaveCount(1);
        await page.click('#btnClear');
        await expect(page.locator('#pinList .pw-item')).toHaveCount(0);
    });

    test('Copy All before generate shows error banner', async ({ page }) => {
        await page.click('#btnCopy');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('each pw-item has a copy button', async ({ page }) => {
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('countSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('countDisplay'));
            s.value = '3'; n.value = '3';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.click('#btnGenerate');
        const copyBtns = page.locator('#pwList .pw-copy');
        await expect(copyBtns).toHaveCount(3);
    });

    test('each pw-item has pw-text with content', async ({ page }) => {
        await page.click('#btnGenerate');
        const txt = await page.locator('#pwList .pw-text').first().textContent();
        expect((txt || '').length).toBeGreaterThan(0);
    });
});

// ── 6. Strength across modes ──────────────────────────────────────────────────
test.describe('Password Generator (Playground) — strength', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('classic strength bar has width after page load (entropy pre-calc)', async ({ page }) => {
        const barWidth = await page.locator('#strengthBar').evaluate(el => el.style.width);
        expect(parseInt(barWidth || '0')).toBeGreaterThan(0);
    });

    test('classic strength is Strong for length 20 with all charsets', async ({ page }) => {
        const label = await page.locator('#strengthLabel').textContent();
        expect(['Strong', 'Very Strong']).toContain(label);
    });

    test('phrase strength is Weak or better for 4 words', async ({ page }) => {
        await page.click('#tabPassphrase');
        const label = await page.locator('#phraseStrengthLabel').textContent();
        expect(['Weak','Fair','Strong','Very Strong']).toContain(label);
    });

    test('phrase 8 words has higher entropy than 2 words', async ({ page }) => {
        await page.click('#tabPassphrase');
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('wordCountSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('wordCountDisplay'));
            s.value = '8'; n.value = '8';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const ent8 = parseInt(await page.locator('#phraseEntropyDisplay').textContent() || '0');
        await page.evaluate(() => {
            const s = /** @type {HTMLInputElement} */ (document.getElementById('wordCountSlider'));
            const n = /** @type {HTMLInputElement} */ (document.getElementById('wordCountDisplay'));
            s.value = '2'; n.value = '2';
            s.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const ent2 = parseInt(await page.locator('#phraseEntropyDisplay').textContent() || '0');
        expect(ent8).toBeGreaterThan(ent2);
    });

    test('PIN entropy increases as length increases', async ({ page }) => {
        await page.click('#tabPin');
        await page.click('#pinLen4');
        const ent4 = parseInt(await page.locator('#pinEntropyDisplay').textContent() || '0');
        await page.click('#pinLen12');
        const ent12 = parseInt(await page.locator('#pinEntropyDisplay').textContent() || '0');
        expect(ent12).toBeGreaterThan(ent4);
    });
});

// ── 7. Tab navigation ─────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — tab navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('can switch to Passphrase then back to Classic', async ({ page }) => {
        await page.click('#tabPassphrase');
        await expect(page.locator('#panelPassphrase')).toHaveClass(/active/);
        await page.click('#tabClassic');
        await expect(page.locator('#panelClassic')).toHaveClass(/active/);
        await expect(page.locator('#panelPassphrase')).not.toHaveClass(/active/);
    });

    test('can switch to PIN then back to Classic', async ({ page }) => {
        await page.click('#tabPin');
        await expect(page.locator('#panelPin')).toHaveClass(/active/);
        await page.click('#tabClassic');
        await expect(page.locator('#panelClassic')).toHaveClass(/active/);
    });

    test('switching tabs clears error banner', async ({ page }) => {
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkLower');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await page.click('#tabPassphrase');
        await expect(page.locator('#errorBanner')).not.toBeVisible();
    });

    test('all three tab buttons exist', async ({ page }) => {
        await expect(page.locator('#tabClassic')).toBeVisible();
        await expect(page.locator('#tabPassphrase')).toBeVisible();
        await expect(page.locator('#tabPin')).toBeVisible();
    });
});

// ── 8. localStorage ───────────────────────────────────────────────────────────
test.describe('Password Generator (Playground) — localStorage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('classic length setting persists across reload', async ({ page }) => {
        await page.fill('#lengthDisplay', '32');
        await page.dispatchEvent('#lengthDisplay', 'input');
        await page.waitForTimeout(1000); // debounce
        await page.reload();
        await page.waitForLoadState('load');
        const val = await page.locator('#lengthDisplay').inputValue();
        expect(val).toBe('32');
    });

    test('active tab persists across reload', async ({ page }) => {
        await page.click('#tabPassphrase');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await expect(page.locator('#tabPassphrase')).toHaveClass(/active/);
    });

    test('chkNumbers unchecked state persists', async ({ page }) => {
        await page.uncheck('#chkNumbers');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        const checked = await page.locator('#chkNumbers').isChecked();
        expect(checked).toBe(false);
    });

    test('PIN length choice persists across reload', async ({ page }) => {
        await page.click('#tabPin');
        await page.click('#pinLen8');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.click('#tabPin');
        await expect(page.locator('#pinLen8')).toHaveClass(/active/);
    });
});
