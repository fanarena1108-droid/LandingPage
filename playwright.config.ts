import { defineConfig, devices } from '@playwright/test';
const backend = process.env.FANARENA_BACKEND_PATH;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  testMatch: backend ? '**/backend-integration.spec.ts' : '**/*.spec.ts',
  testIgnore: backend ? [] : ['**/backend-integration.spec.ts'],
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -- --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI && !backend,
      env: {
        VITE_WAITLIST_ENDPOINT: backend
          ? 'http://127.0.0.1:3101/waitlist'
          : '/test-api/waitlist',
        VITE_SUPPORT_ENDPOINT: backend
          ? 'http://127.0.0.1:3101/contact'
          : '/test-api/support',
        VITE_COUNTER_ENDPOINT: backend
          ? 'http://127.0.0.1:3101/waitlist/count'
          : '/test-api/count',
        VITE_INSTAGRAM_URL: 'https://www.instagram.com/example/',
      },
    },
    ...(backend
      ? [
          {
            command: 'node dist/test/website-server.js',
            cwd: backend,
            url: 'http://127.0.0.1:3101/waitlist/count',
            reuseExistingServer: false,
          },
        ]
      : []),
  ],
});
