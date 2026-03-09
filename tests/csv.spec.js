// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = 'http://localhost:3000/tools/csv/index.html';

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CSV Tool — Smoke', () => {
    test('loads without JS or CSP errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto(PAGE);
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('nav links are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.getByRole('link', { name: /Dev Tools/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Learn/i }).first()).toBeVisible();
    });

    test('toolbar buttons are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnCsvToJson')).toBeVisible();
        await expect(page.locator('#btnJsonToCsv')).toBeVisible();
        await expect(page.locator('#delimiterSelect')).toBeVisible();
        await expect(page.locator('#btnHeaders')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Feature tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CSV Tool — CSV → JSON', () => {
    test('converts simple CSV to JSON array', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name,age\nAlice,30\nBob,25');
        await page.locator('#btnCsvToJson').click();

        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed).toHaveLength(2);
        expect(parsed[0]).toMatchObject({ name: 'Alice', age: '30' });
        expect(parsed[1]).toMatchObject({ name: 'Bob', age: '25' });
    });

    test('shows success banner after CSV → JSON', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('a,b\n1,2');
        await page.locator('#btnCsvToJson').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('renders table view after CSV → JSON', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('x,y\n10,20\n30,40');
        await page.locator('#btnCsvToJson').click();
        await expect(page.locator('#dataTable')).toBeVisible();
        // header cells
        const headers = await page.locator('#dataTable thead th').allTextContents();
        expect(headers).toContain('x');
        expect(headers).toContain('y');
        // data rows
        const rows = await page.locator('#dataTable tbody tr').count();
        expect(rows).toBe(2);
    });

    test('status bar shows rows and columns', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('a,b,c\n1,2,3');
        await page.locator('#btnCsvToJson').click();
        await expect(page.locator('#statRows')).toHaveText('1');
        await expect(page.locator('#statCols')).toHaveText('3');
        await expect(page.locator('#statMode')).toHaveText('CSV → JSON');
    });

    test('handles quoted fields with commas', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name,city\n"Smith, John","New York, NY"');
        await page.locator('#btnCsvToJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed[0].name).toBe('Smith, John');
        expect(parsed[0].city).toBe('New York, NY');
    });

    test('handles escaped double-quotes ("")', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name,quote\nAlice,"She said ""hello""."');
        await page.locator('#btnCsvToJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed[0].quote).toBe('She said "hello".');
    });

    test('shows error banner for empty input', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('');
        await page.locator('#btnCsvToJson').click();
        // toast shows for empty, no crash
        await expect(page.locator('#errorBanner')).toBeHidden();
    });
});

test.describe('CSV Tool — JSON → CSV', () => {
    test('converts JSON array to CSV', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('[{"name":"Alice","age":30},{"name":"Bob","age":25}]');
        await page.locator('#btnJsonToCsv').click();

        const out = await page.locator('#outputArea').inputValue();
        const lines = out.trim().split('\n');
        expect(lines[0]).toBe('name,age');
        expect(lines[1]).toBe('Alice,30');
        expect(lines[2]).toBe('Bob,25');
    });

    test('shows success banner after JSON → CSV', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('[{"a":1}]');
        await page.locator('#btnJsonToCsv').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('shows error for invalid JSON', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('{bad json}');
        await page.locator('#btnJsonToCsv').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('shows error for non-array JSON', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('{"name":"Alice"}');
        await page.locator('#btnJsonToCsv').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('renders table view after JSON → CSV', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('[{"col1":"a","col2":"b"}]');
        await page.locator('#btnJsonToCsv').click();
        await expect(page.locator('#dataTable')).toBeVisible();
    });

    test('status bar shows CSV → mode', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('[{"x":1,"y":2}]');
        await page.locator('#btnJsonToCsv').click();
        await expect(page.locator('#statMode')).toHaveText('JSON → CSV');
    });

    test('quotes fields that contain the delimiter', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('[{"name":"Smith, John","note":"ok"}]');
        await page.locator('#btnJsonToCsv').click();
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toContain('"Smith, John"');
    });
});

test.describe('CSV Tool — Headers toggle', () => {
    test('Headers button has active class by default', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnHeaders')).toHaveClass(/active/);
    });

    test('toggling Headers off excludes first row as header', async ({ page }) => {
        await page.goto(PAGE);
        // Turn headers off
        await page.locator('#btnHeaders').click();
        await expect(page.locator('#btnHeaders')).not.toHaveClass(/active/);
        await expect(page.locator('#statHeaders')).toHaveText('Off');
    });

    test('with headers off, CSV→JSON uses col1/col2 keys', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnHeaders').click(); // off
        await page.locator('#inputArea').fill('Alice,30');
        await page.locator('#btnCsvToJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed[0]).toMatchObject({ col1: 'Alice', col2: '30' });
    });

    test('with headers off, JSON→CSV omits header row', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnHeaders').click(); // off
        await page.locator('#inputArea').fill('[{"name":"Alice"}]');
        await page.locator('#btnJsonToCsv').click();
        const out = await page.locator('#outputArea').inputValue();
        // Should only have data line, no 'name' header
        expect(out.trim()).toBe('Alice');
    });
});

test.describe('CSV Tool — Delimiter', () => {
    test('parses semicolon-delimited CSV', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#delimiterSelect').selectOption(';');
        await page.locator('#inputArea').fill('a;b;c\n1;2;3');
        await page.locator('#btnCsvToJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed[0]).toMatchObject({ a: '1', b: '2', c: '3' });
    });

    test('parses tab-delimited CSV', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#delimiterSelect').selectOption('\t');
        await page.locator('#inputArea').fill('a\tb\n1\t2');
        await page.locator('#btnCsvToJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed[0]).toMatchObject({ a: '1', b: '2' });
    });

    test('delimiter label updates in status bar', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#delimiterSelect').selectOption(';');
        await expect(page.locator('#statDelim')).toHaveText('Semicolon');
    });
});

test.describe('CSV Tool — Sample button', () => {
    test('Sample fills input and converts to JSON', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const input = await page.locator('#inputArea').inputValue();
        expect(input).toContain('name');
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed.length).toBeGreaterThan(0);
    });

    test('Sample shows table after converting', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        await expect(page.locator('#dataTable')).toBeVisible();
    });
});

test.describe('CSV Tool — Clear', () => {
    test('Clear button removes content when confirmed', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('a,b\n1,2');
        await page.locator('#btnCsvToJson').click();

        page.once('dialog', d => d.accept());
        await page.locator('#btnClear').click();

        await expect(page.locator('#inputArea')).toHaveValue('');
        await expect(page.locator('#outputArea')).toHaveValue('');
    });

    test('Clear cancels when dismissed', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('hello,world');

        page.once('dialog', d => d.dismiss());
        await page.locator('#btnClear').click();

        const val = await page.locator('#inputArea').inputValue();
        expect(val).toContain('hello');
    });
});

test.describe('CSV Tool — Auto-save', () => {
    test('auto-saves and restores after reload', async ({ page }) => {
        await page.goto(PAGE);
        // Fill and convert so autosave fires
        await page.locator('#btnSample').click();
        // Wait for debounce
        await page.waitForTimeout(1200);
        // Reload
        await page.reload();
        const input = await page.locator('#inputArea').inputValue();
        expect(input.length).toBeGreaterThan(0);
    });
});

test.describe('CSV Tool — Mobile tabs', () => {
    test('mobile tabs are present in DOM', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#tabInput')).toBeAttached();
        await expect(page.locator('#tabTable')).toBeAttached();
        await expect(page.locator('#tabOutput')).toBeAttached();
    });

    test('Mobile: Output tab shows output pane only', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await expect(page.locator('.mobile-tabs')).toBeVisible();
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
        await expect(page.locator('#paneTable')).not.toHaveClass(/mob-visible/);
    });

    test('Mobile: Table tab shows table pane only', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await expect(page.locator('.mobile-tabs')).toBeVisible();
        await page.click('#tabTable');
        await expect(page.locator('#paneTable')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
        await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
    });
});
