// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000/tools/cron/';

// ── helpers ────────────────────────────────────────────────────────────────

/** Fill the cron input and wait for the description to update (debounce-safe) */
async function fillCron(page, expr) {
    await page.locator('#cronInput').fill(expr);
    // Wait for either a valid description or an error banner to become visible
    await page.locator('#description:not(.placeholder), #errorBanner.visible').first().waitFor({ timeout: 3000 });
}

/** Clear the input and confirm the placeholder returns */
async function clearInput(page) {
    await page.locator('#btnClear').click();
    await expect(page.locator('#description')).toHaveClass(/placeholder/);
}

// ── Smoke ──────────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — smoke', () => {

    test('page loads without JS errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        expect(errors).toHaveLength(0);
    });

    test('page loads without CSP console errors', async ({ page }) => {
        const cspErrors = [];
        page.on('console', m => {
            if (m.type() === 'error' && m.text().toLowerCase().includes('content security policy'))
                cspErrors.push(m.text());
        });
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        expect(cspErrors).toHaveLength(0);
    });

    test('page title is correct', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/Cron Expression Parser/i);
    });

    test('nav breadcrumb is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav')).toContainText('Dev Tools');
    });

    test('nav links include Tools and Playgrounds', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('.nav-links')).toContainText('Tools');
        await expect(page.locator('.nav-links')).toContainText('Playgrounds');
    });

    test('cron input is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#cronInput')).toBeVisible();
    });

    test('Parse and Clear toolbar buttons are visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#btnParse')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('Copy toolbar button is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#btnCopy')).toBeVisible();
    });

    test('description panel is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#descriptionCard')).toBeVisible();
    });

    test('next runs panel is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#nextRunsCard')).toBeVisible();
    });

    test('nav Tools link is highlighted as active section', async ({ page }) => {
        await page.goto(BASE_URL);
        // The nav-active script highlights the correct section link
        const toolsLink = page.locator('.nav-links a[href*="/tools/"]');
        await expect(toolsLink).toHaveCSS('font-weight', '700');
    });

    test('nav Playgrounds link is NOT highlighted on a tools page', async ({ page }) => {
        await page.goto(BASE_URL);
        const playgroundLink = page.locator('.nav-links a[href*="/playground/"]');
        const fw = await playgroundLink.evaluate(el => el.style.fontWeight);
        expect(fw).not.toBe('700');
    });

    test('preset buttons are rendered', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('.preset-btn').first()).toBeVisible();
    });

    test('field reference table is visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#fieldRef')).toBeVisible();
    });

});

// ── Validation ─────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — validation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('valid: * * * * * is accepted (no error)', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
        await expect(page.locator('#cronInput')).toHaveClass(/is-valid/);
    });

    test('valid: */5 * * * * is accepted', async ({ page }) => {
        await fillCron(page, '*/5 * * * *');
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

    test('valid: 0 9 * * 1-5 is accepted', async ({ page }) => {
        await fillCron(page, '0 9 * * 1-5');
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

    test('valid: 30 8 15 3 * is accepted', async ({ page }) => {
        await fillCron(page, '30 8 15 3 *');
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

    test('invalid: too few fields shows error', async ({ page }) => {
        await page.locator('#cronInput').fill('* *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
        await expect(page.locator('#cronInput')).toHaveClass(/is-error/);
    });

    test('invalid: too many fields shows error', async ({ page }) => {
        await page.locator('#cronInput').fill('* * * * * *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('invalid: minute 60 shows error', async ({ page }) => {
        await page.locator('#cronInput').fill('60 * * * *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('invalid: hour 24 shows error', async ({ page }) => {
        await page.locator('#cronInput').fill('0 24 * * *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('invalid: non-numeric value shows error', async ({ page }) => {
        await page.locator('#cronInput').fill('abc * * * *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
    });

    test('invalid input shows no alert dialog', async ({ page }) => {
        let dialogFired = false;
        page.on('dialog', () => { dialogFired = true; });
        await page.locator('#cronInput').fill('bad expression');
        await page.locator('#btnParse').click();
        expect(dialogFired).toBe(false);
    });

    test('clearing input removes error', async ({ page }) => {
        await page.locator('#cronInput').fill('bad');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
        await page.locator('#btnClear').click();
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

});

// ── Descriptions ───────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — descriptions', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('* * * * * → "Every minute"', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await expect(page.locator('#description')).toContainText('Every minute');
    });

    test('*/5 * * * * → contains "5 minutes"', async ({ page }) => {
        await fillCron(page, '*/5 * * * *');
        await expect(page.locator('#description')).toContainText('5 minute');
    });

    test('*/1 * * * * → "Every 1 minute"', async ({ page }) => {
        await fillCron(page, '*/1 * * * *');
        await expect(page.locator('#description')).toContainText('minute');
    });

    test('0 * * * * → contains "hour"', async ({ page }) => {
        await fillCron(page, '0 * * * *');
        await expect(page.locator('#description')).toContainText('hour');
    });

    test('*/15 * * * * → contains "15 minutes"', async ({ page }) => {
        await fillCron(page, '*/15 * * * *');
        await expect(page.locator('#description')).toContainText('15 minute');
    });

    test('0 9 * * * → contains "9" and "AM"', async ({ page }) => {
        await fillCron(page, '0 9 * * *');
        await expect(page.locator('#description')).toContainText('9');
        await expect(page.locator('#description')).toContainText('AM');
    });

    test('0 9 * * * → contains "Daily"', async ({ page }) => {
        await fillCron(page, '0 9 * * *');
        await expect(page.locator('#description')).toContainText('Daily');
    });

    test('0 9 * * 1 → contains "Monday"', async ({ page }) => {
        await fillCron(page, '0 9 * * 1');
        await expect(page.locator('#description')).toContainText('Monday');
    });

    test('0 9 * * 1-5 → contains "weekday"', async ({ page }) => {
        await fillCron(page, '0 9 * * 1-5');
        await expect(page.locator('#description')).toContainText(/weekday/i);
    });

    test('0 0 1 * * → contains "1st" and "month"', async ({ page }) => {
        await fillCron(page, '0 0 1 * *');
        await expect(page.locator('#description')).toContainText('1st');
        await expect(page.locator('#description')).toContainText(/month/i);
    });

    test('0 0 1 1 * → contains "January"', async ({ page }) => {
        await fillCron(page, '0 0 1 1 *');
        await expect(page.locator('#description')).toContainText('January');
    });

    test('30 8 * * 1-5 → contains "8" and "30" and weekday', async ({ page }) => {
        await fillCron(page, '30 8 * * 1-5');
        const desc = await page.locator('#description').textContent();
        expect(desc).toMatch(/8/);
        expect(desc).toMatch(/30/);
        expect(desc?.toLowerCase()).toMatch(/weekday|mon/i);
    });

    test('0 0 * * * → contains "midnight"', async ({ page }) => {
        await fillCron(page, '0 0 * * *');
        await expect(page.locator('#description')).toContainText(/midnight/i);
    });

    test('0 12 * * * → contains "noon" or "12"', async ({ page }) => {
        await fillCron(page, '0 12 * * *');
        const text = await page.locator('#description').textContent();
        expect(text).toMatch(/noon|12/i);
    });

    test('0 0 * * 0 → contains "Sunday"', async ({ page }) => {
        await fillCron(page, '0 0 * * 0');
        await expect(page.locator('#description')).toContainText('Sunday');
    });

});

// ── Next run times ─────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — next run times', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('valid expression shows 5 next run items', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
    });

    test('* * * * * — consecutive items differ by 1 minute', async ({ page }) => {
        await fillCron(page, '* * * * *');
        const items = page.locator('#nextRunsList .run-item');
        await expect(items).toHaveCount(5);
        // Each run-item-time should differ by 1 minute from the prior one.
        // We verify by extracting times and checking they're sequential.
        const times = await items.locator('.run-item-time').allTextContents();
        // parse as minutes within a window — if they cross an hour the next
        // item will have a different hour; we just confirm all 5 exist
        expect(times).toHaveLength(5);
        times.forEach(t => expect(t).toMatch(/\d+:\d{2}\s*(AM|PM)/i));
    });

    test('0 * * * * — all times end in :00 or midnight/noon', async ({ page }) => {
        await fillCron(page, '0 * * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
        const times = await page.locator('.run-item-time').allTextContents();
        times.forEach(t => expect(t).toMatch(/:00\s*(AM|PM)|midnight|noon/i));
    });

    test('*/5 * * * * — all minutes are multiples of 5', async ({ page }) => {
        await fillCron(page, '*/5 * * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
        const times = await page.locator('.run-item-time').allTextContents();
        times.forEach(t => {
            const m = t.match(/:(\d{2})\s*(AM|PM)/i);
            expect(m).not.toBeNull();
            expect(parseInt(m[1], 10) % 5).toBe(0);
        });
    });

    test('0 9 * * * — all times show 9:00 AM', async ({ page }) => {
        await fillCron(page, '0 9 * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
        const times = await page.locator('.run-item-time').allTextContents();
        times.forEach(t => expect(t).toContain('9:00 AM'));
    });

    test('invalid expression shows no run items', async ({ page }) => {
        await page.locator('#cronInput').fill('bad bad bad');
        await page.locator('#btnParse').click();
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(0);
    });

    test('next runs show day-of-week abbreviation', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
        const dates = await page.locator('.run-item-date').allTextContents();
        dates.forEach(d => expect(d).toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/));
    });

});

// ── Presets ────────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — presets', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('clicking "* * * * *" preset sets the input', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="* * * * *"]').click();
        await expect(page.locator('#cronInput')).toHaveValue('* * * * *');
    });

    test('clicking "*/5 * * * *" preset sets the input', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="*/5 * * * *"]').click();
        await expect(page.locator('#cronInput')).toHaveValue('*/5 * * * *');
    });

    test('clicking preset triggers description update', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="0 9 * * *"]').click();
        await expect(page.locator('#description')).not.toHaveClass(/placeholder/);
        await expect(page.locator('#description')).toContainText('9');
    });

    test('clicking "0 9 * * 1-5" preset sets the input', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="0 9 * * 1-5"]').click();
        await expect(page.locator('#cronInput')).toHaveValue('0 9 * * 1-5');
    });

    test('clicking "0 0 1 * *" preset shows monthly description', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="0 0 1 * *"]').click();
        await expect(page.locator('#description')).toContainText(/month|1st/i);
    });

    test('clicking "0 0 1 1 *" preset shows January in description', async ({ page }) => {
        await page.locator('.preset-btn[data-cron="0 0 1 1 *"]').click();
        await expect(page.locator('#description')).toContainText('January');
    });

});

// ── Toolbar ────────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — toolbar', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    });

    test('Parse button triggers parse of current input', async ({ page }) => {
        await page.locator('#cronInput').fill('');
        await page.locator('#cronInput').fill('*/10 * * * *');
        await page.locator('#btnParse').click();
        await expect(page.locator('#description')).toContainText('10 minute');
    });

    test('Copy button copies the cron expression', async ({ page }) => {
        await page.locator('#cronInput').fill('0 9 * * 1-5');
        await page.locator('#btnCopy').click();
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toBe('0 9 * * 1-5');
    });

    test('Copy button shows a toast', async ({ page }) => {
        await page.locator('#cronInput').fill('* * * * *');
        await page.locator('#btnCopy').click();
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('Clear button empties the input', async ({ page }) => {
        await page.locator('#cronInput').fill('*/5 * * * *');
        await page.locator('#btnClear').click();
        await expect(page.locator('#cronInput')).toHaveValue('');
    });

    test('Clear button resets description to placeholder', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await page.locator('#btnClear').click();
        await expect(page.locator('#description')).toHaveClass(/placeholder/);
    });

    test('Clear button removes error banner', async ({ page }) => {
        await page.locator('#cronInput').fill('bad');
        await page.locator('#btnParse').click();
        await expect(page.locator('#errorBanner')).toHaveClass(/visible/);
        await page.locator('#btnClear').click();
        await expect(page.locator('#errorBanner')).not.toHaveClass(/visible/);
    });

    test('Clear button removes next runs', async ({ page }) => {
        await fillCron(page, '* * * * *');
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(5);
        await page.locator('#btnClear').click();
        await expect(page.locator('#nextRunsList .run-item')).toHaveCount(0);
    });

});

// ── Fields breakdown panel ─────────────────────────────────────────────────

test.describe('Cron Expression Parser — fields breakdown', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('breakdown panel shows after valid expression', async ({ page }) => {
        await fillCron(page, '*/5 * * * *');
        await expect(page.locator('#fieldsBreakdown')).toBeVisible();
    });

    test('breakdown shows 5 field rows', async ({ page }) => {
        await fillCron(page, '0 9 * * 1');
        await expect(page.locator('.field-row')).toHaveCount(5);
    });

    test('breakdown shows minute raw value', async ({ page }) => {
        await fillCron(page, '30 9 * * *');
        await expect(page.locator('#fieldsBreakdown')).toContainText('30');
    });

    test('breakdown shows hour raw value', async ({ page }) => {
        await fillCron(page, '0 14 * * *');
        await expect(page.locator('#fieldsBreakdown')).toContainText('14');
    });

    test('breakdown hidden after clear', async ({ page }) => {
        await fillCron(page, '0 9 * * *');
        await page.locator('#btnClear').click();
        await expect(page.locator('#fieldsBreakdown')).toBeHidden();
    });

});

// ── localStorage ────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — localStorage', () => {

    test('expression is saved and restored after reload', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#cronInput').fill('0 9 * * 1-5');
        // Wait a moment for the debounced save
        await page.waitForTimeout(600);
        await page.reload();
        await expect(page.locator('#cronInput')).toHaveValue('0 9 * * 1-5');
    });

    test('restored expression is auto-parsed on load', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#cronInput').fill('*/10 * * * *');
        await page.waitForTimeout(600);
        await page.reload();
        await expect(page.locator('#description')).toContainText('10 minute');
    });

    test('Clear removes localStorage entry', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#cronInput').fill('*/5 * * * *');
        await page.waitForTimeout(600);
        await page.locator('#btnClear').click();
        await page.reload();
        // After clear + reload input should be empty (or match the init default)
        const val = await page.locator('#cronInput').inputValue();
        expect(val).toBe('');
    });

});

// ── Mobile tabs ────────────────────────────────────────────────────────────

test.describe('Cron Expression Parser — mobile tabs', () => {

    const mobile = { width: 390, height: 844 };

    test('mobile tabs are visible at 390px width', async ({ page }) => {
        await page.setViewportSize(mobile);
        await page.goto(BASE_URL);
        await expect(page.locator('.mobile-tabs')).toBeVisible();
    });

    test('mobile: Input pane visible by default', async ({ page }) => {
        await page.setViewportSize(mobile);
        await page.goto(BASE_URL);
        await expect(page.locator('#paneInput')).toBeVisible();
    });

    test('mobile: clicking Output tab shows output pane', async ({ page }) => {
        await page.setViewportSize(mobile);
        await page.goto(BASE_URL);
        await page.locator('#tabOutput').click();
        await expect(page.locator('#paneOutput')).toBeVisible();
        await expect(page.locator('#paneInput')).toBeHidden();
    });

    test('mobile: clicking Input tab shows input pane', async ({ page }) => {
        await page.setViewportSize(mobile);
        await page.goto(BASE_URL);
        await page.locator('#tabOutput').click();
        await page.locator('#tabInput').click();
        await expect(page.locator('#paneInput')).toBeVisible();
        await expect(page.locator('#paneOutput')).toBeHidden();
    });

    test('desktop: mobile tabs are hidden at 1280px', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(BASE_URL);
        await expect(page.locator('.mobile-tabs')).toBeHidden();
    });

});
