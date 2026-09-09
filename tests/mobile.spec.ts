import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  await page.route('**/test-api/count', (r) =>
    r.fulfill({ json: { total: 1284 } }),
  );
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});
for (const [width, height] of [
  [393, 852],
  [320, 568],
  [360, 800],
  [430, 932],
  [740, 360],
  [800, 900],
]) {
  test(`responsive content and accessibility ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    for (const section of await page.locator('main > section').all()) {
      await section.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      if (width < 768)
        expect(
          await section.evaluate(
            (el) => el.scrollHeight <= el.clientHeight + 1,
          ),
        ).toBe(true);
    }
    if (width < 768) {
      await expect(page.locator('.section-rail')).toBeHidden();
      const expected = await page
        .locator('.section')
        .evaluateAll((els) =>
          els.every(
            (el) => el.getBoundingClientRect().height <= innerHeight + 1,
          ),
        );
      await expect
        .poll(() =>
          page
            .locator('html')
            .evaluate((el) => getComputedStyle(el).scrollSnapType),
        )
        .toBe(expected ? 'y mandatory' : 'y');
      expect(
        await page
          .locator('.phone-art img')
          .evaluateAll((imgs) =>
            imgs.every((img) =>
              (img as HTMLImageElement).currentSrc.includes('mobile-'),
            ),
          ),
      ).toBe(true);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
test('native forward/backward scroll and reduced-motion anchors', async ({
  page,
}) => {
  await expect(page.locator('html')).toHaveClass(/mobile-snap-fits/);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(852);
  await page.mouse.wheel(0, -700);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.locator('.scroll-hint').click();
  await expect(page.locator('#matchday-title')).toBeFocused();
  await page.locator('.hero-cta').evaluate((el: HTMLElement) => el.click());
  await expect
    .poll(() =>
      page
        .locator('#waitlist')
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(0);
});
test('contact validates, retains draft, traps focus, closes all ways and retries', async ({
  page,
}) => {
  await page.locator('.contact-trigger').click();
  const dialog = page.getByRole('dialog');
  await expect(page.locator('.sheet-close')).toBeFocused();
  expect(
    await page.locator('#root').evaluate((el) => (el as HTMLElement).inert),
  ).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', { name: 'SEND MESSAGE' }),
  ).toBeFocused();
  await dialog.getByRole('button', { name: 'SEND MESSAGE' }).click();
  await expect(page.locator('#contact-name')).toBeFocused();
  await expect(dialog.locator('.field-error')).toHaveCount(4);
  await page.locator('#contact-name').fill(' Shreya ');
  await page.locator('#contact-email').fill('fan@example.com');
  await page.locator('#contact-topic').selectOption('Feedback');
  await page.locator('#contact-message').fill(' A mobile message ');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.contact-trigger')).toBeFocused();
  await page.locator('.contact-trigger').click();
  await expect(page.locator('#contact-message')).toHaveValue(
    ' A mobile message ',
  );
  await page.goBack();
  await expect(dialog).toHaveCount(0);
  await page.locator('.contact-trigger').click();
  await page.mouse.click(10, 10);
  await expect(dialog).toHaveCount(0);
  await page.locator('.contact-trigger').click();
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/test-api/support', async (r) => {
    requests++;
    expect(r.request().postDataJSON()).toEqual({
      name: 'Shreya',
      email: 'fan@example.com',
      topic: 'Feedback',
      message: 'A mobile message',
    });
    await gate;
    await r.fulfill({ status: 503 });
  });
  await dialog.getByRole('button', { name: 'SEND MESSAGE' }).click();
  await expect(dialog.getByRole('button', { name: 'SENDING' })).toBeDisabled();
  await dialog.locator('form').evaluate((el) => {
    el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(requests).toBe(1);
  release();
  await expect(dialog.getByRole('status')).toHaveText(
    'Couldn’t send. Your message is saved here. Try again.',
  );
  await expect(page.locator('#contact-message')).toHaveValue(
    ' A mobile message ',
  );
  await page.unroute('**/test-api/support');
  await page.route('**/test-api/support', (r) => r.fulfill({ status: 204 }));
  await dialog.getByRole('button', { name: 'TRY AGAIN' }).click();
  await expect(dialog.getByRole('heading')).toHaveText('You’re all set.');
  await expect(dialog.getByRole('status')).toHaveText(
    'Message sent. Thanks for getting in touch.',
  );
  await dialog.getByRole('button', { name: 'DONE' }).click();
  await expect(page.locator('.contact-trigger')).toBeFocused();
});
test('short viewport contact remains scrollable and accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.locator('.contact-trigger').click();
  await page.setViewportSize({ width: 320, height: 320 });
  const dialog = page.getByRole('dialog');
  expect(
    await dialog.evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(320);
  await page.locator('#contact-message').focus();
  await page.locator('#contact-message').fill('Keyboard viewport test');
  await dialog
    .getByRole('button', { name: 'SEND MESSAGE' })
    .scrollIntoViewIfNeeded();
  await expect(
    dialog.getByRole('button', { name: 'SEND MESSAGE' }),
  ).toBeInViewport();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('mobile waitlist uses real states and hides unavailable count', async ({
  page,
}) => {
  await page.unroute('**/test-api/count');
  await page.route('**/test-api/count', (r) => r.fulfill({ status: 503 }));
  await page.reload();
  await expect(page.locator('.waitlist-counter')).toBeHidden();
  const form = page.getByRole('form', { name: 'Join the waitlist' });
  await form.getByRole('button').click();
  await expect(page.locator('#waitlist-email')).toBeFocused();
  await page.locator('#waitlist-email').fill('fan@example.com');
  for (const [code, text] of [
    [503, 'Couldn’t join. Please try again.'],
    [409, 'You’re already on the list.'],
    [201, 'You’re on the list.'],
  ] as const) {
    await page.route('**/test-api/waitlist', (r) =>
      r.fulfill({ status: code }),
    );
    await form.getByRole('button').click();
    await expect(form.getByRole('status')).toHaveText(text);
    await expect(page.locator('#waitlist-email')).toHaveValue(
      'fan@example.com',
    );
    await page.unroute('**/test-api/waitlist');
  }
});
test('enlarged text grows sections and relaxes snapping', async ({ page }) => {
  await page.evaluate(() => {
    document
      .querySelectorAll(
        'h1,h2,p,a,button,input,label,select,textarea,strong,dt,dd,.league-chip',
      )
      .forEach((el) => {
        const style = getComputedStyle(el);
        const html = el as HTMLElement;
        html.style.fontSize = parseFloat(style.fontSize) * 2 + 'px';
        html.style.lineHeight = '1.4';
      });
  });
  await expect(page.locator('html')).not.toHaveClass(/mobile-snap-fits/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(393);
  for (const section of await page.locator('main > section').all())
    expect(
      await section.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
});
