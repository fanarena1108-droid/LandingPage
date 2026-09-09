import { useSyncExternalStore } from 'react';
const query = window.matchMedia('(max-width: 767px)');
const subscribe = (notify: () => void) => {
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
export function useMobile() {
  return useSyncExternalStore(subscribe, () => query.matches);
}
