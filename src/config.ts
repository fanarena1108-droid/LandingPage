/** Public configuration only. Never put secrets in VITE_* variables. */
export const config = {
  waitlistEndpoint: import.meta.env.VITE_WAITLIST_ENDPOINT || '',
  counterEndpoint: import.meta.env.VITE_COUNTER_ENDPOINT || '',
  supportEndpoint: import.meta.env.VITE_SUPPORT_ENDPOINT || '',
  instagramUrl:
    import.meta.env.VITE_INSTAGRAM_URL ||
    'https://www.instagram.com/fan.arena.2026/?hl=en',
  privacyUrl: import.meta.env.VITE_PRIVACY_URL || '',
  termsUrl: import.meta.env.VITE_TERMS_URL || '',
  communityUrl: import.meta.env.VITE_COMMUNITY_URL || '',
  // Supply approved analytics names and an analytics adapter before enabling.
  analyticsEvents: { waitlistSuccess: '', supportSuccess: '' },
  sectionHashes: false,
};

export function externalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
