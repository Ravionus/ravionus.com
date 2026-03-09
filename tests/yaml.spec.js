// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = 'http://localhost:3000/tools/yaml/index.html';

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Smoke', () => {
    test('loads without JS or CSP errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto(PAGE);
        // Wait briefly for js-yaml CDN load
        await page.waitForTimeout(500);
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('nav links are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.getByRole('link', { name: /Dev Tools/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Learn/i }).first()).toBeVisible();
    });

    test('toolbar buttons are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnValidate')).toBeVisible();
        await expect(page.locator('#btnFormat')).toBeVisible();
        await expect(page.locator('#btnModeYaml')).toBeVisible();
        await expect(page.locator('#btnModeJson')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validate — happy path
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Validate (valid input)', () => {
    test('validates simple key-value YAML', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name: Alice\nage: 30\nactive: true');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('output pane is populated after validate', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('key: value');
        await page.locator('#btnValidate').click();
        const out = await page.locator('#outputArea').inputValue();
        expect(out.trim().length).toBeGreaterThan(0);
    });

    test('status bar shows Valid after successful validate', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('x: 1\ny: 2');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#statStatus')).toHaveText('Valid');
    });

    test('status bar shows document and key counts', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('a: 1\nb: 2\nc: 3');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#statDocs')).toHaveText('1');
        await expect(page.locator('#statKeys')).not.toHaveText('—');
    });

    test('validates nested YAML objects', async ({ page }) => {
        await page.goto(PAGE);
        const yaml = 'server:\n  host: localhost\n  port: 8080\n  ssl: false';
        await page.locator('#inputArea').fill(yaml);
        await page.locator('#btnValidate').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('validates YAML with sequences (arrays)', async ({ page }) => {
        await page.goto(PAGE);
        const yaml = 'tags:\n  - web\n  - api\n  - backend';
        await page.locator('#inputArea').fill(yaml);
        await page.locator('#btnValidate').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('validates multi-document YAML (---)', async ({ page }) => {
        await page.goto(PAGE);
        const yaml = 'name: doc1\n---\nname: doc2';
        await page.locator('#inputArea').fill(yaml);
        await page.locator('#btnValidate').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#statDocs')).toHaveText('2');
    });

    test('validates YAML with anchors and aliases', async ({ page }) => {
        await page.goto(PAGE);
        const yaml = 'defaults: &def\n  timeout: 30\nservice:\n  <<: *def\n  name: svc';
        await page.locator('#inputArea').fill(yaml);
        await page.locator('#btnValidate').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('Ctrl+Enter triggers validate', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('key: value');
        await page.locator('#inputArea').press('Control+Enter');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validate — error cases
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Validate (invalid input)', () => {
    test('shows error banner for invalid YAML', async ({ page }) => {
        await page.goto(PAGE);
        // Unclosed flow mapping — js-yaml reliably rejects this
        await page.locator('#inputArea').fill('key: {unclosed bracket');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('shows error for tab-indented YAML', async ({ page }) => {
        await page.goto(PAGE);
        // Tab characters for indentation is a YAML error
        await page.locator('#inputArea').fill('parent:\n\tchild: value');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('shows error for unclosed quoted string', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name: "unclosed string');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('status bar shows Invalid on error', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('bad: yaml: here:');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#statStatus')).toHaveText('Invalid');
    });

    test('error banner includes line number', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('good: ok\n:\nbad');
        await page.locator('#btnValidate').click();
        const msg = await page.locator('#errorBanner').textContent();
        expect(msg).toMatch(/line/i);
    });

    test('empty input does not show error banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('');
        await page.locator('#btnValidate').click();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Format button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Format', () => {
    test('Format button reformats input in-place', async ({ page }) => {
        await page.goto(PAGE);
        // Slightly unformatted YAML (extra spacing, quoted strings)
        await page.locator('#inputArea').fill('name:   Alice\nage: 30');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        const result = await page.locator('#inputArea').inputValue();
        expect(result).toContain('name:');
        expect(result).toContain('Alice');
    });

    test('Format populates output pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('x: 1\ny: 2');
        await page.locator('#btnFormat').click();
        const out = await page.locator('#outputArea').inputValue();
        expect(out.trim().length).toBeGreaterThan(0);
    });

    test('Format on invalid YAML shows error', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name: "unclosed');
        await page.locator('#btnFormat').click();
        await expect(page.locator('#errorBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Output mode (YAML / JSON)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Output mode', () => {
    test('YAML out button is active by default', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnModeYaml')).toHaveClass(/active/);
        await expect(page.locator('#btnModeJson')).not.toHaveClass(/active/);
    });

    test('JSON out mode shows JSON in output after validate', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('name: Alice\nage: 30');
        await page.locator('#btnModeJson').click();
        await page.locator('#btnValidate').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed).toMatchObject({ name: 'Alice', age: 30 });
    });

    test('Switching to JSON mode re-renders existing output', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('colour: blue\ncount: 5');
        await page.locator('#btnValidate').click();
        // Currently YAML mode, switch to JSON
        await page.locator('#btnModeJson').click();
        const out = await page.locator('#outputArea').inputValue();
        const parsed = JSON.parse(out);
        expect(parsed.colour).toBe('blue');
    });

    test('YAML out mode shows YAML after validate', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('flag: true');
        await page.locator('#btnModeYaml').click();
        await page.locator('#btnValidate').click();
        const out = await page.locator('#outputArea').inputValue();
        expect(out).toMatch(/flag/);
        // Should be YAML not JSON (no curly braces at start)
        expect(out.trim()).not.toMatch(/^\{/);
    });

    test('status bar shows current mode', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnModeJson').click();
        await expect(page.locator('#statMode')).toHaveText('JSON');
        await page.locator('#btnModeYaml').click();
        await expect(page.locator('#statMode')).toHaveText('YAML');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sample button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Sample', () => {
    test('Sample fills input with valid YAML', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const input = await page.locator('#inputArea').inputValue();
        expect(input.length).toBeGreaterThan(50);
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('Sample output pane is filled after clicking', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const out = await page.locator('#outputArea').inputValue();
        expect(out.trim().length).toBeGreaterThan(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Clear', () => {
    test('Clear removes content when confirmed', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('key: value');
        await page.locator('#btnValidate').click();
        page.once('dialog', d => d.accept());
        await page.locator('#btnClear').click();
        await expect(page.locator('#inputArea')).toHaveValue('');
        await expect(page.locator('#outputArea')).toHaveValue('');
    });

    test('Clear keeps content when cancelled', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#inputArea').fill('keep: this');
        page.once('dialog', d => d.dismiss());
        await page.locator('#btnClear').click();
        const val = await page.locator('#inputArea').inputValue();
        expect(val).toContain('keep');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Auto-save', () => {
    test('input is restored after reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        await page.waitForTimeout(1200); // past 800ms debounce
        await page.reload();
        const input = await page.locator('#inputArea').inputValue();
        expect(input.length).toBeGreaterThan(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mobile tabs
// ─────────────────────────────────────────────────────────────────────────────
test.describe('YAML Tool — Mobile tabs', () => {
    test('mobile tab elements are present in DOM', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#tabInput')).toBeAttached();
        await expect(page.locator('#tabOutput')).toBeAttached();
    });

    test('Mobile: Output tab shows output pane only', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await expect(page.locator('.mobile-tabs')).toBeVisible();
        await page.click('#tabOutput');
        await expect(page.locator('#paneOutput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneInput')).not.toHaveClass(/mob-visible/);
    });

    test('Mobile: Input tab switches back to input pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.setViewportSize({ width: 400, height: 700 });
        await page.click('#tabOutput');
        await page.click('#tabInput');
        await expect(page.locator('#paneInput')).toHaveClass(/mob-visible/);
        await expect(page.locator('#paneOutput')).not.toHaveClass(/mob-visible/);
    });
});
