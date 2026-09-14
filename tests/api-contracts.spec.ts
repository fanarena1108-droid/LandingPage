import { test, expect } from '@playwright/test';

test('contact handles rate/validation failures, retains its key on retry and renews after an edit', async ({
  page,
}) => {
  await page.route('**/test-api/count', (route) =>
    route.fulfill({ json: { total: 0 } }),
  );
  await page.goto('/');
  await page.locator('#support').scrollIntoViewIfNeeded();
  const form = page.getByRole('form', {
    name: 'Contact FanArena',
    exact: true,
  });
  const keys: string[] = [];
  await page.route('**/test-api/support', (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBeUndefined();
    keys.push(request.headers()['idempotency-key']);
    return route.fulfill({
      status: keys.length === 1 ? 429 : keys.length === 2 ? 400 : 202,
      headers: { 'Retry-After': '30' },
      json: { error: { message: 'DO NOT DISPLAY SERVER CONTENT' } },
    });
  });
  await form.getByLabel('Email address').fill('fan@example.com');
  await form.getByLabel('Message', { exact: true }).fill('Test contact');
  await expect(form.getByLabel('Message', { exact: true })).toHaveAttribute(
    'maxlength',
    '5000',
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('30 seconds');
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('check your details');
  expect(keys[1]).toBe(keys[0]);
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue(
    'Test contact',
  );
  await form.getByLabel('Message', { exact: true }).fill('Edited contact');
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('Message received');
  expect(keys[2]).not.toBe(keys[1]);
});
