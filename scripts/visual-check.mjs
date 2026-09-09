import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await page.goto('http://127.0.0.1:4174');
await page.evaluate(() => document.fonts.ready);
await mkdir('design/reference/current', { recursive: true });
const result = [];
for (const width of [1440, 1024, 1280, 1920]) {
  await page.setViewportSize({ width, height: 900 });
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
      .evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({
      path: `design/reference/current/${width}-D0${i + 1}.png`,
    });
    result.push(
      await page.locator('#' + id).evaluate((section) => {
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        };
        return {
          id: section.id,
          width: innerWidth,
          heading: box(section.querySelector('h1,h2')),
          description: box(section.querySelector('.description')),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      }),
    );
  }
}
// 200% desktop zoom-equivalent metrics: 1440×900 physical area → 720×450 CSS px.
await page.setViewportSize({ width: 720, height: 450 });
for (const id of [
  'home',
  'matchday',
  'fan-talk',
  'challenges',
  'competitions',
  'support',
  'waitlist',
]) {
  await page
    .locator('#' + id)
    .evaluate((el) => el.scrollIntoView({ block: 'start' }));
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error('Overflow at zoom: ' + id);
}
await page.locator('#waitlist-email').fill('fan@example.com');
await page
  .getByRole('form', { name: 'Join the waitlist' })
  .getByRole('button')
  .click();
const status = await page
  .getByRole('form', { name: 'Join the waitlist' })
  .getByRole('status')
  .textContent();
if (!status.includes('not available yet'))
  throw Error('Unconfigured form must not report success');
await page.screenshot({
  path: 'design/reference/current/zoom-equivalent-200.png',
});
await writeFile(
  'design/reference/current/layout.json',
  JSON.stringify(result, null, 2),
);
console.log(
  'Screenshots for all sections at four desktop widths; 200% zoom-equivalent reflow; unconfigured form verified.',
);
await browser.close();
