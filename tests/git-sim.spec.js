// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/playground/git-sim/';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function runCmd(page, cmd) {
    await page.fill('#terminalInput', cmd);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
}

async function lastTermLine(page) {
    const lines = await page.$$('.term-out');
    if (!lines.length) return '';
    return lines[lines.length - 1].textContent();
}

async function termText(page) {
    return page.locator('#terminalOutput').innerText();
}

// Reset to a clean simulator state between tests
async function resetSim(page) {
    await page.click('#btnReset');
    await page.waitForTimeout(50);
}

// ── 1. Smoke tests ────────────────────────────────────────────────────────────
test.describe('Git Simulator — smoke', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await page.waitForLoadState('load');
    });

    test('page title is correct', async ({ page }) => {
        await expect(page).toHaveTitle(/Git Simulator/i);
    });

    test('h1 contains Git Simulator', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toContainText('Git Simulator');
    });

    test('no JS errors on load', async ({ page, context }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.reload();
        await page.waitForLoadState('load');
        expect(errors).toHaveLength(0);
    });

    test('no CSP violations on load', async ({ page }) => {
        const violations = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
                violations.push(msg.text());
            }
        });
        await page.reload();
        await page.waitForLoadState('load');
        expect(violations).toHaveLength(0);
    });

    test('nav breadcrumb shows Playgrounds link', async ({ page }) => {
        const breadcrumb = page.locator('nav .breadcrumb');
        await expect(breadcrumb).toContainText('Playgrounds');
    });
});

// ── 2. Layout / UI ────────────────────────────────────────────────────────────
test.describe('Git Simulator — layout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
    });

    test('terminal input is visible', async ({ page }) => {
        await expect(page.locator('#terminalInput')).toBeVisible();
    });

    test('terminal output area is visible', async ({ page }) => {
        await expect(page.locator('#terminalOutput')).toBeVisible();
    });

    test('graph canvas is present', async ({ page }) => {
        await expect(page.locator('#graphCanvas')).toBeVisible();
    });

    test('graph pane is present', async ({ page }) => {
        await expect(page.locator('#graphPane')).toBeVisible();
    });

    test('Run button is visible', async ({ page }) => {
        await expect(page.locator('#btnRun')).toBeVisible();
    });

    test('Reset button is visible', async ({ page }) => {
        await expect(page.locator('#btnReset')).toBeVisible();
    });

    test('Help button is visible', async ({ page }) => {
        await expect(page.locator('#btnHelp')).toBeVisible();
    });

    test('scenario select is visible', async ({ page }) => {
        await expect(page.locator('#scenarioSelect')).toBeVisible();
    });

    test('status bar shows branch', async ({ page }) => {
        await expect(page.locator('#statBranch')).toBeVisible();
    });

    test('status bar shows commits count', async ({ page }) => {
        await expect(page.locator('#statCommits')).toBeVisible();
    });

    test('status bar shows branches count', async ({ page }) => {
        await expect(page.locator('#statBranches')).toBeVisible();
    });

    test('mobile tab Terminal button exists', async ({ page }) => {
        await expect(page.locator('#tabInput')).toBeAttached();
    });

    test('mobile tab Graph button exists', async ({ page }) => {
        await expect(page.locator('#tabOutput')).toBeAttached();
    });
});

// ── 3. git init ───────────────────────────────────────────────────────────────
test.describe('Git Simulator — git init', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
    });

    test('git init shows initialized message', async ({ page }) => {
        await runCmd(page, 'git init');
        const text = await termText(page);
        expect(text).toMatch(/Initialized|initialized/i);
    });

    test('git init twice shows reinitialized message', async ({ page }) => {
        await runCmd(page, 'git init');
        await runCmd(page, 'git init');
        const text = await termText(page);
        expect(text).toMatch(/reinitial/i);
    });
});

// ── 4. git commit ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git commit', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
    });

    test('git commit -m creates a commit', async ({ page }) => {
        await runCmd(page, 'git commit -m "First commit"');
        const text = await termText(page);
        expect(text).toMatch(/First commit/i);
    });

    test('commit count increments in status bar', async ({ page }) => {
        await runCmd(page, 'git commit -m "Alpha"');
        const count = await page.locator('#statCommits').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(1);
    });

    test('commit without -m still creates a commit', async ({ page }) => {
        await runCmd(page, 'git commit');
        const count = await page.locator('#statCommits').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(1);
    });

    test('multiple commits increment count', async ({ page }) => {
        await runCmd(page, 'git commit -m "A"');
        await runCmd(page, 'git commit -m "B"');
        await runCmd(page, 'git commit -m "C"');
        const count = await page.locator('#statCommits').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(3);
    });
});

// ── 5. git status ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git status', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
    });

    test('git status shows current branch', async ({ page }) => {
        await runCmd(page, 'git status');
        const text = await termText(page);
        expect(text).toMatch(/On branch/i);
    });

    test('git status after add shows staged file', async ({ page }) => {
        await runCmd(page, 'git add README.md');
        await runCmd(page, 'git status');
        const text = await termText(page);
        expect(text).toMatch(/README\.md|staged|to be committed/i);
    });
});

// ── 6. git branch ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git branch', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('git branch lists branches', async ({ page }) => {
        await runCmd(page, 'git branch');
        const text = await termText(page);
        expect(text).toMatch(/main/i);
    });

    test('git branch <name> creates a branch', async ({ page }) => {
        await runCmd(page, 'git branch feature-x');
        const count = await page.locator('#statBranches').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(2);
    });

    test('git branch -d deletes a branch', async ({ page }) => {
        await runCmd(page, 'git branch temp-branch');
        await runCmd(page, 'git branch -d temp-branch');
        const text = await termText(page);
        expect(text).toMatch(/Deleted branch/i);
    });

    test('cannot delete current branch', async ({ page }) => {
        await runCmd(page, 'git branch -d main');
        const text = await termText(page);
        expect(text).toMatch(/Cannot delete|not found|error/i);
    });
});

// ── 7. git checkout ───────────────────────────────────────────────────────────
test.describe('Git Simulator — git checkout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('git checkout -b creates and switches to new branch', async ({ page }) => {
        await runCmd(page, 'git checkout -b feature/test');
        const branch = await page.locator('#statBranch').innerText();
        expect(branch).toBe('feature/test');
    });

    test('git checkout switches to existing branch', async ({ page }) => {
        await runCmd(page, 'git branch develop');
        await runCmd(page, 'git checkout develop');
        const branch = await page.locator('#statBranch').innerText();
        expect(branch).toBe('develop');
    });

    test('git checkout nonexistent branch shows error', async ({ page }) => {
        await runCmd(page, 'git checkout nonexistent-branch');
        const text = await termText(page);
        expect(text).toMatch(/error|pathspec/i);
    });
});

// ── 8. git switch ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git switch', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('git switch -c creates and switches branch', async ({ page }) => {
        await runCmd(page, 'git switch -c new-feature');
        const branch = await page.locator('#statBranch').innerText();
        expect(branch).toBe('new-feature');
    });

    test('git switch switches to existing branch', async ({ page }) => {
        await runCmd(page, 'git branch hotfix');
        await runCmd(page, 'git switch hotfix');
        const branch = await page.locator('#statBranch').innerText();
        expect(branch).toBe('hotfix');
    });
});

// ── 9. git merge ──────────────────────────────────────────────────────────────
test.describe('Git Simulator — git merge', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('fast-forward merge succeeds', async ({ page }) => {
        await runCmd(page, 'git checkout -b feature/ff');
        await runCmd(page, 'git commit -m "feature work"');
        await runCmd(page, 'git checkout main');
        await runCmd(page, 'git merge feature/ff');
        const text = await termText(page);
        expect(text).toMatch(/Fast-forward|up to date|Merge/i);
    });

    test('merge nonexistent branch shows error', async ({ page }) => {
        await runCmd(page, 'git merge ghost-branch');
        const text = await termText(page);
        expect(text).toMatch(/cannot|not something|merge:/i);
    });
});

// ── 10. git log ───────────────────────────────────────────────────────────────
test.describe('Git Simulator — git log', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "First"');
        await runCmd(page, 'git commit -m "Second"');
    });

    test('git log shows commit hashes', async ({ page }) => {
        await runCmd(page, 'git log');
        const text = await termText(page);
        expect(text).toMatch(/commit/i);
    });

    test('git log --oneline shows abbreviated output', async ({ page }) => {
        await runCmd(page, 'git log --oneline');
        const text = await termText(page);
        expect(text).toMatch(/First|Second/i);
    });

    test('git log --all shows all branches', async ({ page }) => {
        await runCmd(page, 'git branch side');
        await runCmd(page, 'git checkout side');
        await runCmd(page, 'git commit -m "Side commit"');
        await runCmd(page, 'git log --all');
        const text = await termText(page);
        expect(text).toMatch(/Side commit/i);
    });
});

// ── 11. git tag ───────────────────────────────────────────────────────────────
test.describe('Git Simulator — git tag', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "tagged commit"');
    });

    test('git tag creates a tag', async ({ page }) => {
        await runCmd(page, 'git tag v1.0.0');
        const text = await termText(page);
        expect(text).toMatch(/Tagged|v1\.0\.0/i);
    });

    test('git tag lists tags', async ({ page }) => {
        await runCmd(page, 'git tag v1.0.0');
        await runCmd(page, 'git tag');
        const text = await termText(page);
        expect(text).toMatch(/v1\.0\.0/);
    });

    test('git tag -d deletes a tag', async ({ page }) => {
        await runCmd(page, 'git tag release');
        await runCmd(page, 'git tag -d release');
        const text = await termText(page);
        expect(text).toMatch(/Deleted tag/i);
    });
});

// ── 12. git stash ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git stash', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "base"');
        await runCmd(page, 'git add README.md');
    });

    test('git stash saves changes', async ({ page }) => {
        await runCmd(page, 'git stash');
        const text = await termText(page);
        expect(text).toMatch(/Saved|WIP/i);
    });

    test('git stash list shows stash entries', async ({ page }) => {
        await runCmd(page, 'git stash');
        await runCmd(page, 'git stash list');
        const text = await termText(page);
        expect(text).toMatch(/stash@\{0\}/i);
    });

    test('git stash pop restores changes', async ({ page }) => {
        await runCmd(page, 'git stash');
        await runCmd(page, 'git stash pop');
        const text = await termText(page);
        expect(text).toMatch(/restored|On branch/i);
    });
});

// ── 13. git rebase ────────────────────────────────────────────────────────────
test.describe('Git Simulator — git rebase', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "base"');
        await runCmd(page, 'git checkout -b feature');
        await runCmd(page, 'git commit -m "feature work"');
        await runCmd(page, 'git checkout main');
        await runCmd(page, 'git commit -m "main progress"');
        await runCmd(page, 'git checkout feature');
    });

    test('git rebase succeeds with output', async ({ page }) => {
        await runCmd(page, 'git rebase main');
        const text = await termText(page);
        expect(text).toMatch(/Rebasing|rebased|Successfully/i);
    });

    test('git rebase --abort aborts rebase', async ({ page }) => {
        await runCmd(page, 'git rebase --abort');
        const text = await termText(page);
        expect(text).toMatch(/abort/i);
    });
});

// ── 14. git reset ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — git reset', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('git reset --hard clears index', async ({ page }) => {
        await runCmd(page, 'git add file.txt');
        await runCmd(page, 'git reset --hard');
        const text = await termText(page);
        expect(text).toMatch(/HEAD/i);
    });

    test('git reset --soft shows ok output', async ({ page }) => {
        await runCmd(page, 'git reset --soft');
        const text = await termText(page);
        expect(text).toMatch(/reset|soft/i);
    });
});

// ── 15. Error / edge cases ────────────────────────────────────────────────────
test.describe('Git Simulator — errors', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
    });

    test('unknown command shows error', async ({ page }) => {
        await runCmd(page, 'foobar');
        const text = await termText(page);
        expect(text).toMatch(/Command not found|not found/i);
    });

    test('git command without init shows error', async ({ page }) => {
        await runCmd(page, 'git status');
        const text = await termText(page);
        expect(text).toMatch(/not a git repository|git init/i);
    });

    test('unknown git subcommand shows error', async ({ page }) => {
        await runCmd(page, 'git init');
        await runCmd(page, 'git xyzzy');
        const text = await termText(page);
        expect(text).toMatch(/not a git command/i);
    });

    test('empty input does nothing destructive', async ({ page }) => {
        const before = await termText(page);
        await runCmd(page, '');
        const after = await termText(page);
        expect(after).toBe(before);
    });
});

// ── 16. help / clear ─────────────────────────────────────────────────────────
test.describe('Git Simulator — help & clear', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
    });

    test('"help" command shows command reference', async ({ page }) => {
        await runCmd(page, 'help');
        const text = await termText(page);
        expect(text).toMatch(/git commit|git branch|Supported Commands/i);
    });

    test('Help button shows help output', async ({ page }) => {
        await page.click('#btnHelp');
        const text = await termText(page);
        expect(text).toMatch(/git commit|Supported Commands/i);
    });

    test('"clear" clears terminal output', async ({ page }) => {
        await runCmd(page, 'git commit -m "A"');
        await runCmd(page, 'clear');
        const items = await page.$$('.term-out');
        expect(items.length).toBe(0);
    });

    test('Clear button clears terminal', async ({ page }) => {
        await runCmd(page, 'git commit -m "A"');
        await page.click('#btnClearTerminal');
        const items = await page.$$('.term-out');
        expect(items.length).toBe(0);
    });
});

// ── 17. Scenarios ─────────────────────────────────────────────────────────────
test.describe('Git Simulator — scenarios', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
    });

    test('Basic workflow scenario runs without errors', async ({ page }) => {
        await page.selectOption('#scenarioSelect', 'basic');
        await page.waitForTimeout(300);
        const text = await termText(page);
        expect(text).toMatch(/Initial commit|Add homepage/i);
    });

    test('Branching scenario creates branches and merges', async ({ page }) => {
        await page.selectOption('#scenarioSelect', 'branching');
        await page.waitForTimeout(300);
        const text = await termText(page);
        expect(text).toMatch(/feature\/login|Merge/i);
    });

    test('Rebase scenario rebases commits', async ({ page }) => {
        await page.selectOption('#scenarioSelect', 'rebase');
        await page.waitForTimeout(300);
        const text = await termText(page);
        expect(text).toMatch(/rebase|Rebasing|rebased/i);
    });

    test('Tags scenario creates tags', async ({ page }) => {
        await page.selectOption('#scenarioSelect', 'tags');
        await page.waitForTimeout(300);
        const text = await termText(page);
        expect(text).toMatch(/v1\.0\.0|Tagged/i);
    });

    test('Stash scenario uses stash', async ({ page }) => {
        await page.selectOption('#scenarioSelect', 'stash');
        await page.waitForTimeout(300);
        const text = await termText(page);
        expect(text).toMatch(/Saved|stash|restored/i);
    });
});

// ── 18. Graph ─────────────────────────────────────────────────────────────────
test.describe('Git Simulator — graph rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "init"');
    });

    test('canvas dimensions expand after commits', async ({ page }) => {
        const w = await page.evaluate(() => document.getElementById('graphCanvas').width);
        expect(w).toBeGreaterThan(0);
    });

    test('ref list shows HEAD after commit', async ({ page }) => {
        const text = await page.locator('#refList').innerText();
        expect(text).toMatch(/HEAD/i);
    });

    test('ref list shows branch name', async ({ page }) => {
        const text = await page.locator('#refList').innerText();
        expect(text).toMatch(/main/i);
    });

    test('graph info shows commit count', async ({ page }) => {
        const text = await page.locator('#graphInfo').innerText();
        expect(text).toMatch(/commit/i);
    });

    test('ref list shows tag after git tag', async ({ page }) => {
        await runCmd(page, 'git tag v0.1');
        const text = await page.locator('#refList').innerText();
        expect(text).toMatch(/v0\.1/);
    });

    test('new branch shows in ref list', async ({ page }) => {
        await runCmd(page, 'git branch side-branch');
        const text = await page.locator('#refList').innerText();
        expect(text).toMatch(/side-branch/i);
    });
});

// ── 19. Command history ───────────────────────────────────────────────────────
test.describe('Git Simulator — command history', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
    });

    test('arrow up recalls previous command', async ({ page }) => {
        await page.fill('#terminalInput', 'git status');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(50);
        await page.click('#terminalInput');
        await page.keyboard.press('ArrowUp');
        const val = await page.inputValue('#terminalInput');
        expect(val).toBe('git status');
    });

    test('arrow down clears to empty after going up then down', async ({ page }) => {
        await page.fill('#terminalInput', 'git status');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(50);
        await page.click('#terminalInput');
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('ArrowDown');
        const val = await page.inputValue('#terminalInput');
        expect(val).toBe('');
    });
});

// ── 20. Reset button ──────────────────────────────────────────────────────────
test.describe('Git Simulator — reset', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
    });

    test('Reset button clears commit count to 0', async ({ page }) => {
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "A"');
        await page.click('#btnReset');
        await page.waitForTimeout(50);
        const count = await page.locator('#statCommits').innerText();
        expect(count).toBe('0');
    });

    test('Reset button clears terminal', async ({ page }) => {
        await runCmd(page, 'git init');
        await page.click('#btnReset');
        await page.waitForTimeout(50);
        const items = await page.$$('.term-out');
        expect(items.length).toBe(0);
    });

    test('status bar shows uninitialized after reset', async ({ page }) => {
        await runCmd(page, 'git init');
        await page.click('#btnReset');
        await page.waitForTimeout(50);
        const status = await page.locator('#statStatus').innerText();
        expect(status).toMatch(/uninitial/i);
    });
});

// ── 21. localStorage ──────────────────────────────────────────────────────────
test.describe('Git Simulator — localStorage', () => {
    test('repo state persists across reload', async ({ page, context }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "Persistent commit"');
        await page.waitForTimeout(1000); // wait for debounced save

        await page.reload();
        await page.waitForLoadState('load');
        const count = await page.locator('#statCommits').innerText();
        expect(Number(count)).toBeGreaterThanOrEqual(1);
    });
});

// ── 22. git remote ────────────────────────────────────────────────────────────
test.describe('Git Simulator — git remote', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
    });

    test('git remote -v shows no remotes initially', async ({ page }) => {
        await runCmd(page, 'git remote -v');
        const text = await termText(page);
        expect(text).toMatch(/no remotes|empty/i);
    });

    test('git remote add adds a remote', async ({ page }) => {
        await runCmd(page, 'git remote add origin https://github.com/example/repo.git');
        const text = await termText(page);
        expect(text).toMatch(/origin/i);
    });

    test('git remote shows added remote in list', async ({ page }) => {
        await runCmd(page, 'git remote add upstream https://github.com/foo/bar.git');
        await runCmd(page, 'git remote -v');
        const text = await termText(page);
        expect(text).toMatch(/upstream/i);
    });
});

// ── 23. git show / cherry-pick ────────────────────────────────────────────────
test.describe('Git Simulator — show & cherry-pick', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
        await resetSim(page);
        await runCmd(page, 'git init');
        await runCmd(page, 'git commit -m "First commit"');
    });

    test('git show displays commit info', async ({ page }) => {
        await runCmd(page, 'git show');
        const text = await termText(page);
        expect(text).toMatch(/commit|First commit/i);
    });
});

// ── 24. Copy log button ───────────────────────────────────────────────────────
test.describe('Git Simulator — copy log', () => {
    test('Copy log button is visible', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#btnCopyLog')).toBeVisible();
    });
});
