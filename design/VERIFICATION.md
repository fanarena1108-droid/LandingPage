# Desktop verification

Final mobile implementation, 11 additional browser tests and a pixel-identical desktop regression comparison are documented in [MOBILE.md](MOBILE.md). The historical desktop-only scope below predates the mobile implementation.

Completed on 2026-09-09.

- `npm run format`: applied.
- `npm run format:check`: passed.
- `npm run lint`: passed with zero warnings/errors.
- `npm run build`: passed, static output in `dist/`.
- `npm test`: 16 Playwright tests passed, including the updated elastic scrolling behavior and visible animation in both directions.
- `npm audit`: zero known vulnerabilities.
- `node scripts/visual-check.mjs`: completed.

Browser tests verify seven semantic sections, one H1, six H2s, loaded images, no browser console warnings/errors, live counter response, all forward/back adjacent-section controls, first-up/final-down disabled states, no hash/history mutation, CTA focus, keyboard support, field validation, request-pending lock, duplicate email, retry after server failure, success focus, reduced motion, and store link semantics.

Elastic scroll tests verify below/above the 25% threshold in both directions, net displacement after reversal, continued gesture input, explicit navigation cancelling a rebound, access to tall-section content, and free scrolling below 1024px.

The latest scroll animation test samples intermediate document positions in both directions with OS reduced motion enabled. It confirms multiple rendered positions during each 700ms transition instead of an instantaneous jump. Explicit animated scrolling follows the user's updated preference; decorative animations still respect reduced motion.

All seven frames were visually compared at 1440×900. Additional screenshots and overflow checks cover 1024, 1280, and 1920px. Axe WCAG 2 A/AA and WCAG 2.1 AA scans passed at these widths and the temporary 720px fallback.

All four full phone PNGs were visually inspected to confirm complete frames, screens, cameras, device details and transparent exteriors. Phone artwork clipping happens at the section boundary, not inside the exported image.

The unconfigured preview was separately checked: it does not display a fabricated count or claim a form submission succeeded. Entered data survives the unavailable response.

Zoom reflow was checked at 720×450 CSS pixels, equivalent to the content area of 1440×900 at 200%. An attempt to launch full Chromium with a persisted browser zoom preference failed with the runtime's `spawn UNKNOWN` error. Actual browser-toolbar zoom and manual screen-reader testing remain unverified.

The only terminal warnings during tests concern inherited NO_COLOR/FORCE_COLOR settings; these are test-runner environment warnings, not website console warnings.

Remaining differences and reasons are documented in README.md and ASSETS.md. No mobile Figma frames were implemented or used as references. No approved Figma nodes were edited. No live deployment or backend integration was performed.
