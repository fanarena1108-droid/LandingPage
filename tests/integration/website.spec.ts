import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

const api = 'http://127.0.0.1:3101';
const testControl = 'http://127.0.0.1:3102';
const safeUnavailable = {
  error: {
    code: 'TEMPORARILY_UNAVAILABLE',
    message: 'Please try again shortly.',
    request_id: 'test-request',
    retry_after_seconds: 2,
    fields: [],
  },
};

test('desktop waitlist consumes the public API count and treats only its 409 as duplicate', async ({
  page,
}) => {
  const email = `desktop-${randomUUID()}@example.com`;
  const beforeResponse = await page.request.get(`${api}/waitlist/count`);
  expect(beforeResponse.ok()).toBe(true);
  const before = (await beforeResponse.json()) as { total: number };
  expect(Number.isSafeInteger(before.total)).toBe(true);

  const bodies: unknown[] = [];
  await page.route(`${api}/waitlist`, async (route) => {
    if (route.request().method() === 'POST')
      bodies.push(route.request().postDataJSON());
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('.waitlist-counter')).toContainText(
    `${before.total.toLocaleString('en-IN')} fans already waiting`,
  );
  const form = page.getByRole('form', { name: 'Join the waitlist' });
  await form.getByRole('textbox').fill(email);
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText('You’re on the list');
  await expect(page.locator('.waitlist-counter')).toContainText(
    `${(before.total + 1).toLocaleString('en-IN')} fans already waiting`,
  );
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toContainText(
    'already on the waitlist',
  );
  expect(bodies).toEqual([{ email }, { email }]);

  const afterResponse = await page.request.get(`${api}/waitlist/count`);
  expect((await afterResponse.json()).total).toBe(before.total + 1);
});

for (const mode of ['desktop', 'mobile'] as const) {
  test(`${mode} contact retries a lost response with one backend receipt and triage job`, async ({
    page,
  }) => {
    const email = `${mode}-${randomUUID()}@example.com`;
    if (mode === 'mobile')
      await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    if (mode === 'mobile') await page.locator('.contact-trigger').click();
    else await page.locator('#support').scrollIntoViewIfNeeded();

    if (mode === 'desktop') {
      const form = page.getByRole('form', { name: 'Contact FanArena' });
      await form.getByLabel('Email address').fill(email);
      await form.getByRole('combobox').selectOption('Feedback');
      await form
        .getByLabel('Message', { exact: true })
        .fill('A desktop test message.');
    } else {
      await page.locator('#contact-name').fill('Example Fan');
      await page.locator('#contact-email').fill(email);
      await page.locator('#contact-topic').selectOption('Feedback');
      await page.locator('#contact-message').fill('A mobile test message.');
    }

    let attempts = 0;
    const requests: {
      key: string | undefined;
      body: unknown;
      responseId: string | undefined;
    }[] = [];
    await page.route(`${api}/contact`, async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      const key = route.request().headers()['idempotency-key'];
      const body = route.request().postDataJSON();
      const response = await route.fetch();
      const responseBody = (await response.json()) as {
        submission_id?: string;
      };
      requests.push({ key, body, responseId: responseBody.submission_id });
      attempts++;
      if (attempts === 1) {
        return route.fulfill({
          response,
          status: 503,
          body: JSON.stringify(safeUnavailable),
        });
      }
      await route.fulfill({ response });
    });

    const submit =
      mode === 'mobile'
        ? page.getByRole('button', { name: 'SEND MESSAGE' })
        : page
            .getByRole('form', { name: 'Contact FanArena' })
            .getByRole('button');
    const retry =
      mode === 'mobile'
        ? page.getByRole('button', { name: 'TRY AGAIN' })
        : submit;
    const status =
      mode === 'mobile'
        ? page.locator('.sheet-status')
        : page
            .getByRole('form', { name: 'Contact FanArena' })
            .getByRole('status');
    await submit.click();
    await expect(status).toContainText('We couldn’t send this right now');
    await expect(
      page.locator(mode === 'mobile' ? '#contact-message' : '#support-message'),
    ).toHaveValue(
      mode === 'mobile' ? 'A mobile test message.' : 'A desktop test message.',
    );
    await retry.click();
    await expect(status).toContainText('Message sent');

    expect(requests).toHaveLength(2);
    expect(requests[0]?.key).toBeTruthy();
    expect(requests[1]?.key).toBe(requests[0]?.key);
    expect(requests[1]?.responseId).toBe(requests[0]?.responseId);
    if (mode === 'desktop') {
      expect(requests[0]?.body).toEqual({
        email,
        category: 'Feedback',
        message: 'A desktop test message.',
      });
    } else {
      expect(requests[0]?.body).toEqual({
        name: 'Example Fan',
        email,
        topic: 'Feedback',
        message: 'A mobile test message.',
      });
    }

    const intake = await page.request.get(
      `${testControl}/__test/website-intake?email=${encodeURIComponent(email)}`,
    );
    expect(await intake.json()).toEqual({
      receipt_count: 1,
      job_count: 1,
      firebase_verifier_calls: 0,
    });
  });
}
