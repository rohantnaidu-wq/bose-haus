# Bose Haus · Design package (10k-websites, Tier 1 trimmed)

Written before the build; the build consumes it. Copy lives in `src/content.js` and ships verbatim.

## 1. Brand premise
**Walking in.** Bose Haus is a brick path under old trees with five doors off it and a family at the end of it. Every section is a step further in: the drive, the story, the five doors, the map of the path, which door is yours, what's around the corner, the straight talk, the questions. The single call to action is **Check dates** on a space page, reached through "See the five spaces".

## 2. Palette (brand-locked, sampled from the photos by the brand kit)
```css
:root{
  --canvas:#EDEEEA;   /* limewash, light sections */
  --night:#0E1433;    /* dark canvas, derived from the gate blue, never #000 */
  --panel:#17224C;    /* gate blue: dark panels, body text on light */
  --accent:#5E2B19;   /* red oxide: CTA on light, drop caps, rare */
  --accent-dark:#C9A05A; /* turmeric, lightened for small text on dark (6.3:1 on gate) */
  --turmeric:#A67B2F; /* large display only */
  --leaf:#4B5729; --sage:#CBCAB1; --muted:#4A5068; --mist:#9AA0B8;
}
```
Deviation, said out loud: the skill bans "cream canvas + serif + terracotta" as a default look. Here it *is* the subject's material world (limewash walls, red oxide floors, sampled from the photos), so the carve-out applies. Kept clear of the stock layout by the arches and the dark gate-blue chapters.

## 3. Type
Young Serif (display, 400) and Hanken Grotesk (400/500/600). Deviation: no mono. The brand kit locks two faces; small labels use Hanken 600 uppercase with tracking instead.

## 4. Hero: "The gate opens" (desktop, 560vh; starting points validated by the flick test)
A limewash wall with one arched doorway standing on a red oxide floor. The walk-in film (`-g 8`, seek-scrubbed, gated seeks) plays inside the arch. Scrolling scales the arch open (transform only) while the view inside counter-scales, so the film holds still and the doorway grows around it until it covers the screen (the cover scale is solved per viewport, round top included).

| Beat | Progress | What happens | Copy | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to ~0.30 | Wall, doorway, film starting inside it. The doorway opens from 0.06 to 0.44 | kicker + `home.heroLine`, split at the comma either side of the door | halves step out of the doorway on load, then the opening door pushes them aside |
| 2 | 0.47 to 0.69 | Walking up the path | `home.filmBand2` | drift-down |
| 3 | 0.73 to 1.00 | Under the canopy, dusk gathers toward the night-blue doors section | `home.filmBand3` + `home.heroSub` + CTA | staged settle |

The five doors follow straight after the hero (the story moved below them) and rise into place with the scroll, largest first: one arch becomes five.

Nav: ink over the wall, a glass backing while the arch crosses it, clear over the film. Film lines are limewash, not turmeric: turmeric could not hold 3.5:1 over the sunlit pavers.

Measured: flick test at 1440x900: headline 5, band 2 5, band 3 14 normal flicks (120px), every beat reached at 360px. Worst-frame contrast (glyphs hidden, real composited page): 3.85:1 or better at 1920, 1440, 1280, 1024, 768, 390 and 375.

## 5. Phones and portrait tablets: the same reveal, lighter (280vh)
The same arch opening driven by scroll over the portrait driveway photo (`compound-driveway-garden-walkway-05`) with the portrait walkway loop (0.8 MB) fading in once it plays. The headline halves sit above and below the doorway and part vertically. Portrait tablets use the sharper 16:9 start frame as the still under the loop, since the portrait photo would be stretched about 1.6x there. The film is never requested.

Reduced motion and no JS: a still composition (words left, doorway on the floor right; stacked on phones), plus the opt-in button "Play the walk-in as you scroll", remembered per device. Reduced motion is honoured live in both directions.

## 6. Below the fold
1. Five doors (night): arched doorways, largest first. Hover (or keyboard focus) flips each door through three rooms from `MEDIA.featured` with the room name and quick facts (sleeps, bedrooms, bathrooms). Phones: a swipe carousel with snap and progress dots.
2. Story (light): drop cap, offset red-oxide photo, pull quote `ui.pullQuote`.
3. The compound (paper): the illustrated map, hotspots, gate photo inset.
4. Which space suits you (gate blue): **the one interactive moment**.
5. Neighbourhood (light): a drawn route line with stops.
6. Good to know (paper): spot illustrations inline.
7. Questions (night, brass texture at whisper level).
8. Footer: contact (To update), Airbnb links, Family view.

Space pages: arched desktop hero (photos kept near true size, at most about 1.2x), then a content column with a **sticky booking summary card** beside it on desktop (book bar on phones and tablets). Photos are grouped into **room chapters** in the handover's room order, with a jump index; chapters over eight photos fold behind "Show all". Lightbox browses every photo of the space, capped at 1.3x. Booking simulation unchanged.

One-page artifact: views change with an arch wipe (`::view-transition`), a plain cut under reduced motion or where the browser lacks view transitions.

Type and spacing: one token scale (`--fs-xs` to `--fs-5xl`, `--sp-1` to `--sp-9`, `--sec-y` for every section's padding, `--head-gap` from header to content).

## 7. Vector layer
The brick path: one hand-drawn SVG line down the page margin that draws itself as you scroll. Accent underline on space names. Amenity icons. Fixed background layer: slow dappled leaf-shadow drift (70s cycle) behind the light sections.

## 8. Engineering list
Seek scrub (-g 8) with gated seeks, streamed Blob, progress ring and 20s watchdog; dt-normalised lerp loop that rests; delta-gated DOM writes; bands paced in vh; four-layer legibility (base scrim, band scrim, text-shadow token, chip); five static-hero gates identical in CSS and JS and live; complete without the film; reduced motion honoured live both ways; `overflow-x: clip`; IntersectionObserver entrances with retired delays; one living element per section; paused on hidden tabs.

## 9. Copy gate
Copy ships verbatim from `src/content.js`. `tools/check_copy.py` (handover banned list, no emoji, no exclamation marks) plus the skill's grep: zero em dashes, zero of leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions.
