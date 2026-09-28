# Bose Haus — Full Project Handover for Claude Code
**Date:** 27 September 2026  
**Status:** Brand, copy, assets and a working preview are done. The owner wants the website completely redesigned — the current Claude.ai preview is too basic. Claude Code should start fresh on the front-end while reusing everything below.

---

## 1. WHAT THIS IS

**Bose Haus** is a 1960s family compound in Bengaluru with five guest spaces. The family still lives on site. It sits between Lalbagh Botanical Garden and NIMHANS.

Five spaces:
| ID | Name | Sleeps | Bedrooms | Beds | Bathrooms | Airbnb |
|---|---|---|---|---|---|---|
| cottage | The Cottage | 2 | 1 | 1 double bed | 1.5 | https://www.airbnb.co.in/rooms/20767422 |
| courtyard | The Courtyard | 2 | 1 | null (To update) | 1 | https://www.airbnb.co.in/rooms/1142679811301194470 |
| nook | The Nook | 2 | 1 | 1 queen bed | 1 | https://www.airbnb.co.in/rooms/22335455 |
| retreat | The Retreat | 4 | 2 | Bedroom 1: 2 double beds + 2 floor mattresses. Bedroom 2: 2 single beds | 1 | https://www.airbnb.co.in/rooms/20594104 |
| rooftop | The Rooftop | 2 | 1 | 1 king bed | 1 private | https://www.airbnb.co.in/rooms/33142551 |

Airbnb ratings (as of 27 Sep 2026): Cottage 4.73 (158), Courtyard 4.80 (60), Nook 4.79 (205), Retreat 4.81 (164), Rooftop 4.92 (119).

The physical sign on the gate reads **"Bose Enclave"** — tell guests to look for it.

---

## 2. WHY THE OWNER REJECTED THE PREVIOUS DESIGN

The Claude.ai preview was dismissed as "too basic" and "too simple." The owner wants:
- A **dynamic, immersive build** — not cards on a white background
- All the Higgsfield assets actually used prominently and creatively
- Character and atmosphere, not a generic Airbnb-clone layout
- Something that feels like it was built specifically for this property

The previous preview is at https://claude.ai/artifact/BpW9Wnkbi68AD4nnXd77Kq — look at it to understand what to avoid.

---

## 3. FOLDER STRUCTURE (what exists on disk)

```
/home/claude/site/
  photos/                  235 real photos, never modified
    compound/              14 photos (driveway, gate, walkway, bench, trees)
    cottage/               29 photos (bedroom, dressing-room-bathroom, garden, kitchen)
    courtyard/             62 photos (bathroom, bedroom, garden, kitchen, living-space)
    nook/                  23 photos (bathroom, bedroom, garden, kitchen)
    retreat/               52 photos (bathroom, bedroom-1, bedroom-2, garden-inner-courtyard, kitchen, livingroom)
    rooftop/               55 photos (bathroom, bedroom-livingspace, garden, kitchen)
  generated/               All Higgsfield-made assets
    loop-walkway.mp4       Home hero loop (600×800, H.264)
    loop-rooftop.mp4       Rooftop page loop (600×450, H.264)
    loop-courtyard.mp4     Courtyard page loop (600×450, H.264)
    loop-retreat.mp4       Retreat page loop (600×450, H.264)
    compound-map.webp      Illustrated compound map, 1400×1046
    compound-map.png       Full-res version, 2400×1792
    texture-leaf.webp      Brick/leaf texture, 800×800
    texture-brass.webp     Brass patina texture, 800×800
    spot-teacup-swing.webp Teacup on swing illustration, 996×843
    spot-squirrel.webp     Squirrel illustration, 794×789
    spot-brass-key.webp    Brass key illustration, 895×852
    spot-copper-pod-tree.webp Copper pod tree illustration, 807×968
    spots-1.png            Source sheet with all 4 spots in one image
    brand-texture-red-oxide-01.png Red oxide test texture (1024×1024)
    map-1.png              Illustrated map option 1 (chosen, full-res)
    map-2.png              Illustrated map option 2 (simpler, schematic)
  web/
    selection.json         The 56 photos selected for the preview (8-10 per space)
    *.webp                 WebP-encoded versions of those 56 photos
  src/
    content.js             ALL copy and ALL editable facts (see Section 6)
    style.css              CSS written for the previous design (reuse tokens only)
    app.js                 JS written for the previous design (reuse logic modules)
  tools/
    build.py               Previous build script (ignore or reuse logic)
    check_images.py        Image integrity checker (KEEP AND RUN)
    check_copy.js          Copy banned-word checker (KEEP AND RUN)
  image-manifest.json      Ground truth for all 235 photos + 13 generated assets
  copy-deck.md             Human-readable copy document
  brand/
    Bose-Haus-brand-kit.pdf  One-page brand kit PDF
    palette-samples.json   Hex values + source photos for every brand colour
```

---

## 4. BRAND KIT (DO NOT CHANGE THESE)

### Palette (sampled from real photos)
| Token | Hex | Use | Source photo |
|---|---|---|---|
| --limewash | #EDEEEA | Page background | retreat-garden-inner-courtyard-02 |
| --gate | #17224C | All body text. 13.2:1 on limewash | compound-driveway-garden-walkway-07 (the gate) |
| --oxide | #5E2B19 | Primary: buttons, accents, drop caps | retreat-livingroom-01 (floor) |
| --leaf | #4B5729 | Secondary: available dates, nature refs | compound-driveway-garden-walkway-03 (ferns) |
| --turmeric | #A67B2F | Large display only, decoration | cottage-bedroom-01 (wall) |
| --turmeric-text | #8A6424 | Turmeric at readable size (4.6:1) | — |
| --sage | #CBCAB1 | Quiet surfaces, form fields | courtyard-bathroom-01 |
| --muted | #4A5068 | Secondary text, captions | — |

Per-space accent colours (for underlines, card tops, etc.):
- cottage → --oxide (#5E2B19)
- courtyard → #8A6424
- nook → --gate (#17224C)
- retreat → --leaf (#4B5729)
- rooftop → #30405E

### Typography
- **Display/headings:** Young Serif (Google Fonts) — `font-family: 'Young Serif', Georgia, 'Times New Roman', serif`
- **Body/UI:** Hanken Grotesk (Google Fonts) — `font-family: 'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif`
- Scale: Display 48px / H1 36px / H2 28px / H3 21px Hanken SemiBold / Body 17px 160% / Small 14px / Tag 13px Hanken Medium
- Mobile: step down one size. Body stays 17px (never below, prevents iOS zoom).

### Brand personality
- **Lived-in.** Real rooms the family has furnished over decades.
- **Unhurried.** Trees, birdsong, a slower pace.
- **Straight-talking.** We say what's there, including insects, steps and rustic bits.
- **NOT:** boutique hotel, luxury, wellness retreat, staged rustic-chic.

### Voice (enforced by check_copy.js — do not violate)
BANNED WORDS: nestled, hidden gem, oasis, elevate, curated, unwind and recharge, boasts, tapestry, sanctuary, "whether you're... or...", "discover the magic", illness, hospital, patient, treatment, luxury, only 1 left, hurry, book now before.
BANNED: emoji anywhere in copy, exclamation marks anywhere in copy.

---

## 5. THE 235 PHOTOS — IMAGE INTEGRITY RULES (NON-NEGOTIABLE)

**The worst possible error is a photo of the wrong room on the wrong space's page.**

All photos are in `photos/{space}/{area}/` and renamed to `{space}-{area}-{nn}.png` in the manifest. The manifest is the single source of truth.

### Rules
1. Every image on the site MUST have `data-img="{manifest_key}"` pointing to its `image-manifest.json` entry.
2. Every image block MUST be wrapped in an element with `data-space="{space}"` matching the photo's space.
3. Generated assets (loops, illustrations, textures) MUST be wrapped in `data-kind="motion"`, `data-kind="illustration"`, or `data-kind="texture"`. They must NEVER appear inside a `data-space` room block without that kind marker.
4. `check_images.py` must pass before publishing. Run: `python3 tools/check_images.py . [your-html-file.html]`
5. One photo (`photos/cottage/cottage-garden-08.png` = `photos/nook/nook-garden-02.png`) is visually identical. It is held — do NOT show it on either space's page until the owner confirms which space it belongs to.

### Cover photos (chosen from full contact-sheet review)
- compound → `photos/compound/compound-driveway-garden-walkway-05.png`
- cottage → `photos/cottage/cottage-bedroom-01.png`
- courtyard → `photos/courtyard/courtyard-bedroom-06.png`
- nook → `photos/nook/nook-bedroom-05.png`
- retreat → `photos/retreat/retreat-bedroom-2-02.png`
- rooftop → `photos/rooftop/rooftop-bedroom-livingspace-10.png`

### Photo display rules
- Photos are 617–911 px on the long side. Show at true size with light sharpening. No AI upscaling on room photos.
- The 56 pre-selected and WebP-encoded photos are in `web/selection.json` + `web/*.webp`. Use those for the web build (they're already light-sharpened and WebP-encoded at ~76 quality).
- Photo areas per space and suggested gallery order:
  - **cottage:** bedroom → dressing-room-bathroom → kitchen → garden
  - **courtyard:** bedroom → living-space → kitchen → bathroom → garden
  - **nook:** bedroom → kitchen → bathroom → garden
  - **retreat:** bedroom-1 → bedroom-2 → livingroom → kitchen → bathroom → garden-inner-courtyard
  - **rooftop:** bedroom-livingspace → bathroom → kitchen → garden

---

## 6. ALL COPY AND SETTINGS (content.js — source of truth)

The complete `content.js` is below. Keep it as the single editable source. Every price, time, phone number, and rule goes in `SETTINGS` — the site should update everywhere when you change it there.

**Placeholders show as dashed "To update" tags.** `null` = unknown. `0` = price placeholder.

```javascript
/* =====================================================================
   BOSE HAUS · SETTINGS  (edit here, the whole site updates)
   null  = unknown → shows as dashed "To update" tag
   0     = price placeholder
   ===================================================================== */
const SETTINGS = {
  brand: "Bose Haus",
  gateSign: "Bose Enclave",
  contact: { phone: null, whatsapp: null, email: null },
  stepsOther: null,        // steps at Cottage, Courtyard, Nook, Retreat?
  paymentProcess: null,    // how guests pay after request confirmed
  times: { checkIn: null, checkOut: null },
  earlyCheckIn: false,
  currency: "₹",
  taxRate: 0,
  longStay: { nights: 7, discount: 0 },
  minNightsDefault: null,
  analytics: { ga4: null, searchConsole: null },
  ratingsAsOf: "27 Sep 2026",
  spaces: {
    cottage:   { guests: 2, bedrooms: 1, beds: "1 double bed", baths: "1.5 bathrooms", nightly: 0, weekend: 0, cleaning: 0, minNights: null, rating: 4.73, reviews: 158, airbnb: "https://www.airbnb.co.in/rooms/20767422" },
    courtyard: { guests: 2, bedrooms: 1, beds: null,           baths: "1 bathroom",    nightly: 0, weekend: 0, cleaning: 0, minNights: null, rating: 4.8,  reviews: 60,  airbnb: "https://www.airbnb.co.in/rooms/1142679811301194470" },
    nook:      { guests: 2, bedrooms: 1, beds: "1 queen bed",  baths: "1 bathroom",    nightly: 0, weekend: 0, cleaning: 0, minNights: null, rating: 4.79, reviews: 205, airbnb: "https://www.airbnb.co.in/rooms/22335455" },
    retreat:   { guests: 4, bedrooms: 2, beds: "Bedroom 1: 2 double beds and 2 floor mattresses. Bedroom 2: 2 single beds", baths: "1 bathroom", nightly: 0, weekend: 0, cleaning: 0, minNights: null, rating: 4.81, reviews: 164, airbnb: "https://www.airbnb.co.in/rooms/20594104" },
    rooftop:   { guests: 2, bedrooms: 1, beds: "1 king bed",   baths: "1 private bathroom", nightly: 0, weekend: 0, cleaning: 0, minNights: null, rating: 4.92, reviews: 119, airbnb: "https://www.airbnb.co.in/rooms/33142551" }
  },
  houseRules: { smoking: null, pets: null, parties: null, quietHours: null, visitors: null }
};

const COPY = {
  site: {
    title: "Bose Haus · Five stays in a 1960s family compound, Bengaluru",
    description: "Five lived-in stays under old trees in a 1960s family compound between Lalbagh and NIMHANS. Kitchens, wifi, parking inside the gate. The family lives here too.",
    previewLabel: "Preview: no real bookings or payments"
  },
  home: {
    heroLine: "Old trees, red oxide floors, and a family who lives next door.",
    heroSub: "Five stays inside a 1960s family compound in Bengaluru, minutes from Lalbagh and NIMHANS.",
    heroCta: "See the five spaces",
    storyTitle: "A family home that hosts guests",
    story: [
      "Bose Haus is a compound of old buildings and older trees. The main building is from the 1960s, with the high ceilings and red oxide floors of that time.",
      "Five spaces in it are let to guests. They are furnished the way the family furnishes its own rooms: old wood, flea-market finds collected over the years, and plenty of plants.",
      "We still live here. That is why it stays calm, and why we ask guests to keep it that way."
    ]
  },
  spaces: {
    cottage: {
      name: "The Cottage",
      promise: "A sloping tiled roof, a turmeric-yellow wall and a small garden outside. Rustic and basic, and we say so.",
      story: [
        "The Cottage sits under a pitched roof of clay tiles on dark wooden beams. One wall of the bedroom is painted turmeric yellow; the others are plain white.",
        "The kitchen has black and white tiles and arched doorways. Outside there is a small garden with chairs under the trees.",
        "It is the most rustic of the five. If you like things a little rough at the edges and very green, it suits."
      ],
      amenities: ["Kitchen", "Wifi", "Dedicated workspace", "Free parking inside the compound", "32-inch TV with Amazon Prime Video and Netflix"],
      notes: [
        "Rustic and basic. Please read the photos closely.",
        "Lots of trees, so expect ants, spiders, birds and squirrels. The rooms are meshed.",
        "Early check-in is not possible.",
        "The family lives in the compound."
      ],
      seoTitle: "The Cottage at Bose Haus · Rustic garden cottage, Bengaluru",
      seoDesc: "A rustic cottage for two with a tiled roof, kitchen and garden, in a green 1960s compound near Lalbagh and Forum Mall."
    },
    courtyard: {
      name: "The Courtyard",
      promise: "Warm ochre rooms, a sitting room of its own and a brick-paved garden full of potted plants.",
      story: [
        "The Courtyard's walls are painted a deep ochre, and the floors are terracotta. The bedroom has carved wooden beds and a long painted panel above them.",
        "There is a separate sitting room with wooden armchairs, a kitchen with leaf-patterned tiles, and a bathroom walled in palm-leaf tiles.",
        "Outside, a brick-paved garden with lanterns and pots of ferns, palms and monstera."
      ],
      amenities: ["Kitchen", "Wifi", "Dedicated workspace", "Free parking inside the compound", "TV"],
      notes: [
        "Lots of trees, so expect ants, spiders, birds and squirrels. The rooms are meshed.",
        "Early check-in is not possible.",
        "The family lives in the compound."
      ],
      seoTitle: "The Courtyard at Bose Haus · Stay for two with sitting room, Bengaluru",
      seoDesc: "Ochre rooms, a separate sitting room, a full kitchen and a brick courtyard garden, between Lalbagh and Forum Mall."
    },
    nook: {
      name: "The Nook",
      promise: "One big room with exposed brick and a kitchenette, for one or two people who like it simple.",
      story: [
        "The Nook is one large room: bed, table and kitchenette together, with an attached bathroom.",
        "One wall is bare brick. Blue-framed windows look out at the trees, and shelves are set into peach-coloured alcoves.",
        "It has its own entrance and a small private garden. The listing suits singles and couples who are comfortable with nature and a rustic feel."
      ],
      amenities: ["Kitchenette", "Wifi", "Dedicated workspace", "Free parking inside the compound", "32-inch TV", "Own entrance and private garden", "Self check-in with our staff"],
      notes: [
        "One room, so the kitchenette is in the same space as the bed.",
        "Lots of trees, so expect insects, birds and squirrels.",
        "Early check-in is not possible."
      ],
      seoTitle: "The Nook at Bose Haus · Room with kitchenette near NIMHANS",
      seoDesc: "One large room with a queen bed, kitchenette, private garden and entrance, minutes from NIMHANS and Lalbagh."
    },
    retreat: {
      name: "The Retreat",
      promise: "Two bedrooms, high ceilings, red oxide floors, and a walled garden only Retreat guests use.",
      story: [
        "The Retreat is in the 1960s building: high ceilings, tall windows and red oxide floors, the kind laid at the time.",
        "There are two bedrooms, a living room with a dining table, and a kitchen with blue-tiled splashbacks and open shelves.",
        "The small walled garden with its bench is only for Retreat guests. Families and couples stay here for short visits and long ones."
      ],
      amenities: ["Full kitchen", "Wifi", "Dedicated workspace", "32-inch TV with Netflix and Amazon Prime Video", "Private garden", "Parking on the driveway, on request", "Self check-in with our staff"],
      notes: [
        "Sleeps four. Bedroom 1 has 2 double beds and 2 floor mattresses; bedroom 2 has 2 single beds.",
        "One bathroom shared by both bedrooms.",
        "It's a green compound, so the odd wandering creature is part of the deal."
      ],
      seoTitle: "The Retreat at Bose Haus · Two-bedroom stay with garden, Bengaluru",
      seoDesc: "A two-bedroom 1960s home for up to four, with red oxide floors, full kitchen and private garden. Minutes from NIMHANS and Lalbagh."
    },
    rooftop: {
      name: "The Rooftop",
      promise: "Up about 15 steps: antique furniture, an indigo bathroom and a private terrace with a swing.",
      story: [
        "The Rooftop is one large room under a peaked wooden roof, filled with antique furniture. Big east-facing windows open onto the terrace.",
        "From the terrace you look into silver oaks, a copper pod, a pine and a jamun tree. There is a swing, and the listing mentions setting up a barbecue.",
        "The bathroom is large, with deep indigo walls. The kitchen is tiny but has modern gadgets."
      ],
      amenities: ["Small kitchen", "Wifi", "Dedicated workspace", "TV", "Private terrace with a swing", "Free parking on the front drive", "Self check-in with our staff"],
      notes: [
        "There are about 15 steps up. There is no lift.",
        "Airbnb lists it as a private room in the bungalow, with its own private bathroom.",
        "Best for short stays, the listing says."
      ],
      seoTitle: "The Rooftop at Bose Haus · Terrace room with swing, Bengaluru",
      seoDesc: "A large rooftop room with antique furniture, king bed and a private terrace among silver oaks. About 15 steps up."
    }
  },
  neighbourhood: [
    { name: "Lalbagh Botanical Garden", text: "Close by, for morning walks." },
    { name: "NIMHANS", text: "Minutes away." },
    { name: "Forum Mall", text: "Nearby, for shops and food." },
    { name: "Street food", text: "Vendors with chaat and momos in the evenings, a few roads away." },
    { name: "ATMs", text: "HSBC and SBI, a few roads away." },
    { name: "Airport", text: "The new interstate bus terminal is close. From there it takes about 45 minutes to the airport." },
    { name: "Getting around", text: "Autos nearby, plus Uber and Ola." }
  ],
  goodToKnow: [
    { title: "It's green, so it's alive", text: "Lots of trees means ants, spiders, birds and squirrels. The rooms are meshed. Please only book if you are comfortable with that.", spot: "spot-squirrel" },
    { title: "No early check-in", text: "Check-in is from [checkIn], check-out by [checkOut]. No exceptions.", spot: "spot-brass-key" },
    { title: "We live here too", text: "The family lives in the compound. It keeps things calm and safe, and we ask guests to keep it that way.", spot: "spot-copper-pod-tree" },
    { title: "15 steps to the Rooftop", text: "The Rooftop is up about 15 steps with no lift. The other spaces are at ground level.", spot: null },
    { title: "Parking inside the gate", text: "Look for the \"Bose Enclave\" sign on the blue gate. Park inside the compound.", spot: null },
    { title: "Rustic, not hotel", text: "These are old rooms in a family home. The Cottage in particular is basic. The photos show exactly what you get.", spot: "spot-teacup-swing" }
  ],
  faq: [
    { q: "Can we check in early?", a: "No, early check-in isn't possible. Check-in is from [checkIn]." },
    { q: "What time is check-out?", a: "By [checkOut]." },
    { q: "Is there parking?", a: "Yes, free, inside the compound. For the Retreat, the driveway can be used on request." },
    { q: "Is there wifi and somewhere to work?", a: "Yes. Every space has wifi and a dedicated workspace, according to the listings." },
    { q: "Can we cook?", a: "Yes. The Cottage, the Courtyard and the Retreat have kitchens. The Nook has a kitchenette and the Rooftop a small kitchen." },
    { q: "Which space works for a family?", a: "The Retreat sleeps four across two bedrooms, with its own garden and a full kitchen." },
    { q: "Are there insects?", a: "Yes. It's a compound full of trees. The rooms are meshed and usually free of them." },
    { q: "Are there stairs?", a: "Only to the Rooftop: about 15 steps, no lift." },
    { q: "Is it good for a long stay?", a: "Yes. Kitchens, wifi and quiet make longer stays easy. The Retreat in particular suits families for a week or more." },
    { q: "How far is the airport?", a: "The new interstate bus terminal is close by, and from there it takes about 45 minutes to the airport." },
    { q: "Does the family live on site?", a: "Yes. That's why it's calm, and why we ask guests to respect the quiet." },
    { q: "Can we bring pets?", a: "[pets]" },
    { q: "Is smoking allowed?", a: "[smoking]" },
    { q: "How do we find you?", a: "Look for the \"Bose Enclave\" sign on the blue gate. We send directions when you book." }
  ],
  houseRules: {
    title: "House rules",
    intro: "A short list, so everyone gets a calm stay.",
    items: [
      { label: "Check-in", value: "From [checkIn]. Early check-in isn't possible." },
      { label: "Check-out", value: "By [checkOut]." },
      { label: "Quiet", value: "The family lives here. Please keep the compound calm. Quiet hours: [quietHours]." },
      { label: "Smoking", value: "[smoking]" },
      { label: "Pets", value: "[pets]" },
      { label: "Parties", value: "[parties]" },
      { label: "Visitors", value: "[visitors]" }
    ]
  }
};
```

---

## 7. GENERATED HIGGSFIELD ASSETS (ready to use)

All files are in `/home/claude/site/generated/`. Credits spent: 42 of 60.22. Do not regenerate.

### Motion loops (H.264, muted, loop, autoplay, seamless)
| File | Use | Source photo |
|---|---|---|
| `loop-walkway.mp4` | Home hero — brick path, leaves swaying | `compound-driveway-garden-walkway-05.png` |
| `loop-rooftop.mp4` | Rooftop page hero — terrace swing swaying | `rooftop-garden-24.png` |
| `loop-courtyard.mp4` | Courtyard page hero — garden ferns moving | `courtyard-garden-08.png` |
| `loop-retreat.mp4` | Retreat page hero — walled garden plants | `retreat-garden-inner-courtyard-04.png` |

**Critical:** Video must degrade gracefully to a still photo if the browser can't decode. The `.ready` class approach: `v.addEventListener('playing', () => v.classList.add('ready'))` — only reveal the video on that event, keep `opacity:0` until then.

### Illustrated map
| File | Size | Notes |
|---|---|---|
| `compound-map.webp` | 1400×1046 | The **chosen** one — isometric, charming, brick paths in terracotta, all five spaces labelled |
| `map-2.png` | Full-res | Alternative — schematic, cleaner, also good |
| `compound-map.png` | 2400×1792 | Full-res of chosen map |

The map's building positions are **approximate**. Always label it as such. Hotspot approximate % positions (from image top-left) for each building in `compound-map.webp`:
- Courtyard: left 27%, top 21%
- Nook: left 49%, top 17%
- Retreat: left 74%, top 18%
- Cottage: left 21%, top 71%
- Rooftop: left 79%, top 57%

### Spot illustrations (navy line + terracotta/ochre accent on cream background)
| File | Subject | Use |
|---|---|---|
| `spot-teacup-swing.webp` | Teacup on garden swing | Rooftop page, "rustic not hotel" note |
| `spot-squirrel.webp` | Squirrel with nut | "It's green, so it's alive" section |
| `spot-brass-key.webp` | Ornate brass key | Check-in / no-early-check-in note |
| `spot-copper-pod-tree.webp` | Copper pod tree with pods | "We live here too" / Retreat garden |
| `spots-1.png` | All four in one sheet (2×2 grid) | Source / reference |

### Textures (seamless, 800×800)
| File | Description | Use |
|---|---|---|
| `texture-leaf.webp` | Interlocking brick-and-leaf pattern, terracotta/sage | Section dividers, background panels — low opacity |
| `texture-brass.webp` | Worn brass patina, warm golden-brown | Dark accent panels, footer accents |
| `brand-texture-red-oxide-01.png` | Red oxide floor texture | Brand texture reference |

---

## 8. WHAT TO BUILD — REQUIREMENTS

### Overall feel
Dark, atmospheric, editorial. Think: spread in a design-forward magazine about Bengaluru heritage. The property has real character — old wood, red oxide, ochre walls, a blue gate, dappled light through silver oaks. The website should feel like walking in.

### Technical requirements
- **Mobile-first.** Most visitors arrive from WhatsApp on a phone. The design must be stunning at 375px before desktop.
- **Single HTML file** OR a proper multi-page build Claude Code can serve — owner's preference is the shareable WhatsApp link, so if multi-page, also produce a `dist/index.html` that can be shared standalone.
- All images embedded as base64 or served from the same origin. No external image CDN for now.
- The 56 pre-selected WebP photos are in `web/selection.json` + `web/*.webp`. Reference via manifest always.
- **Font loading:** Google Fonts (Young Serif + Hanken Grotesk). Use `display=swap`.
- Under 16 MB total if single-file.

### Pages / sections (all required)
1. **Home** — hero (loop-walkway.mp4 over cover photo fallback), story, the five space cards, illustrated map with clickable hotspots, "which space suits you" helper, neighbourhood, good-to-know (with spot illustrations), FAQ
2. **Per-space pages** — The Cottage, The Courtyard, The Nook, The Retreat, The Rooftop. Each: full gallery by area (grouped tabs or scroll sections), key facts, story, amenities, honest notes, working booking panel
3. **House rules** — clean, readable

### The booking simulation (required, fully working)
- Calendar per space with sample booked dates
- Minimum nights cap, no same-day check-in
- Guest count capped to the space's maximum
- Price breakdown: nightly × nights, weekend rate, long-stay discount, cleaning fee, tax
- All prices show as "₹0 · To update" until real rates go in (they're in SETTINGS)
- Form with name, phone, email, optional note
- Validation with warm, specific error messages (not "field required")
- Review step, then confirmation with a reference number and "what happens next"
- Visible "Preview: no real bookings or payments" label throughout
- One clearly marked module so Lodgify widget can replace it later

### "To update" placeholder system
- Any `null` value in SETTINGS renders as a small dashed tag reading "To update"
- For prices: "₹0 · To update"
- A **Family view** toggle in the footer highlights all tags and opens a checklist of missing details grouped by space
- A **"Suggest a change" button** on every section that opens a comment/note box

### Image integrity (enforced by check_images.py)
- Every `<img>` and `<video>` must carry `data-img="{manifest_key}"`
- Every image must sit inside a `data-space="{space}"` wrapper matching its folder
- Generated assets need `data-kind="motion|illustration|texture"`
- Run `python3 tools/check_images.py . [output.html]` before any publish — it must PASS

### Copy linting
- Run `node tools/check_copy.js` against your content source — it must PASS
- No banned words, no emoji, no exclamation marks anywhere

### Accessibility
- Keyboard navigable gallery (lightbox with Escape, arrow keys, tab trap)
- All images have descriptive alt text
- `prefers-reduced-motion`: remove all transitions and autoplay
- Body text never below 17px (iOS zoom prevention)
- Colour contrast: every text pair must pass WCAG AA

---

## 9. DESIGN DIRECTION (what to actually build)

Here is the kind of visual language that fits:

**Home hero** — video loop (with still fallback) covering most of the viewport. Large serif headline overlaid. Location kicker in turmeric above it. Not full-bleed-card-on-white; dark, immersive, filmic.

**Space cards** — don't use a simple grid of identical cards. Consider: one large feature card (the Retreat, full width), two medium cards below it, two small ones. Or a horizontal scroll of tall portrait cards. Or stacked full-width strips that collapse into cards on mobile. Each card should feel like a different object, not a template.

**Story section** — editorial. Giant drop cap on the opening paragraph. One photo framed unexpectedly (offset, cropped at the edge, overlapping text). A pull quote in oversized Young Serif in oxide red.

**The illustrated map** — not a section with a header and text below. Feature it: full-width or close to it, the illustration large enough to read. Clickable hotspots visible on hover. Maybe the section is dark (gate-blue background) with the map light on it.

**Gallery on space pages** — masonry, not grid. Mix portrait and landscape naturally. Tap to open a lightbox. Areas as tab labels or anchor-jump menu above the gallery.

**Motion loops** — on four pages (home, Rooftop, Courtyard, Retreat). The still photo sits behind; video fades in only when it's actually playing. Pause button always visible when playing.

**Textures** — use them sparingly. A thin strip of `texture-brass.webp` at very low opacity behind the footer or FAQ section. `texture-leaf.webp` at 4–6% opacity as a page-section divider, never under body text.

**Spot illustrations** — inline, not boxed. The squirrel next to the insects note. The brass key next to check-in. The tree next to the "we live here" note. Sized like a generous icon (~80px), not a feature illustration.

**Per-space pages** — each space has its own accent colour, applied to: the underline on the h1, the booking button, the gallery tab indicators. The page should feel tinted without being costume-y.

---

## 10. OPEN QUESTIONS (decisions still needed from the owner)

These will be "To update" placeholders until answered:
1. **Check-in and check-out times** — not on the listings, couldn't get them
2. **House rules** — smoking, pets, parties, quiet hours, visitors policy
3. **Prices** — all set to ₹0
4. **Contact** — phone, WhatsApp, email
5. **Minimum nights** — per space
6. **Duplicate garden photo** — `cottage-garden-08.png` and `nook-garden-02.png` are the same shot. Which space does it belong to? Currently excluded from both.
7. **Retreat bedroom 2** — listing says "2 single beds" but photos look like one double pushed together. Confirm.
8. **The Rooftop listing** — Airbnb calls it a "private room in the bungalow", not a whole unit. Confirm how to describe it.
9. **Compound map accuracy** — building positions are approximate. Family needs to check and adjust hotspot positions.
10. **Family history** — who built it, when the first guests came — for the story section.
11. **Steps at ground-floor spaces** — are there any steps to enter the Cottage, Courtyard, Nook, Retreat?

---

## 11. HIGGSFIELD BUDGET REMAINING

Total: 60.22 credits. Spent: 42. **Remaining: 18.22 credits.**

Costs for reference:
- Seedance 2.0 Mini video, 720p, 5s: 5 credits
- Nano Banana Pro image, 2K: 2 credits
- Nano Banana 2 image (what actually ran): 1.5 credits
- Seedream 5 Lite image: 1 credit

Do not regenerate existing assets. If new Higgsfield generations are needed, price them first (use `get_cost: true`), state the cost before submitting, and stay within 18.22 credits total remaining.

The Higgsfield MCP server is connected: `https://mcp.higgsfield.ai/mcp`

---

## 12. PHASE 4 DELIVERABLES STILL TO PRODUCE

These weren't done before the owner asked to restart the design:
- GoDaddy-ready zip: full 235-photo galleries (all photos, not just the 56), separate HTML pages per space, `sitemap.xml`, `robots.txt`, `404.html`, LodgingBusiness JSON-LD schema, Open Graph tags, WhatsApp chat button, GA4 + Search Console placeholders
- Short guide: how to update a price, where Lodgify goes, how to upload to GoDaddy

---

## 13. CHECKS TO RUN BEFORE ANY PUBLISH

```bash
# Image integrity (must PASS)
python3 /home/claude/site/tools/check_images.py . [your-output.html]

# Copy linting (must PASS)
node /home/claude/site/tools/check_copy.js [path-to-content-file]

# Banned words in content
# No: nestled, hidden gem, oasis, elevate, curated, unwind and recharge, boasts,
#     tapestry, sanctuary, illness, hospital, luxury, only 1 left, hurry
# No: emoji anywhere, exclamation marks anywhere

# Accessibility
# - All images have alt text
# - Keyboard navigable
# - No horizontal scroll at 375px
# - prefers-reduced-motion respected
# - Body text >= 17px
```

---

*This document generated from the complete Claude.ai conversation, 27 Sep 2026. All photo data, copy, settings and Higgsfield asset details are verified against the actual files on disk.*
