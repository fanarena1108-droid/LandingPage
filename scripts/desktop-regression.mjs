import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await page.goto('http://127.0.0.1:4174');
await page.evaluate(() => document.fonts.ready);
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
  const old = await sharp(
    await readFile(`design/reference/current/1440-D0${i + 1}.png`),
  )
    .raw()
    .toBuffer();
  const current = await sharp(await page.screenshot())
    .raw()
    .toBuffer();
  let changed = 0;
  for (let j = 0; j < old.length; j++) if (old[j] !== current[j]) changed++;
  console.log(
    id,
    `${((changed / old.length) * 100).toFixed(3)}% changed channels`,
  );
}
await browser.close();
