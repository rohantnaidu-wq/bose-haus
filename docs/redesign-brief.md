# Bose Haus · Redesign brief (for the cloud session)

Read first: `BOSE_HAUS_HANDOVER.md` (brand, copy rules, image rules), `docs/design-package.md` (current design decisions), `README.md` (build and checks). The `10k-websites` skill is in `.claude/skills/10k-websites/`: follow it for the hero, motion standard and self-test.

## Goal
Raise the site to a high-end, client-ready standard before the owner sees it: a new hero and better UI/UX throughout. Keep every piece of content, every rule and the booking simulation. The live preview is https://claude.ai/artifact/K625hD7tLYMj9xXFFnfkkg (republish from `artifact/index.html` to update it, same URL).

## 1. New hero: "The gate opens" (approved)
- First screen: limewash wall, one tall arched doorway centred (the site's signature shape, from the Cottage and Retreat arches). Inside the arch: the driveway walk-in film (`web/gen/film-walk-in.mp4`, encoded `-g 8`, seek-scrubbed; see the Film engine in `src/js/site.js`).
- As the visitor scrolls, the arch widens until it fills the viewport and the film carries them up the path. The headline "Old trees, red oxide floors, and a family who lives next door." splits and slides aside as the doorway opens. Kicker above, the approved film lines (`home.filmBand2`, `home.filmBand3`) during the walk, `home.heroSub` and the CTA at the settle.
- At the end of the walk, the five arched doors of the next section rise into place (continuity from one arch to five).
- Phones and portrait tablets: the same arch reveal driven by scroll, using the portrait still (`compound-driveway-garden-walkway-05`) and the light portrait loop (`loop-walkway`, 0.8 MB). Never load the film on phones.
- Reduced motion: still hero plus the existing opt-in button ("Play the walk-in as you scroll", remembered per device). The owner's own PC has Windows animation effects off, so the opt-in must stay.
- All motion: transform and opacity only, rAF loop that rests, gated seeks, delta-gated DOM writes, bands paced in vh (skill's scrub-pipeline standard). Legibility: scrims plus text-shadow token, worst-frame contrast at least 3.5:1.

## 2. UI/UX upgrades
- Tighten the type scale and spacing rhythm into one system (tokens), so sections feel related; audit every section at 375, 768, 1280, 1440.
- View transitions in the one-page artifact: an arch-wipe between views instead of a hard cut (respect reduced motion).
- Five doors: on hover, flip through three rooms from `MEDIA.featured` with quick facts; on phones a swipe carousel with snap and progress dots.
- Space pages: photos grouped into room chapters; sticky booking summary card beside the content on desktop; keep the arched desktop hero (photos are only ~620 px tall; never stretch them past about 1.3x).
- Keep "To update" tags visible (owner decision): the client should see what they still need to supply. Keep Family view and the suggest-a-change pencils.

## 3. Rules that must not break
- Brand kit locked (colours, Young Serif + Hanken Grotesk). No banned words, emoji, exclamation marks or em dashes. Copy lives only in `src/content.js`; new wording goes there and must pass `python tools/check_copy.py`.
- Image integrity: every image carries `data-img`, sits in the right `data-space` wrapper, generated assets carry `data-kind`. `python tools/check_images.py . dist/*.html artifact/index.html` must PASS. The duplicate garden photo stays held.
- Honest copy: no invented facts, prices, reviews or history.
- Artifact limits: page at most 16 MB, at most 255 files, 64 MB total, 15 MB per file; CSS/JS inline, assets published beside the page, no external images or scripts except the allowed CDNs and Google Fonts. Today: 234 files, 26 MB.
- The build is plain Python (`python tools/build.py` writes `dist/` and `artifact/`). `tools/assets.py` needs the original photos, which are not in this repo; `web/` already holds the processed versions, so it does not need to run.

## 4. Done means
New hero and upgrades built, both checkers PASS, skill self-test done (flick test, worst-frame audit, reduced motion both ways, phone widths, console clean), artifact republished to the same URL, and a short note of what changed.
