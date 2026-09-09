import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 393, height: 852 },
  reducedMotion: 'reduce',
});
await page.goto('http://127.0.0.1:4174');
await page.evaluate(() => document.fonts.ready);
await mkdir('design/reference/mobile-current', { recursive: true });
for (const [i, id] of [
  'home',
  'matchday',
  'fan-talk',
  'challenges',
  'competitions',
  'support',
  'waitlist',
].entries()) {
  await page
    .locator('#' + id)
    .evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(100);
  await page.screenshot({
    path: `design/reference/mobile-current/M0${i + 1}.png`,
  });
  console.log(
    await page.locator('#' + id).evaluate((el) => ({
      id: el.id,
      height: el.offsetHeight,
      phone: el.querySelector('.phone-art')?.getBoundingClientRect().toJSON(),
      overflow: document.documentElement.scrollWidth > innerWidth,
    })),
  );
}
await page.locator('.contact-trigger').click();
await page.screenshot({ path: 'design/reference/mobile-current/contact.png' });
await browser.close();
