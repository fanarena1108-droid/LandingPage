import { animateScrollTo } from './scrollAnimation';

export function navigate(id: string, focusEmail = false) {
  const target = document.getElementById(id);
  if (!target) return;
  window.dispatchEvent(new Event('fanarena:navigate'));
  const focusTarget = focusEmail
    ? document.getElementById('waitlist-email')
    : target.querySelector<HTMLElement>('h1, h2');
  if (matchMedia('(max-width: 767px)').matches) {
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
    if (!focusEmail) focusTarget?.focus({ preventScroll: true });
    return;
  }
  animateScrollTo(target.getBoundingClientRect().top + scrollY, () => {
    focusTarget?.focus({ preventScroll: true });
  });
}
