import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/test-api/count', (route) =>
    route.fulfill({ json: { total: 1284 } }),
  );
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/elastic-scroll/);
  await page.mouse.move(650, 400);
});

test('section transitions visibly animate even when OS smooth scrolling is disabled', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const sample = () =>
    page.evaluate(async () => {
      const positions: number[] = [];
      const started = performance.now();
      return await new Promise<number[]>((resolve) => {
        const tick = () => {
          positions.push(scrollY);
          if (performance.now() - started < 1000) requestAnimationFrame(tick);
          else resolve(positions);
        };
        requestAnimationFrame(tick);
        const buttons = document.querySelectorAll<HTMLButtonElement>(
          '.section-rail button',
        );
        buttons[scrollY < 450 ? 1 : 0].click();
      });
    });
  const down = await sample();
  expect(new Set(down.filter((y) => y > 20 && y < 880)).size).toBeGreaterThan(
    8,
  );
  expect(down.at(-1)).toBe(900);
  const up = await sample();
  expect(new Set(up.filter((y) => y > 20 && y < 880)).size).toBeGreaterThan(8);
  expect(up.at(-1)).toBe(0);
});

test('25% threshold settles back below it and advances in both directions above it', async ({
  page,
}) => {
  await page.mouse.wheel(0, 224);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.mouse.wheel(0, 226);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(900);
  await page.mouse.wheel(0, -224);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(900);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(900);
  await page.mouse.wheel(0, -226);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('a gesture uses net displacement and waits for continued input', async ({
  page,
}) => {
  // Keep the gesture cadence in the browser rather than between test-runner
  // round trips, which can exceed the idle window on a busy machine.
  await page.evaluate(async () => {
    for (const delta of [180, 100, -100]) {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: delta }));
      window.scrollBy({ top: delta, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('explicit navigation cancels a pending rebound', async ({ page }) => {
  await page.mouse.wheel(0, 100);
  await page.getByRole('link', { name: 'GET EARLY ACCESS' }).click();
  await expect(page.locator('#waitlist-email')).toBeFocused();
  await expect
    .poll(() =>
      page
        .locator('#waitlist')
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(0);
});

test('tall sections allow reading before the edge threshold applies', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: 'Live Matchday', exact: true }).click();
  await expect(page.locator('#matchday-title')).toBeFocused();
  const top = await page.evaluate(() => scrollY);
  await page.mouse.move(650, 400);
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => scrollY)).toBe(top + 150);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(top + 300);
  await page.mouse.wheel(0, 151);
  await expect
    .poll(() =>
      page
        .locator('#fan-talk')
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(0);
});

test('narrow fallback retains free scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await expect(page.locator('html')).not.toHaveClass(/elastic-scroll/);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(100);
});
