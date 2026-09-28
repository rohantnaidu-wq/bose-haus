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

## 4. Band map (desktop walk-in film, 400vh, starting points)
| Band | Range | Footage moment | Copy | Entrance |
|---|---|---|---|---|
| 1 | 0.00–0.30 | Standing at the start of the drive | kicker + `home.heroLine` | word rise, load ramp |
| 2 | 0.36–0.62 | Gliding up the path, leaves moving | `home.filmBand2` | drift-down (leaves settling) |
| 3 | 0.68–1.00 | Settling under the canopy | `home.filmBand3` + `home.heroSub` + CTA | staged settle |

Film engine deviation: the Higgsfield file has one keyframe in 121 frames and ffmpeg is not installed, so the page decodes the film once into a frame sequence (JPEG blobs via requestVideoFrameCallback) and scrubs a canvas. Smooth regardless of keyframes. Swap to the skill's seek method after `-g 8` re-encoding if ffmpeg arrives.

## 5. Static hero (phones, portrait tablets, coarse portrait, landscape phones, reduced motion)
The portrait driveway photo, with the existing portrait walkway loop fading in when it actually plays (not on reduced motion or data-saver). `home.heroLine`, `home.heroSub`, CTA.

## 6. Below the fold
1. Story (light): drop cap, offset red-oxide photo, pull quote `ui.pullQuote`.
2. Five doors (night): arched doorways, largest first. **Signature element: the arch**, from the Cottage and Retreat doorways.
3. The compound (paper): the illustrated map, hotspots, gate photo inset.
4. Which space suits you (gate blue): **the one interactive moment**. Pick who's coming and what matters; the doors re-order and say why.
5. Neighbourhood (light): a drawn route line with stops.
6. Good to know (limewash): spot illustrations inline.
7. Questions (night, brass texture at whisper level).
8. Footer: contact (To update), Airbnb links, Family view.

Space pages: split hero (loop or cover), accent underline that draws itself, facts, story, masonry gallery by area with lightbox, amenities with drawn icons, notes, **booking simulation** (the page's CTA), next door.

## 7. Vector layer
The brick path: one hand-drawn SVG line down the page margin that draws itself as you scroll. Accent underline on space names. Amenity icons. Fixed background layer: slow dappled leaf-shadow drift (70s cycle) behind the light sections.

## 8. Engineering list
Frame-sequence scrub with progress ring and 20s watchdog; dt-normalised lerp loop that rests; delta-gated DOM writes; bands paced in vh; four-layer legibility (base scrim, band scrim, text-shadow token, chip); five static-hero gates identical in CSS and JS and live; complete without the film; reduced motion honoured live both ways; `overflow-x: clip`; IntersectionObserver entrances with retired delays; one living element per section; paused on hidden tabs.

## 9. Copy gate
Copy ships verbatim from `src/content.js`. `tools/check_copy.py` (handover banned list, no emoji, no exclamation marks) plus the skill's grep: zero em dashes, zero of leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions.
