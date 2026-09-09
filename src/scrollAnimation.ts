export const SCROLL_DURATION_MS = 700;
let frame = 0;
let generation = 0;

export function cancelScrollAnimation() {
  generation++;
  cancelAnimationFrame(frame);
}

/** Explicit animated scrolling requested by the user, independent of OS smooth-scroll settings. */
export function animateScrollTo(top: number, onComplete?: () => void) {
  cancelScrollAnimation();
  const current = generation;
  const start = window.scrollY;
  const target = Math.max(
    0,
    Math.min(top, document.documentElement.scrollHeight - innerHeight),
  );
  const distance = target - start;
  if (Math.abs(distance) < 1) {
    onComplete?.();
    return;
  }
  const started = performance.now();
  const step = (now: number) => {
    if (current !== generation) return;
    const progress = Math.min(1, (now - started) / SCROLL_DURATION_MS);
    const eased =
      progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    // Each frame positions the native document; CSS smooth scrolling must not
    // restart another browser animation for every frame.
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    if (progress < 1) frame = requestAnimationFrame(step);
    else onComplete?.();
  };
  frame = requestAnimationFrame(step);
}
