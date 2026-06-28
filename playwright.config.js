const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:8000',
    browserName: 'chromium'
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:8000/healthz',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
});
