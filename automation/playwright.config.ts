import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory where tests are located
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if test.only is accidentally left in source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI, zero locally
  retries: process.env.CI ? 1 : 0,

  // Single worker for ordered flow tests to avoid cart state conflicts
  workers: 1,

  // Reporter: 'html' for detailed report, 'list' for console output
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    // Base URL for all page.goto() calls
    baseURL: 'http://localhost:3000',

    headless: false,
    // Collect traces on first retry for debugging failures
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Default timeout for actions (click, fill, etc.)
    actionTimeout: 15_000,

    // Viewport
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global timeout per test (3 minutes for the full COD flow)
  timeout: 180_000,

  // Timeout for each assertion
  expect: {
    timeout: 10_000,
  },
});
