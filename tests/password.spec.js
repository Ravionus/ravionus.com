// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/password/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('Password Generator — smoke', () => {
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
        await expect(page).toHaveTitle(/Password.*Ravionus|Ravionus.*Password/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('all toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnGenerate')).toBeVisible();
        await expect(page.locator('#btnCopyAll')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('h1 heading is present and mentions Password', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('Password');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('Password Generator — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('generates 5 passwords by default', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('.pw-row')).toHaveCount(5);
    });

    test('generates correct count when changed to 10', async ({ page }) => {
        await page.fill('#countInput', '10');
        await page.click('#btnGenerate');
        await expect(page.locator('.pw-row')).toHaveCount(10);
    });

    test('all passwords have the correct default length (16)', async ({ page }) => {
        await page.click('#btnGenerate');
        const values = await page.locator('.pw-value').allTextContents();
        expect(values).toHaveLength(5);
        values.forEach(pw => {
            expect(pw.length).toBe(16);
        });
    });

    test('lowercase-only produces only a-z characters', async ({ page }) => {
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        const first = await page.locator('.pw-value').first().textContent();
        expect(first).toMatch(/^[a-z]+$/);
    });

    test('uppercase-only produces only A-Z characters', async ({ page }) => {
        await page.uncheck('#chkLower');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        const first = await page.locator('.pw-value').first().textContent();
        expect(first).toMatch(/^[A-Z]+$/);
    });

    test('numbers-only produces only 0-9 characters', async ({ page }) => {
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkLower');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        const first = await page.locator('.pw-value').first().textContent();
        expect(first).toMatch(/^[0-9]+$/);
    });

    test('all four character sets: each password contains chars from every set', async ({ page }) => {
        // All 4 sets checked by default; use length 20 to ensure statistical certainty
        // The generator guarantees at least one char from each set
        await page.fill('#lengthInput', '20');
        // Trigger change event to sync slider
        await page.locator('#lengthInput').dispatchEvent('change');
        await page.click('#btnGenerate');
        const rows = page.locator('.pw-value');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            const pw = await rows.nth(i).textContent();
            expect(pw).toMatch(/[A-Z]/);      // has uppercase
            expect(pw).toMatch(/[a-z]/);      // has lowercase
            expect(pw).toMatch(/[0-9]/);      // has number
            expect(pw).toMatch(/[^a-zA-Z0-9]/); // has symbol
        }
    });

    test('20 generated passwords are all unique', async ({ page }) => {
        await page.fill('#countInput', '20');
        await page.click('#btnGenerate');
        const values = await page.locator('.pw-value').allTextContents();
        expect(values).toHaveLength(20);
        expect(new Set(values).size).toBe(20);
    });

    test('clear removes all passwords and restores placeholder', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('.pw-row')).toHaveCount(5);
        await page.click('#btnClear');
        await expect(page.locator('.pw-row')).toHaveCount(0);
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
        await expect(page.locator('#statCount')).toHaveText('0');
    });

    test('copy all without passwords shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnCopyAll');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download without passwords shows toast — no dialog', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownload');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download with passwords triggers a .txt file download', async ({ page }) => {
        await page.click('#btnGenerate');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownload')
        ]);
        expect(download.suggestedFilename()).toMatch(/passwords.*\.txt$/);
    });

    test('no charset selected shows error banner — no dialog or alert', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.uncheck('#chkUpper');
        await page.uncheck('#chkLower');
        await page.uncheck('#chkNumbers');
        await page.uncheck('#chkSymbols');
        await page.click('#btnGenerate');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('localStorage restores passwords on reload', async ({ page }) => {
        await page.click('#btnGenerate');
        const before = await page.locator('.pw-value').allTextContents();
        expect(before).toHaveLength(5);
        await page.reload();
        const after = await page.locator('.pw-value').allTextContents();
        expect(after).toEqual(before);
    });

    test('localStorage restores length and count settings on reload', async ({ page }) => {
        await page.fill('#countInput', '8');
        await page.fill('#lengthInput', '24');
        await page.locator('#lengthInput').dispatchEvent('change');
        await page.click('#btnGenerate');
        await page.reload();
        await expect(page.locator('#countInput')).toHaveValue('8');
        await expect(page.locator('#lengthInput')).toHaveValue('24');
    });

    test('copy individual password row shows toast — no dialog', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.click('#btnGenerate');
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.locator('.pw-row').first().locator('.ph-btn').click();
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('each generated password row has a strength badge', async ({ page }) => {
        await page.click('#btnGenerate');
        const badges = page.locator('.pw-strength');
        await expect(badges).toHaveCount(5);
        // All badges should have one of the four strength classes
        const count = await badges.count();
        for (let i = 0; i < count; i++) {
            const cls = await badges.nth(i).getAttribute('class');
            expect(cls).toMatch(/str-weak|str-fair|str-strong|str-vstrong/);
        }
    });

    test('slider and number input stay in sync', async ({ page }) => {
        await page.fill('#lengthSlider', '32');
        await page.locator('#lengthSlider').dispatchEvent('input');
        await expect(page.locator('#lengthInput')).toHaveValue('32');
    });

    test('exclude ambiguous: no 0 O I l 1 characters in output', async ({ page }) => {
        await page.check('#chkAmbiguous');
        await page.fill('#lengthInput', '64');
        await page.locator('#lengthInput').dispatchEvent('change');
        await page.fill('#countInput', '10');
        await page.click('#btnGenerate');
        const values = await page.locator('.pw-value').allTextContents();
        values.forEach(pw => {
            expect(pw).not.toMatch(/[0OIl1]/);
        });
    });

    test('mobile output tab shows output pane and hides settings', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.reload();
        await expect(page.locator('#tabOutput')).toBeVisible();
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneSettings')).not.toBeVisible();
    });
});
