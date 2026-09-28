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

## The walk-in film
Desktop visitors (no reduced-motion setting) get a scroll-driven walk up the driveway.
Phones, portrait tablets and reduced-motion visitors get a still hero; phones also get the portrait walkway loop.

## Before going live
- Re-encode the film with ffmpeg (`-g 8`, about 4–6 MB) and replace `generated/raw/film-walk-in.mp4`.
- Fill `siteUrl` so canonical links, og tags and the sitemap use the real address.
- Fill the Family view checklist (footer button on any page).
