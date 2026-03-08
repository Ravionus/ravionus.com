const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  // Starts the dev server automatically before tests.
  // reuseExistingServer: true means if port 3000 is already running (e.g. locally), it uses it.
  webServer: {
    command: process.platform === 'win32'
      ? 'python -m http.server 3000'
      : 'python3 -m http.server 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    cwd: path.join(__dirname, '..'),
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
});
