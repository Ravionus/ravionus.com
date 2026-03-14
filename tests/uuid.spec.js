// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/tools/uuid/`;

// ── Smoke tests (always run — pre-deploy gate) ────────────────────────────────
test.describe('UUID Generator — smoke', () => {
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
        await expect(page).toHaveTitle(/UUID.*Ravionus|Ravionus.*UUID/i);
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

    test('h1 heading is present and mentions UUID', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('UUID');
    });
});

// ── Feature tests (path-triggered + pre-deploy gate) ─────────────────────────
test.describe('UUID Generator — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('generates 5 UUIDs by default', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('.uuid-row')).toHaveCount(5);
    });

    test('generates correct count when count changed to 10', async ({ page }) => {
        await page.fill('#countInput', '10');
        await page.click('#btnGenerate');
        await expect(page.locator('.uuid-row')).toHaveCount(10);
    });

    test('lowercase format produces only lowercase hex characters', async ({ page }) => {
        await page.click('input[name="uuidCase"][value="lower"]');
        await page.click('#btnGenerate');
        const first = await page.locator('.uuid-value').first().textContent();
        // UUID v4 lowercase with hyphens: 8-4-4-4-12 hex
        expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('uppercase format produces only uppercase hex characters', async ({ page }) => {
        await page.click('input[name="uuidCase"][value="upper"]');
        await page.click('#btnGenerate');
        const first = await page.locator('.uuid-value').first().textContent();
        expect(first).toMatch(/^[0-9A-F-]+$/);
        expect(first).toContain('-');
    });

    test('disabling hyphens removes all hyphens (32 hex chars)', async ({ page }) => {
        await page.uncheck('#hyphensCheck');
        await page.click('#btnGenerate');
        const first = await page.locator('.uuid-value').first().textContent();
        expect(first).not.toContain('-');
        expect(first?.replace(/[{}]/g, '').length).toBe(32);
    });

    test('curly braces wrapper wraps each uuid in { }', async ({ page }) => {
        await page.click('input[name="uuidWrapper"][value="braces"]');
        await page.click('#btnGenerate');
        const first = await page.locator('.uuid-value').first().textContent();
        expect(first).toMatch(/^\{[0-9a-f-]+\}$/i);
    });

    test('urn wrapper prefixes each uuid with urn:uuid:', async ({ page }) => {
        await page.click('input[name="uuidWrapper"][value="urn"]');
        await page.click('#btnGenerate');
        const first = await page.locator('.uuid-value').first().textContent();
        expect(first).toMatch(/^urn:uuid:[0-9a-f-]+$/i);
    });

    test('all generated UUIDs are unique', async ({ page }) => {
        await page.fill('#countInput', '20');
        await page.click('#btnGenerate');
        const values = await page.locator('.uuid-value').allTextContents();
        const unique = new Set(values);
        expect(unique.size).toBe(20);
    });

    test('status bar shows correct generated count', async ({ page }) => {
        await page.fill('#countInput', '7');
        await page.click('#btnGenerate');
        await expect(page.locator('#statCount')).toHaveText('7');
    });

    test('clear removes all UUIDs and restores placeholder', async ({ page }) => {
        await page.click('#btnGenerate');
        await expect(page.locator('.uuid-row')).toHaveCount(5);
        await page.click('#btnClear');
        await expect(page.locator('.uuid-row')).toHaveCount(0);
        await expect(page.locator('#outputPlaceholder')).toBeVisible();
        await expect(page.locator('#statCount')).toHaveText('0');
    });

    test('copy all without UUIDs shows toast — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        // No generate → list is empty
        await page.click('#btnCopyAll');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download without UUIDs shows toast — no dialog', async ({ page }) => {
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.click('#btnDownload');
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('download with UUIDs triggers a .txt file download', async ({ page }) => {
        await page.click('#btnGenerate');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownload')
        ]);
        expect(download.suggestedFilename()).toMatch(/uuids.*\.txt$/);
    });

    test('copy individual UUID row shows toast — no dialog', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.click('#btnGenerate');
        const dialogs = /** @type {string[]} */ ([]);
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.locator('.uuid-row').first().locator('.ph-btn').click();
        expect(dialogs).toHaveLength(0);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('localStorage round-trip restores UUIDs on reload', async ({ page }) => {
        await page.fill('#countInput', '3');
        await page.click('#btnGenerate');
        const before = await page.locator('.uuid-value').allTextContents();
        expect(before).toHaveLength(3);
        await page.reload();
        const after = await page.locator('.uuid-value').allTextContents();
        expect(after).toEqual(before);
    });

    test('localStorage restores format settings on reload', async ({ page }) => {
        // Set uppercase + no hyphens + braces
        await page.click('input[name="uuidCase"][value="upper"]');
        await page.uncheck('#hyphensCheck');
        await page.click('input[name="uuidWrapper"][value="braces"]');
        await page.click('#btnGenerate');
        await page.reload();
        // Check settings were restored
        const caseVal    = await page.$eval('input[name="uuidCase"]:checked',    el => /** @type {HTMLInputElement} */ (el).value);
        const wrapperVal = await page.$eval('input[name="uuidWrapper"]:checked', el => /** @type {HTMLInputElement} */ (el).value);
        const hyphens    = await page.$eval('#hyphensCheck', el => /** @type {HTMLInputElement} */ (el).checked);
        expect(caseVal).toBe('upper');
        expect(wrapperVal).toBe('braces');
        expect(hyphens).toBe(false);
    });

    test('mobile output tab shows output pane and hides settings', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.reload();
        await expect(page.locator('#tabOutput')).toBeVisible();
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneSettings')).not.toBeVisible();
    });

    test('settings change live-updates results if UUIDs already exist', async ({ page }) => {
        await page.click('#btnGenerate');
        const before = await page.locator('.uuid-value').first().textContent();
        // Switch to uppercase — should regenerate
        await page.click('input[name="uuidCase"][value="upper"]');
        const after = await page.locator('.uuid-value').first().textContent();
        expect(after).toMatch(/^[0-9A-F-]+$/);
        // New UUIDs generated (very likely different)
        expect(after).not.toBe(before);
    });
});
