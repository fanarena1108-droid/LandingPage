# Final mobile implementation

Approved Figma section 611:3, handoff boards 712:2, 713:2, 713:10. All seven frame contexts and screenshots were read before implementation, plus all five contact states. Desktop and mobile share the same React page, section order, API adapters and real counter source.

## Export provenance

| Node    | File in public/assets      | PNG dimensions |
| ------- | -------------------------- | -------------- |
| 700:15  | mobile-live@2x.png         | 440 × 928      |
| 700:139 | mobile-talk@2x.png         | 400 × 843      |
| 700:294 | mobile-challenges@2x.png   | 440 × 928      |
| 700:439 | mobile-competitions@2x.png | 440 × 928      |
| 699:9   | mobile-hero@2x.png         | 690 × 480      |
| 464:4   | mobile-logo@2x.png         | 77 × 77        |

Exports use configured PNG 2× settings and absolute bounds, preserving the complete phone parent and transparent exterior. Phone widths are 220/200/220/220 CSS px, with proportional scaling when needed. Hero photo treatment is included in its approved export; match result and crests remain HTML/separate assets. No whole-section raster is used. Existing approved store/social logos and crests are reused.

## Behavior

Below 768px, native bidirectional scroll uses mandatory snapping only if every section fits the visual viewport; otherwise proximity. No wheel/touch interception or timed advance. Anchors use native smooth scrolling and instant movement for reduced motion. At 768–1023px the existing tablet fallback remains; desktop retains its prior elastic scroll controller.

Contact uses a native modal dialog plus explicit Tab wrapping, background inertness, fixed-body scroll lock, restored focus/position, visualViewport sizing, internal overflow and safe-area padding. Close, backdrop, Escape, browser Back and Done dismiss it. Drafts remain in component memory until acknowledged success; no localStorage. A temporary history entry exists only for the sheet. Inputs validate on blur/submit and announce linked errors. A request guard prevents duplicate sends. Closing during a request does not abort an already submitted request; reopening reflects the result.

## Verification

Browser tests cover 393×852, 320×568, 360×800, 430×932, 740×360 landscape and 800×900 tablet. Enlarged text is tested by doubling rendered text sizes. Tests exercise native scrolling both directions, reduced-motion anchors, asset selection, no horizontal overflow, content growth, conditional snap, focus trapping, dismissal, draft persistence, validation, pending lock, server failure/retry/success, waitlist duplicate/error/success and unavailable count. Axe WCAG A/AA checks cover mobile, tablet and the short contact dialog.

All seven mobile screenshots visually reviewed at 393×852. Complete phone positions match reference y=283/351/361/343 and widths=220/200/220/220. Reference screenshots live in ignored design/reference; regenerate current screenshots with `node scripts/mobile-check.mjs` against port 4174. Hero count is hidden in the unconfigured preview, so subsequent hero artwork moves up naturally.

Desktop comparison using `node scripts/desktop-regression.mjs`: all seven 1440×900 screenshots had 0 changed pixel channels against the saved desktop baseline. Existing desktop behavior and accessibility tests remain included.

## Remaining release dependencies

Configure real waitlist/count/support endpoints, confirm response codes and mobile support payload `{ name, email, topic, message }` with the backend, and supply verified Instagram and legal URLs. Store cards remain Coming soon. API tests use intercepted local paths; no production success is claimed. Confirm field limits with the backend.

Actual iOS Safari/Android browser chrome, virtual keyboards, device safe areas, screen readers, and browser-level text zoom require real-device QA. Automated reduced-height viewport checks exercise the sizing and scrollability paths, but do not substitute for physical keyboard/browser testing. No deployment performed.
