import { useEffect } from 'react';
import { sections } from './content';
import { animateScrollTo, cancelScrollAnimation } from './scrollAnimation';

export const SCROLL_THRESHOLD = 0.25;
const GESTURE_IDLE_MS = 180;

/** Native movement during the gesture; settle only after input/momentum stops. */
export function useElasticScroll() {
  useEffect(() => {
    const desktop = matchMedia('(min-width: 1024px)');
    let origin: number | null = null;
    let timer = 0;
    let held = false;
    const nodes = () => sections.map(({ id }) => document.getElementById(id)!);
    const bounds = (node: HTMLElement) => {
      const top = node.getBoundingClientRect().top + scrollY;
      return {
        top,
        bottom: top + Math.max(0, node.offsetHeight - innerHeight),
      };
    };
    const cancel = () => {
      clearTimeout(timer);
      origin = null;
      held = false;
      cancelScrollAnimation();
    };
    const settle = () => {
      if (origin === null || held || !desktop.matches) return;
      const list = nodes();
      const index = origin;
      const { top, bottom } = bounds(list[index]);
      const position = scrollY;
      const threshold = innerHeight * SCROLL_THRESHOLD;
      let target = position;
      if (position > bottom) {
        target =
          position - bottom >= threshold && index < list.length - 1
            ? bounds(list[index + 1]).top
            : bottom;
      } else if (position < top) {
        target =
          top - position >= threshold && index > 0
            ? bounds(list[index - 1]).bottom
            : top;
      }
      origin = null;
      if (Math.abs(target - position) < 1) return;
      animateScrollTo(target);
    };
    const schedule = () => {
      clearTimeout(timer);
      if (origin !== null && !held)
        timer = window.setTimeout(settle, GESTURE_IDLE_MS);
    };
    const nestedControl = (target: EventTarget | null) => {
      let element = target instanceof Element ? target : null;
      while (element && element !== document.body) {
        if (
          element.matches('input, textarea, select, [contenteditable="true"]')
        )
          return true;
        const style = getComputedStyle(element);
        if (
          /(auto|scroll)/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight
        )
          return true;
        element = element.parentElement;
      }
      return false;
    };
    const begin = () => {
      if (!desktop.matches) return;
      if (origin === null) {
        cancelScrollAnimation();
        const list = nodes();
        origin = list.findIndex((node) => {
          const rect = node.getBoundingClientRect();
          return rect.top <= innerHeight / 2 && rect.bottom > innerHeight / 2;
        });
        if (origin < 0) origin = 0;
      }
      schedule();
    };
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        nestedControl(event.target)
      )
        return;
      begin();
    };
    const key = (event: KeyboardEvent) => {
      if (nestedControl(event.target)) return;
      if (['Home', 'End', 'Tab', 'Escape'].includes(event.key)) {
        cancel();
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest('button, a') &&
        event.key === ' '
      )
        return;
      if (
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key)
      )
        begin();
    };
    const down = (event: PointerEvent) => {
      if (nestedControl(event.target)) return;
      if (
        event.pointerType === 'touch' ||
        event.clientX >= document.documentElement.clientWidth
      ) {
        begin();
        held = true;
        clearTimeout(timer);
      }
    };
    const up = () => {
      held = false;
      schedule();
    };
    const resize = () => {
      cancel();
      document.documentElement.classList.toggle(
        'elastic-scroll',
        desktop.matches,
      );
    };
    resize();
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('keydown', key);
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('resize', resize);
    window.addEventListener('fanarena:navigate', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      cancel();
      document.documentElement.classList.remove('elastic-scroll');
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('keydown', key);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', resize);
      window.removeEventListener('fanarena:navigate', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, []);
}
