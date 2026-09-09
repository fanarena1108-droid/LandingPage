import sharp from 'sharp';
import { readdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/assets/', import.meta.url);
for (const name of await readdir(root)) {
  if (name.endsWith('-full.png')) {
    await rename(
      new URL(name, root),
      new URL(name.replace('-full.png', '@2x.png'), root),
    );
  }
}
for (const name of await readdir(root)) {
  if (!name.startsWith('phone-') || !name.endsWith('@2x.png')) continue;
  const input = fileURLToPath(new URL(name, root));
  const metadata = await sharp(input).metadata();
  if (metadata.width !== 820 && metadata.width !== 570)
    throw new Error('Phone export is not full bounds: ' + name);
  const stem = name.replace('@2x.png', '');
  await sharp(input)
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(fileURLToPath(new URL(stem + '@2x.webp', root)));
  await sharp(input)
    .resize({ width: Math.round(metadata.width / 2) })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(fileURLToPath(new URL(stem + '.webp', root)));
}
const hero = fileURLToPath(new URL('hero-source.png', root));
// Source is the approved EXPORT photo fill; apply the frame's controlled cover crop.
for (const width of [728, 1456]) {
  const stem = 'hero-el-clasico-crowd' + (width === 1456 ? '@2x' : '');
  for (const format of ['webp', 'avif', 'jpg']) {
    await sharp(hero)
      .resize(width, Math.round((width * 705) / 728), { fit: 'cover' })
      .toFormat(format, { quality: format === 'jpg' ? 88 : 82 })
      .toFile(fileURLToPath(new URL(stem + '.' + format, root)));
  }
}
console.log('Optimized approved phone exports and hero photo.');
