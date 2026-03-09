// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = 'http://localhost:3000/tools/regex/index.html';

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Smoke', () => {
    test('loads without JS or CSP errors', async ({ page }) => {
        const errors = /** @type {string[]} */ ([]);
        page.on('pageerror',  e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto(PAGE);
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('nav breadcrumb and links are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.getByRole('link', { name: /Dev Tools/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Learn/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Tools/i }).first()).toBeVisible();
    });

    test('toolbar buttons are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnTest')).toBeVisible();
        await expect(page.locator('#btnReplace')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Basic — happy path
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Basic matching', () => {
    test('finds a simple literal match', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('hello');
        await page.locator('#testArea').fill('say hello world');
        await page.locator('#btnTest').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toContainText('1 match');
    });

    test('match count appears in success banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('\\d+');
        await page.locator('#testArea').fill('abc 123 def 456 ghi 789');
        await page.locator('#btnTest').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toContainText('3 matches');
    });

    test('highlight view is populated after matching', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('foo');
        await page.locator('#testArea').fill('foo bar foo');
        await page.locator('#btnTest').click();
        // Should have <mark> elements rendered
        const markCount = await page.locator('#highlightView mark').count();
        expect(markCount).toBeGreaterThan(0);
    });

    test('match table is populated with position and match data', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('cat');
        await page.locator('#testArea').fill('cat on a mat');
        await page.locator('#btnTest').click();
        await expect(page.locator('#matchTable')).toBeVisible();
        // Table should have at least a header row + 1 data row
        const rows = page.locator('#matchTable tbody tr');
        await expect(rows).toHaveCount(1);
        // Start column should say 0
        const startCell = rows.first().locator('td').nth(1);
        await expect(startCell).toHaveText('0');
    });

    test('match table shows match text', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('world');
        await page.locator('#testArea').fill('hello world!');
        await page.locator('#btnTest').click();
        const matchCell = page.locator('#matchTable tbody tr').first().locator('td').nth(4);
        await expect(matchCell).toHaveText('world');
    });

    test('Ctrl+Enter triggers test', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('abc');
        await page.locator('#testArea').fill('abcdef');
        await page.locator('#testArea').press('Control+Enter');
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('auto-runs after 300ms debounce on input changes', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('x');
        await page.locator('#testArea').fill('x marks the spot');
        // Wait for debounce
        await page.waitForTimeout(500);
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// No match and empty cases
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — No match / empty', () => {
    test('no match shows info banner (not error)', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('zzz');
        await page.locator('#testArea').fill('hello world');
        await page.locator('#btnTest').click();
        await expect(page.locator('#infoBanner')).toBeVisible();
        await expect(page.locator('#infoBanner')).toContainText('No matches');
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('empty pattern clears output without error', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('');
        await page.locator('#testArea').fill('some text');
        await page.locator('#btnTest').click();
        await expect(page.locator('#errorBanner')).toBeHidden();
        await expect(page.locator('#successBanner')).toBeHidden();
    });

    test('empty test string produces no matches', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('abc');
        await page.locator('#testArea').fill('');
        await page.locator('#btnTest').click();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Invalid regex
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Invalid regex', () => {
    test('shows error banner for unclosed group', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('(unclosed');
        await page.locator('#testArea').fill('test');
        await page.locator('#btnTest').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText(/invalid regex/i);
    });

    test('shows error banner for invalid escape', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('[invalid-class');
        await page.locator('#testArea').fill('test');
        await page.locator('#btnTest').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Flags
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Flags', () => {
    test('case insensitive flag (i) matches regardless of case', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('hello');
        // Enable i flag
        await page.locator('[data-flag="i"]').click();
        await page.locator('#testArea').fill('HELLO World');
        await page.locator('#btnTest').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toContainText('1 match');
    });

    test('global flag (g) finds all matches', async ({ page }) => {
        await page.goto(PAGE);
        // g is on by default; verify it finds multiple
        await page.locator('#patternInput').fill('\\ba\\b');
        await page.locator('#testArea').fill('a b a c a');
        await page.locator('#btnTest').click();
        await expect(page.locator('#successBanner')).toContainText('3 matches');
    });

    test('multiline flag (m) makes ^ match start of each line', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('^\\w+');
        await page.locator('[data-flag="m"]').click();
        await page.locator('#testArea').fill('alpha\nbeta\ngamma');
        await page.locator('#btnTest').click();
        await expect(page.locator('#successBanner')).toContainText('3 matches');
    });

    test('flag toggle changes active class', async ({ page }) => {
        await page.goto(PAGE);
        const iBtn = page.locator('[data-flag="i"]');
        // Initially not active
        await expect(iBtn).not.toHaveClass(/active/);
        await iBtn.click();
        await expect(iBtn).toHaveClass(/active/);
        await iBtn.click();
        await expect(iBtn).not.toHaveClass(/active/);
    });

    test('active flags display updates when flags change', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('[data-flag="i"]').click();
        const display = await page.locator('#activeFlagsDisplay').textContent();
        expect(display).toContain('i');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Capture groups
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Capture groups', () => {
    test('numbered capture groups appear in match table', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('(\\w+)@(\\w+)');
        await page.locator('#testArea').fill('user@domain');
        await page.locator('#btnTest').click();
        await expect(page.locator('#matchTable')).toBeVisible();
        // Should have Group 1 and Group 2 header columns
        const headers = page.locator('#matchTable th');
        await expect(headers.filter({ hasText: 'Group 1' })).toBeVisible();
        await expect(headers.filter({ hasText: 'Group 2' })).toBeVisible();
    });

    test('named capture groups shown in table header', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('(?<year>\\d{4})-(?<month>\\d{2})');
        await page.locator('#testArea').fill('date: 2025-06');
        await page.locator('#btnTest').click();
        await expect(page.locator('#matchTable')).toBeVisible();
        const headerText = await page.locator('#matchTable thead').textContent();
        expect(headerText).toMatch(/year/i);
        expect(headerText).toMatch(/month/i);
    });

    test('capture group values appear in table row', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('(\\d+)');
        await page.locator('#testArea').fill('abc 42 xyz');
        await page.locator('#btnTest').click();
        const groupCell = page.locator('#matchTable tbody tr').first().locator('td').nth(5);
        await expect(groupCell).toHaveText('42');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sample
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Sample', () => {
    test('sample button fills pattern and test string', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const pattern = await page.locator('#patternInput').inputValue();
        const text    = await page.locator('#testArea').inputValue();
        expect(pattern.length).toBeGreaterThan(0);
        expect(text.length).toBeGreaterThan(0);
    });

    test('sample produces matches', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Clear', () => {
    test('clear with confirmation empties fields', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('test');
        await page.locator('#testArea').fill('test string');
        page.on('dialog', d => d.accept());
        await page.locator('#btnClear').click();
        expect(await page.locator('#patternInput').inputValue()).toBe('');
        expect(await page.locator('#testArea').inputValue()).toBe('');
    });

    test('cancel on clear dialog keeps content', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('keep');
        await page.locator('#testArea').fill('keep this');
        page.on('dialog', d => d.dismiss());
        await page.locator('#btnClear').click();
        expect(await page.locator('#patternInput').inputValue()).toBe('keep');
        expect(await page.locator('#testArea').inputValue()).toBe('keep this');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Download
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Download', () => {
    test('download creates a JSON file when matches exist', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('\\d+');
        await page.locator('#testArea').fill('123 456');
        await page.locator('#btnTest').click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#btnDownload').click()
        ]);
        expect(download.suggestedFilename()).toBe('matches.json');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Replace mode
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Replace mode', () => {
    test('replace button toggles active state and shows replace bar', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#replaceBar')).not.toHaveClass(/visible/);
        await page.locator('#btnReplace').click();
        await expect(page.locator('#replaceBar')).toHaveClass(/visible/);
        await expect(page.locator('#btnReplace')).toHaveClass(/active/);
    });

    test('replace shows correct replacement result', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnReplace').click();
        await page.locator('#patternInput').fill('foo');
        await page.locator('#testArea').fill('foo bar foo');
        await page.locator('#replaceInput').fill('baz');
        await page.locator('#btnTest').click();
        const result = await page.locator('#replaceResultArea').inputValue();
        expect(result).toContain('baz');
        expect(result).not.toContain('foo');
    });

    test('clicking Replace again hides the replace bar', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnReplace').click();
        await expect(page.locator('#replaceBar')).toHaveClass(/visible/);
        await page.locator('#btnReplace').click();
        await expect(page.locator('#replaceBar')).not.toHaveClass(/visible/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save / restore
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Auto-save', () => {
    test('pattern and test string are restored after page reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('save-test');
        await page.locator('#testArea').fill('content to save');
        // Wait for save debounce
        await page.waitForTimeout(1200);
        await page.reload();
        await page.waitForTimeout(300);
        expect(await page.locator('#patternInput').inputValue()).toBe('save-test');
        expect(await page.locator('#testArea').inputValue()).toBe('content to save');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Status bar', () => {
    test('match count in status bar updates correctly', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('a');
        await page.locator('#testArea').fill('aaa bbb aaa');
        await page.locator('#btnTest').click();
        const matches = await page.locator('#statMatches').textContent();
        expect(Number(matches)).toBe(6); // 6 'a' characters total (with g flag)
    });

    test('input char count in status bar', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('x');
        await page.locator('#testArea').fill('12345');
        await page.locator('#btnTest').click();
        await expect(page.locator('#statChars')).toHaveText('5');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Edge cases', () => {
    test('zero-width match (^) with gm does not hang browser', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('^');
        await page.locator('[data-flag="m"]').click();
        await page.locator('#testArea').fill('line1\nline2\nline3');
        await page.locator('#btnTest').click();
        // Should complete without timeout — ^ with gm produces 3 zero-width matches (one per line)
        await expect(page.locator('#successBanner')).toBeVisible({ timeout: 3000 });
    });

    test('HTML special chars are escaped in highlight view', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#patternInput').fill('tag');
        await page.locator('#testArea').fill('<tag>html</tag>');
        await page.locator('#btnTest').click();
        // Ensure innerHTML contains &lt; not raw < outside of mark elements
        const raw = await page.locator('#highlightView').innerHTML();
        // Strip mark elements and check remaining text is escaped
        const withoutMarks = raw.replace(/<mark[^>]*>.*?<\/mark>/g, '');
        expect(withoutMarks).toContain('&lt;');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mobile tabs
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Regex Tester — Mobile tabs', () => {
    test('mobile tabs are visible at narrow viewport', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await expect(page.locator('.mobile-tabs')).toBeVisible();
    });

    test('Results tab shows results pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await page.locator('#patternInput').fill('hi');
        await page.locator('#testArea').fill('hi there');
        await page.locator('#btnTest').click();
        await page.locator('#tabResults').click();
        await expect(page.locator('#paneResults')).toBeVisible();
    });

    test('Input tab returns to input pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await page.locator('#tabResults').click();
        await page.locator('#tabInput').click();
        await expect(page.locator('#paneInput')).toBeVisible();
    });
});
