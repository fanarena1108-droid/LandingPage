# Approved Figma assets

Final mobile exports and node provenance are documented in [MOBILE.md](MOBILE.md). The following table describes the unchanged desktop assets.

Source file: https://www.figma.com/design/dJ67Z4MTpKyZlxZ7CKQM1U/FanArena

Only these named `EXPORT —` nodes produce runtime image dependencies. Seven frame screenshots were downloaded solely for visual comparison into ignored `design/reference/`; they are never used by the website.

| Node    | Asset                                   | Verified delivery                                                                          |
| ------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| 443:14  | phone-mockup-live-match-pixel-9-pro     | Complete PNG, 820×1728                                                                     |
| 443:135 | phone-mockup-fan-talk-iphone-16-pro     | Complete PNG, 820×1728                                                                     |
| 443:287 | phone-mockup-challenges-pixel-9-pro     | Complete PNG, 820×1728                                                                     |
| 443:428 | phone-mockup-competitions-iphone-16-pro | Complete PNG, 570×1201 (rounded source 284.75×600.06)                                      |
| 653:39  | hero-el-clasico-crowd                   | Approved photo fill, original 1024×992; responsive AVIF/WebP/JPEG at 728×705 and 1456×1410 |
| 655:3   | crest-real-madrid                       | Transparent PNG, 108×108                                                                   |
| 655:10  | crest-fc-barcelona                      | Transparent PNG, 108×108                                                                   |
| 655:14  | logo-fanarena                           | Exported SVG                                                                               |
| 449:2   | logo-instagram                          | PNG, 84×84                                                                                 |
| 467:2   | logo-google-play                        | PNG, 84×84                                                                                 |
| 467:3   | logo-app-store                          | PNG, 84×84                                                                                 |
| 443:541 | logo-fanarena-footer                    | Exported SVG                                                                               |

The configured phone settings are PNG / 2× / contentsOnly. The default tool output included parent viewport clipping and shadow bounds. Re-exporting with `useAbsoluteBounds: true` returned the complete approved outer phone dimensions. No file mutation, phone-layer edits, screen reconstruction, separate frame export, or post-export crop was used. All four complete PNGs were inspected visually. WebP variants preserve alpha and aspect ratio.

The configured hero JPG export was requested but not delivered as an accessible file by the connector. Its base64 fallback exceeded the connector's 20KB text limit. The implementation therefore downloads the exact image asset supplied by design context for approved node 653:39 and applies the node's tint in CSS. This preserves the original image content; the larger production rendition is an upscale of its 1024px source.

`npm run assets:optimize` regenerates the optimized variants from checked-in source assets with Sharp. The complete PNGs remain available as fallback. SVG bytes are the exact Figma exports. Brand colors and transparency are retained.
