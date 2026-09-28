/* Bose Haus · site.js
   Reads SETTINGS, COPY and MEDIA from content.js. Pages are pre-rendered;
   this adds the moving parts. Every drive rests when idle and respects reduced motion. */
(() => {
  'use strict';
  const U = COPY.ui;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (p, a, b) => { const t = clamp((p - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: fine */ } }
  };
  const saveData = () => { const c = navigator.connection; return !!(c && (c.saveData || /2g|3g/.test(c.effectiveType || ''))); };

  /* ---------- toast ---------- */
  const toastEl = $('.toast');
  let toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- nav: solid after the hero, mobile drawer ---------- */
  const nav = $('[data-nav]');
  const hero = $('[data-film]');
  function navState() {
    if (!nav) return;
    const scrub = document.documentElement.classList.contains('scrub');
    const edge = hero && hero.offsetParent ? (scrub ? hero.offsetHeight - innerHeight * 1.05 : innerHeight * 0.6) : 10;
    const solid = scrollY > Math.max(10, edge);
    if (solid !== nav.classList.contains('solid')) nav.classList.toggle('solid', solid);
  }
  addEventListener('scroll', navState, { passive: true });
  navState();

  const drawer = $('#drawer');
  const menuBtn = $('.nav-menu');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('.drawer-close', drawer).focus(); else menuBtn.focus();
  }
  menuBtn?.addEventListener('click', () => setDrawer(true));
  $('.drawer-close')?.addEventListener('click', () => setDrawer(false));
  drawer?.addEventListener('click', e => { if (e.target === drawer || e.target.closest('a')) setDrawer(false); });
  drawer?.addEventListener('keydown', e => {
    if (e.key === 'Escape') setDrawer(false);
    if (e.key !== 'Tab') return;
    const f = $$('a,button', drawer); const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- entrances: IntersectionObserver adds .in, then retires stagger delays ---------- */
  const revealIO = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
      setTimeout(() => {
        en.target.classList.add('settled');
        $$('.good,.stop', en.target.parentElement || en.target).forEach(x => x.classList.add('settled'));
      }, 1800);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  // Only what is below the first screen gets hidden for an entrance; everything else is visible at rest.
  function markPre(scope = document) {
    if (reduced.matches) return;
    $$('.reveal,.doors-row', scope).forEach(el => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.height && r.top > innerHeight * 0.95) { el.classList.add('pre'); revealIO.observe(el); }
    });
  }
  markPre();

  /* ---------- scroll-drawn lines: the brick path in the story, the route, the story photo lift ---------- */
  const drawn = $$('.story,.hood').map(sec => ({ sec, target: sec.querySelector('.path-line') || sec.querySelector('.route') }));
  const lift = $('.story-photo');
  let drawCache = new Map();
  function drawLines() {
    for (const { sec, target } of drawn) {
      if (!target) continue;
      const r = sec.getBoundingClientRect();
      const v = reduced.matches ? 1 : clamp((innerHeight - r.top) / (r.height + innerHeight * 0.4), 0, 1);
      const s = v.toFixed(3);
      if (drawCache.get(target) !== s) { drawCache.set(target, s); target.style.setProperty('--draw', s); }
    }
    if (lift && !reduced.matches && innerWidth >= 900) {
      const r = lift.parentElement.getBoundingClientRect();
      const y = ((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px';
      if (drawCache.get(lift) !== y) { drawCache.set(lift, y); lift.style.setProperty('--lift', y); }
    }
  }
  let drawQueued = false;
  addEventListener('scroll', () => {
    if (drawQueued) return;
    drawQueued = true;
    requestAnimationFrame(() => { drawQueued = false; drawLines(); });
  }, { passive: true });
  drawLines();

  /* ---------- pause every loop on hidden tabs ---------- */
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  /* ---------- split headline words (screen readers get the plain sentence) ---------- */
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  $$('[data-split]').forEach((el, n) => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    const r = rng(17 + n * 101);
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
    const vis = document.createElement('span'); vis.className = 'split'; vis.setAttribute('aria-hidden', 'true');
    words.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      s.style.setProperty('--th', (i / words.length * 0.55).toFixed(3));
      s.style.setProperty('--jr', ((r() - 0.5) * 10).toFixed(1) + 'deg');
      vis.append(s, i < words.length - 1 ? ' ' : '');
    });
    el.append(sr, vis);
  });

  /* ---------- the walk-in film ----------
     The Higgsfield file has a single keyframe, so seeking it would stutter. Instead it is
     decoded once into JPEG frames (requestVideoFrameCallback) and a canvas scrubs through them.
     The five static-hero gates below match the skill's list exactly and are re-checked live. */
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));
  const Film = (() => {
    if (!hero) return null;
    const canvas = $('.film-canvas', hero), ctx = canvas.getContext('2d');
    const poster = $('.film-poster', hero), ringEl = $('.film-ring', hero);
    const bands = $$('.band', hero).map((el, i, all) => {
      const [a, b] = el.dataset.band.split(',').map(Number);
      return { el, a, b, first: i === 0, last: i === all.length - 1, o: -1, k: -1, ks: -1, kb: -1 };
    });
    let frames = [], cache = new Map(), drawn = -1, wanted = 0, busy = false;
    let started = false, on = false, visible = true, target = 0, shown = 0, raf = null, last = 0, pCache = '';
    const loadStart = performance.now();

    const ring = f => ringEl.style.setProperty('--ld', Math.round(126 * (1 - clamp(f, 0, 1))));
    function progress() {
      const r = hero.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, hero.offsetHeight - innerHeight), 0, 1);
    }
    function size() {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; drawn = -1; }
    }
    function paint(src, iw = src.width, ih = src.height) {
      const cw = canvas.width, ch = canvas.height, s = Math.max(cw / iw, ch / ih);
      const w = iw * s, h = ih * s;
      ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    // Fallback for browsers without requestVideoFrameCallback: seek the (-g 8) video directly, one seek at a time
    let seekVideo = null, seekBusy = false, seekNext = null, lastT = -1;
    function seekTo(t) {
      if (seekBusy) { seekNext = t; return; }
      seekBusy = true; lastT = t; seekVideo.currentTime = t;
    }
    function armSeek(v) {
      seekVideo = v;
      v.addEventListener('seeked', () => {
        paint(v, v.videoWidth, v.videoHeight);
        seekBusy = false;
        if (seekNext !== null) { const t = seekNext; seekNext = null; seekTo(t); }
      });
      v.addEventListener('error', () => { seekBusy = false; seekNext = null; });
    }
    async function draw() {
      if (busy || !frames.length) return;
      const i = wanted;
      if (i === drawn) return;
      busy = true;
      try {
        let bmp = cache.get(i);
        if (!bmp) {
          bmp = await createImageBitmap(frames[i]);
          cache.set(i, bmp);
          if (cache.size > 18) { const k = cache.keys().next().value; cache.get(k).close?.(); cache.delete(k); }
        }
        paint(bmp);
        drawn = i;
      } finally { busy = false; }
      if (wanted !== drawn) draw();
    }

    function bandsAt(p, now) {
      const loadK = clamp((now - loadStart) / 1400, 0, 1);
      for (const b of bands) {
        const f = Math.min(0.03, (b.b - b.a) / 3);
        let o = (b.first ? 1 : smooth(p, b.a, b.a + f)) * (b.last ? 1 : 1 - smooth(p, b.b - f, b.b));
        if (b.last && p < b.a) o = 0;
        let k = clamp((p - b.a) / (b.last ? 0.16 : 0.07), 0, 1);
        if (b.first) k = Math.max(k, 1 - (1 - loadK) ** 3);
        const put = (key, prop, v, gate) => { if (Math.abs(b[key] - v) > gate) { b[key] = v; b.el.style.setProperty(prop, v.toFixed(3)); } };
        put('o', '--o', o, 0.004);
        put('k', '--k', k, 0.008);
        if (b.last) { put('ks', '--ks', clamp((k - 0.45) * 3, 0, 1), 0.008); put('kb', '--kb', clamp((k - 0.7) * 4, 0, 1), 0.008); }
        const vis = o > 0.02 ? '' : 'hidden';
        if (b.el.style.visibility !== vis) b.el.style.visibility = vis;
      }
    }
    function tick(now) {
      const dt = Math.min(100, now - (last || now)); last = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      const settledLoad = now - loadStart > 1500;
      if (Math.abs(target - shown) < 0.0005 && settledLoad) { shown = target; raf = null; last = 0; }
      else raf = requestAnimationFrame(tick);
      if (frames.length) { wanted = Math.round(shown * (frames.length - 1)); draw(); }
      else if (seekVideo && seekVideo.duration) { const t = shown * (seekVideo.duration - 0.05); if (Math.abs(t - lastT) > 0.02) seekTo(t); }
      const p = shown.toFixed(3);
      if (p !== pCache) { pCache = p; hero.style.setProperty('--p', p); }
      bandsAt(shown, now);
    }
    function onScroll() {
      if (!on) return;                 // still-hero mode: the drive stays off
      target = progress();
      if (raf === null && visible) raf = requestAnimationFrame(tick);
    }
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) onScroll(); }).observe(hero);

    async function load() {
      const src = hero.dataset.filmSrc;
      const ctrl = new AbortController();
      let watchdog = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(src, { signal: ctrl.signal, priority: 'low' });
      if (!res.ok || !res.body) throw new Error('film ' + res.status);
      const total = Number(res.headers.get('Content-Length')) || 5.6e6;   // the -g 8 web encode is about 5.3 MB
      const reader = res.body.getReader(), chunks = [];
      let got = 0, lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(watchdog); watchdog = setTimeout(() => ctrl.abort(), 20000);
        chunks.push(value); got += value.length;
        const now = performance.now();
        if (now - lastRing > 100) { lastRing = now; ring(0.95 * got / total); }
      }
      clearTimeout(watchdog);
      ring(0.95);
      await decode(URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' })));
    }
    // The film is encoded with a keyframe every 8 frames (-g 8), so seeking it directly is smooth.
    // Frames are painted to the canvas on each 'seeked'; seeks are gated so they never pile up.
    function decode(url) {
      return new Promise((resolve, reject) => {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
        const t = setTimeout(() => reject(new Error('video stalled')), 20000);
        v.addEventListener('loadeddata', () => { clearTimeout(t); armSeek(v); resolve(); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(t); reject(new Error('video error')); }, { once: true });
      });
    }
    function initOnce() {
      if (started) return;
      started = true;
      let go = false;
      const begin = () => {
        if (go) return; go = true;
        load().then(() => {
          ring(1); size(); drawn = -1; hero.classList.add('ready');
          if (frames.length) { wanted = Math.round(progress() * (frames.length - 1)); draw(); }
          else if (seekVideo) seekTo(progress() * (seekVideo.duration - 0.05));
          navState();
        }).catch(() => hero.classList.add('failed'));
      };
      poster.addEventListener('load', begin, { once: true });
      poster.addEventListener('error', begin, { once: true });
      poster.src = poster.dataset.src;
      setTimeout(begin, 4000);
    }
    addEventListener('resize', () => {
      if (!on) return;
      size();
      if (seekVideo && seekVideo.readyState >= 2) paint(seekVideo, seekVideo.videoWidth, seekVideo.videoHeight); else draw();
    });
    return {
      enable() {
        if (on) return; on = true;
        document.documentElement.classList.add('scrub');
        initOnce(); size();
        bands.forEach(b => { b.o = b.k = b.ks = b.kb = -1; });
        addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      },
      disable() {
        if (!on) return; on = false;
        document.documentElement.classList.remove('scrub');
        removeEventListener('scroll', onScroll);
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
        bands.forEach(b => { b.el.style.cssText = ''; });
      }
    };
  })();
  // Reduced motion starts the film off, but the visitor can opt in (remembered on this device).
  // The other four gates (phones, portrait tablets, coarse portrait, landscape phones) always win.
  let filmOptIn = store.get('bh-film', false);
  const optWrap = $('.film-opt'), optBtn = $('.film-opt-btn');
  function applyHeroMode() {
    if (!Film) return;
    const off = hero.closest('.view')?.hidden;      // one-page version: the film only runs on the home view
    const small = MQLS.slice(0, 4).some(m => m.matches);
    const calm = reduced.matches;
    if (optWrap) {
      optWrap.hidden = small || !calm;              // the choice only exists where reduced motion is the sole blocker
      optBtn.setAttribute('aria-pressed', String(filmOptIn));
      $('span', optBtn).textContent = filmOptIn ? optBtn.dataset.on : optBtn.dataset.off;
    }
    if (off || small || (calm && !filmOptIn)) { Film.disable(); ambient(); } else Film.enable();
  }
  optBtn?.addEventListener('click', () => {
    filmOptIn = !filmOptIn;
    store.set('bh-film', filmOptIn);
    applyHeroMode();
    navState();
  });
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));

  /* ---------- ambient loops: fade in only once really playing, pause off-screen ---------- */
  const loopIO = new IntersectionObserver(entries => {
    for (const en of entries) {
      const v = en.target;
      if (en.isIntersecting && !reduced.matches && !v.classList.contains('user-paused')) v.play().catch(() => {});
      else v.pause();
    }
  }, { threshold: 0.15 });
  function ambient() {
    if (reduced.matches || saveData()) return;
    $$('video[data-src]').forEach(v => {
      if (v.src || !v.offsetParent) return;           // skip hidden ones (e.g. the phone loop on desktop)
      v.addEventListener('playing', () => {
        v.classList.add('ready');
        const t = v.parentElement.querySelector('.loop-toggle'); if (t) t.hidden = false;
      }, { once: true });
      v.addEventListener('error', () => v.remove(), { once: true });
      v.src = v.dataset.src;
      loopIO.observe(v);
    });
  }
  $$('.loop-toggle').forEach(btn => btn.addEventListener('click', () => {
    const v = btn.parentElement.querySelector('video');
    const pause = !v.paused;
    pause ? v.pause() : v.play().catch(() => {});
    v.classList.toggle('user-paused', pause);
    btn.classList.toggle('paused', pause);
    btn.setAttribute('aria-label', pause ? btn.dataset.labelPlay : btn.dataset.labelPause);
  }));

  /* ---------- map hotspots ---------- */
  $$('[data-hotspot]').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    $$('[data-hotspot]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    $$('.map-card').forEach(c => { c.hidden = true; });
    if (open) {
      btn.setAttribute('aria-expanded', 'true');
      const card = document.getElementById(btn.getAttribute('aria-controls'));
      card.hidden = false;
      if (innerWidth < 960) card.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  }));
  /* ---------- which space suits you ---------- */
  const finderForm = $('[data-finder]');
  if (finderForm) {
    const list = $('[data-fits]'), empty = $('[data-finder-empty]');
    const order = $$('.fit', list).map(li => li.dataset.fit);
    function run() {
      const who = Number(finderForm.who.value);
      const wants = $$('input[name=want]:checked', finderForm).map(i => i.value);
      const rows = order.map((s, idx) => {
        const t = MEDIA.traits[s] || {}, guests = SETTINGS.spaces[s].guests;
        let level = '', why = COPY.spaces[s].promise, score = 0;
        if (who > guests) { level = 'no'; why = U.helperTooSmall; }
        else if (wants.includes('nostairs') && !t.nostairs) { level = 'no'; why = U.helperStairs; }
        else if (wants.length || who > 2) {
          const hits = wants.filter(w => t[w]);
          score = hits.length + (who > 2 ? 1 : 0);
          level = !wants.length || hits.length === wants.length ? 'good' : hits.length ? 'ok' : 'no';
          if (hits.length) why = hits.map(w => t[w]).join(' ');
        }
        return { s, level, why, score, idx };
      });
      const rank = { good: 0, ok: 1, '': 2, no: 3 };
      rows.sort((a, b) => rank[a.level] - rank[b.level] || b.score - a.score || a.idx - b.idx);
      const before = new Map($$('.fit', list).map(li => [li, li.getBoundingClientRect().top]));
      for (const r of rows) {
        const li = $(`.fit[data-fit="${r.s}"]`, list);
        li.dataset.level = r.level;
        $('[data-verdict]', li).textContent = r.level === 'good' ? U.helperGood : r.level === 'ok' ? U.helperOk : r.level === 'no' ? U.helperNo : '';
        $('[data-why]', li).textContent = r.why;
        list.append(li);
      }
      empty.hidden = wants.length > 0 || who > 2;
      if (reduced.matches) return;
      for (const [li, top] of before) {                 // FLIP: rows glide to their new places
        const dy = top - li.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
    finderForm.addEventListener('change', run);
  }
  /* ---------- gallery tabs + lightbox ---------- */
  const lb = $('.lightbox');
  if (lb) {
    const lbImg = $('[data-lb-img]', lb), cap = $('[data-lb-cap]', lb), count = $('[data-lb-count]', lb);
    let shots = [], at = 0, opener = null, gal = null;
    function show(i) {
      at = (i + shots.length) % shots.length;
      const src = $('img', shots[at]);
      lbImg.src = src.currentSrc || src.src;
      lbImg.alt = src.alt;
      lbImg.dataset.img = src.dataset.img;      // integrity: the lightbox carries the photo's key and space
      // never enlarge a ~620px photo more than 1.35x
      lbImg.style.maxWidth = src.naturalWidth ? `min(92vw, ${Math.round(src.naturalWidth * 1.35)}px)` : '';
      lb.dataset.space = gal.dataset.space;
      cap.textContent = src.alt;
      count.textContent = `${at + 1} ${U.lightboxOf} ${shots.length}`;
    }
    $$('[data-gallery]').forEach(g => {
      const tabs = $$('.tab', g.closest('section'));
      tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.setAttribute('aria-pressed', String(x === t)));
        const area = t.dataset.area;
        $$('.shot', g).forEach(s => { s.hidden = area !== 'all' && s.dataset.area !== area; });
      }));
      g.addEventListener('click', e => {
        const b = e.target.closest('.shot-btn'); if (!b) return;
        gal = g;
        shots = $$('.shot:not([hidden]) .shot-btn', g);
        opener = b;
        show(shots.indexOf(b));
        lb.showModal();
      });
    });
    $('.lb-prev', lb).addEventListener('click', () => show(at - 1));
    $('.lb-next', lb).addEventListener('click', () => show(at + 1));
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    lb.addEventListener('close', () => opener?.focus());
  }

  /* ---------- space pages: sub-nav highlight, mobile book bar ---------- */
  const byHash = h => document.getElementById(decodeURIComponent(h.slice(1)));
  $$('.subnav').forEach(nav => {
    const links = $$('a', nav);
    const io = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', byHash(a.hash) === en.target));
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(a => { const t = byHash(a.hash); if (t) io.observe(t); });
  });
  $$('.book-bar').forEach(bar => {
    const scope = bar.closest('.view') || document;
    const seen = new Set();
    const io = new IntersectionObserver(entries => {
      for (const en of entries) en.isIntersecting ? seen.add(en.target) : seen.delete(en.target);
      bar.classList.toggle('away', seen.size > 0);
    });
    [$('.book', scope), $('.sp-hero', scope), $('.foot')].forEach(t => { if (t) io.observe(t); });
  });

  /* ---------- one-page version (the published artifact): views switch by #hash ---------- */
  const routes = $$('.view');
  const app = $('.app');
  function showRoute(hash) {
    if (!routes.length) return;
    const raw = decodeURIComponent((hash || '').replace(/^#/, ''));
    const name = raw.split('--')[0];
    const route = routes.find(r => r.dataset.route === name) || (raw ? null : routes[0]);
    if (!route) return;                              // e.g. #main: leave it to the browser
    const changed = route.hidden;
    if (changed) {
      routes.forEach(r => { r.hidden = r !== route; });
      app.dataset.page = route.dataset.route;
      document.title = route.dataset.title;
      $$('#drawer a').forEach(a => a.toggleAttribute('aria-current', a.hash === '#' + route.dataset.route));
      applyHeroMode(); ambient(); markPre(route); drawLines();
    }
    const target = raw.includes('--') && document.getElementById(raw);
    if (target) target.scrollIntoView({ behavior: changed || reduced.matches ? 'instant' : 'smooth' });
    else if (changed) scrollTo({ top: 0, behavior: 'instant' });
    navState();
  }
  addEventListener('hashchange', () => showRoute(location.hash));
  /* ---------- Family view: every missing detail, straight from SETTINGS ---------- */
  function missing() {
    const S = SETTINGS, groups = [];
    const gen = [];
    const add = (arr, label, v) => { if (v === null || v === '' || v === 0) arr.push(label); };
    add(gen, 'Phone number', S.contact.phone);
    add(gen, 'WhatsApp number', S.contact.whatsapp);
    add(gen, 'Email address', S.contact.email);
    add(gen, 'Check-in time', S.times.checkIn);
    add(gen, 'Check-out time', S.times.checkOut);
    add(gen, 'How guests pay', S.paymentProcess);
    add(gen, 'Steps at the ground-level spaces', S.stepsOther);
    add(gen, 'Default minimum nights', S.minNightsDefault);
    add(gen, 'Website address (siteUrl)', S.siteUrl);
    add(gen, 'Google Analytics ID', S.analytics.ga4);
    add(gen, 'Search Console code', S.analytics.searchConsole);
    add(gen, 'Long-stay discount', S.longStay.discount);
    for (const [k, v] of Object.entries(S.houseRules)) add(gen, 'House rule: ' + k.replace(/([A-Z])/g, ' $1').toLowerCase(), v);
    groups.push([U.familyGeneral, gen]);
    for (const s of Object.keys(S.spaces)) {
      const sp = S.spaces[s], out = [];
      add(out, 'Nightly price', sp.nightly);
      add(out, 'Weekend price', sp.weekend);
      add(out, 'Cleaning fee', sp.cleaning);
      if (sp.minNights === null && S.minNightsDefault === null) out.push('Minimum nights');
      add(out, 'Beds', sp.beds);
      if (out.length) groups.push([COPY.spaces[s].name, out]);
    }
    return groups;
  }
  const family = $('#family'), famBtn = $('.family-toggle');
  function renderFamily() {
    const list = $('[data-family-list]', family);
    list.innerHTML = '';
    for (const [title, items] of missing()) {
      const h = document.createElement('h3'); h.textContent = `${title} (${items.length})`;
      const ul = document.createElement('ul');
      items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
      list.append(h, ul);
    }
    const q = document.createElement('h3'); q.textContent = U.familyQuestionsTitle;
    const qul = document.createElement('ul');
    U.familyQuestions.forEach(t => { const li = document.createElement('li'); li.textContent = t; qul.append(li); });
    list.append(q, qul);
    renderNotes();
  }
  function setFamily(on) {
    if (!family) return;
    document.body.classList.toggle('family-on', on);
    family.hidden = !on;
    famBtn.setAttribute('aria-pressed', String(on));
    store.set('bh-family', on);
    if (on) { renderFamily(); $('.family-close', family).focus(); }
  }
  famBtn?.addEventListener('click', () => setFamily(family.hidden));
  $('.family-close')?.addEventListener('click', () => { setFamily(false); famBtn.focus(); });
  family?.addEventListener('keydown', e => { if (e.key === 'Escape') { setFamily(false); famBtn.focus(); } });
  if (store.get('bh-family', false)) setFamily(true);
  /* ---------- Suggest a change: notes kept on this device, listed in Family view ---------- */
  const dlg = $('.suggest-dialog');
  let noteSection = '';
  function renderNotes() {
    const box = $('[data-family-notes]');
    if (!box) return;
    const notes = store.get('bh-notes', []);
    if (!notes.length) { box.innerHTML = ''; const p = document.createElement('p'); p.textContent = U.familyNoNotes; box.append(p); return; }
    const ul = document.createElement('ul');
    notes.forEach(n => { const li = document.createElement('li'); li.textContent = `${n.page} · ${n.section}: ${n.text}`; ul.append(li); });
    box.innerHTML = ''; box.append(ul);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.suggest');
    if (!b || !dlg) return;
    noteSection = b.dataset.section;
    $('[data-suggest-section]', dlg).textContent = noteSection;
    $('textarea', dlg).value = '';
    dlg.showModal();
  });
  dlg?.addEventListener('close', () => {
    const text = $('textarea', dlg).value.trim();
    if (dlg.returnValue !== 'save' || !text) return;
    const notes = store.get('bh-notes', []);
    notes.push({ page: document.title.split(' · ')[0], section: noteSection, text, at: new Date().toISOString() });
    store.set('bh-notes', notes);
    renderNotes();
    toast(U.suggestSaved);
  });
  $('[data-copy-notes]')?.addEventListener('click', async () => {
    const notes = store.get('bh-notes', []);
    const text = notes.map(n => `${n.page} · ${n.section}: ${n.text}`).join('\n');
    try { await navigator.clipboard.writeText(text); toast(U.familyCopied); } catch { /* clipboard blocked */ }
  });
  $('[data-clear-notes]')?.addEventListener('click', () => { store.set('bh-notes', []); renderNotes(); });

  /* ---------- reduced motion, honoured live in both directions ---------- */
  function pinFinal() {
    $$('.reveal,.doors-row').forEach(el => el.classList.add('in', 'settled'));
    $$('video').forEach(v => v.pause());
    drawLines();
  }
  reduced.addEventListener('change', e => { if (e.matches) pinFinal(); applyHeroMode(); if (!e.matches) ambient(); });

  /* ---------- start ---------- */
  if (reduced.matches) pinFinal();
  if (routes.length && location.hash) showRoute(location.hash);
  if (Film) applyHeroMode(); else ambient();
  window.BH = { toast, film: Film };   // film exposed for testing: BH.film.enable() / disable()
})();
