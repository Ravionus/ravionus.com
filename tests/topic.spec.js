// ============================================================
//  topic.spec.js — Unauthenticated tests for /learn/topic.html
//  Runs on every push via GitHub Actions.
//  No sign-in required.
// ============================================================

const { test, expect } = require('@playwright/test');

test.describe('Topic page — unauthenticated', () => {

  // ── Page load ────────────────────────────────────────────

  test('loads git-basics without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForLoadState('networkidle');
    expect(errors, `JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });

  // ── Header / metadata ────────────────────────────────────

  test('shows topic title', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('#topicTitleEl');
    await expect(page.locator('#topicTitleEl')).toContainText('Git');
  });

  test('shows difficulty badge', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await expect(page.locator('#topicDiff')).not.toBeEmpty();
  });

  test('shows time estimate badge', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await expect(page.locator('#topicTime')).toContainText('min');
  });

  // ── Sidebar ──────────────────────────────────────────────

  test('sidebar renders section steps', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('.step-item');
    const count = await page.locator('.step-item').count();
    expect(count).toBeGreaterThan(0);
  });

  test('first section is marked active in sidebar', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('.step-item.active');
    await expect(page.locator('.step-item.active')).toHaveCount(1);
  });

  // ── Lesson content ───────────────────────────────────────

  test('first section card is visible', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('.section-card');
    await expect(page.locator('.section-card')).toBeVisible();
  });

  test('lesson body has content', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('.lesson-body');
    const text = await page.locator('.lesson-body').textContent();
    expect(text?.trim().length).toBeGreaterThan(20);
  });

  test('continue button is present', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('#continueBtn');
    await expect(page.locator('#continueBtn')).toBeVisible();
  });

  // ── Navigation ───────────────────────────────────────────

  test('continue advances to next section', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('#continueBtn');
    const initialTitle = await page.locator('.section-card-title').textContent();
    await page.click('#continueBtn');
    // Wait for new content to render
    await page.waitForFunction(
      (prev) => document.querySelector('.section-card-title')?.textContent !== prev,
      initialTitle
    );
    const newTitle = await page.locator('.section-card-title').textContent();
    expect(newTitle).not.toBe(initialTitle);
  });

  test('back button appears after advancing', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('#continueBtn');
    await page.click('#continueBtn');
    await page.waitForSelector('#prevBtn');
    await expect(page.locator('#prevBtn')).toBeVisible();
  });

  test('back button returns to previous section', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.waitForSelector('#continueBtn');
    const firstTitle = await page.locator('.section-card-title').textContent();
    await page.click('#continueBtn');
    await page.waitForSelector('#prevBtn');
    await page.click('#prevBtn');
    await page.waitForFunction(
      (expected) => document.querySelector('.section-card-title')?.textContent === expected,
      firstTitle
    );
    const backTitle = await page.locator('.section-card-title').textContent();
    expect(backTitle).toBe(firstTitle);
  });

  // ── Error handling / redirects ───────────────────────────

  test('invalid topic id redirects to catalog', async ({ page }) => {
    await page.goto('/learn/topic.html?id=does-not-exist');
    await page.waitForURL(url => !url.href.includes('topic.html'), { timeout: 5000 });
    expect(page.url()).not.toContain('topic.html');
  });

  test('missing id redirects to catalog', async ({ page }) => {
    await page.goto('/learn/topic.html');
    await page.waitForURL(url => !url.href.includes('topic.html'), { timeout: 5000 });
    expect(page.url()).not.toContain('topic.html');
  });

  // ── Auth UI ──────────────────────────────────────────────

  test('sign-in button visible when not logged in', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await expect(page.locator('#signInBtn')).toBeVisible();
  });

  test('"All Topics" back link navigates to catalog', async ({ page }) => {
    await page.goto('/learn/topic.html?id=git-basics');
    await page.click('text=← All Topics');
    await expect(page).toHaveURL(/\/learn\//);
  });

});
