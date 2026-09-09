import { useCallback, useEffect, useState } from 'react';
import { Hero } from './sections/Hero';
import { Matchday } from './sections/Matchday';
import { FanTalk } from './sections/FanTalk';
import { Challenges } from './sections/Challenges';
import { Competitions } from './sections/Competitions';
import { Support } from './sections/Support';
import { Waitlist } from './sections/Waitlist';
import { Navigation } from './components/Navigation';
import { navigate } from './navigation';
import { getWaitlistTotal } from './api';
import { useElasticScroll } from './useElasticScroll';
import { useMobileSnap } from './useMobileSnap';

export default function App() {
  useElasticScroll();
  useMobileSnap();
  const [total, setTotal] = useState<number | null>(null);
  const [counterRevision, setCounterRevision] = useState(0);
  const refreshCount = useCallback(() => setCounterRevision((n) => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    getWaitlistTotal(controller.signal)
      .then(setTotal)
      .catch(() => {
        if (!controller.signal.aborted) setTotal(null);
      });
    return () => controller.abort();
  }, [counterRevision]);
  useEffect(() => {
    function follow(event: MouseEvent) {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button
      )
        return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        'a[data-scroll]',
      );
      if (!anchor) return;
      event.preventDefault();
      navigate(anchor.dataset.scroll!, anchor.dataset.scroll === 'waitlist');
    }
    document.addEventListener('click', follow);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('entrance-ready');
      observer.observe(el);
    });
    return () => {
      document.removeEventListener('click', follow);
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <main id="main">
        <Hero total={total} />
        <Matchday />
        <FanTalk />
        <Challenges />
        <Competitions />
        <Support />
        <Waitlist onJoined={refreshCount} />
      </main>
      <Navigation />
    </>
  );
}
