import { useMobile } from '../useMobile';
export function Brand({ footer = false }: { footer?: boolean }) {
  const mobile = useMobile();
  return (
    <a
      className={`brand ${footer ? 'brand-footer' : ''}`}
      href="#home"
      data-scroll="home"
      aria-label="FanArena home"
    >
      <img
        src={
          mobile
            ? '/assets/mobile-logo@2x.png'
            : `/assets/logo-fanarena${footer ? '-footer' : ''}.svg`
        }
        width={footer ? 40 : 56}
        height={footer ? 40 : 56}
        alt=""
      />
      <span>FanArena</span>
    </a>
  );
}
