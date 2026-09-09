import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 30000, retries: 0, workers: 2,
  reporter: [['list']],
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:8934', headless: true, trace: 'retain-on-failure' },
  projects: [{name:'chromium',testIgnore:'**/safari.spec.js',use:{channel:'chrome'}},{name:'webkit',testMatch:'**/safari.spec.js',use:{browserName:'webkit'}}],
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:8934', reuseExistingServer: true },
});
