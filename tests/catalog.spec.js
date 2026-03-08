// ============================================================
//  catalog.spec.js — Unauthenticated tests for /learn/
//  Runs on every push via GitHub Actions.
//  No sign-in required.
// ============================================================

const { test, expect } = require('@playwright/test');

test.describe('Catalog page — unauthenticated', () => {

  // ── Page load ────────────────────────────────────────────

  test('loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/learn/');
    await page.waitForLoadState('networkidle');
    expect(errors, `JS errors on page load: ${errors.join(', ')}`).toHaveLength(0);
  });

  // ── Stats ────────────────────────────────────────────────

  test('stats update from — to real numbers', async ({ page }) => {
    await page.goto('/learn/');
    // Wait for initCatalog to populate the stats
    await page.waitForFunction(
      () => document.getElementById('statTopics')?.textContent !== '—',
      { timeout: 10000 }
    );
    const topics  = await page.locator('#statTopics').textContent();
    const lessons = await page.locator('#statLessons').textContent();
    const quizzes = await page.locator('#statQuizzes').textContent();

    expect(Number(topics)).toBe(10);
    expect(Number(lessons)).toBeGreaterThan(0);
    expect(Number(quizzes)).toBeGreaterThan(0);
  });

  // ── Course cards ─────────────────────────────────────────

  test('renders 10 topic cards', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    await expect(page.locator('.topic-card')).toHaveCount(10);
  });

  test('each card links to topic page with an id', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    const hrefs = await page.locator('.topic-card').evaluateAll(
      cards => cards.map(c => c.getAttribute('href'))
    );
    expect(hrefs.every(h => h?.startsWith('topic.html?id='))).toBe(true);
  });

  test('each card shows a title', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    const titles = await page.locator('.card-title').allTextContents();
    expect(titles.length).toBe(10);
    expect(titles.every(t => t.trim().length > 0)).toBe(true);
  });

  // ── Search ───────────────────────────────────────────────

  test('search filters cards by keyword', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    await page.fill('#searchInput', 'git');
    await page.waitForTimeout(150);
    const count = await page.locator('.topic-card').count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(10);
  });

  test('clearing search restores all 10 cards', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    await page.fill('#searchInput', 'git');
    await page.waitForTimeout(150);
    await page.fill('#searchInput', '');
    await page.waitForTimeout(150);
    await expect(page.locator('.topic-card')).toHaveCount(10);
  });

  test('search with no results shows empty state message', async ({ page }) => {
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    await page.fill('#searchInput', 'zzznomatchzzz');
    await page.waitForTimeout(150);
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.topic-card')).toHaveCount(0);
  });

  // ── XSS protection ───────────────────────────────────────

  test('XSS payload in search is treated as plain text, not executed', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/learn/');
    await page.waitForSelector('.topic-card');
    // An XSS payload that would throw a JS error if executed
    await page.fill('#searchInput', '<img src=x onerror=throw new Error("XSS executed")>');
    await page.waitForTimeout(300);
    expect(errors, 'XSS payload was executed!').toHaveLength(0);
    // Empty state should be visible and contain the raw text, not execute the tag
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  // ── Auth UI ──────────────────────────────────────────────

  test('sign-in button visible when not logged in', async ({ page }) => {
    await page.goto('/learn/');
    await expect(page.locator('#signInBtn')).toBeVisible();
    await expect(page.locator('#userChip')).toHaveClass(/hidden/);
  });

});
