/* =====================================================================
   BOSE HAUS · SETTINGS  (edit here, then run:  python tools/build.py)
   null  = unknown → shows as a dashed "To update" tag on the site
   0     = price placeholder → shows as "₹0 · To update"
   Keep the punctuation as it is: commas between items, quotes around text.
   ===================================================================== */
const SETTINGS = {
  brand: "Bose Haus",
  gateSign: "Bose Enclave",
  // Full web address once the domain is live, e.g. "https://www.bosehaus.in"
  siteUrl: null,
  contact: { phone: null, whatsapp: null, email: null },
  // Steps at Cottage, Courtyard, Nook, Retreat?
  stepsOther: null,
  // How guests pay after a request is confirmed
  paymentProcess: null,
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
    // The walk-in film (desktop): three lines that appear as you scroll up the driveway
    filmBand2: "A compound of old buildings and older trees.",
    filmBand3: "Five spaces in it are let to guests.",
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
  },

  /* ---- Interface wording (buttons, labels, messages). Checked by tools/check_copy.py ---- */
  ui: {
    toUpdate: "To update",
    nav: { home: "Home", spaces: "The spaces", compound: "The compound", rules: "House rules", book: "Check dates", menu: "Menu", close: "Close", skip: "Skip to the content" },
    heroKicker: "Bengaluru · between Lalbagh and NIMHANS",
    scrollCue: "Walk in",
    filmNote: "Moving picture made from our own photo of the driveway",
    filmLoading: "Opening the gate",
    filmOptIn: "Play the walk-in as you scroll",
    filmOptOut: "Turn the walk-in off",
    filmOptHint: "Your device asks for less motion, so this starts as a still photo.",
    pause: "Pause the moving picture",
    play: "Play the moving picture",
    storyKicker: "Since the 1960s",
    pullQuote: "We still live here.",
    storyCaption: "Red oxide floor, the Retreat living room",
    spacesKicker: "Five doors",
    spacesTitle: "Five spaces, one compound",
    spacesIntro: "Each one is furnished differently, and each has its own quirks. Largest first.",
    sleeps: "Sleeps",
    bedrooms: "Bedrooms",
    beds: "Beds",
    baths: "Bathrooms",
    rating: "Airbnb rating",
    reviews: "reviews",
    ratingNote: "Ratings from Airbnb, as of",
    look: "Look inside",
    mapKicker: "The lay of the land",
    mapTitle: "Where everything is",
    mapIntro: "A brick path runs from the blue gate through the trees, and the five spaces sit off it. Tap a building.",
    mapNote: "Drawn by hand. Building positions are approximate.",
    gateTitle: "Look for the blue gate",
    gateText: "The sign on it says",
    helperKicker: "Which space suits you",
    helperTitle: "Tell us who is coming",
    helperIntro: "Pick what matters and the list sorts itself. Nothing is sent anywhere.",
    helperWho: "How many of you?",
    helperWhoSmall: "1 or 2",
    helperWhoLarge: "3 or 4",
    helperWant: "What matters most?",
    helperGood: "Good fit",
    helperOk: "Could work",
    helperNo: "Not this time",
    helperTooSmall: "Sleeps two.",
    helperStairs: "About 15 steps up, no lift.",
    helperEmpty: "Pick one or two things above and the spaces sort themselves.",
    traits: {
      garden: "A garden of our own",
      kitchen: "A full kitchen",
      nostairs: "No stairs",
      sitting: "Room to sit apart from the bed",
      terrace: "A terrace",
      rustic: "Rustic is fine",
      long: "A long stay"
    },
    neighbourhoodKicker: "Around the corner",
    neighbourhoodTitle: "The neighbourhood",
    goodKicker: "Straight talk",
    goodTitle: "Good to know before you book",
    faqKicker: "Asked often",
    faqTitle: "Questions people ask",
    rulesLink: "Read the house rules",
    footerLine: "Five stays in a 1960s family compound. The family lives here too.",
    contact: "Contact",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    chat: "Message us on WhatsApp",
    airbnbLinks: "The listings on Airbnb",
    familyView: "Family view",
    familyTitle: "Details still to fill in",
    familyIntro: "Each item below shows as a dashed tag on the site. Fill it in src/content.js and run the build again.",
    familyNotes: "Suggested changes saved on this device",
    familyNoNotes: "No suggestions yet. Use the small pencil button on any section.",
    familyCopy: "Copy all notes",
    familyCopied: "Copied",
    familyClear: "Clear notes",
    familyGeneral: "Whole site",
    familyQuestionsTitle: "Questions only the family can answer",
    familyQuestions: [
      "Which space does the garden photo shared by the Cottage and the Nook belong to? It is hidden on both pages until then.",
      "Retreat bedroom 2: the listing says 2 single beds, the photos look like one double. Which is right?",
      "The Rooftop: Airbnb calls it a private room in the bungalow. How should we describe it?",
      "The map dots are approximate. Do any sit on the wrong building?",
      "The family history: who built it, and when did the first guests come?",
      "Are there any steps into the Cottage, the Courtyard, the Nook or the Retreat?"
    ],
    suggest: "Suggest a change",
    suggestHelp: "Write what should change in this section. It is kept on this device only, and listed in Family view.",
    suggestSave: "Save note",
    suggestCancel: "Cancel",
    suggestSaved: "Saved. It is listed in Family view.",
    storyHeading: "The story",
    photosHeading: "Photos",
    photosAll: "All",
    amenitiesHeading: "What's there",
    notesHeading: "Before you book",
    onAirbnb: "See the listing on Airbnb",
    nextDoor: "Next door",
    backHome: "All five spaces",
    lightboxClose: "Close photo",
    lightboxPrev: "Previous photo",
    lightboxNext: "Next photo",
    lightboxOf: "of",
    notFoundTitle: "This path doesn't lead anywhere",
    notFoundText: "The page you were looking for isn't here. The gate is this way.",
    notFoundCta: "Back to the gate",
    areas: {
      "bedroom": "Bedroom", "bedroom-1": "Bedroom 1", "bedroom-2": "Bedroom 2",
      "bedroom-livingspace": "Bedroom and living space", "living-space": "Sitting room",
      "livingroom": "Living room", "kitchen": "Kitchen", "bathroom": "Bathroom",
      "dressing-room-bathroom": "Dressing room and bathroom", "garden": "Garden",
      "garden-inner-courtyard": "Walled garden", "driveway-garden-walkway": "Driveway and garden"
    },
    booking: {
      title: "Ask for these dates",
      intro: "Pick dates, tell us who you are, and send a request. The family confirms it by message.",
      steps: ["Dates", "Details", "Review", "Sent"],
      checkIn: "Check-in",
      checkOut: "Check-out",
      pickIn: "Pick a check-in date",
      pickOut: "Now pick a check-out date",
      clear: "Clear dates",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      legendFree: "Free",
      legendBooked: "Taken",
      legendPicked: "Your stay",
      guests: "Guests",
      fewer: "One fewer guest",
      more: "One more guest",
      nights: "nights",
      night: "night",
      perNight: "a night",
      weeknights: "Weeknights",
      weekendNights: "Friday and Saturday nights",
      longStay: "Long-stay discount",
      cleaning: "Cleaning",
      tax: "Tax",
      total: "Total",
      minStay: "Minimum stay",
      continue: "Continue",
      back: "Back",
      name: "Your name",
      phone: "Phone",
      phoneHint: "With country code if you're outside India",
      email: "Email",
      note: "Anything we should know",
      noteHint: "Optional. Arrival time, a question, who is coming.",
      reviewTitle: "Check everything once more",
      send: "Send request",
      edit: "Change something",
      sentTitle: "Request sent (preview)",
      reference: "Your reference",
      nextTitle: "What happens next",
      next1: "The family reads your request and replies to confirm the dates.",
      next2: "Payment:",
      next3: "On the day, check in from",
      next4: "Look for the \"Bose Enclave\" sign on the blue gate and park inside.",
      another: "Start again",
      errNoDates: "Pick a check-in and a check-out date on the calendar first.",
      errSameDay: "Same-day check-in isn't possible. The earliest check-in is tomorrow.",
      errBooked: "Someone is already staying on {date}. Try dates either side of it.",
      errMin: "This space needs at least {n} nights. Pick a later check-out.",
      errGuests: "{space} sleeps {n}. For a bigger group, the Retreat sleeps four.",
      errGuestsLargest: "{space} sleeps {n}, the most of the five spaces.",
      errName: "What should we call you? Please add your name.",
      errPhone: "That number looks too short. Please give the full number, with country code if you're outside India.",
      errEmail: "That email address is missing something. Check the @ and the part after it.",
      errSummary: "A couple of things need a look before we can go on."
    }
  }
};

/* =====================================================================
   MEDIA · which photo goes where. Keys come from image-manifest.json.
   Every photo key must belong to the space it is listed under.
   ===================================================================== */
const MEDIA = {
  covers: {
    compound: "compound-driveway-garden-walkway-05",
    cottage: "cottage-bedroom-01",
    courtyard: "courtyard-bedroom-06",
    nook: "nook-bedroom-05",
    retreat: "retreat-bedroom-2-02",
    rooftop: "rooftop-bedroom-livingspace-10"
  },
  // Motion loops sit over a still photo of the same view
  loops: {
    home:      { video: "loop-walkway",   poster: "compound-driveway-garden-walkway-05", space: "compound" },
    courtyard: { video: "loop-courtyard", poster: "courtyard-garden-08", space: "courtyard" },
    retreat:   { video: "loop-retreat",   poster: "retreat-garden-inner-courtyard-06", space: "retreat" },
    rooftop:   { video: "loop-rooftop",   poster: "rooftop-garden-24", space: "rooftop" }
  },
  // Gallery order by area
  areaOrder: {
    compound: ["driveway-garden-walkway"],
    cottage: ["bedroom", "dressing-room-bathroom", "kitchen", "garden"],
    courtyard: ["bedroom", "living-space", "kitchen", "bathroom", "garden"],
    nook: ["bedroom", "kitchen", "bathroom", "garden"],
    retreat: ["bedroom-1", "bedroom-2", "livingroom", "kitchen", "bathroom", "garden-inner-courtyard"],
    rooftop: ["bedroom-livingspace", "bathroom", "kitchen", "garden"]
  },
  // A short pick per space: card hover, the photo strip, and the one-file share version
  featured: {
    compound: ["compound-driveway-garden-walkway-05", "compound-driveway-garden-walkway-07", "compound-driveway-garden-walkway-02", "compound-driveway-garden-walkway-03", "compound-driveway-garden-walkway-12", "compound-driveway-garden-walkway-14"],
    cottage: ["cottage-bedroom-01", "cottage-bedroom-05", "cottage-bedroom-06", "cottage-dressing-room-bathroom-01", "cottage-dressing-room-bathroom-02", "cottage-kitchen-01", "cottage-kitchen-04", "cottage-kitchen-07", "cottage-garden-01", "cottage-garden-02", "cottage-garden-06"],
    courtyard: ["courtyard-bedroom-06", "courtyard-bedroom-12", "courtyard-bedroom-02", "courtyard-living-space-03", "courtyard-living-space-07", "courtyard-kitchen-04", "courtyard-kitchen-08", "courtyard-bathroom-02", "courtyard-bathroom-07", "courtyard-garden-08", "courtyard-garden-10", "courtyard-garden-15"],
    nook: ["nook-bedroom-05", "nook-bedroom-10", "nook-bedroom-11", "nook-bedroom-02", "nook-bedroom-03", "nook-kitchen-02", "nook-kitchen-01", "nook-bathroom-01", "nook-garden-01"],
    retreat: ["retreat-bedroom-2-02", "retreat-bedroom-1-05", "retreat-bedroom-1-06", "retreat-bedroom-2-07", "retreat-livingroom-05", "retreat-livingroom-01", "retreat-kitchen-01", "retreat-kitchen-03", "retreat-bathroom-01", "retreat-garden-inner-courtyard-06", "retreat-garden-inner-courtyard-13"],
    rooftop: ["rooftop-bedroom-livingspace-10", "rooftop-bedroom-livingspace-02", "rooftop-bedroom-livingspace-04", "rooftop-bedroom-livingspace-06", "rooftop-bathroom-01", "rooftop-bathroom-05", "rooftop-kitchen-01", "rooftop-kitchen-05", "rooftop-garden-24", "rooftop-garden-19", "rooftop-garden-09", "rooftop-garden-17"]
  },
  storyPhoto: "retreat-livingroom-01",
  gatePhoto: "compound-driveway-garden-walkway-07",
  // Approximate positions on the illustrated map, in % from its top-left corner.
  // The family should check these and nudge them if a dot sits on the wrong building.
  mapHotspots: {
    courtyard: { left: 27, top: 21 },
    nook:      { left: 49, top: 17 },
    retreat:   { left: 74, top: 18 },
    cottage:   { left: 21, top: 71 },
    rooftop:   { left: 79, top: 57 }
  },
  // Accent colour per space: heading underline, booking button, gallery tabs
  accents: { cottage: "#5E2B19", courtyard: "#8A6424", nook: "#17224C", retreat: "#4B5729", rooftop: "#30405E" },
  // Which space fits which need (used by "Which space suits you")
  traits: {
    cottage:   { garden: "A small garden with chairs under the trees.", kitchen: "Its own kitchen.", nostairs: "At ground level.", rustic: "The most rustic of the five." },
    courtyard: { garden: "A brick-paved garden full of pots.", kitchen: "A kitchen with leaf-patterned tiles.", nostairs: "At ground level.", sitting: "A separate sitting room.", long: "A sitting room and kitchen make a longer stay easy." },
    nook:      { garden: "A small private garden and its own entrance.", nostairs: "At ground level.", rustic: "One big room, simple and green." },
    retreat:   { garden: "A walled garden only Retreat guests use.", kitchen: "A full kitchen.", nostairs: "At ground level.", sitting: "A living room with a dining table.", long: "Families stay here for a week or more.", rustic: "Old 1960s rooms, lived in." },
    rooftop:   { terrace: "A private terrace with a swing.", sitting: "One large room with antique chairs and a table." }
  },
  // Descriptive alt text. Photos not listed here get "<space>, <area>, photo n of m".
  alt: {
    "compound-driveway-garden-walkway-02": "The blue front gate with the Bose Enclave sign, seen from the brick driveway",
    "compound-driveway-garden-walkway-03": "A slatted blue garden bench among ferns and tree trunks",
    "compound-driveway-garden-walkway-05": "A brick path with a diamond pattern runs under tall trees in dappled light",
    "compound-driveway-garden-walkway-07": "The blue metal gate from inside the compound, with the brick driveway in front",
    "compound-driveway-garden-walkway-12": "A narrow brick path edged in red runs past a white wall and climbing plants",
    "compound-driveway-garden-walkway-14": "Palms and trees above a white wall with a patterned blue grille",
    "cottage-bedroom-01": "The Cottage bedroom under a sloping tiled roof, with a turmeric-yellow wall and red floor",
    "cottage-bedroom-05": "The Cottage bedroom with an iron bed, a rug and wooden roof beams",
    "cottage-bedroom-06": "A small table and wicker chairs by the Cottage windows",
    "cottage-dressing-room-bathroom-01": "A yellow-walled passage with a red runner leading to the Cottage bathroom",
    "cottage-dressing-room-bathroom-02": "The Cottage bathroom with a basin, mirror and water heater",
    "cottage-kitchen-01": "The Cottage kitchen with a yellow wall, a small table and a red floor",
    "cottage-kitchen-04": "Black and white tiled counter and an arched doorway in the Cottage kitchen",
    "cottage-kitchen-07": "Looking through an arched doorway into the Cottage kitchen",
    "cottage-garden-01": "The Cottage garden: stepping stones, plants and trees",
    "cottage-garden-02": "A turmeric wall with red chairs and potted plants outside the Cottage",
    "cottage-garden-06": "Brick planters and red chairs on the Cottage patio",
    "courtyard-bedroom-06": "The Courtyard bedroom: carved wooden beds under a long painted panel, ochre walls",
    "courtyard-bedroom-12": "Leaf-print cushions on the Courtyard bed below the painted panel",
    "courtyard-bedroom-02": "The Courtyard bedroom with a lamp-lit corner and terracotta floor",
    "courtyard-living-space-03": "The Courtyard sitting room with wooden armchairs, a round lamp and a patterned rug",
    "courtyard-living-space-07": "Wooden armchairs and a low table in the Courtyard sitting room",
    "courtyard-kitchen-04": "The long Courtyard kitchen with a black counter and a skylight",
    "courtyard-kitchen-08": "Leaf-patterned tiles and a white jali window above the Courtyard stove",
    "courtyard-bathroom-02": "A round mirror and a stone basin against palm-leaf tiles in the Courtyard bathroom",
    "courtyard-bathroom-07": "Palm-leaf tiles in the Courtyard shower",
    "courtyard-garden-08": "The Courtyard garden: white walls, a lantern and pots of ferns and palms on brick",
    "courtyard-garden-10": "A red planter overflowing with ferns in the Courtyard garden",
    "courtyard-garden-15": "A doorway from the Courtyard garden into a leafy passage",
    "nook-bedroom-05": "The Nook: one long room with a bed, a rug and a dining table at the far end",
    "nook-bedroom-10": "The Nook bed with red cushions below blue-framed windows",
    "nook-bedroom-11": "The Nook doorway with a hanging textile above it",
    "nook-bedroom-02": "A bare brick wall with a bookshelf above it in the Nook",
    "nook-bedroom-03": "Peach-coloured alcove shelves with small paintings in the Nook",
    "nook-kitchen-02": "A small dining table for two against a terracotta wall in the Nook",
    "nook-kitchen-01": "The Nook kitchenette beside the exposed brick wall",
    "nook-bathroom-01": "The Nook bathroom with a basin and blue door",
    "nook-garden-01": "The Nook garden: a lawn and stepping stones under a tree",
    "retreat-bedroom-2-02": "Retreat bedroom 2: a bed with red cushions on a chequered rug, red oxide floor",
    "retreat-bedroom-1-05": "Retreat bedroom 1: an iron bed below a painting, red oxide floor",
    "retreat-bedroom-1-06": "Retreat bedroom 1 under a wooden roof, with a desk and an orange lamp",
    "retreat-bedroom-2-07": "Retreat bedroom 2 with windows on two sides and a patchwork rug",
    "retreat-livingroom-05": "The Retreat living room: a sofa with an elephant-print throw and a blue armchair",
    "retreat-livingroom-01": "The Retreat living room, looking across the red oxide floor to the dining table",
    "retreat-kitchen-01": "The Retreat kitchen: peach walls, blue tiles and open shelves",
    "retreat-kitchen-03": "Blue alcove shelves with jars and cups in the Retreat kitchen",
    "retreat-bathroom-01": "The Retreat bathroom with a blue wall and patterned floor tiles",
    "retreat-garden-inner-courtyard-06": "The Retreat walled garden with a wooden bench, plants and a white wall",
    "retreat-garden-inner-courtyard-13": "A white bench under hanging plants in the Retreat garden at night",
    "rooftop-bedroom-livingspace-10": "The Rooftop: one large room under a peaked wooden roof, with antique furniture and tall windows",
    "rooftop-bedroom-livingspace-02": "The Rooftop bed against a deep blue wall under the sloping roof",
    "rooftop-bedroom-livingspace-04": "A dining table and a planter's chair by the Rooftop windows",
    "rooftop-bedroom-livingspace-06": "An antique planter's chair by a curtained window in the Rooftop",
    "rooftop-bathroom-01": "The large Rooftop bathroom with indigo walls, a glass shower and a wooden vanity",
    "rooftop-bathroom-05": "A round mirror over a wooden vanity in the indigo Rooftop bathroom",
    "rooftop-kitchen-01": "The tiny Rooftop kitchen with patterned tiles and wooden shelves",
    "rooftop-kitchen-05": "Tea, sugar and coffee jars on a shelf in the Rooftop kitchen",
    "rooftop-garden-24": "The wooden swing on the Rooftop terrace, with trees beyond the wall",
    "rooftop-garden-19": "Chairs and a table on the red Rooftop terrace under tall trees",
    "rooftop-garden-09": "The Rooftop cabin and its red-floored terrace",
    "rooftop-garden-17": "The steps up to the Rooftop, about fifteen of them"
  }
};
