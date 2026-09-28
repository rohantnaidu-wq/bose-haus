"""Build the Bose Haus site into dist/ from src/content.js and image-manifest.json.

Usage:  python tools/build.py
Then:   python tools/check_images.py . dist/*.html
        python tools/check_copy.py src/content.js dist/*.html

Every page is pre-rendered to plain HTML. JavaScript only adds the moving parts:
the walk-in film, lightbox, space finder, booking simulation, Family view.
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import bh  # noqa: E402

C = bh.read_content()
S, T, M = C["SETTINGS"], C["COPY"], C["MEDIA"]
U = T["ui"]
MAN = bh.read_manifest()
P, G, HELD = MAN["photos"], MAN["generated"], MAN.get("held", {})
DIST = bh.ROOT / "dist"
SPACES = bh.SPACES
FONTS = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Young+Serif&display=swap"


def _stamp(*paths):
    """Short content hash for cache-busting ?v= on CSS and JS links."""
    import hashlib
    h = hashlib.sha1()
    for p in paths:
        h.update((bh.ROOT / p).read_bytes())
    return h.hexdigest()[:8]


V = {"css": _stamp("src/css/site.css"), "content.js": _stamp("src/content.js"),
     "site.js": _stamp("src/js/site.js"), "booking.js": _stamp("src/js/booking.js")}


def e(s):
    return html.escape(str(s), quote=True)


def tbu(what=""):
    """Dashed 'To update' tag. `what` names the missing detail for Family view."""
    return f'<span class="tbu" data-tbu="{e(what)}">{e(U["toUpdate"])}</span>'


def money(n, what):
    if n:
        return f'{e(S["currency"])}{n:,}'
    return f'<span class="tbu tbu-price" data-tbu="{e(what)}">{e(S["currency"])}0 · {e(U["toUpdate"])}</span>'


PLACEHOLDERS = {
    "checkIn": (lambda: S["times"]["checkIn"], "Check-in time"),
    "checkOut": (lambda: S["times"]["checkOut"], "Check-out time"),
    "quietHours": (lambda: S["houseRules"]["quietHours"], "Quiet hours"),
    "smoking": (lambda: S["houseRules"]["smoking"], "Smoking rule"),
    "pets": (lambda: S["houseRules"]["pets"], "Pets rule"),
    "parties": (lambda: S["houseRules"]["parties"], "Parties rule"),
    "visitors": (lambda: S["houseRules"]["visitors"], "Visitors rule"),
}


def fill(text):
    """Escape copy and swap [checkIn]-style placeholders for values or To update tags."""
    def sub(m):
        get, label = PLACEHOLDERS[m.group(1)]
        v = get()
        return e(v) if v else tbu(label)
    return re.sub(r"\[(\w+)\]", sub, e(text))


def val(v, what):
    return e(v) if v not in (None, "") else tbu(what)


def alt_for(key):
    if key in M["alt"]:
        return M["alt"][key]
    p = P[key]
    name = T["spaces"][p["space"]]["name"] if p["space"] in T["spaces"] else "The compound"
    same = [k for k in gallery_keys(p["space"]) if P[k]["area"] == p["area"]]
    n = same.index(key) + 1 if key in same else 1
    return f'{name}, {U["areas"].get(p["area"], p["area"]).lower()}, photo {n} of {len(same)}'


def img(key, cls="", eager=False, sizes=None, extra=""):
    """A manifest photo. The caller wraps it in a data-space element (check_images.py enforces it)."""
    p = P[key]
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="assets/{p["web"]}" width="{p["width"]}" height="{p["height"]}" '
            f'alt="{e(alt_for(key))}" data-img="{key}" {load} decoding="async"'
            f'{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}{f" {extra}" if extra else ""}>')


def gen_img(key, alt="", cls="", eager=False):
    g = G[key]
    size = f' width="{g["width"]}" height="{g["height"]}"' if "width" in g else ""
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    aria = ' aria-hidden="true"' if not alt else ""
    return (f'<img src="assets/{g["file"]}"{size} alt="{e(alt)}" data-img="{key}" data-kind="{g["kind"]}"'
            f' {load} decoding="async"{aria}{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}>')


def gallery_keys(space):
    order = M["areaOrder"][space]
    keys = [k for k, p in P.items() if p["space"] == space and k not in HELD]
    return sorted(keys, key=lambda k: (order.index(P[k]["area"]) if P[k]["area"] in order else 99, k))


def suggest_btn(section):
    return (f'<button class="suggest" type="button" data-section="{e(section)}" '
            f'aria-label="{e(U["suggest"])}: {e(section)}" title="{e(U["suggest"])}">'
            f'{icon("pencil")}</button>')

ICONS = {
    "pencil": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    "kitchen": '<path d="M4 11h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M2 11h20M9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5"/>',
    "wifi": '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    "desk": '<path d="M3 9h18M5 9v11M19 9v11M5 14h14"/><path d="M8 9V5h5v4"/>',
    "car": '<path d="M4 16V11l2-5h12l2 5v5z"/><path d="M4 11h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>',
    "tv": '<rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8M12 17v4"/>',
    "leaf": '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-7 10-9"/>',
    "key": '<circle cx="7.5" cy="12" r="3.5"/><path d="M11 12h10M17 12v3M20 12v2"/>',
    "door": '<path d="M6 21V5a7 7 0 0 1 12 0v16"/><path d="M3 21h18"/><circle cx="14.5" cy="13" r=".8"/>',
    "swing": '<path d="M4 3h16M7 3v10M17 3v10"/><path d="M5 13h14l-1 3H6z"/>',
    "star": '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
    "arrow": '<path d="M4 12h16M14 6l6 6-6 6"/>',
    "close": '<path d="M5 5l14 14M19 5L5 19"/>',
    "left": '<path d="M15 5l-7 7 7 7"/>',
    "right": '<path d="M9 5l7 7-7 7"/>',
    "pause": '<path d="M8 5v14M16 5v14"/>',
    "play": '<path d="M7 4l13 8-13 8z"/>',
    "menu": '<path d="M3 7h18M3 12h18M3 17h12"/>',
    "chat": '<path d="M4 19l1.5-4A8 8 0 1 1 9 18.5z"/>',
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>',
    "check": '<path d="M4 12l5 5L20 6"/>',
    "minus": '<path d="M5 12h14"/>',
    "plus": '<path d="M5 12h14M12 5v14"/>',
    "steps": '<path d="M3 20h5v-4h4v-4h4V8h5"/>',
    "bug": '<path d="M9 7a3 3 0 0 1 6 0M8 9h8v5a4 4 0 0 1-8 0zM4 13h4M16 13h4M5 8l3 2M19 8l-3 2M5 19l3-2M19 19l-3-2"/>',
    "home": '<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    "bed": '<path d="M3 19V6M3 13h18v6M21 13a3 3 0 0 0-3-3h-8v3"/><circle cx="6.5" cy="10.5" r="1.5"/>',
    "bath": '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/>',
}


def icon(name, cls="ic"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" '
            f'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')


def amenity_icon(text):
    t = text.lower()
    for words, name in [(("kitchen",), "kitchen"), (("wifi",), "wifi"), (("workspace",), "desk"),
                        (("parking",), "car"), (("tv",), "tv"), (("terrace", "swing"), "swing"),
                        (("garden",), "leaf"), (("check-in",), "key"), (("entrance",), "door")]:
        if any(w in t for w in words):
            return icon(name)
    return icon("check")


def rating_html(space):
    s = S["spaces"][space]
    return (f'<span class="rating">{icon("star", "ic ic-star")}<b>{s["rating"]:.2f}</b>'
            f'<span> · {s["reviews"]} {e(U["reviews"])}</span></span>')


def link(page):
    return "index.html" if page == "home" else f"{page}.html"

FAVICON = ("data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
           "%3Crect width='32' height='32' rx='6' fill='%2317224C'/%3E"
           "%3Cpath d='M9 27V15a7 7 0 0 1 14 0v12' fill='none' stroke='%23C9A05A' stroke-width='3'/%3E%3C/svg%3E")


def head(page, title, desc, og_key=None, extra=""):
    url = (S["siteUrl"] or "").rstrip("/")
    path = "" if page == "home" else f"{page}.html"
    og = f'assets/{P[og_key]["web"]}' if og_key else ""
    canon = f'<link rel="canonical" href="{e(url)}/{path}">' if url else ""
    og_abs = f"{url}/{og}" if url else og
    sc = S["analytics"]["searchConsole"]
    ga = S["analytics"]["ga4"]
    ga_tag = (f'<script async src="https://www.googletagmanager.com/gtag/js?id={e(ga)}"></script>'
              f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}'
              f'gtag("js",new Date());gtag("config","{e(ga)}");</script>') if ga else ""
    return f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#0E1433">
<script>document.documentElement.classList.add('js')</script>
{canon}
<!-- DEPLOY STEP: og:url and og:image become absolute once SETTINGS.siteUrl is filled in -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="{e(S["brand"])}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(url)}/{path}">
<meta property="og:image" content="{e(og_abs)}">
<meta name="twitter:card" content="summary_large_image">
{f'<meta name="google-site-verification" content="{e(sc)}">' if sc else ""}
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="assets/css/site.css?v={V["css"]}">
{extra}
{ga_tag}
</head>
"""


def header(page):
    book = "#book" if page in SPACES else "index.html#spaces"
    home = "" if page == "home" else "index.html"
    return f"""<a class="skip" href="#main">{e(U["nav"]["skip"])}</a>
<header class="nav" data-nav>
  <a class="brand" href="index.html" aria-label="{e(S["brand"])}, {e(U["nav"]["home"])}">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 29V15a8 8 0 0 1 16 0v14" /></svg>
    <span>{e(S["brand"])}</span>
  </a>
  <nav aria-label="Main">
    <ul class="nav-links">
      <li><a href="{home}#spaces">{e(U["nav"]["spaces"])}</a></li>
      <li><a href="{home}#compound">{e(U["nav"]["compound"])}</a></li>
      <li><a href="house-rules.html"{" aria-current=page" if page == "house-rules" else ""}>{e(U["nav"]["rules"])}</a></li>
    </ul>
  </nav>
  <a class="btn btn-nav" href="{book}">{e(U["nav"]["book"])}</a>
  <button class="nav-menu" type="button" aria-expanded="false" aria-controls="drawer">{icon("menu")}<span class="sr">{e(U["nav"]["menu"])}</span></button>
</header>
<p class="preview-label" role="note">{e(T["site"]["previewLabel"])}</p>
"""


def drawer(page):
    """Mobile menu, emitted at the end of the page so its thumbnails never compete with the hero."""
    items = "".join(
        f'<li data-space="{s}"><a href="{link(s)}"{" aria-current=page" if s == page else ""}>'
        f'{img(M["covers"][s])}<span>{e(T["spaces"][s]["name"])}</span>'
        f'<small>{e(U["sleeps"])} {S["spaces"][s]["guests"]}</small></a></li>'
        for s in SPACES)
    home = "" if page == "home" else "index.html"
    return f"""<div class="drawer" id="drawer" hidden>
  <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="{e(U["nav"]["menu"])}">
    <button class="drawer-close" type="button">{icon("close")}<span class="sr">{e(U["nav"]["close"])}</span></button>
    <p class="kicker">{e(U["spacesKicker"])}</p>
    <ul class="drawer-spaces">{items}</ul>
    <ul class="drawer-links">
      <li><a href="{home}#compound">{e(U["nav"]["compound"])}</a></li>
      <li><a href="house-rules.html">{e(U["nav"]["rules"])}</a></li>
    </ul>
  </div>
</div>
"""

def contact_row(kind, value, href):
    what = "Email address" if kind == "email" else U[kind] + " number"
    body = f'<a href="{e(href)}">{e(value)}</a>' if value else tbu(what)
    return f'<li>{icon({"phone": "phone", "whatsapp": "chat", "email": "mail"}[kind])}<span>{e(U[kind])}</span>{body}</li>'


def footer(page, scripts=()):
    c = S["contact"]
    wa = re.sub(r"\D", "", c["whatsapp"] or "")
    airbnb = "".join(f'<li><a href="{e(S["spaces"][s]["airbnb"])}" rel="noopener" target="_blank">{e(T["spaces"][s]["name"])}</a></li>'
                     for s in SPACES)
    chat = (f'<a class="chat-fab" href="https://wa.me/{wa}" rel="noopener" target="_blank">{icon("chat")}'
            f'<span>{e(U["chat"])}</span></a>') if wa else ""
    js = "".join(f'<script src="assets/js/{s}?v={V[s]}" defer></script>' for s in ("content.js", "site.js", *scripts))
    return drawer(page) + f"""<footer class="foot" data-kind="texture">
  <div class="foot-grain" aria-hidden="true"></div>
  <div class="foot-inner wrap">
    <div class="foot-brand">
      <p class="foot-mark">{e(S["brand"])}</p>
      <p>{e(U["footerLine"])}</p>
      <p class="foot-gate">{e(U["gateText"])} <b>{e(S["gateSign"])}</b></p>
    </div>
    <div>
      <h2 class="foot-h">{e(U["contact"])}</h2>
      <ul class="foot-contact">
        {contact_row("phone", c["phone"], f'tel:{c["phone"]}')}
        {contact_row("whatsapp", c["whatsapp"], f"https://wa.me/{wa}")}
        {contact_row("email", c["email"], f'mailto:{c["email"]}')}
      </ul>
    </div>
    <div>
      <h2 class="foot-h">{e(U["airbnbLinks"])}</h2>
      <ul class="foot-links">{airbnb}</ul>
    </div>
    <div>
      <h2 class="foot-h">{e(S["brand"])}</h2>
      <ul class="foot-links">
        <li><a href="index.html#spaces">{e(U["nav"]["spaces"])}</a></li>
        <li><a href="house-rules.html">{e(U["nav"]["rules"])}</a></li>
      </ul>
      <button class="family-toggle" type="button" aria-pressed="false" aria-controls="family">{icon("home")}{e(U["familyView"])}</button>
    </div>
  </div>
  <p class="foot-note wrap">{e(U["ratingNote"])} {e(S["ratingsAsOf"])}. {e(T["site"]["previewLabel"])}.</p>
</footer>
{chat}
<aside class="family" id="family" hidden aria-label="{e(U["familyView"])}">
  <div class="family-head">
    <h2>{e(U["familyTitle"])}</h2>
    <button class="family-close" type="button">{icon("close")}<span class="sr">{e(U["nav"]["close"])}</span></button>
  </div>
  <p class="family-intro">{e(U["familyIntro"])}</p>
  <div class="family-list" data-family-list></div>
  <h3>{e(U["familyNotes"])}</h3>
  <div class="family-notes" data-family-notes><p>{e(U["familyNoNotes"])}</p></div>
  <div class="family-actions">
    <button class="btn btn-small" type="button" data-copy-notes>{e(U["familyCopy"])}</button>
    <button class="btn btn-small btn-ghost" type="button" data-clear-notes>{e(U["familyClear"])}</button>
  </div>
</aside>
<dialog class="suggest-dialog" aria-labelledby="suggest-title">
  <form method="dialog">
    <h2 id="suggest-title">{e(U["suggest"])}: <span data-suggest-section></span></h2>
    <label for="suggest-text">{e(U["suggestHelp"])}</label>
    <textarea id="suggest-text" rows="5"></textarea>
    <div class="dialog-actions">
      <button class="btn btn-ghost" value="cancel" type="submit">{e(U["suggestCancel"])}</button>
      <button class="btn" value="save" type="submit">{e(U["suggestSave"])}</button>
    </div>
  </form>
</dialog>
<p class="toast" role="status" aria-live="polite"></p>
<dialog class="lightbox" aria-label="{e(U["photosHeading"])}">
  <figure class="lb-stage"><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure>
  <button class="lb-btn lb-prev" type="button">{icon("left")}<span class="sr">{e(U["lightboxPrev"])}</span></button>
  <button class="lb-btn lb-next" type="button">{icon("right")}<span class="sr">{e(U["lightboxNext"])}</span></button>
  <button class="lb-btn lb-close" type="button">{icon("close")}<span class="sr">{e(U["lightboxClose"])}</span></button>
  <p class="lb-count" data-lb-count></p>
</dialog>
{js}
</body>
</html>
"""

def film_hero():
    h = T["home"]
    film, start = G["film-walk-in"], G["film-walk-in-start"]
    loop = G["loop-walkway"]
    return f"""<section class="film" id="top" data-film data-film-src="assets/{film["file"]}" aria-labelledby="hero-title">
  <div class="film-stage">
    <div class="film-media" data-kind="motion" aria-hidden="true">
      <div class="film-static" data-space="compound">
        {img(M["covers"]["compound"], "film-still", eager=True)}
        <img class="film-still-wide" alt="" data-img="film-walk-in-start" data-kind="motion" loading="lazy" decoding="async"
          src="assets/{start["file"]}" width="{start["width"]}" height="{start["height"]}">
        <video class="film-loop" muted loop playsinline preload="none" tabindex="-1"
          data-img="loop-walkway" data-kind="motion" data-src="assets/{loop["file"]}"></video>
      </div>
      <img class="film-poster" alt="" data-img="film-walk-in-start" data-kind="motion"
        data-src="assets/{start["file"]}" width="{start["width"]}" height="{start["height"]}">
      <canvas class="film-canvas"></canvas>
      <div class="scrim"></div>
    </div>
    <div class="film-ring" aria-hidden="true">
      <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" /></svg>
      <span>{e(U["filmLoading"])}</span>
    </div>
    <div class="band band-1" data-band="0,0.3">
      <p class="kicker chip">{e(U["heroKicker"])}</p>
      <h1 id="hero-title" class="band-title" data-split>{e(h["heroLine"])}</h1>
      <a class="cue" href="#story">{e(U["scrollCue"])}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
      <p class="film-opt" hidden><button type="button" class="chip film-opt-btn" aria-pressed="false"
        data-on="{e(U["filmOptOut"])}" data-off="{e(U["filmOptIn"])}">{icon("play")}<span>{e(U["filmOptIn"])}</span></button>
        <small>{e(U["filmOptHint"])}</small></p>
    </div>
    <div class="band band-2" data-band="0.36,0.62" data-entrance="drift">
      <p class="band-line" data-split>{e(h["filmBand2"])}</p>
    </div>
    <div class="band band-3" data-band="0.68,1" data-entrance="settle">
      <p class="band-line" data-split>{e(h["filmBand3"])}</p>
      <p class="band-sub">{e(h["heroSub"])}</p>
      <p class="band-cta"><a class="btn btn-warm" href="#spaces">{e(h["heroCta"])}{icon("arrow")}</a></p>
    </div>
    <p class="film-note chip">{e(U["filmNote"])}</p>
  </div>
</section>"""


def story():
    h = T["home"]
    paras = "".join(f'<p{" class=dropcap" if i == 0 else ""}>{e(p)}</p>' for i, p in enumerate(h["story"]))
    key = M["storyPhoto"]
    return f"""<section class="story" id="story" aria-labelledby="story-title">
  {suggest_btn(h["storyTitle"])}
  <svg class="path-line" viewBox="0 0 60 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M30 0 C 8 180, 52 320, 30 500 S 10 820, 30 1000" pathLength="1"/></svg>
  <div class="wrap story-grid">
    <header class="story-head reveal">
      <p class="kicker">{e(U["storyKicker"])}</p>
      <h2 id="story-title" class="h-display">{e(h["storyTitle"])}</h2>
    </header>
    <div class="story-body reveal">{paras}</div>
    <figure class="story-photo reveal" data-space="{P[key]["space"]}">
      <div class="arch arch-tall">{img(key)}</div>
      <figcaption>{e(U["storyCaption"])}</figcaption>
    </figure>
    <blockquote class="pull reveal"><p>{e(U["pullQuote"])}</p></blockquote>
    <span class="numeral" aria-hidden="true">1960s</span>
  </div>
</section>"""

def doors():
    cards = []
    for n, s in enumerate(SPACES, 1):
        sp, st = T["spaces"][s], S["spaces"][s]
        alt_key = next(k for k in M["featured"][s][1:] if P[k]["area"] != P[M["covers"][s]]["area"])
        cards.append(f"""<article class="door door-{s}" data-space="{s}" style="--accent:{M["accents"][s]}">
      <a class="door-link" href="{link(s)}">
        <div class="arch door-arch">{img(M["covers"][s])}{img(alt_key, "door-alt", extra='aria-hidden="true"')}</div>
        <div class="door-body">
          <span class="door-no" aria-hidden="true">0{n}</span>
          <h3 class="door-name">{e(sp["name"])}</h3>
          <p class="door-promise">{e(sp["promise"])}</p>
          <ul class="door-facts">
            <li>{icon("users")}{e(U["sleeps"])} {st["guests"]}</li>
            <li>{rating_html(s)}</li>
          </ul>
          <span class="door-cta">{e(U["look"])}{icon("arrow")}</span>
        </div>
      </a>
    </article>""")
    return f"""<section class="doors" id="spaces" aria-labelledby="spaces-title">
  {suggest_btn(U["spacesTitle"])}
  <div class="wrap doors-head reveal">
    <p class="kicker">{e(U["spacesKicker"])}</p>
    <h2 id="spaces-title" class="h-display">{e(U["spacesTitle"])}</h2>
    <p class="lede">{e(U["spacesIntro"])}</p>
  </div>
  <div class="doors-row" role="list">{"".join(c.replace("<article", '<article role="listitem"', 1) for c in cards)}</div>
  <p class="wrap doors-note">{e(U["ratingNote"])} {e(S["ratingsAsOf"])}.</p>
</section>"""


def compound():
    spots, cards = [], []
    for s in SPACES:
        pos = M["mapHotspots"][s]
        name = T["spaces"][s]["name"]
        spots.append(f'<button class="hotspot" type="button" style="left:{pos["left"]}%;top:{pos["top"]}%" '
                     f'aria-controls="map-card-{s}" aria-expanded="false" data-hotspot="{s}">'
                     f'<span class="hotspot-dot" aria-hidden="true"></span><span class="hotspot-label">{e(name)}</span></button>')
        cards.append(f"""<div class="map-card" id="map-card-{s}" data-space="{s}" hidden>
        <div class="arch">{img(M["covers"][s])}</div>
        <div><h3>{e(name)}</h3><p>{e(T["spaces"][s]["promise"])}</p>
        <a class="link-arrow" href="{link(s)}">{e(U["look"])}{icon("arrow")}</a></div>
      </div>""")
    gate = M["gatePhoto"]
    return f"""<section class="compound" id="compound" aria-labelledby="compound-title">
  {suggest_btn(U["mapTitle"])}
  <div class="wrap compound-grid">
    <header class="compound-head reveal">
      <p class="kicker">{e(U["mapKicker"])}</p>
      <h2 id="compound-title" class="h-display">{e(U["mapTitle"])}</h2>
      <p class="lede">{e(U["mapIntro"])}</p>
      <figure class="gate" data-space="{P[gate]["space"]}">
        {img(gate)}
        <figcaption><b>{e(U["gateTitle"])}</b>{e(U["gateText"])} <span class="gate-sign">{e(S["gateSign"])}</span></figcaption>
      </figure>
    </header>
    <figure class="map reveal" data-kind="illustration">
      <div class="map-canvas">
        {gen_img("compound-map", "Hand-drawn map of the compound: the blue front gate at the bottom, a brick driveway curving up through trees to the Courtyard, the Nook, the Retreat, the Rooftop and the Cottage.")}
        {"".join(spots)}
      </div>
      <figcaption class="map-note">{e(U["mapNote"])}</figcaption>
    </figure>
    <div class="map-cards" aria-live="polite">{"".join(cards)}</div>
  </div>
</section>"""


def finder():
    chips = "".join(f'<label class="chip-toggle"><input type="checkbox" name="want" value="{k}"><span>{e(v)}</span></label>'
                    for k, v in U["traits"].items())
    rows = "".join(f"""<li class="fit" data-space="{s}" data-fit="{s}">
        <a href="{link(s)}"><div class="arch fit-arch">{img(M["covers"][s])}</div>
        <div class="fit-body"><span class="fit-verdict" data-verdict></span><h3>{e(T["spaces"][s]["name"])}</h3>
        <p class="fit-why" data-why>{e(T["spaces"][s]["promise"])}</p></div>{icon("arrow")}</a></li>""" for s in SPACES)
    return f"""<section class="finder" id="finder" aria-labelledby="finder-title">
  {suggest_btn(U["helperKicker"])}
  <div class="wrap finder-grid">
    <form class="finder-form reveal" data-finder onsubmit="return false">
      <p class="kicker">{e(U["helperKicker"])}</p>
      <h2 id="finder-title" class="h-display">{e(U["helperTitle"])}</h2>
      <p class="lede">{e(U["helperIntro"])}</p>
      <fieldset class="seg">
        <legend>{e(U["helperWho"])}</legend>
        <label><input type="radio" name="who" value="2" checked><span>{e(U["helperWhoSmall"])}</span></label>
        <label><input type="radio" name="who" value="4"><span>{e(U["helperWhoLarge"])}</span></label>
      </fieldset>
      <fieldset class="chips">
        <legend>{e(U["helperWant"])}</legend>
        {chips}
      </fieldset>
    </form>
    <div class="finder-results">
      <p class="finder-empty" data-finder-empty>{e(U["helperEmpty"])}</p>
      <ol class="fits" data-fits>{rows}</ol>
    </div>
  </div>
</section>"""

def neighbourhood():
    stops = "".join(f'<li class="stop reveal"><span class="stop-dot" aria-hidden="true"></span>'
                    f'<h3>{e(n["name"])}</h3><p>{e(n["text"])}</p></li>' for n in T["neighbourhood"])
    return f"""<section class="hood" id="neighbourhood" aria-labelledby="hood-title">
  {suggest_btn(U["neighbourhoodTitle"])}
  <div class="wrap hood-grid">
    <header class="reveal">
      <p class="kicker">{e(U["neighbourhoodKicker"])}</p>
      <h2 id="hood-title" class="h-display">{e(U["neighbourhoodTitle"])}</h2>
    </header>
    <ol class="route">{stops}</ol>
  </div>
</section>"""


GOOD_ICONS = {"15 steps to the Rooftop": "steps", "Parking inside the gate": "car"}


def good_to_know():
    items = []
    for g in T["goodToKnow"]:
        art = (f'<span class="good-art" data-kind="illustration">{gen_img(g["spot"])}</span>' if g["spot"]
               else f'<span class="good-art good-icon">{icon(GOOD_ICONS.get(g["title"], "check"))}</span>')
        items.append(f'<li class="good reveal">{art}<div><h3>{e(g["title"])}</h3><p>{fill(g["text"])}</p></div></li>')
    return f"""<section class="goodtk" id="good-to-know" aria-labelledby="good-title">
  <div class="leaf-band" data-kind="texture" aria-hidden="true"></div>
  {suggest_btn(U["goodTitle"])}
  <div class="wrap">
    <header class="goodtk-head reveal">
      <p class="kicker">{e(U["goodKicker"])}</p>
      <h2 id="good-title" class="h-display">{e(U["goodTitle"])}</h2>
    </header>
    <ul class="good-list">{"".join(items)}</ul>
  </div>
</section>"""


def faq():
    qs = "".join(f'<details class="qa"><summary>{e(f["q"])}{icon("plus", "ic qa-ic")}</summary><p>{fill(f["a"])}</p></details>'
                 for f in T["faq"])
    return f"""<section class="faq" id="faq" aria-labelledby="faq-title" data-kind="texture">
  <div class="brass" aria-hidden="true"></div>
  {suggest_btn(U["faqTitle"])}
  <div class="wrap faq-grid">
    <header class="faq-head reveal">
      <p class="kicker">{e(U["faqKicker"])}</p>
      <h2 id="faq-title" class="h-display">{e(U["faqTitle"])}</h2>
      <a class="link-arrow" href="house-rules.html">{e(U["rulesLink"])}{icon("arrow")}</a>
    </header>
    <div class="qas reveal">{qs}</div>
  </div>
</section>"""


def jsonld():
    data = {
        "@context": "https://schema.org", "@type": "LodgingBusiness", "name": S["brand"],
        "description": T["site"]["description"],
        "address": {"@type": "PostalAddress", "addressLocality": "Bengaluru", "addressRegion": "Karnataka", "addressCountry": "IN"},
        "amenityFeature": [{"@type": "LocationFeatureSpecification", "name": n, "value": True}
                           for n in ("Wifi", "Kitchen", "Free parking")],
        "containsPlace": [{"@type": "Accommodation", "name": T["spaces"][s]["name"],
                           "description": T["spaces"][s]["promise"],
                           "occupancy": {"@type": "QuantitativeValue", "maxValue": S["spaces"][s]["guests"]},
                           "numberOfRooms": S["spaces"][s]["bedrooms"]} for s in SPACES],
    }
    if S["siteUrl"]:
        data["url"] = S["siteUrl"]
    if S["contact"]["phone"]:
        data["telephone"] = S["contact"]["phone"]
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def home_main():
    return film_hero() + story() + doors() + compound() + finder() + neighbourhood() + good_to_know() + faq()


def page_home():
    return (head("home", T["site"]["title"], T["site"]["description"], M["covers"]["compound"], jsonld())
            + '<body data-page="home">' + header("home")
            + '<main id="main" tabindex="-1">' + home_main() + "</main>" + footer("home"))

NOTE_SPOT = {"cottage": "spot-squirrel", "courtyard": "spot-squirrel", "nook": "spot-squirrel",
             "retreat": "spot-copper-pod-tree", "rooftop": "spot-teacup-swing"}


def space_hero(s, n):
    sp, st = T["spaces"][s], S["spaces"][s]
    loop = M["loops"].get(s)
    if loop:
        g = G[loop["video"]]
        media = (img(loop["poster"], "sp-still", eager=True)
                 + f'<video class="sp-loop" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true" '
                   f'data-img="{loop["video"]}" data-kind="motion" data-src="assets/{g["file"]}"></video>'
                 + f'<button class="loop-toggle" type="button" hidden aria-label="{e(U["pause"])}" '
                   f'data-label-pause="{e(U["pause"])}" data-label-play="{e(U["play"])}">{icon("pause")}{icon("play")}</button>')
    else:
        media = img(M["covers"][s], "sp-still kenburns", eager=True)
    min_n = st["minNights"] or S["minNightsDefault"]
    facts = [(U["sleeps"], e(st["guests"]), "users"), (U["bedrooms"], e(st["bedrooms"]), "bed"),
             (U["beds"], val(st["beds"], f'{sp["name"]}: beds'), "bed"), (U["baths"], val(st["baths"], f'{sp["name"]}: bathrooms'), "bath"),
             (U["booking"]["minStay"], f'{min_n} {e(U["booking"]["nights"])}' if min_n else tbu(f'{sp["name"]}: minimum nights'), "key")]
    dl = "".join(f'<div class="fact{" fact-wide" if len(re.sub("<[^>]+>", "", v)) > 24 else ""}">{icon(ic)}<dt>{e(k)}</dt><dd>{v}</dd></div>'
                 for k, v, ic in facts)
    inset = next(k for k in M["featured"][s] if P[k]["area"] != P[loop["poster"] if loop else M["covers"][s]]["area"])
    return f"""<section class="sp-hero" aria-labelledby="sp-title">
  <div class="sp-media" data-space="{s}"><div class="sp-arch">{media}</div>{img(inset, "sp-arch-2")}</div>
  <div class="sp-panel">
    <p class="kicker">0{n} · {e(S["brand"])}</p>
    <h1 id="sp-title" class="sp-title"><span>{e(sp["name"])}</span>
      <svg class="underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 60 3, 120 12, 180 6 S 270 4, 298 8" pathLength="1"/></svg></h1>
    <p class="sp-promise">{e(sp["promise"])}</p>
    <dl class="facts">{dl}</dl>
    <div class="sp-actions">
      <a class="btn btn-accent" href="#book">{e(U["nav"]["book"])}{icon("arrow")}</a>
      <p class="sp-price"><b>{money(st["nightly"], f'{sp["name"]}: nightly price')}</b> {e(U["booking"]["perNight"])}</p>
    </div>
    <p class="sp-rating">{rating_html(s)} <a href="{e(st["airbnb"])}" rel="noopener" target="_blank">{e(U["onAirbnb"])}</a></p>
  </div>
</section>"""


def space_story(s):
    sp = T["spaces"][s]
    paras = "".join(f'<p{" class=dropcap" if i == 0 else ""}>{e(p)}</p>' for i, p in enumerate(sp["story"]))
    strip = "".join(f'<li>{img(k)}</li>' for k in M["featured"][s][1:6])
    return f"""<section class="sp-story" id="story" aria-labelledby="story-h">
  {suggest_btn(U["storyHeading"])}
  <div class="wrap sp-story-grid">
    <h2 id="story-h" class="h-section reveal">{e(U["storyHeading"])}</h2>
    <div class="sp-story-body reveal">{paras}</div>
  </div>
  <ul class="strip" data-space="{s}" aria-label="{e(U["photosHeading"])}">{strip}</ul>
</section>"""


def gallery(s):
    keys = gallery_keys(s)
    areas = [a for a in M["areaOrder"][s] if any(P[k]["area"] == a for k in keys)]
    tabs = [f'<button type="button" class="tab" aria-pressed="true" data-area="all">{e(U["photosAll"])} <span>{len(keys)}</span></button>']
    tabs += [f'<button type="button" class="tab" aria-pressed="false" data-area="{a}">{e(U["areas"].get(a, a))} '
             f'<span>{sum(P[k]["area"] == a for k in keys)}</span></button>' for a in areas]
    items = "".join(f'<li class="shot" data-area="{P[k]["area"]}"><button type="button" class="shot-btn" data-lb="{i}" '
                    f'aria-label="{e(U["photosHeading"])}: {e(alt_for(k))}">'
                    f'{img(k)}</button></li>' for i, k in enumerate(keys))
    return f"""<section class="sp-gallery" id="photos" aria-labelledby="photos-h">
  {suggest_btn(U["photosHeading"])}
  <div class="wrap">
    <header class="gallery-head">
      <h2 id="photos-h" class="h-section">{e(U["photosHeading"])}</h2>
      <div class="tabs" role="group" aria-label="{e(U["photosHeading"])}">{"".join(tabs)}</div>
    </header>
    <ul class="masonry" data-space="{s}" data-gallery>{items}</ul>
  </div>
</section>"""


def space_details(s):
    sp = T["spaces"][s]
    am = "".join(f'<li>{amenity_icon(a)}<span>{e(a)}</span></li>' for a in sp["amenities"])
    notes = "".join(f"<li>{fill(n)}</li>" for n in sp["notes"])
    return f"""<section class="sp-details" id="details" aria-label="{e(U["amenitiesHeading"])}">
  <div class="wrap sp-details-grid">
    <div class="amen reveal">
      {suggest_btn(U["amenitiesHeading"])}
      <h2 class="h-section">{e(U["amenitiesHeading"])}</h2>
      <ul class="amen-list">{am}</ul>
    </div>
    <div class="notes reveal">
      {suggest_btn(U["notesHeading"])}
      <span class="notes-art" data-kind="illustration">{gen_img(NOTE_SPOT[s])}</span>
      <h2 class="h-section">{e(U["notesHeading"])}</h2>
      <ul class="notes-list">{notes}</ul>
      <a class="link-arrow" href="house-rules.html">{e(U["rulesLink"])}{icon("arrow")}</a>
    </div>
  </div>
</section>"""

def booking(s):
    b = U["booking"]
    return f"""<section class="book" id="book" aria-labelledby="book-h">
  {suggest_btn(b["title"])}
  <div class="wrap">
    <!-- ===== BOOKING MODULE (preview) =====
         Everything inside [data-booking] is drawn by assets/js/booking.js.
         To go live, replace this div with the Lodgify booking widget embed code
         and remove booking.js from this page. Nothing else depends on it. -->
    <div class="booking" data-booking="{s}">
      <header class="book-head">
        <p class="kicker">{e(U["nav"]["book"])}</p>
        <h2 id="book-h" class="h-display">{e(b["title"])}</h2>
        <p class="lede">{e(b["intro"])}</p>
        <p class="preview-pill">{e(T["site"]["previewLabel"])}</p>
      </header>
      <div class="booking-root" data-booking-root>
        <noscript><p><a href="{e(S["spaces"][s]["airbnb"])}">{e(U["onAirbnb"])}</a></p></noscript>
      </div>
    </div>
    <!-- ===== END BOOKING MODULE ===== -->
  </div>
</section>"""


def next_door(s):
    others = [x for x in SPACES if x != s]
    cards = "".join(f"""<li class="nd" data-space="{x}"><a href="{link(x)}"><div class="arch">{img(M["covers"][x])}</div>
      <h3>{e(T["spaces"][x]["name"])}</h3><p>{e(U["sleeps"])} {S["spaces"][x]["guests"]}</p></a></li>""" for x in others)
    return f"""<section class="nextdoor" aria-labelledby="nd-h">
  <div class="wrap">
    <h2 id="nd-h" class="h-section">{e(U["nextDoor"])}</h2>
    <ul class="nd-list">{cards}</ul>
    <a class="link-arrow" href="index.html#spaces">{e(U["backHome"])}{icon("arrow")}</a>
  </div>
</section>"""


def space_main(s):
    sp, st = T["spaces"][s], S["spaces"][s]
    sub = "".join(f'<li><a href="#{a}">{e(t)}</a></li>' for a, t in
                  [("story", U["storyHeading"]), ("photos", U["photosHeading"]),
                   ("details", U["amenitiesHeading"]), ("book", U["nav"]["book"])])
    price = money(st["nightly"], sp["name"] + ": nightly price")
    bar = (f'<div class="book-bar"><p><b>{price}</b> '
           f'{e(U["booking"]["perNight"])}</p><a class="btn btn-accent" href="#book">{e(U["nav"]["book"])}</a></div>')
    return (space_hero(s, SPACES.index(s) + 1)
            + f'<nav class="subnav" aria-label="{e(sp["name"])}"><ul>{sub}</ul></nav>'
            + space_story(s) + gallery(s) + space_details(s) + booking(s) + next_door(s) + bar)


def page_space(s):
    sp, st = T["spaces"][s], S["spaces"][s]
    ld = {"@context": "https://schema.org", "@type": "Accommodation", "name": sp["name"], "description": sp["seoDesc"],
          "occupancy": {"@type": "QuantitativeValue", "maxValue": st["guests"]}, "numberOfRooms": st["bedrooms"],
          "amenityFeature": [{"@type": "LocationFeatureSpecification", "name": a, "value": True} for a in sp["amenities"]],
          "containedInPlace": {"@type": "LodgingBusiness", "name": S["brand"],
                               "address": {"@type": "PostalAddress", "addressLocality": "Bengaluru", "addressCountry": "IN"}}}
    ld_tag = f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>'
    return (head(s, sp["seoTitle"], sp["seoDesc"], M["covers"][s], ld_tag)
            + f'<body data-page="{s}" style="--accent:{M["accents"][s]}">' + header(s)
            + '<main id="main" tabindex="-1">' + space_main(s) + "</main>" + footer(s, ("booking.js",)))


def rules_main():
    r = T["houseRules"]
    items = "".join(f'<div class="rule reveal"><dt>{e(i["label"])}</dt><dd>{fill(i["value"])}</dd></div>' for i in r["items"])
    return f"""<div class="rules-page">
  <section class="rules" aria-labelledby="rules-h">
    {suggest_btn(r["title"])}
    <div class="wrap rules-grid">
      <header>
        <span class="rules-art" data-kind="illustration">{gen_img("spot-brass-key")}</span>
        <h1 id="rules-h" class="h-display">{e(r["title"])}</h1>
        <p class="lede">{e(r["intro"])}</p>
      </header>
      <dl class="rule-list">{items}</dl>
    </div>
  </section>
</div>"""


def page_rules():
    r = T["houseRules"]
    return (head("house-rules", f'{r["title"]} · {S["brand"]}', r["intro"])
            + '<body data-page="house-rules">' + header("house-rules")
            + '<main id="main" tabindex="-1">' + rules_main() + "</main>" + footer("house-rules"))


def page_404():
    return (head("404", U["notFoundTitle"], U["notFoundText"])
            + '<body data-page="404">' + header("404")
            + f"""<main id="main" tabindex="-1" class="lost" data-space="compound">
  {img("compound-driveway-garden-walkway-12", "lost-bg")}
  <div class="lost-card"><h1 class="h-display">{e(U["notFoundTitle"])}</h1><p>{e(U["notFoundText"])}</p>
  <a class="btn btn-warm" href="index.html">{e(U["notFoundCta"])}</a></div>
</main>""" + footer("404"))


ROUTE_NAMES = ["home", *SPACES, "house-rules"]
REF_ATTRS = re.compile(r'(?<![\w-])(id|for|aria-labelledby|aria-controls|aria-describedby)="([\w-]+)"')


def spa_links(html_text, route=None):
    """Point page links at views (#retreat) and, inside a view, prefix its anchors and ids (#retreat--book)."""
    t = re.sub(r'href="index\.html#([\w-]+)"', r'href="#home--\1"', html_text)
    t = t.replace('href="index.html"', 'href="#home"')
    t = re.sub(r'href="([a-z-]+)\.html"', r'href="#\1"', t)
    if route:
        t = re.sub(r'href="#([\w-]+)"',
                   lambda m: m.group(0) if m.group(1) in ROUTE_NAMES or "--" in m.group(1) else f'href="#{route}--{m.group(1)}"', t)
        t = REF_ATTRS.sub(lambda m: f'{m.group(1)}="{route}--{m.group(2)}"', t)
    return t


def build_artifact():
    """One self-contained page for the claude.ai artifact: every view in one document, CSS/JS inline,
    assets published next to it. Written to artifact/index.html + artifact/assets/."""
    out = bh.ROOT / "artifact"
    if out.exists():
        shutil.rmtree(out)
    (out / "assets").mkdir(parents=True)
    views = [("home", T["site"]["title"], home_main(), "")]
    views += [(s, T["spaces"][s]["seoTitle"], space_main(s), f' style="--accent:{M["accents"][s]}"') for s in SPACES]
    views += [("house-rules", f'{T["houseRules"]["title"]} · {S["brand"]}', rules_main(), "")]
    routes = "".join(f'<div class="view" data-route="{n}" data-title="{e(t)}"{st}{"" if n == "home" else " hidden"}>'
                     f'{spa_links(body, n)}</div>' for n, t, body, st in views)
    css = (bh.ROOT / "src/css/site.css").read_text(encoding="utf-8").replace("url(../gen/", "url(assets/gen/")
    js = "".join((bh.ROOT / p).read_text(encoding="utf-8") + "\n" for p in ("src/content.js", "src/js/site.js", "src/js/booking.js"))
    foot = footer("spa")
    foot = re.sub(r'<script src="assets/js/[^"]+" defer></script>', "", foot).replace("</body>\n</html>\n", "")
    page = f"""<title>{e(S["brand"])}</title>
<meta name="description" content="{e(T["site"]["description"])}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>{css}</style>
<script>document.documentElement.classList.add('js')</script>
<div class="app" data-page="home">
{spa_links(header("spa"))}
<main id="main" tabindex="-1">{routes}</main>
{spa_links(foot)}
</div>
<script>{js}</script>
"""
    (out / "index.html").write_text(page, encoding="utf-8")
    # Local preview only (never published): the same skeleton the artifact host wraps around index.html
    (out / "_local.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, '
        'initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);'
        'padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui;background:#fafaf8}'
        'img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + page + "</body></html>",
        encoding="utf-8")
    refs = sorted(set(re.findall(r'assets/((?:photos|gen)/[\w.-]+)', page)))
    for r in refs:
        dst = out / "assets" / r
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(bh.ROOT / "web" / r, dst)
    size = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    biggest = max((out / "assets" / r).stat().st_size for r in refs)
    print(f"artifact: index.html {len(page.encode()) / 1e3:.0f} KB + {len(refs)} files, {size / 1e6:.1f} MB total, "
          f"largest file {biggest / 1e6:.1f} MB")


def write(name, text):
    (DIST / name).write_text(text, encoding="utf-8")


def copy_assets():
    a = DIST / "assets"
    for sub in ("photos", "gen"):
        dst = a / sub
        dst.mkdir(parents=True, exist_ok=True)
        for f in (bh.ROOT / "web" / sub).iterdir():
            if f.name.startswith(tuple(HELD)):
                continue
            t = dst / f.name
            if not t.exists() or t.stat().st_mtime < f.stat().st_mtime:
                shutil.copy2(f, t)
    for sub, src in (("css", "src/css"), ("js", "src/js")):
        (a / sub).mkdir(parents=True, exist_ok=True)
        for f in (bh.ROOT / src).glob("*"):
            shutil.copy2(f, a / sub / f.name)
    shutil.copy2(bh.ROOT / "src/content.js", a / "js/content.js")


def main():
    DIST.mkdir(exist_ok=True)
    copy_assets()
    write("index.html", page_home())
    for s in SPACES:
        write(f"{s}.html", page_space(s))
    write("house-rules.html", page_rules())
    write("404.html", page_404())
    base = (S["siteUrl"] or "https://your-domain.example").rstrip("/")
    urls = ["", *[f"{s}.html" for s in SPACES], "house-rules.html"]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "".join(f"  <url><loc>{base}/{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    if not S["siteUrl"]:
        print("note: SETTINGS.siteUrl is empty, so sitemap.xml uses a placeholder domain")
    print(f"build: {len(list(DIST.glob('*.html')))} pages in dist/")
    build_artifact()


if __name__ == "__main__":
    main()
