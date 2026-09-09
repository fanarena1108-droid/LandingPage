import { useEffect, useState } from 'react';
import { sections } from '../content';
import { navigate } from '../navigation';

export function Navigation() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = innerHeight / 2;
        const found = sections.findIndex(({ id }) => {
          const r = document.getElementById(id)!.getBoundingClientRect();
          return r.top <= center && r.bottom > center;
        });
        if (found >= 0) setActive(found);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return (
    <nav className="section-rail" aria-label="Section navigation">
      <button
        disabled={active === 0}
        aria-label={
          active
            ? `Previous section: ${sections[active - 1].label}`
            : 'Previous section'
        }
        onClick={() => navigate(sections[active - 1].id)}
      >
        <span className="chevron up" aria-hidden="true" />
      </button>
      <button
        disabled={active === sections.length - 1}
        aria-label={
          active < 6
            ? `Next section: ${sections[active + 1].label}`
            : 'Next section'
        }
        onClick={() => navigate(sections[active + 1].id)}
      >
        <span className="chevron" aria-hidden="true" />
      </button>
    </nav>
  );
}
