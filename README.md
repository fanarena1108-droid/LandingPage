# FanArena responsive website

The final mobile composition is implemented below 768px from section 611:3 and boards 712:2, 713:2, 713:10. See [mobile implementation and verification](design/MOBILE.md) for behavior, exports, checks and release dependencies. An unavailable mobile counter is hidden. Desktop and mobile forms implement the checked Backend WEB01–03 contracts.

New React + TypeScript + Vite project, built from the seven approved frames inside **Desktop Website — DEV HANDOFF** (Figma section 611:2), with developer handoff 670:2 taking precedence. No existing source, backend, deployment configuration, or integrations were present in this workspace.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

Node 22.12+ or Node 24 is recommended. The production output is `dist/` and can be served by any static HTTPS host. There is one route, `/`; no client router or server runtime is required. No deployment has been performed.

## Project map

- `src/sections/`: seven meaningful section components.
- `src/components/`: forms, heading, brand, complete phone media, and fixed navigation rail.
- `src/content.ts`: marketing copy, section names, categories, and decorative league data.
- `src/config.ts` and `.env.example`: public integration settings.
- `src/api.ts`: explicitly proposed API adapters.
- `src/styles.css`: Figma colors, typography, desktop compositions, reduced motion, and temporary narrow-width fallback.
- `public/assets/`: approved exports and optimized raster variants.
- `design/ASSETS.md`: asset provenance and export details.
- `tests/desktop.spec.ts`: browser, accessibility, form, and navigation checks.

## Required external configuration

Copy `.env.example` to `.env.local` and supply real public values. Vite embeds these values at build time; rebuild after changing them. **Never put credentials or secrets in VITE variables.**

| Value                                             | Current state                                  |
| ------------------------------------------------- | ---------------------------------------------- |
| Waitlist endpoint and actual response schema      | Missing                                        |
| Counter endpoint or subscription method           | Missing                                        |
| Support/grievance endpoint and recipient workflow | Missing                                        |
| Instagram profile URL                             | Missing                                        |
| Privacy Policy, Terms, Community Guidelines URLs  | Missing                                        |
| Approved analytics events/provider                | Missing; analytics is not enabled              |
| Section URL hashes                                | Kept unchanged, per brief; no history mutation |
| Google Play and App Store destinations            | Coming Soon, non-interactive                   |

The static page does not invent endpoints, counts, URLs, or successful submissions. Unconfigured submissions show an accessible unavailable message and retain input. The counter reads “Be among the first fans” until real data is supplied. Legal destinations are non-interactive text until configured; Instagram is an inactive updates card until its HTTPS URL exists.

### Backend adapter contract

- Waitlist: JSON POST `{ email }`; HTTP 201 means accepted; HTTP 409 means duplicate; other status/network/15-second timeout means recoverable failure.
- Support: JSON POST `{ email, category, message }` or `{ name, email, topic, message }` with a stable `Idempotency-Key` across retries; HTTP 202 means accepted. Failures retain the content and permit retry.
- Counter: JSON GET `{ total: nonNegativeSafeInteger }`; failures leave the last known total or the invitation text. Refetched after a successful waitlist submission. No invented count increment.

The backend must own validation, persistence, deduplication, delivery, abuse prevention, and any private credentials. The adapters do not implement those services. No entered data is stored in local storage.

## Verification

```sh
npm run format
npm run format:check
npm run lint
npm run build
npx playwright install chromium
npm test
npm audit
```

Tests start a separate server with test-only endpoint paths, intercepted by Playwright. No test request reaches an external service. Set `FANARENA_BACKEND_PATH` to a built Backend checkout to run the focused real-backend browser integration. The sample Instagram URL exists only in the default test process.

`node scripts/visual-check.mjs` runs against an unconfigured dev server on port 4174 and saves reference screenshots for all seven sections at 1024, 1280, 1440, and 1920px. It also checks a 720×450 CSS viewport equivalent to the content area of 1440×900 at 200% zoom. This is zoom-equivalent reflow testing, not a manual browser-toolbar zoom check.

## Scope and visual notes

All seven final mobile frames are implemented below 768px in `src/mobile.css`. Sections grow with content, with a 100svh minimum. Mobile uses native bidirectional scrolling and mandatory snap only when every section fits; otherwise proximity. At 768–1023px, the conservative tablet fallback remains. The desktop behavior described below applies at 1024px and above.

The website uses native movement with a 25% elastic section threshold on desktop. After a gesture and momentum stop (180ms idle), movement below 25% of viewport height returns to the current section; at or above 25% it settles to the adjacent section in that direction. The threshold is measured from the current section's reading boundary, so taller sections can be read freely before transitioning. Upward transitions into a tall section land at its bottom reading position. CSS proximity snapping is disabled while the desktop gesture controller is active. Below 1024px scrolling remains free.

The gesture controller lives in `src/useElasticScroll.ts`; adjust `SCROLL_THRESHOLD` there. Navigation links cancel pending settling and nested scrollable controls retain native behavior. Arrows, links and threshold settling use a shared 700ms ease-in-out scroll animation in `src/scrollAnimation.ts`, with intermediate document positions rendered on each animation frame. New scroll input interrupts the animation. Per the user's explicit request to see scrolling, this animation also runs when OS reduced motion is enabled; decorative entrances and pulses still respect reduced motion. One H1, six H2s, semantic sections, keyboard focus and accessible form errors/live regions remain in place. CSS intrinsic layouts replace viewport coordinates; phone UI is never rebuilt.

Deliberate differences: header section links are included as explicitly required by the written brief although absent in the final hero screenshot; the navigation rail uses one consistent viewport position instead of the slightly different positions in individual frames; missing links/counts use truthful non-interactive fallbacks. Native form controls and browser font/emoji rendering differ slightly from Figma. Phone shadows outside the configured device bounds are omitted, avoiding a spotlight effect.

The hero's available Figma asset is 1024×992. Responsive 728×705 and 1456×1410 deliveries are generated from that source, so the larger version cannot add detail. See the asset manifest. Safari/Firefox, manual screen-reader testing, and actual browser-toolbar 200% zoom remain unverified.
