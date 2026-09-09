const phoneNames = {
  live: 'phone-mockup-live-match-pixel-9-pro',
  talk: 'phone-mockup-fan-talk-iphone-16-pro',
  challenges: 'phone-mockup-challenges-pixel-9-pro',
  competitions: 'phone-mockup-competitions-iphone-16-pro',
};
export function Phone({ variant }: { variant: keyof typeof phoneNames }) {
  const name = phoneNames[variant];
  const small = variant === 'competitions';
  return (
    <div className="phone-art" aria-hidden="true">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={`/assets/mobile-${variant}@2x.png`}
        />
        <source
          type="image/webp"
          srcSet={`/assets/${name}.webp 1x, /assets/${name}@2x.webp 2x`}
        />
        <img
          src={`/assets/${name}@2x.png`}
          alt=""
          width={small ? 570 : 820}
          height={small ? 1201 : 1728}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
}
