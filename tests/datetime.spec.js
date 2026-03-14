// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/playground/datetime/';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function goToTab(page, tabId) {
    await page.click(`#${tabId}`);
    await page.waitForTimeout(50);
}

// ── 1. Smoke ─────────────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — smoke', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('page title contains Date/Time Utilities', async ({ page }) => {
        await expect(page).toHaveTitle(/Date\/Time Utilities/i);
    });

    test('h1 contains Date/Time Utilities', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Date/Time Utilities');
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

    test('Fill Now toolbar button is visible', async ({ page }) => {
        await expect(page.locator('#btnNow')).toBeVisible();
    });

    test('Copy Result toolbar button is visible', async ({ page }) => {
        await expect(page.locator('#btnCopyResult')).toBeVisible();
    });

    test('Clear toolbar button is visible', async ({ page }) => {
        await expect(page.locator('#btnClear')).toBeVisible();
    });
});

// ── 2. Tab navigation ─────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — tab navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Timestamp tab is active by default', async ({ page }) => {
        await expect(page.locator('#tabTimestamp')).toHaveClass(/active/);
        await expect(page.locator('#panelTimestamp')).toBeVisible();
    });

    test('Calculator tab shows its panel', async ({ page }) => {
        await page.click('#tabCalculator');
        await expect(page.locator('#panelCalculator')).toBeVisible();
        await expect(page.locator('#panelTimestamp')).toBeHidden();
    });

    test('Timezone tab shows its panel', async ({ page }) => {
        await page.click('#tabTimezone');
        await expect(page.locator('#panelTimezone')).toBeVisible();
        await expect(page.locator('#panelTimestamp')).toBeHidden();
    });

    test('Formats tab shows its panel', async ({ page }) => {
        await page.click('#tabFormats');
        await expect(page.locator('#panelFormats')).toBeVisible();
        await expect(page.locator('#panelTimestamp')).toBeHidden();
    });

    test('clicking active tab maintains its active state', async ({ page }) => {
        await page.click('#tabTimestamp');
        await expect(page.locator('#tabTimestamp')).toHaveClass(/active/);
    });

    test('tab aria-selected is updated', async ({ page }) => {
        await page.click('#tabCalculator');
        await expect(page.locator('#tabCalculator')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#tabTimestamp')).toHaveAttribute('aria-selected', 'false');
    });

    test('status bar Utility reflects active tab name', async ({ page }) => {
        await page.click('#tabTimezone');
        const text = await page.locator('#statTab').innerText();
        expect(text).toBe('Timezone');
    });
});

// ── 3. Timestamp panel ────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Timestamp', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('ts input and decode button are visible', async ({ page }) => {
        await expect(page.locator('#tsInput')).toBeVisible();
        await expect(page.locator('#btnTsDecode')).toBeVisible();
    });

    test('decode a known Unix timestamp', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        const iso = await page.locator('#tsIsoResult').textContent();
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    test('decoded result shows Unix seconds', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        const sec = await page.locator('#tsSecResult').textContent();
        expect(sec).toBe('1741910400');
    });

    test('decoded result shows Unix ms', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        const ms = await page.locator('#tsMsResult').textContent();
        expect(ms).toBe('1741910400000');
    });

    test('decode ms unit divides by 1000', async ({ page }) => {
        await page.fill('#tsInput', '1741910400000');
        await page.selectOption('#tsUnit', 'ms');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        const sec = await page.locator('#tsSecResult').textContent();
        expect(sec).toBe('1741910400');
    });

    test('empty timestamp shows error banner', async ({ page }) => {
        await page.fill('#tsInput', '');
        await page.click('#btnTsDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('invalid timestamp shows error banner', async ({ page }) => {
        await page.fill('#tsInput', 'notanumber');
        await page.click('#btnTsDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('Now button fills timestamp and decodes', async ({ page }) => {
        await page.click('#btnTsNow');
        await page.waitForTimeout(100);
        const val = await page.locator('#tsInput').inputValue();
        expect(Number(val)).toBeGreaterThan(0);
        const sec = await page.locator('#tsSecResult').textContent();
        expect(sec).not.toBe('—');
    });

    test('Human date/time encode shows ISO result', async ({ page }) => {
        await page.fill('#humanDateInput', '2026-03-14');
        await page.fill('#humanTimeInput', '12:00');
        await page.click('#btnHumanEncode');
        await page.waitForTimeout(100);
        const iso = await page.locator('#tsIsoResult').textContent();
        expect(iso).toMatch(/2026-03-14/);
    });

    test('success banner appears after successful decode', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('Today button fills human date and encodes', async ({ page }) => {
        await page.click('#btnHumanNow');
        await page.waitForTimeout(100);
        const date = await page.locator('#humanDateInput').inputValue();
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const sec = await page.locator('#tsSecResult').textContent();
        expect(sec).not.toBe('—');
    });

    test('relative result is non-empty after decode', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        const rel = await page.locator('#tsRelResult').textContent();
        expect(rel).toBeTruthy();
        expect(rel).not.toBe('—');
    });
});

// ── 4. Calculator panel ───────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Calculator', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.click('#tabCalculator');
        await page.waitForTimeout(50);
    });

    test('calc date input is visible', async ({ page }) => {
        await expect(page.locator('#calcDate')).toBeVisible();
    });

    test('add 7 days to a date', async ({ page }) => {
        await page.fill('#calcDate', '2026-03-14');
        await page.fill('#calcAmount', '7');
        await page.selectOption('#calcUnit', 'day');
        await page.selectOption('#calcOp', 'add');
        await page.click('#btnCalc');
        await page.waitForTimeout(100);
        const result = await page.locator('#calcResult').textContent();
        expect(result).toContain('2026-03-21');
    });

    test('subtract 1 month from a date', async ({ page }) => {
        await page.fill('#calcDate', '2026-03-14');
        await page.fill('#calcAmount', '1');
        await page.selectOption('#calcUnit', 'month');
        await page.selectOption('#calcOp', 'sub');
        await page.click('#btnCalc');
        await page.waitForTimeout(100);
        const result = await page.locator('#calcResult').textContent();
        expect(result).toContain('2026-02-14');
    });

    test('add 1 year to a date', async ({ page }) => {
        await page.fill('#calcDate', '2026-03-14');
        await page.fill('#calcAmount', '1');
        await page.selectOption('#calcUnit', 'year');
        await page.selectOption('#calcOp', 'add');
        await page.click('#btnCalc');
        await page.waitForTimeout(100);
        const result = await page.locator('#calcResult').textContent();
        expect(result).toContain('2027-03-14');
    });

    test('add 2 weeks to a date', async ({ page }) => {
        await page.fill('#calcDate', '2026-03-14');
        await page.fill('#calcAmount', '2');
        await page.selectOption('#calcUnit', 'week');
        await page.selectOption('#calcOp', 'add');
        await page.click('#btnCalc');
        await page.waitForTimeout(100);
        const result = await page.locator('#calcResult').textContent();
        expect(result).toContain('2026-03-28');
    });

    test('empty calc date shows error', async ({ page }) => {
        await page.fill('#calcDate', '');
        await page.click('#btnCalc');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('Today button fills today date and calculates', async ({ page }) => {
        await page.click('#btnCalcToday');
        await page.waitForTimeout(100);
        const val = await page.locator('#calcDate').inputValue();
        expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const result = await page.locator('#calcResult').textContent();
        expect(result).not.toBe('—');
    });

    test('date difference calculates days correctly', async ({ page }) => {
        await page.fill('#diffDate1', '2026-01-01');
        await page.fill('#diffDate2', '2026-03-14');
        await page.click('#btnDiff');
        await page.waitForTimeout(100);
        const days = await page.locator('#diffDays').textContent();
        expect(days).toContain('72');
    });

    test('date difference shows weeks', async ({ page }) => {
        await page.fill('#diffDate1', '2026-01-01');
        await page.fill('#diffDate2', '2026-01-15');
        await page.click('#btnDiff');
        await page.waitForTimeout(100);
        const weeks = await page.locator('#diffWeeks').textContent();
        expect(weeks).toContain('2');
    });

    test('date difference shows months approx', async ({ page }) => {
        await page.fill('#diffDate1', '2026-01-01');
        await page.fill('#diffDate2', '2026-01-15');
        await page.click('#btnDiff');
        await page.waitForTimeout(100);
        const months = await page.locator('#diffMonths').textContent();
        expect(months).toBeTruthy();
        expect(months).not.toBe('—');
    });

    test('empty diff dates shows error', async ({ page }) => {
        await page.fill('#diffDate1', '');
        await page.click('#btnDiff');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('same date difference is 0 days', async ({ page }) => {
        await page.fill('#diffDate1', '2026-03-14');
        await page.fill('#diffDate2', '2026-03-14');
        await page.click('#btnDiff');
        await page.waitForTimeout(100);
        const days = await page.locator('#diffDays').textContent();
        expect(days).toContain('0');
    });

    test('success banner shows after successful calculation', async ({ page }) => {
        await page.fill('#calcDate', '2026-03-14');
        await page.click('#btnCalc');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ── 5. Timezone panel ─────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Timezone', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.click('#tabTimezone');
        await page.waitForTimeout(50);
    });

    test('timezone selects are populated', async ({ page }) => {
        const fromOpts = await page.locator('#tzFrom option').count();
        const toOpts   = await page.locator('#tzTo option').count();
        expect(fromOpts).toBeGreaterThan(10);
        expect(toOpts).toBeGreaterThan(10);
    });

    test('UTC is an option in both selects', async ({ page }) => {
        const fromOpts = await page.locator('#tzFrom option').allTextContents();
        expect(fromOpts.some(t => t === 'UTC')).toBe(true);
    });

    test('Convert button is visible', async ({ page }) => {
        await expect(page.locator('#btnTzConvert')).toBeVisible();
    });

    test('Swap button swaps from/to timezones', async ({ page }) => {
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'America/New_York');
        await page.click('#btnTzSwap');
        await page.waitForTimeout(50);
        const from = await page.locator('#tzFrom').inputValue();
        const to   = await page.locator('#tzTo').inputValue();
        expect(from).toBe('America/New_York');
        expect(to).toBe('UTC');
    });

    test('convert UTC to Tokyo shows result', async ({ page }) => {
        await page.fill('#tzDate', '2026-03-14');
        await page.fill('#tzTime', '12:00');
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'Asia/Tokyo');
        await page.click('#btnTzConvert');
        await page.waitForTimeout(100);
        const result = await page.locator('#tzResult').textContent();
        expect(result).not.toBe('—');
        expect(result).toBeTruthy();
    });

    test('conversion shows ISO result', async ({ page }) => {
        await page.fill('#tzDate', '2026-03-14');
        await page.fill('#tzTime', '00:00');
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'UTC');
        await page.click('#btnTzConvert');
        await page.waitForTimeout(100);
        const iso = await page.locator('#tzIsoResult').textContent();
        expect(iso).toMatch(/2026-03-14/);
    });

    test('conversion shows Unix seconds', async ({ page }) => {
        await page.fill('#tzDate', '2026-03-14');
        await page.fill('#tzTime', '00:00');
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'UTC');
        await page.click('#btnTzConvert');
        await page.waitForTimeout(100);
        const ts = await page.locator('#tzTsResult').textContent();
        expect(Number(ts)).toBeGreaterThan(0);
    });

    test('conversion shows UTC offsets', async ({ page }) => {
        await page.fill('#tzDate', '2026-03-14');
        await page.fill('#tzTime', '12:00');
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'America/New_York');
        await page.click('#btnTzConvert');
        await page.waitForTimeout(100);
        const offFrom = await page.locator('#tzFromOffset').textContent();
        const offTo   = await page.locator('#tzToOffset').textContent();
        expect(offFrom).toBeTruthy();
        expect(offTo).toBeTruthy();
    });

    test('empty date shows error', async ({ page }) => {
        await page.fill('#tzDate', '');
        await page.click('#btnTzConvert');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('Now button fills date/time and converts', async ({ page }) => {
        await page.click('#btnTzNow');
        await page.waitForTimeout(200);
        const result = await page.locator('#tzResult').textContent();
        expect(result).not.toBe('—');
    });

    test('success banner shows after successful conversion', async ({ page }) => {
        await page.fill('#tzDate', '2026-03-14');
        await page.fill('#tzTime', '12:00');
        await page.selectOption('#tzFrom', 'UTC');
        await page.selectOption('#tzTo', 'UTC');
        await page.click('#btnTzConvert');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ── 6. Formats panel ─────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Formats', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
        await page.click('#tabFormats');
        await page.waitForTimeout(50);
    });

    test('format date input is visible', async ({ page }) => {
        await expect(page.locator('#fmtDate')).toBeVisible();
    });

    test('Show Formats button is visible', async ({ page }) => {
        await expect(page.locator('#btnFmtShow')).toBeVisible();
    });

    test('formats table shows multiple rows', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const rows = await page.locator('.fmt-row').count();
        expect(rows).toBeGreaterThan(5);
    });

    test('format rows have labels and values', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const labels = await page.locator('.fmt-label').allTextContents();
        expect(labels.some(l => l.includes('ISO'))).toBe(true);
    });

    test('ISO 8601 format shows full date', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.fill('#fmtTime', '00:00');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const values = await page.locator('.fmt-value').allTextContents();
        expect(values.some(v => v.includes('2026-03-14'))).toBe(true);
    });

    test('Unix seconds row shows numeric value', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const rows = await page.locator('.fmt-row').all();
        let found = false;
        for (const row of rows) {
            const label = await row.locator('.fmt-label').textContent();
            if (label && label.includes('Unix (seconds)')) {
                const value = await row.locator('.fmt-value').textContent();
                expect(Number(value)).toBeGreaterThan(0);
                found = true;
            }
        }
        expect(found).toBe(true);
    });

    test('day of week row shows a weekday name', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const fullText = await page.locator('#fmtTable').innerText();
        expect(fullText).toMatch(/Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday/);
    });

    test('week number row shows Week N', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const values = await page.locator('.fmt-value').allTextContents();
        expect(values.some(v => v.startsWith('Week '))).toBe(true);
    });

    test('leap year row shows Yes or No', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        const rows = await page.locator('.fmt-row').all();
        let found = false;
        for (const row of rows) {
            const label = await row.locator('.fmt-label').textContent();
            if (label && label.includes('Leap Year')) {
                const value = await row.locator('.fmt-value').textContent();
                expect(['Yes', 'No']).toContain(value);
                found = true;
            }
        }
        expect(found).toBe(true);
    });

    test('empty date shows error', async ({ page }) => {
        await page.fill('#fmtDate', '');
        await page.click('#btnFmtShow');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('Now button fills today date and shows formats', async ({ page }) => {
        await page.click('#btnFmtNow');
        await page.waitForTimeout(100);
        const rows = await page.locator('.fmt-row').count();
        expect(rows).toBeGreaterThan(5);
    });

    test('success banner shows after showing formats', async ({ page }) => {
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ── 7. Toolbar Fill Now ───────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Fill Now', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Fill Now fills ts input with current timestamp', async ({ page }) => {
        await page.click('#btnNow');
        await page.waitForTimeout(100);
        const val = await page.locator('#tsInput').inputValue();
        expect(Number(val)).toBeGreaterThan(0);
    });

    test('Fill Now runs decode and shows results', async ({ page }) => {
        await page.click('#btnNow');
        await page.waitForTimeout(100);
        const iso = await page.locator('#tsIsoResult').textContent();
        expect(iso).not.toBe('—');
        expect(iso).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('Fill Now on Calculator tab fills calcDate', async ({ page }) => {
        await page.click('#tabCalculator');
        await page.click('#btnNow');
        await page.waitForTimeout(100);
        const val = await page.locator('#calcDate').inputValue();
        expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('Fill Now on Timezone tab shows converted result', async ({ page }) => {
        await page.click('#tabTimezone');
        await page.click('#btnNow');
        await page.waitForTimeout(200);
        const result = await page.locator('#tzResult').textContent();
        expect(result).not.toBe('—');
    });

    test('Fill Now on Formats tab shows format rows', async ({ page }) => {
        await page.click('#tabFormats');
        await page.click('#btnNow');
        await page.waitForTimeout(100);
        const rows = await page.locator('.fmt-row').count();
        expect(rows).toBeGreaterThan(5);
    });
});

// ── 8. Clear ─────────────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — Clear', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Clear empties ts input', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnClear');
        await page.waitForTimeout(100);
        const val = await page.locator('#tsInput').inputValue();
        expect(val).toBe('');
    });

    test('Clear resets ts results to dash', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.click('#btnClear');
        await page.waitForTimeout(100);
        const iso = await page.locator('#tsIsoResult').textContent();
        expect(iso).toBe('—');
    });

    test('Clear shows toast', async ({ page }) => {
        await page.click('#btnClear');
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });
});

// ── 9. Clipboard copy ─────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — clipboard', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('clicking ISO result copies to clipboard', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        await page.click('#tsIsoResult');
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('Copy Result button copies to clipboard and shows toast', async ({ page }) => {
        await page.fill('#tsInput', '1741910400');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        await page.click('#btnCopyResult');
        await page.waitForTimeout(300);
        await expect(page.locator('#toast')).toHaveClass(/show/);
    });

    test('clicking fmt-value copies to clipboard', async ({ page }) => {
        await page.click('#tabFormats');
        await page.fill('#fmtDate', '2026-03-14');
        await page.click('#btnFmtShow');
        await page.waitForTimeout(100);
        await page.locator('.fmt-value').first().click();
        await page.waitForTimeout(300);
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text.length).toBeGreaterThan(0);
    });
});

// ── 10. Status bar ────────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — status bar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('Local TZ in status bar is not empty', async ({ page }) => {
        const tz = await page.locator('#statTz').innerText();
        expect(tz.length).toBeGreaterThan(0);
        expect(tz).not.toBe('—');
    });

    test('UTC Offset in status bar shows UTC format', async ({ page }) => {
        const offset = await page.locator('#statOffset').innerText();
        expect(offset).toMatch(/^UTC[+-]\d{2}:\d{2}$/);
    });
});

// ── 11. localStorage ─────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — localStorage', () => {
    test('active tab persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.click('#tabCalculator');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        await expect(page.locator('#panelCalculator')).toBeVisible();
    });

    test('ts input value persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#tsInput', '1741910400');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        const val = await page.locator('#tsInput').inputValue();
        expect(val).toBe('1741910400');
    });

    test('calc date persists across reload', async ({ page }) => {
        await page.goto(URL);
        await page.click('#tabCalculator');
        await page.waitForTimeout(50);
        await page.fill('#calcDate', '2026-03-14');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(200);
        const val = await page.locator('#calcDate').inputValue();
        expect(val).toBe('2026-03-14');
    });
});

// ── 12. error cases ───────────────────────────────────────────────────────────
test.describe('Date/Time Utilities — error handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('no alert() dialogs fired on invalid input', async ({ page }) => {
        const dialogs = [];
        page.on('dialog', d => { dialogs.push(d.type()); d.dismiss(); });
        await page.fill('#tsInput', 'bad');
        await page.click('#btnTsDecode');
        await page.waitForTimeout(100);
        expect(dialogs).toHaveLength(0);
    });

    test('Copy Result with no result shows error banner', async ({ page }) => {
        await page.click('#btnCopyResult');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});
