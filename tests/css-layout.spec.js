// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

const PAGE = '/playground/css-layout/';

// ── helpers ──────────────────────────────────────────────────────────────────
async function getFrame(page) {
    return page.frameLocator('#previewFrame');
}

async function clearAndType(page, selector, text) {
    await page.click(selector);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.type(selector, text);
}

// ── Smoke ─────────────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — smoke', () => {
    test('page loads with correct title', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page).toHaveTitle(/CSS Layout Playground/i);
    });

    test('page heading is visible', async ({ page }) => {
        await page.goto(PAGE);
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toContainText('CSS Layout Playground');
    });

    test('nav links are present', async ({ page }) => {
        await page.goto(PAGE);
        const nav = page.locator('nav');
        await expect(nav.first()).toBeVisible();
    });

    test('no unhandled JS errors on load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(PAGE);
        await page.waitForLoadState('networkidle');
        expect(errors.filter(e =>
            !e.includes('favicon') && !e.includes('net::ERR')
        )).toHaveLength(0);
    });
});

// ── HTML editor ───────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — HTML editor', () => {
    test('HTML textarea is present and visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#htmlInput')).toBeVisible();
    });

    test('HTML textarea is editable', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<h1>Hello</h1>');
        expect(await ta.inputValue()).toContain('<h1>Hello</h1>');
    });

    test('Tab key inserts spaces in HTML editor', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('a');
        await page.keyboard.press('Tab');
        await ta.type('b');
        const val = await ta.inputValue();
        expect(val).toMatch(/a\s+b/);
    });

    test('HTML tab button is active by default', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#tabHtml')).toHaveClass(/active/);
    });
});

// ── CSS editor ────────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — CSS editor', () => {
    test('CSS textarea is present', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#cssInput')).toBeAttached();
    });

    test('switching to CSS tab makes CSS editor visible', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabCss');
        await expect(page.locator('#cssInput')).toBeVisible();
        await expect(page.locator('#tabCss')).toHaveClass(/active/);
    });

    test('CSS textarea is editable', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('body { color: red; }');
        expect(await ta.inputValue()).toContain('body { color: red; }');
    });

    test('switching tabs updates statActive label', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#statActive')).toHaveText('HTML');
        await page.click('#tabCss');
        await expect(page.locator('#statActive')).toHaveText('CSS');
        await page.click('#tabHtml');
        await expect(page.locator('#statActive')).toHaveText('HTML');
    });
});

// ── Preview iframe ─────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — preview iframe', () => {
    test('preview iframe is present', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#previewFrame')).toBeAttached();
    });

    test('preview iframe is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#previewFrame')).toBeVisible();
    });

    test('typing HTML updates preview srcdoc', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<p>hello-world</p>');
        await page.waitForTimeout(900); // wait for debounce
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('hello-world');
    });

    test('typing CSS updates preview srcdoc', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('body { background: pink; }');
        await page.waitForTimeout(900);
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('background: pink');
    });

    test('Run button triggers immediate preview update', async ({ page }) => {
        await page.goto(PAGE);
        // Disable auto-run first
        await page.evaluate(() => {
            /** @type {HTMLInputElement} */ (document.getElementById('autoRun')).checked = false;
        });
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<span>manual-run-test</span>');
        await page.click('#btnRun');
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('manual-run-test');
    });

    test('Refresh button updates preview', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<b>refresh-test</b>');
        await page.click('#btnRefresh');
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('refresh-test');
    });

    test('Ctrl+Enter keyboard shortcut triggers run', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<i>ctrl-enter-test</i>');
        await page.keyboard.press('Control+Enter');
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('ctrl-enter-test');
    });

    test('preview iframe has sandbox attribute', async ({ page }) => {
        await page.goto(PAGE);
        const sandbox = await page.locator('#previewFrame').getAttribute('sandbox');
        expect(sandbox).toBeTruthy();
    });

    test('preview srcdoc wraps CSS in style tag', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('.foo { color: blue; }');
        await page.click('#btnRun');
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect(srcdoc).toContain('<style>');
        expect(srcdoc).toContain('.foo { color: blue; }');
        expect(srcdoc).toContain('</style>');
    });
});

// ── Toolbar buttons ───────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — toolbar', () => {
    test('Run button is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnRun')).toBeVisible();
    });

    test('Copy HTML button is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnCopyHtml')).toBeVisible();
    });

    test('Copy CSS button is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnCopyCss')).toBeVisible();
    });

    test('Clear All button is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnClearAll')).toBeVisible();
    });

    test('Example select is present', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#exampleSelect')).toBeVisible();
    });

    test('Auto-run checkbox is present and checked by default', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#autoRun')).toBeChecked();
    });

    test('Wrap button toggles word wrap text', async ({ page }) => {
        await page.goto(PAGE);
        const before = await page.locator('#btnWordWrap').textContent();
        await page.click('#btnWordWrap');
        const after = await page.locator('#btnWordWrap').textContent();
        expect(before).not.toBe(after);
    });
});

// ── Clear All ─────────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — Clear All', () => {
    test('Clear All empties HTML editor', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<p>clearme</p>');
        await page.click('#btnClearAll');
        expect(await ta.inputValue()).toBe('');
    });

    test('Clear All empties CSS editor', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('body { }');
        await page.click('#btnClearAll');
        expect(await ta.inputValue()).toBe('');
    });

    test('Clear All clears both editors together', async ({ page }) => {
        await page.goto(PAGE);
        const htmlTa = page.locator('#htmlInput');
        await htmlTa.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await htmlTa.type('<b>html</b>');
        await page.click('#tabCss');
        const cssTa = page.locator('#cssInput');
        await cssTa.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await cssTa.type('body {}');
        await page.click('#btnClearAll');
        expect(await htmlTa.inputValue()).toBe('');
        expect(await cssTa.inputValue()).toBe('');
    });
});

// ── Examples ──────────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — examples', () => {
    test('loading an example fills HTML editor', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'flexbox-center');
        await page.waitForTimeout(200);
        const val = await page.locator('#htmlInput').inputValue();
        expect(val.trim().length).toBeGreaterThan(5);
    });

    test('loading an example fills CSS editor', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'flexbox-center');
        await page.waitForTimeout(200);
        const val = await page.locator('#cssInput').inputValue();
        expect(val.trim().length).toBeGreaterThan(5);
    });

    test('loading an example triggers preview render', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'grid-basic');
        await page.waitForTimeout(300);
        const srcdoc = await page.locator('#previewFrame').getAttribute('srcdoc');
        expect((srcdoc || '').length).toBeGreaterThan(20);
    });

    test('flexbox-center example loads Flexbox HTML', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'flexbox-center');
        await page.waitForTimeout(200);
        const val = await page.locator('#htmlInput').inputValue();
        expect(val).toContain('card');
    });

    test('holy-grail example loads', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'holy-grail');
        await page.waitForTimeout(200);
        const val = await page.locator('#htmlInput').inputValue();
        expect(val.trim().length).toBeGreaterThan(10);
    });

    test('grid-areas example loads', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'grid-areas');
        await page.waitForTimeout(200);
        const css = await page.locator('#cssInput').inputValue();
        expect(css).toContain('grid');
    });

    test('example select resets to placeholder after load', async ({ page }) => {
        await page.goto(PAGE);
        await page.selectOption('#exampleSelect', 'card-grid');
        await page.waitForTimeout(200);
        const val = await page.locator('#exampleSelect').inputValue();
        expect(val).toBe('');
    });
});

// ── Status bar ────────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — status bar', () => {
    test('HTML line count updates on input', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<div>\n  <p>A</p>\n</div>');
        const count = await page.locator('#statHtmlLines').textContent();
        expect(parseInt(count)).toBeGreaterThan(1);
    });

    test('CSS line count updates on input', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('body {\n  color: red;\n}\n');
        const count = await page.locator('#statCssLines').textContent();
        expect(parseInt(count)).toBeGreaterThan(1);
    });

    test('Last run time updates after Run', async ({ page }) => {
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await ta.type('<p>a</p>');
        await page.click('#btnRun');
        const t = await page.locator('#statLastRun').textContent();
        expect(t).not.toBe('—');
    });
});

// ── localStorage ──────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — localStorage', () => {
    test('HTML content persists across page reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        const ta = page.locator('#htmlInput');
        await ta.click();
        await ta.type('<section>persist-html</section>');
        await page.waitForTimeout(1000); // wait for debounced save
        await page.reload();
        await page.waitForLoadState('networkidle');
        const val = await page.locator('#htmlInput').inputValue();
        expect(val).toContain('persist-html');
    });

    test('CSS content persists across page reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await ta.type('.persist-css { color: gold; }');
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState('networkidle');
        const val = await page.locator('#cssInput').inputValue();
        expect(val).toContain('.persist-css');
    });
});

// ── Mobile tabs ───────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — mobile tabs', () => {
    test.use({ viewport: { width: 480, height: 800 } });

    test('mobile tab buttons are visible on narrow viewport', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#tabInput')).toBeVisible();
        await expect(page.locator('#tabPreview')).toBeVisible();
    });

    test('clicking Preview tab shows preview pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabPreview');
        await expect(page.locator('#panePreview')).toBeVisible();
    });

    test('clicking Editor tab shows editor pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#tabPreview');
        await page.click('#tabInput');
        await expect(page.locator('#paneEditor')).toBeVisible();
    });
});

// ── Copy buttons ──────────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — copy', () => {
    test('Copy HTML button shows toast when content present', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(PAGE);
        const ta = page.locator('#htmlInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('<p>copy-me</p>');
        await page.click('#btnCopyHtml');
        await expect(page.locator('#toast')).toBeVisible();
    });

    test('Copy CSS button shows toast when content present', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(PAGE);
        await page.click('#tabCss');
        const ta = page.locator('#cssInput');
        await ta.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');
        await ta.type('p { color: blue; }');
        await page.click('#btnCopyCss');
        await expect(page.locator('#toast')).toBeVisible();
    });

    test('Copy HTML shows toast when empty', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        await page.click('#btnCopyHtml');
        await expect(page.locator('#toast')).toBeVisible();
    });
});

// ── Cursor position ───────────────────────────────────────────────────────────
test.describe('CSS Layout Playground — cursor position', () => {
    test('cursor position indicator is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#cursorPos')).toBeVisible();
    });

    test('cursor position starts at Ln 1, Col 1', async ({ page }) => {
        await page.goto(PAGE);
        await page.click('#btnClearAll');
        await page.click('#htmlInput');
        const text = await page.locator('#cursorPos').textContent();
        expect(text).toContain('Ln 1');
        expect(text).toContain('Col 1');
    });
});

// ── Breadcrumb navigation ─────────────────────────────────────────────────────
test.describe('CSS Layout Playground — navigation', () => {
    test('breadcrumb shows Playgrounds link', async ({ page }) => {
        await page.goto(PAGE);
        const bc = page.locator('.breadcrumb');
        await expect(bc).toContainText('Playgrounds');
    });

    test('breadcrumb shows CSS Layout Playground current page', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('.breadcrumb .current')).toContainText('CSS Layout Playground');
    });

    test('Playgrounds breadcrumb link is correct', async ({ page }) => {
        await page.goto(PAGE);
        const href = await page.locator('.breadcrumb a').nth(1).getAttribute('href');
        expect(href).toContain('/playground/');
    });
});
