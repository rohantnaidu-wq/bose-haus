# Bose Haus website

Static site built from one editable file. Design phase; not deployed yet.

## Change something
1. Edit `src/content.js` (prices, times, contact, rules, all copy, which photo goes where).
   `null` shows as a dashed "To update" tag; a price of `0` shows as "₹0 · To update".
2. Rebuild and check:
   ```
   python tools/build.py
   python tools/check_images.py . dist/index.html dist/cottage.html dist/courtyard.html dist/nook.html dist/retreat.html dist/rooftop.html dist/house-rules.html dist/404.html
   python tools/check_copy.py src/content.js dist/index.html
   ```
3. Preview: `python -m http.server 8765` in this folder, then open http://localhost:8765/dist/index.html

## What's where
| Path | What |
|---|---|
| `src/content.js` | The only file to edit day to day |
| `src/css/site.css`, `src/js/site.js` | Design and moving parts |
| `src/js/booking.js` | Booking simulation. Swap for the Lodgify widget later (see the BOOKING MODULE comment in each space page) |
| `tools/build.py` | Renders every page into `dist/` |
| `tools/assets.py` | Photos → sharpened WebP, generated art → web sizes (`web/`) |
| `tools/ingest.py` | Re-import the original photo zip |
| `image-manifest.json` | Ground truth for every photo and generated asset |
| `docs/design-package.md` | Design decisions (10k-websites skill) |
| `generated/raw/` | Higgsfield originals, including the 35 MB walk-in film. Never deployed |

## The hero: "The gate opens"
Desktop: a limewash wall with one arched doorway; scrolling opens it and walks up the driveway (the film, `-g 8`).
Phones and portrait tablets: the same doorway opening over the portrait photo and walkway loop; the film never loads.
Reduced motion: a still composition with a "Play the walk-in as you scroll" button, remembered per device.

## Before going live
- Fill `siteUrl` so canonical links, og tags and the sitemap use the real address.
- Fill the Family view checklist (footer button on any page).
