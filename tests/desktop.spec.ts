import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

async function open(page: Page) {
  await page.route('**/test-api/count', (r) =>
    r.fulfill({ json: { total: 1284 } }),
  );
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}
test('all seven desktop sections, real counter, complete images and no browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      errors.push(msg.text());
  });
  await open(page);
  await expect(page.locator('main > section')).toHaveCount(7);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h2')).toHaveCount(6);
  await expect(page.locator('.waitlist-counter')).toContainText('1,284');
  await page.locator('#waitlist').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});
test('navigation follows every adjacent section, preserves history, disables endpoints', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const rail = page.getByRole('navigation', { name: 'Section navigation' });
  await expect(rail.getByRole('button').first()).toBeDisabled();
  const ids = [
    'matchday',
    'fan-talk',
    'challenges',
    'competitions',
    'support',
    'waitlist',
  ];
  for (const id of ids) {
    await rail.getByRole('button').last().click();
    await expect
      .poll(() =>
        page
          .locator('#' + id)
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(2);
  }
  await expect(rail.getByRole('button').last()).toBeDisabled();
  for (const id of [
    'support',
    'competitions',
    'challenges',
    'fan-talk',
    'matchday',
    'home',
  ]) {
    await rail.getByRole('button').first().click();
    await expect
      .poll(() =>
        page
          .locator('#' + id)
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(2);
  }
  expect(new URL(page.url()).hash).toBe('');
  await page.getByRole('link', { name: 'GET EARLY ACCESS' }).click();
  await expect(page.locator('#waitlist-email')).toBeFocused();
});
test('waitlist validation, pending lock, duplicate, recoverable error and success', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const form = page.getByRole('form', { name: 'Join the waitlist' });
  await page.locator('#waitlist').scrollIntoViewIfNeeded();
  await form.getByRole('button').click();
  await expect(form.getByText('Enter a valid email address.')).toBeVisible();
  await form.getByRole('textbox').fill('fan@example.com');
  let calls = 0;
  await page.route('**/test-api/waitlist', async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 200));
    const status = calls === 1 ? 503 : calls === 2 ? 409 : 201;
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        status === 409
          ? { error: { code: 'WAITLIST_ALREADY_REGISTERED' } }
          : status === 201
            ? { status: 'accepted' }
            : { error: { code: 'TEMPORARILY_UNAVAILABLE' } },
      ),
    });
  });
  await form.getByRole('button').click();
  await expect(form.getByRole('button')).toBeDisabled();
  await expect(form.getByRole('status')).toContainText('couldn’t send');
  await expect(form.getByRole('textbox')).toHaveValue('fan@example.com');
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('already on');
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('You’re on the list');
  expect(calls).toBe(3);
  await expect(form.getByRole('status')).toBeFocused();
});
test('support keyboard validation preserves values on failure and focuses success', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.locator('#support').scrollIntoViewIfNeeded();
  const form = page.getByRole('form', { name: 'Contact FanArena' });
  await form.getByRole('button').click();
  await expect(form.getByLabel('Email address')).toBeFocused();
  await form
    .getByLabel('Email address')
    .pressSequentially('support@example.com');
  await page.keyboard.press('Tab');
  await expect(form.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Message', { exact: true })).toBeFocused();
  await page.keyboard.type('Please help me with my match notification.');
  let fail = true;
  const requests: { key: string | undefined; body: unknown }[] = [];
  await page.route('**/test-api/support', (route) => {
    requests.push({
      key: route.request().headers()['idempotency-key'],
      body: route.request().postDataJSON(),
    });
    return route.fulfill({ status: fail ? 503 : 202, body: '' });
  });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(form.getByRole('status')).toContainText('couldn’t send');
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue(
    'Please help me with my match notification.',
  );
  fail = false;
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('Message sent');
  await expect(form.getByRole('status')).toBeFocused();
  expect(requests).toHaveLength(2);
  expect(requests[0]?.key).toBeTruthy();
  expect(requests[1]?.key).toBe(requests[0]?.key);
  expect(requests[0]?.body).toEqual({
    email: 'support@example.com',
    category: 'Feedback',
    message: 'Please help me with my match notification.',
  });
  await form.getByLabel('Message', { exact: true }).fill('A changed message.');
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('Message sent');
  expect(requests).toHaveLength(3);
  expect(requests[2]?.key).not.toBe(requests[1]?.key);
});
test('contact conflicts stay distinct from waitlist duplicates and rate limits are safe', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.locator('#support').scrollIntoViewIfNeeded();
  const form = page.getByRole('form', { name: 'Contact FanArena' });
  await form.getByLabel('Email address').fill('support@example.com');
  await form.getByRole('combobox').selectOption('Feedback');
  await form.getByLabel('Message', { exact: true }).fill('Please help me.');
  await page.route('**/test-api/support', (route) =>
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'IDEMPOTENCY_PAYLOAD_MISMATCH' } }),
    }),
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('couldn’t send');
  await expect(form.getByRole('status')).not.toContainText(
    'already on the waitlist',
  );
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue(
    'Please help me.',
  );

  await page.unroute('**/test-api/support');
  await page.route('**/test-api/support', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 'RATE_LIMITED',
          retry_after_seconds: 2,
          message: 'Please wait before trying again.',
        },
      }),
    }),
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText(
    'Too many attempts. Please try again in 2 seconds.',
  );
  await page.unroute('**/test-api/support');
  await page.route('**/test-api/support', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'VALIDATION_ERROR' } }),
    }),
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText(
    'Please check your details and try again.',
  );
  await expect(form.getByLabel('Message', { exact: true })).toHaveValue(
    'Please help me.',
  );
});
test('reduced motion and store semantics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(
    await page
      .locator('html')
      .evaluate((e) => getComputedStyle(e).scrollBehavior),
  ).toBe('auto');
  expect(
    await page
      .locator('.live-dot')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  expect(
    await page
      .locator('.reveal')
      .first()
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe('none');
  await expect(page.locator('.platforms a')).toHaveCount(1);
  await expect(page.locator('.platforms a')).toHaveAttribute(
    'target',
    '_blank',
  );
  await expect(
    page.locator('.platform').filter({ hasText: 'Google Play' }),
  ).not.toHaveRole('link');
});
for (const width of [1024, 1280, 1440, 1920, 720]) {
  test('layout and accessibility at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    for (const [i, id] of [
      'home',
      'matchday',
      'fan-talk',
      'challenges',
      'competitions',
      'support',
      'waitlist',
    ].entries()) {
      await page.locator('#' + id).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width === 1440)
        await page.screenshot({ path: `test-results/desktop-D0${i + 1}.png` });
    }
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
