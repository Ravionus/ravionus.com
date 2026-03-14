// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const URL  = `${BASE}/tools/jwt/`;

// ── Sample JWTs ──
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022,"exp":9999999999}
const VALID_JWT = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9',
    'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
].join('.');

// Header: {"alg":"RS256","typ":"JWT"}
// Payload: {"sub":"abc","iss":"https://auth.example.com","aud":"api","iat":1000000000,"exp":1000000001}
// (exp in the past → expired)
const EXPIRED_JWT = [
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJzdWIiOiJhYmMiLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkiLCJpYXQiOjEwMDAwMDAwMDAsImV4cCI6MTAwMDAwMDAwMX0',
    'fakesignature'
].join('.');

// ── 1. Smoke Tests ─────────────────────────────────────────────────────────
test.describe('Smoke', () => {
    test('page title is JWT Decoder', async ({ page }) => {
        await page.goto(URL);
        await expect(page).toHaveTitle(/JWT Decoder/i);
    });

    test('h1 contains JWT Decoder', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('h1')).toContainText('JWT Decoder');
    });

    test('no JS errors on load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(URL);
        expect(errors).toHaveLength(0);
    });

    test('no CSP violations on load', async ({ page }) => {
        const violations = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().toLowerCase().includes('content security policy')) {
                violations.push(msg.text());
            }
        });
        await page.goto(URL);
        expect(violations).toHaveLength(0);
    });

    test('nav breadcrumb visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav')).toContainText('Ravionus');
        await expect(page.locator('nav')).toContainText('Tools');
        await expect(page.locator('nav')).toContainText('JWT Decoder');
    });

    test('JWT token textarea is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#jwtInput')).toBeVisible();
    });

    test('Decode button is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#btnDecode')).toBeVisible();
    });

    test('Clear button is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#btnClear')).toBeVisible();
    });

    test('Sample button is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#btnSample')).toBeVisible();
    });

    test('Copy Payload button is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#btnCopyPayload')).toBeVisible();
    });

    test('warning bar is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('.warning-bar')).toBeVisible();
        await expect(page.locator('.warning-bar')).toContainText('NOT verified');
    });

    test('three output cards present', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#headerCard')).toBeVisible();
        await expect(page.locator('#payloadCard')).toBeVisible();
        await expect(page.locator('#signatureCard')).toBeVisible();
    });
});

// ── 2. Core Decode ─────────────────────────────────────────────────────────
test.describe('Core Decode', () => {
    test('valid JWT → header panel shows algorithm', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#headerOutput')).toContainText('HS256');
    });

    test('valid JWT → header panel shows token type', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#headerOutput')).toContainText('JWT');
    });

    test('valid JWT → payload panel shows subject', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#payloadOutput')).toContainText('1234567890');
    });

    test('valid JWT → payload panel shows name claim', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#payloadOutput')).toContainText('John Doe');
    });

    test('valid JWT → signature card shows algorithm badge', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#sigAlgBadge')).toContainText('HS256');
    });

    test('valid JWT → signature card shows signature value', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#sigValue')).toContainText('SflKxwR');
    });

    test('valid JWT → signature card not-verified notice visible', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('.sig-notice')).toBeVisible();
    });

    test('valid JWT → status bar shows algorithm', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#statAlg')).toContainText('HS256');
    });

    test('valid JWT → status bar shows token type', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#statType')).toContainText('JWT');
    });

    test('valid JWT → status bar shows claim count', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        // VALID_JWT payload has 4 claims: sub, name, iat, exp
        await expect(page.locator('#statClaims')).toContainText('4');
    });

    test('header output is pretty-printed JSON', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        const text = await page.locator('#headerOutput').textContent();
        expect(() => JSON.parse(text)).not.toThrow();
        expect(text).toContain('\n');
    });

    test('payload output is pretty-printed JSON', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        const text = await page.locator('#payloadOutput').textContent();
        expect(() => JSON.parse(text)).not.toThrow();
        expect(text).toContain('\n');
    });
});

// ── 3. Claims Parsing ──────────────────────────────────────────────────────
test.describe('Claims Parsing', () => {
    test('exp claim shows human-readable date in claims table', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsSection')).toBeVisible();
        // exp 9999999999 → year 2286
        await expect(page.locator('#claimsTable')).toContainText('2286');
    });

    test('iat claim shows human-readable date in claims table', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        // iat 1516239022 → 2018
        await expect(page.locator('#claimsTable')).toContainText('2018');
    });

    test('claims table shows Expires label', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsTable')).toContainText('Expires');
    });

    test('claims table shows Issued At label', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsTable')).toContainText('Issued At');
    });

    test('claims table shows Subject label', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsTable')).toContainText('Subject');
    });

    test('claims table shows Issuer label for iss claim', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', EXPIRED_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsTable')).toContainText('Issuer');
    });

    test('claims table shows Audience label for aud claim', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', EXPIRED_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#claimsTable')).toContainText('Audience');
    });
});

// ── 4. Expiry Status ───────────────────────────────────────────────────────
test.describe('Expiry Status', () => {
    test('far-future exp shows Valid indicator in status bar', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#statExpiry')).toContainText('Valid');
    });

    test('far-future exp shows green Valid badge in claims table', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#expiryBadge')).toBeVisible();
        await expect(page.locator('#expiryBadge')).toContainText('Valid');
        await expect(page.locator('#expiryBadge')).toHaveClass(/valid/);
    });

    test('expired token shows Expired indicator in status bar', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', EXPIRED_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#statExpiry')).toContainText('Expired');
    });

    test('expired token shows Expired badge in claims table', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', EXPIRED_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#expiryBadge')).toContainText('Expired');
        await expect(page.locator('#expiryBadge')).toHaveClass(/expired/);
    });

    test('token without exp shows dash in status bar', async ({ page }) => {
        // JWT with no exp claim
        // Header: {"alg":"HS256","typ":"JWT"}, Payload: {"sub":"user"}
        const noExpJwt = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            'eyJzdWIiOiJ1c2VyIn0',
            'fakesig'
        ].join('.');
        await page.goto(URL);
        await page.fill('#jwtInput', noExpJwt);
        await page.click('#btnDecode');
        await expect(page.locator('#statExpiry')).toContainText('—');
    });

    test('RS256 algorithm shown correctly in expired token', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', EXPIRED_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#statAlg')).toContainText('RS256');
        await expect(page.locator('#sigAlgBadge')).toContainText('RS256');
    });
});

// ── 5. Error Handling ──────────────────────────────────────────────────────
test.describe('Error Handling', () => {
    test('empty input shows error banner', async ({ page }) => {
        await page.goto(URL);
        // Clear localStorage to prevent sample loading
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText('paste a JWT');
    });

    test('empty input does not open dialog', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => { localStorage.clear(); });
        await page.reload();
        let dialogFired = false;
        page.on('dialog', () => { dialogFired = true; });
        await page.click('#btnDecode');
        expect(dialogFired).toBeFalsy();
    });

    test('single segment input shows error banner', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', 'notajwt');
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText('3');
    });

    test('two segment input shows error banner', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', 'part1.part2');
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('invalid base64 in header shows error banner', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', '!!!invalid!!!.eyJzdWIiOiJ0ZXN0In0.sig');
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('malformed JSON in payload shows error banner', async ({ page }) => {
        await page.goto(URL);
        // header is valid, payload decodes to non-JSON (just "nonjson")
        const badPayload = btoa('nonjson').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const jwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${badPayload}.sig`;
        await page.fill('#jwtInput', jwt);
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
    });

    test('no dialog on invalid input', async ({ page }) => {
        await page.goto(URL);
        let dialogFired = false;
        page.on('dialog', () => { dialogFired = true; });
        await page.fill('#jwtInput', 'bad.input');
        await page.click('#btnDecode');
        expect(dialogFired).toBeFalsy();
    });

    test('error banner hidden after successful decode', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        // First trigger an error
        await page.fill('#jwtInput', 'bad');
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).toBeVisible();
        // Then decode valid JWT
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#errorBanner')).not.toBeVisible();
    });
});

// ── 6. Toolbar ─────────────────────────────────────────────────────────────
test.describe('Toolbar', () => {
    test('Sample button fills the textarea', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.click('#btnSample');
        const val = await page.inputValue('#jwtInput');
        expect(val.trim().length).toBeGreaterThan(10);
        // Should have two dots (three parts)
        expect(val.split('.').length).toBe(3);
    });

    test('Sample button auto-decodes', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.click('#btnSample');
        // Header output should no longer be placeholder text
        await expect(page.locator('#headerOutput')).not.toContainText('Paste a JWT');
        await expect(page.locator('#headerOutput')).toContainText('alg');
    });

    test('Clear button empties the textarea', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await page.click('#btnClear');
        const val = await page.inputValue('#jwtInput');
        expect(val).toBe('');
    });

    test('Clear button resets output panels', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await page.click('#btnClear');
        await expect(page.locator('#headerOutput')).toContainText('Paste a JWT');
    });

    test('Copy Payload button copies JSON', async ({ page }) => {
        await page.goto(URL);

        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await page.click('#btnCopyPayload');

        const clipText = await page.evaluate(() => navigator.clipboard.readText());
        const parsed = JSON.parse(clipText);
        expect(parsed.sub).toBe('1234567890');
        expect(parsed.name).toBe('John Doe');
    });

    test('Copy Header button copies header JSON', async ({ page }) => {
        await page.goto(URL);
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await page.click('#btnCopyHeader');

        const clipText = await page.evaluate(() => navigator.clipboard.readText());
        const parsed = JSON.parse(clipText);
        expect(parsed.alg).toBe('HS256');
        expect(parsed.typ).toBe('JWT');
    });
});

// ── 7. Output Format ───────────────────────────────────────────────────────
test.describe('Output Format', () => {
    test('header JSON has 2-space indentation', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        const text = await page.locator('#headerOutput').textContent();
        expect(text).toContain('  "alg"');
    });

    test('payload JSON has 2-space indentation', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        const text = await page.locator('#payloadOutput').textContent();
        expect(text).toContain('  "sub"');
    });

    test('success banner shown after decode', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#successBanner')).toBeVisible();
        await expect(page.locator('#successBanner')).toContainText('Decoded successfully');
    });

    test('success banner mentions claim count', async ({ page }) => {
        await page.goto(URL);
        await page.fill('#jwtInput', VALID_JWT);
        await page.click('#btnDecode');
        await expect(page.locator('#successBanner')).toContainText('4');
    });
});

// ── 8. localStorage ────────────────────────────────────────────────────────
test.describe('localStorage', () => {
    test('input persists after reload', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.fill('#jwtInput', VALID_JWT);
        // Trigger save (input event fires debounce)
        await page.locator('#jwtInput').dispatchEvent('input');
        await page.waitForTimeout(500);
        await page.reload();
        const val = await page.inputValue('#jwtInput');
        expect(val.trim()).toBe(VALID_JWT);
    });

    test('cleared input reflected in localStorage', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.fill('#jwtInput', VALID_JWT);
        await page.locator('#jwtInput').dispatchEvent('input');
        await page.waitForTimeout(500);
        await page.click('#btnClear');
        await page.waitForTimeout(500);
        const saved = await page.evaluate(() => localStorage.getItem('ravionus_tool_jwt'));
        expect(saved ?? '').toBe('');
    });

    test('auto-decodes stored token on load', async ({ page }) => {
        await page.goto(URL);
        await page.evaluate((jwt) => localStorage.setItem('ravionus_tool_jwt', jwt), VALID_JWT);
        await page.reload();
        // Should have decoded automatically
        await expect(page.locator('#headerOutput')).not.toContainText('Paste a JWT');
        await expect(page.locator('#headerOutput')).toContainText('HS256');
    });
});
