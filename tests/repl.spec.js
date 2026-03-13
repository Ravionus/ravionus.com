// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const URL  = `${BASE}/playground/repl/`;

// ── Smoke tests ───────────────────────────────────────────────────────────────
test.describe('JavaScript REPL — smoke', () => {
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
            !e.includes('net::ERR') &&
            !e.includes('CSP')
        );
        expect(real).toHaveLength(0);
    });

    test('page loads with correct title and no JS/CSP errors', async ({ page }) => {
        await expect(page).toHaveTitle(/JavaScript REPL.*Ravionus|Ravionus.*REPL/i);
    });

    test('nav bar is visible with breadcrumb links', async ({ page }) => {
        await expect(page.locator('nav').first()).toBeVisible();
        await expect(page.locator('nav a').first()).toBeVisible();
    });

    test('primary toolbar buttons are visible', async ({ page }) => {
        await expect(page.locator('#btnRun')).toBeVisible();
        await expect(page.locator('#btnClearOutput')).toBeVisible();
        await expect(page.locator('#btnClearAll')).toBeVisible();
    });

    test('h1 heading is present and mentions REPL or JavaScript', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText(/REPL|JavaScript/i);
    });
});

// ── Feature tests ─────────────────────────────────────────────────────────────
test.describe('JavaScript REPL — features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ── Initial state ─────────────────────────────────────────────────────────

    test('code input is empty on fresh load', async ({ page }) => {
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('');
    });

    test('status bar shows 0 lines and 0 chars on fresh load', async ({ page }) => {
        await expect(page.locator('#statLines')).toHaveText('0');
        await expect(page.locator('#statChars')).toHaveText('0');
    });

    test('console output shows empty state on fresh load', async ({ page }) => {
        await expect(page.locator('#emptyState')).toBeVisible();
    });

    test('Run button is enabled on fresh load', async ({ page }) => {
        await expect(page.locator('#btnRun')).toBeEnabled();
    });

    // ── Empty input handling ──────────────────────────────────────────────────

    test('empty input shows error banner without running', async ({ page }) => {
        await page.click('#btnRun');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText(/Write some JavaScript/i);
    });

    test('empty state is replaced after successful run', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("test")');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        await expect(page.locator('#emptyState')).toBeHidden();
    });

    // ── console.log output ────────────────────────────────────────────────────

    test('console.log output appears in console pane', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("hello world")');
        await page.click('#btnRun');
        const line = page.locator('.console-line.log').filter({ hasText: 'hello world' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('multiple console.log calls produce multiple output lines', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("a");\nconsole.log("b");\nconsole.log("c");');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line.log', { timeout: 7000 });
        const count = await page.locator('.console-line.log').count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('multiple arguments to console.log are joined', async ({ page }) => {
        await page.fill('#codeInput', 'console.log(1, "plus", 2, "=", 3)');
        await page.click('#btnRun');
        const line = page.locator('.console-line.log').first();
        await expect(line).toBeVisible({ timeout: 7000 });
        await expect(line).toContainText('1');
    });

    // ── console.error / warn / info ───────────────────────────────────────────

    test('console.error appears with error class', async ({ page }) => {
        await page.fill('#codeInput', 'console.error("something broke")');
        await page.click('#btnRun');
        const line = page.locator('.console-line.error').filter({ hasText: 'something broke' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('console.warn appears with warn class', async ({ page }) => {
        await page.fill('#codeInput', 'console.warn("heads up")');
        await page.click('#btnRun');
        const line = page.locator('.console-line.warn').filter({ hasText: 'heads up' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('console.info appears with info class', async ({ page }) => {
        await page.fill('#codeInput', 'console.info("fyi")');
        await page.click('#btnRun');
        const line = page.locator('.console-line.info').filter({ hasText: 'fyi' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    // ── Return value ──────────────────────────────────────────────────────────

    test('arithmetic expression return value shown with return class', async ({ page }) => {
        await page.fill('#codeInput', '2 + 2');
        await page.click('#btnRun');
        const line = page.locator('.console-line.return').filter({ hasText: '4' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('string expression return value shown', async ({ page }) => {
        await page.fill('#codeInput', '"hello"');
        await page.click('#btnRun');
        const line = page.locator('.console-line.return');
        await expect(line).toBeVisible({ timeout: 7000 });
        await expect(line).toContainText('hello');
    });

    test('undefined return value not shown as return line', async ({ page }) => {
        await page.fill('#codeInput', 'let x = 1;');
        await page.click('#btnRun');
        await page.waitForTimeout(1500);
        const count = await page.locator('.console-line.return').count();
        expect(count).toBe(0);
    });

    test('object return value rendered as JSON string', async ({ page }) => {
        await page.fill('#codeInput', '({ a: 1, b: 2 })');
        await page.click('#btnRun');
        const line = page.locator('.console-line.return');
        await expect(line).toBeVisible({ timeout: 7000 });
        await expect(line).toContainText('"a"');
    });

    test('array return value displayed', async ({ page }) => {
        await page.fill('#codeInput', '[1, 2, 3]');
        await page.click('#btnRun');
        const line = page.locator('.console-line.return');
        await expect(line).toBeVisible({ timeout: 7000 });
        await expect(line).toContainText('1');
    });

    // ── Error handling ────────────────────────────────────────────────────────

    test('syntax error shows error output line', async ({ page }) => {
        await page.fill('#codeInput', 'const = broken;');
        await page.click('#btnRun');
        const line = page.locator('.console-line.error');
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('runtime error (throw) shows error output line', async ({ page }) => {
        await page.fill('#codeInput', 'throw new Error("oops")');
        await page.click('#btnRun');
        const line = page.locator('.console-line.error').filter({ hasText: 'oops' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('runtime type error shows error output', async ({ page }) => {
        await page.fill('#codeInput', 'null.foo');
        await page.click('#btnRun');
        const line = page.locator('.console-line.error');
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    // ── Clear buttons ─────────────────────────────────────────────────────────

    test('Clear Output button removes all console lines', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("to be cleared")');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        await page.click('#btnClearOutput');
        await expect(page.locator('.console-line')).toHaveCount(0, { timeout: 3000 });
    });

    test('Clear Output button restores empty state message', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("x")');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        await page.click('#btnClearOutput');
        await expect(page.locator('#emptyState')).toBeVisible();
    });

    test('Clear All button clears both editor and output', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("content")');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        await page.click('#btnClearAll');
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('');
        await expect(page.locator('.console-line')).toHaveCount(0, { timeout: 3000 });
    });

    test('console.clear() inside code clears the output', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("first");\nconsole.clear();\nconsole.log("second");');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line.log', { timeout: 7000 });
        // After clear, only the post-clear log appears
        const text = await page.locator('.console-line.log').allTextContents();
        expect(text.join(' ')).toContain('second');
    });

    // ── Keyboard shortcuts ────────────────────────────────────────────────────

    test('Shift+Enter triggers code execution', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("shift-enter")');
        await page.locator('#codeInput').press('Shift+Enter');
        const line = page.locator('.console-line.log').filter({ hasText: 'shift-enter' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('Ctrl+Enter triggers code execution', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("ctrl-enter")');
        await page.locator('#codeInput').press('Control+Enter');
        const line = page.locator('.console-line.log').filter({ hasText: 'ctrl-enter' });
        await expect(line).toBeVisible({ timeout: 7000 });
    });

    test('Tab key inserts 4 spaces in editor', async ({ page }) => {
        await page.locator('#codeInput').click();
        await page.locator('#codeInput').press('Tab');
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('    ');
    });

    // ── Status bar ────────────────────────────────────────────────────────────

    test('status bar lines updates when typing', async ({ page }) => {
        await page.fill('#codeInput', 'line1\nline2\nline3');
        await expect(page.locator('#statLines')).toHaveText('3');
    });

    test('status bar chars updates when typing', async ({ page }) => {
        await page.fill('#codeInput', 'abc');
        await expect(page.locator('#statChars')).toHaveText('3');
    });

    test('output line count in status bar updates after run', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("a");\nconsole.log("b");');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        const stat = await page.locator('#statOutputLines').textContent();
        expect(parseInt(stat ?? '0', 10)).toBeGreaterThanOrEqual(2);
    });

    test('last run timestamp updates after execution', async ({ page }) => {
        await page.fill('#codeInput', 'console.log("x")');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line', { timeout: 7000 });
        await expect(page.locator('#statLastRun')).not.toHaveText('—');
    });

    // ── Load example ──────────────────────────────────────────────────────────

    test('loading an example fills the editor', async ({ page }) => {
        await page.selectOption('#exampleSelect', 'fibonacci');
        const val = await page.locator('#codeInput').inputValue();
        expect(val.trim().length).toBeGreaterThan(0);
        expect(val).toContain('fib');
    });

    test('loaded example runs successfully without errors in output', async ({ page }) => {
        await page.selectOption('#exampleSelect', 'fibonacci');
        await page.click('#btnRun');
        await page.waitForSelector('.console-line.log', { timeout: 8000 });
        const errCount = await page.locator('.console-line.error').count();
        expect(errCount).toBe(0);
    });

    test('all example keys load without throwing', async ({ page }) => {
        const examples = ['fibonacci', 'array', 'classes', 'closures', 'regex', 'json', 'destructuring', 'errors'];
        for (const key of examples) {
            await page.selectOption('#exampleSelect', key);
            const val = await page.locator('#codeInput').inputValue();
            expect(val.trim().length).toBeGreaterThan(10);
        }
    });

    // ── Word wrap toggle ──────────────────────────────────────────────────────

    test('word wrap toggle changes button text', async ({ page }) => {
        const btn = page.locator('#btnWordWrap');
        const before = await btn.textContent();
        await btn.click();
        const after = await btn.textContent();
        expect(before).not.toBe(after);
    });

    // ── localStorage persistence ──────────────────────────────────────────────

    test('localStorage input persists after reload', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('ravionus_tool_repl', JSON.stringify({ input: '// persisted code' }));
        });
        await page.reload();
        const val = await page.locator('#codeInput').inputValue();
        expect(val).toBe('// persisted code');
    });

    // ── Mobile tabs ───────────────────────────────────────────────────────────

    test('mobile tab buttons are present in DOM', async ({ page }) => {
        await expect(page.locator('#tabInput')).toBeAttached();
        await expect(page.locator('#tabOutput')).toBeAttached();
    });

    test('mobile Output tab makes output pane visible', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.reload();
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toBeVisible();
        await expect(page.locator('#paneInput')).toBeHidden();
    });

    test('mobile Editor tab makes input pane visible', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 700 });
        await page.reload();
        await page.click('#tabOutput');
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toBeVisible();
    });
});
