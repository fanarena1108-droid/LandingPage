import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testIgnore: ['tests/integration/**'],
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_WAITLIST_ENDPOINT: '/test-api/waitlist',
      VITE_SUPPORT_ENDPOINT: '/test-api/support',
      VITE_COUNTER_ENDPOINT: '/test-api/count',
      VITE_INSTAGRAM_URL: 'https://www.instagram.com/example/',
    },
  },
});
