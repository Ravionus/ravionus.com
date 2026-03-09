// @ts-check
const { test, expect } = require('@playwright/test');

const PAGE = 'http://localhost:3000/tools/hash/index.html';

// Known-good hashes for "hello" (hex, lowercase)
const HELLO_HASHES = {
    md5:    '5d41402abc4b2a76b9719d911017c592',
    sha1:   'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
    sha256: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    sha384: '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',
    sha512: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
};

// Known-good hashes for "The quick brown fox jumps over the lazy dog"
const FOX_MD5    = '9e107d9d372bb6826bd81d3542a419d6';
const FOX_SHA256 = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';

// ─────────────────────────────────────────────────────────────────────────────
// Smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Smoke', () => {
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

    test('toolbar buttons are all visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnHash')).toBeVisible();
        await expect(page.locator('#btnHex')).toBeVisible();
        await expect(page.locator('#btnBase64')).toBeVisible();
        await expect(page.locator('#btnSample')).toBeVisible();
        await expect(page.locator('#btnCopyAll')).toBeVisible();
        await expect(page.locator('#btnDownload')).toBeVisible();
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('all 5 hash algorithm rows are rendered', async ({ page }) => {
        await page.goto(PAGE);
        for (const algo of ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
            await expect(page.locator('.hash-algo', { hasText: algo })).toBeVisible();
        }
    });

    test('text input and file mode tabs are visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#modeText')).toBeVisible();
        await expect(page.locator('#modeFile')).toBeVisible();
    });

    test('compare input is visible', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#compareInput')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy path — hashing text
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Text hashing', () => {
    test('SHA-256 of "hello" matches known value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA256')).toHaveText(HELLO_HASHES.sha256);
    });

    test('MD5 of "hello" matches known value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valMD5')).toHaveText(HELLO_HASHES.md5);
    });

    test('SHA-1 of "hello" matches known value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA1')).toHaveText(HELLO_HASHES.sha1);
    });

    test('SHA-512 of "hello" matches known value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA512')).toHaveText(HELLO_HASHES.sha512);
    });

    test('success banner appears after hashing', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#successBanner')).toBeVisible();
    });

    test('auto-hashes on typing after debounce', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('test auto hash');
        await page.waitForTimeout(600);
        await expect(page.locator('#valSHA256')).not.toHaveText('—');
    });

    test('SHA-256 of sample text matches known value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        await expect(page.locator('#valSHA256')).toHaveText(FOX_SHA256);
        await expect(page.locator('#valMD5')).toHaveText(FOX_MD5);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Empty / edge input
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Empty input', () => {
    test('empty input leaves hash values as em-dash', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA256')).toHaveText('—');
    });

    test('no error banner shown for empty input', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('');
        await page.locator('#btnHash').click();
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('whitespace-only input leaves output empty', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('   ');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA256')).toHaveText('—');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Format toggle (hex ↔ base64)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Format toggle', () => {
    test('hex is active by default', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('#btnHex')).toHaveClass(/active/);
        await expect(page.locator('#btnBase64')).not.toHaveClass(/active/);
    });

    test('switching to base64 changes displayed value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        const hexVal = await page.locator('#valSHA256').textContent();
        await page.locator('#btnBase64').click();
        const b64Val = await page.locator('#valSHA256').textContent();
        expect(hexVal).not.toBe(b64Val);
        expect(b64Val).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('switching back to hex restores original value', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        const hexBefore = await page.locator('#valSHA256').textContent();
        await page.locator('#btnBase64').click();
        await page.locator('#btnHex').click();
        const hexAfter = await page.locator('#valSHA256').textContent();
        expect(hexAfter).toBe(hexBefore);
    });

    test('base64 button gets active class when clicked', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnBase64').click();
        await expect(page.locator('#btnBase64')).toHaveClass(/active/);
        await expect(page.locator('#btnHex')).not.toHaveClass(/active/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sample button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Sample', () => {
    test('sample button fills text input', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        const val = await page.locator('#textInput').inputValue();
        expect(val.length).toBeGreaterThan(0);
    });

    test('sample button triggers hashing', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnSample').click();
        await expect(page.locator('#valSHA256')).not.toHaveText('—');
        await expect(page.locator('#successBanner')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Clear', () => {
    test('clear button empties the input', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('some text');
        await page.locator('#btnClear').click();
        await expect(page.locator('#textInput')).toHaveValue('');
    });

    test('clear button resets hash values to em-dash', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA256')).not.toHaveText('—');
        await page.locator('#btnClear').click();
        await expect(page.locator('#valSHA256')).toHaveText('—');
    });

    test('clear hides success banner', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await expect(page.locator('#successBanner')).toBeVisible();
        await page.locator('#btnClear').click();
        await expect(page.locator('#successBanner')).toBeHidden();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save / localStorage
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Auto-save', () => {
    test('input persists after page reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('persist me');
        await page.locator('#btnHash').click();
        await page.reload();
        await expect(page.locator('#textInput')).toHaveValue('persist me');
    });

    test('restores and re-hashes saved text on reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.reload();
        // After reload the init code runs the hash automatically
        await expect(page.locator('#valSHA256')).toHaveText(HELLO_HASHES.sha256);
    });

    test('format preference persists after reload', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#btnBase64').click();
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.reload();
        await expect(page.locator('#btnBase64')).toHaveClass(/active/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Compare feature
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Compare', () => {
    test('pasting matching SHA-256 shows ✓ Match', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.locator('#compareInput').fill(HELLO_HASHES.sha256);
        await expect(page.locator('#compareResult')).toHaveClass(/match/);
        await expect(page.locator('#compareResult')).toContainText('Match');
    });

    test('pasting wrong hash shows ✗ Mismatch', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.locator('#compareInput').fill('0000000000000000000000000000000000000000000000000000000000000000');
        await expect(page.locator('#compareResult')).toHaveClass(/mismatch/);
        await expect(page.locator('#compareResult')).toContainText('Mismatch');
    });

    test('compare works with MD5 hash too', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.locator('#compareInput').fill(HELLO_HASHES.md5);
        await expect(page.locator('#compareResult')).toHaveClass(/match/);
    });

    test('empty compare input hides result', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        await page.locator('#compareInput').fill(HELLO_HASHES.sha256);
        await page.locator('#compareInput').fill('');
        await expect(page.locator('#compareResult')).toBeHidden();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Input mode — File tab UI
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Input modes', () => {
    test('switching to File mode shows file drop zone', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#modeFile').click();
        await expect(page.locator('#fileZone')).toBeVisible();
        await expect(page.locator('#textInput')).toBeHidden();
    });

    test('switching back to Text mode hides file zone', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#modeFile').click();
        await page.locator('#modeText').click();
        await expect(page.locator('#textInput')).toBeVisible();
        await expect(page.locator('#fileZone')).toBeHidden();
    });

    test('File mode tab gets active class', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#modeFile').click();
        await expect(page.locator('#modeFile')).toHaveClass(/active/);
        await expect(page.locator('#modeText')).not.toHaveClass(/active/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mobile tabs
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Mobile tabs', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('mobile tabs are visible on narrow viewport', async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator('.mobile-tabs')).toBeVisible();
    });

    test('Output tab shows the hash output pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('.mobile-tab[data-pane="output"]').click();
        await expect(page.locator('#outputPane')).toHaveClass(/mobile-active/);
        await expect(page.locator('#inputPane')).not.toHaveClass(/mobile-active/);
    });

    test('Input tab shows the input pane', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('.mobile-tab[data-pane="output"]').click();
        await page.locator('.mobile-tab[data-pane="input"]').click();
        await expect(page.locator('#inputPane')).toHaveClass(/mobile-active/);
        await expect(page.locator('#outputPane')).not.toHaveClass(/mobile-active/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Download button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Download', () => {
    test('download button triggers a file download', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#btnDownload').click(),
        ]);
        expect(download.suggestedFilename()).toBe('hashes.txt');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Hash Generator — Edge cases', () => {
    test('unicode / emoji input hashes consistently', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('こんにちは 🌍');
        await page.locator('#btnHash').click();
        const v1 = await page.locator('#valSHA256').textContent();
        // Second hash should be identical
        await page.locator('#btnHash').click();
        const v2 = await page.locator('#valSHA256').textContent();
        expect(v1).toBe(v2);
        expect(v1).not.toBe('—');
    });

    test('very long input (10 000 chars) produces a hash without error', async ({ page }) => {
        await page.goto(PAGE);
        const longText = 'a'.repeat(10000);
        await page.locator('#textInput').fill(longText);
        await page.locator('#btnHash').click();
        await expect(page.locator('#valSHA256')).not.toHaveText('—');
        await expect(page.locator('#errorBanner')).toBeHidden();
    });

    test('changing text re-computes all hashes', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('hello');
        await page.locator('#btnHash').click();
        const first = await page.locator('#valSHA256').textContent();
        await page.locator('#textInput').fill('world');
        await page.locator('#btnHash').click();
        const second = await page.locator('#valSHA256').textContent();
        expect(first).not.toBe(second);
    });

    test('single character input produces valid hashes', async ({ page }) => {
        await page.goto(PAGE);
        await page.locator('#textInput').fill('a');
        await page.locator('#btnHash').click();
        const sha256 = await page.locator('#valSHA256').textContent();
        // SHA-256 of 'a' is ca978112...
        expect(sha256).toMatch(/^ca978112/);
    });
});
