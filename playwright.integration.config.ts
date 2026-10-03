import { defineConfig, devices } from '@playwright/test';

const api = 'http://127.0.0.1:3101';
const testControl = 'http://127.0.0.1:3102';

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../Backend run start:website-test-server',
      url: `${testControl}/__test/ready`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        TEST_DATABASE_URL:
          'postgresql://fanarena:fanarena_test_only@127.0.0.1:15433/fanarena_test',
        TEST_REDIS_URL: 'redis://127.0.0.1:16380',
        WEBSITE_TEST_PORT: '3101',
        WEBSITE_TEST_CONTROL_PORT: '3102',
      },
    },
    {
      command: 'npm run dev -- --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      env: {
        VITE_WAITLIST_ENDPOINT: `${api}/waitlist`,
        VITE_COUNTER_ENDPOINT: `${api}/waitlist/count`,
        VITE_SUPPORT_ENDPOINT: `${api}/contact`,
        VITE_INSTAGRAM_URL: 'https://www.instagram.com/example/',
      },
    },
  ],
});
