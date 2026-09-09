import { useEffect } from 'react';
import { useMobile } from './useMobile';
export function useMobileSnap() {
  const mobile = useMobile();
  useEffect(() => {
    if (!mobile) return;
    const sections = [...document.querySelectorAll<HTMLElement>('.section')];
    const update = () => {
      document.documentElement.classList.toggle(
        'mobile-snap-fits',
        sections.every(
          (s) => s.offsetHeight <= (visualViewport?.height ?? innerHeight) + 1,
        ),
      );
    };
    const observer = new ResizeObserver(update);
    sections.forEach((s) => observer.observe(s));
    visualViewport?.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      visualViewport?.removeEventListener('resize', update);
      document.documentElement.classList.remove('mobile-snap-fits');
    };
  }, [mobile]);
}
