import { test, expect } from '@playwright/test';

test('real Backend: anonymous waitlist, lost contact receipt retry and mobile submission', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const email = `browser-${crypto.randomUUID()}@example.com`;
  await page.locator('#waitlist').scrollIntoViewIfNeeded();
  const waitlist = page.getByRole('form', { name: 'Join the waitlist' });
  await waitlist.getByRole('textbox').fill(email);
  await waitlist.getByRole('button').click();
  await expect(waitlist.getByRole('status')).toContainText(
    'You’re on the list',
  );
  await waitlist.getByRole('button').click();
  await expect(waitlist.getByRole('status')).toContainText('already on');

  await page.locator('#support').scrollIntoViewIfNeeded();
  const form = page.getByRole('form', {
    name: 'Contact FanArena',
    exact: true,
  });
  await form.getByLabel('Email address').fill(email);
  await form
    .getByLabel('Message', { exact: true })
    .fill('Please help with my match.');
  const keys: string[] = [],
    receipts: string[] = [];
  await page.route('http://127.0.0.1:3101/contact', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    expect(route.request().headers().authorization).toBeUndefined();
    keys.push(route.request().headers()['idempotency-key']);
    expect(route.request().postDataJSON()).toEqual({
      email,
      category: 'General query',
      message: 'Please help with my match.',
    });
    const response = await route.fetch();
    expect(response.status()).toBe(202);
    receipts.push((await response.json()).submission_id);
    if (receipts.length === 1)
      await route.abort('failed'); // DB committed; browser loses response.
    else await route.fulfill({ response });
  });
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('couldn’t send');
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue(
    'Please help with my match.',
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('Message received');
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
  expect(receipts[1]).toBe(receipts[0]);
  await page.unroute('http://127.0.0.1:3101/contact');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'CONTACT US' }).click();
  const mobile = page.getByRole('form', { name: 'Contact FanArena mobile' });
  await mobile.getByLabel('Name', { exact: true }).fill('Fan');
  await mobile.getByLabel('Email', { exact: true }).fill(email);
  await mobile.getByLabel('Topic').selectOption('Feedback');
  await mobile.getByLabel('Message', { exact: true }).fill('Mobile feedback');
  await mobile.getByRole('button').click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText(
    'Message received',
  );
});
