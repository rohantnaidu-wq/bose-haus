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
  let film = null;                                   // the hero engine, set once it exists (below)
  // Solid after the hero. Over the limewash wall the nav turns ink, until the doorway has opened.
  function navState() {
    if (!nav) return;
    const home = hero && hero.offsetParent;
    const moving = film && film.mode();
    const tone = moving ? film.tone() : 'ink';     // ink over the wall, glass while the arch crosses the nav, clear over the film
    const edge = home ? hero.offsetHeight - (moving ? innerHeight * 1.05 : nav.offsetHeight) : 10;
    const solid = scrollY > Math.max(10, edge) || (!!home && tone === 'glass');
    const ink = !solid && !!home && tone === 'ink';
    if (solid !== nav.classList.contains('solid')) nav.classList.toggle('solid', solid);
    if (ink !== nav.classList.contains('ink')) nav.classList.toggle('ink', ink);
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
      if (el.matches('.doors-row') && innerWidth >= 1100) return;   // desktop doors rise with the scroll instead
      const r = el.getBoundingClientRect();
      if (r.height && r.top > innerHeight * 0.95) { el.classList.add('pre'); revealIO.observe(el); }
    });
  }
  markPre();

  /* ---------- scroll-drawn lines: the brick path in the story, the route, the story photo lift ---------- */
  const drawn = $$('.story,.hood').map(sec => ({ sec, target: sec.querySelector('.path-line') || sec.querySelector('.route') }));
  const lift = $('.story-photo');
  const doorRow = $('[data-doors]'), doorEls = doorRow ? $$('.door', doorRow) : [];
  let drawCache = new Map();
  function drawLines() {
    // desktop: the five doors rise into place as the walk ends, largest first (scroll-driven, reversible)
    if (doorRow && doorRow.offsetParent) {
      const still = reduced.matches || innerWidth < 1100;
      const top = doorRow.getBoundingClientRect().top;
      doorEls.forEach((d, i) => {
        const k = still ? 1 : clamp((innerHeight - top) / (innerHeight * 0.5) - i * 0.12, 0, 1);
        const v = (1 - (1 - k) ** 3).toFixed(3);
        if (drawCache.get(d) !== v) { drawCache.set(d, v); d.style.setProperty('--rise', v); }
      });
    }
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

  /* ---------- the hero: the gate opens ----------
     A limewash wall with one arched doorway. Scrolling scales the arch open (transform only) while
     the view inside counter-scales, so the walk-in film stays still and the doorway grows around it.
       scrub  (desktop): the walk-in film (-g 8 encode), seek-scrubbed with gated seeks, 560vh
       reveal (phones, portrait tablets): the same opening over the portrait still and loop, 280vh; the film never loads
       static (reduced motion, no JS): the still composition in CSS
     The five static-hero gates below match the skill's list exactly and are re-checked live. */
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const Film = (() => {
    if (!hero) return null;
    const stage = $('.film-stage', hero), arch = $('.gate-arch', hero), view = $('.gate-view', hero);
    const canvas = $('.film-canvas', hero), ctx = canvas.getContext('2d');
    const poster = $('.film-poster', hero), ringEl = $('.film-ring', hero);
    const halves = $$('.hl', hero);
    const bands = $$('.band', hero).slice(1).map(el => {
      const [a, b] = el.dataset.band.split(',').map(Number);
      return { el, a, b, last: el.classList.contains('band-3') };
    });
    // how far the doorway opens, as a share of the scroll through the hero
    const CFG = { scrub: { open: [0.06, 0.44], axis: 'x' }, reveal: { open: [0.03, 0.5], axis: 'y', settle: [0.6, 1] } };
    let mode = '', geo = null, started = false, visible = true, target = 0, shown = 0, raf = null, last = 0, loadStart = null, tone = 'ink';
    let vars = new WeakMap();
    // delta-gated custom property writes: nothing touches the DOM unless the value really moved
    function put(el, prop, v, gate, unit = '') {
      let c = vars.get(el);
      if (!c) vars.set(el, c = {});
      if (c[prop] !== undefined && Math.abs(c[prop] - v) <= gate) return;
      c[prop] = v;
      el.style.setProperty(prop, unit ? v.toFixed(1) + unit : v.toFixed(4));
    }
    const ring = f => ringEl.style.setProperty('--ld', Math.round(126 * (1 - clamp(f, 0, 1))));
    function progress() {
      const r = hero.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, hero.offsetHeight - stage.offsetHeight), 0, 1);
    }
    function measure() {
      const W = stage.clientWidth, H = stage.clientHeight;
      const aw = arch.offsetWidth, ah = arch.offsetHeight, ax = arch.offsetLeft, ay = arch.offsetTop;
      const cx = ax + aw / 2, cy = ay + ah / 2;
      // the smallest scale at which the arch (round top included) covers all four corners of the screen
      const covers = (s, x, y) => {
        const dx = x - cx, dy = y - cy, r = s * aw / 2, top = s * (aw / 2 - ah / 2);
        return Math.abs(dx) <= r && dy <= s * ah / 2 && (dy >= top || dx * dx + (dy - top) ** 2 <= r * r);
      };
      const least = pts => {
        const ok = s => pts.every(([x, y]) => covers(s, x, y));
        let lo = 1, hi = 60;
        for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
        return hi;
      };
      const navH = nav ? nav.offsetHeight : 64;
      geo = { aw, ah, sEnd: least([[0, 0], [W, 0], [0, H], [W, H]]) * 1.04, col: halves[0] ? halves[0].offsetWidth : 300,
        sNavIn: Math.max(1, (cy - navH) / (ah / 2)),                // the arch top reaches the nav bar
        sNavOut: least([[0, navH], [W, navH]]) };                     // the whole nav bar sits over the film
      Object.assign(view.style, { width: W + 'px', height: H + 'px', left: -ax + 'px', top: -ay + 'px', transformOrigin: `${cx}px ${cy}px` });
    }
    function size() {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; return true; }
      return false;
    }
    function paint(src, iw, ih) {
      const cw = canvas.width, ch = canvas.height, s = Math.max(cw / iw, ch / ih);
      ctx.drawImage(src, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
    }
    // gated seeks: one in flight, the newest target coalesced, the error path resets the gate
    let video = null, seekBusy = false, seekNext = null, lastT = -1;
    function seekTo(t) {
      if (seekBusy) { seekNext = t; return; }
      seekBusy = true; lastT = t; video.currentTime = t;
    }
    function armSeek(v) {
      video = v;
      v.addEventListener('seeked', () => {
        paint(v, v.videoWidth, v.videoHeight);
        seekBusy = false;
        if (seekNext !== null) { const t = seekNext; seekNext = null; seekTo(t); }
      });
      v.addEventListener('error', () => { seekBusy = false; seekNext = null; });
    }

    function bandsAt(p) {
      for (const b of bands) {
        let a = b.a, z = b.b;
        if (mode === 'reveal') { if (!b.last) continue; [a, z] = CFG.reveal.settle; }
        const f = Math.min(0.03, (z - a) / 3);
        const o = p < a ? 0 : smooth(p, a, a + f) * (b.last ? 1 : 1 - smooth(p, z - f, z));
        const k = clamp((p - a) / (b.last ? 0.16 : 0.07), 0, 1);
        put(b.el, '--o', o, 0.004);
        put(b.el, '--k', k, 0.008);
        if (b.last) { put(b.el, '--ks', clamp((k - 0.45) * 3, 0, 1), 0.008); put(b.el, '--kb', clamp((k - 0.7) * 4, 0, 1), 0.008); }
        const vis = o > 0.02 ? '' : 'hidden';
        if (b.el.style.visibility !== vis) b.el.style.visibility = vis;
      }
    }
    function frame(p, now) {
      const c = CFG[mode];
      const lk = 1 - (1 - clamp((now - loadStart) / 1200, 0, 1)) ** 3;   // one-time load ramp: the words step out of the doorway
      const e = easeIO(clamp((p - c.open[0]) / (c.open[1] - c.open[0]), 0, 1));
      const s = 1 + (geo.sEnd - 1) * e;
      put(stage, '--s', s, 0.0004);
      put(stage, '--z', 1.1 - 0.1 * e, 0.0004);
      put(stage, '--deco', 1 - smooth(e, 0.15, 0.6), 0.004);
      // the opening door pushes the two halves of the headline aside and they fade as they go
      const push = (s - 1) * (c.axis === 'x' ? geo.aw : geo.ah) / 2;
      const room = c.axis === 'x' ? geo.col : 140;
      const ho = lk * (1 - smooth(push, room * 0.12, room * 0.7));
      for (const h of halves) { put(h, '--tx', push - (1 - lk) * 36, 0.25, 'px'); put(h, '--ho', ho, 0.004); }
      put(stage, '--ko', lk * (1 - smooth(e, 0.02, 0.2)), 0.004);
      put(stage, '--dusk', 0.85 * smooth(p, 0.78, 1), 0.004);
      put(stage, '--note', smooth(e, 0.75, 1) * (1 - smooth(p, 0.9, 1)), 0.004);
      bandsAt(p);
      const was = tone;
      tone = s < geo.sNavIn ? 'ink' : s < geo.sNavOut ? 'glass' : 'clear';
      if (tone !== was) navState();
    }
    function tick(now) {
      const dt = Math.min(100, now - (last || now)); last = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      const loading = now - loadStart < 1300;
      if (Math.abs(target - shown) < 0.0005 && !loading) { shown = target; raf = null; last = 0; }   // converged: rest
      else raf = requestAnimationFrame(tick);
      if (mode === 'scrub' && video && video.duration) {
        const t = shown * (video.duration - 0.05);
        if (Math.abs(t - lastT) > 0.01) seekTo(t);
      }
      frame(shown, now);
    }
    function onScroll() {
      if (!mode) return;
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
      const total = Number(res.headers.get('Content-Length')) || 5597797;   // the -g 8 web encode
      const reader = res.body.getReader(), chunks = [];
      let got = 0, lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(watchdog); watchdog = setTimeout(() => ctrl.abort(), 20000);   // 20s without progress aborts
        chunks.push(value); got += value.length;
        const now = performance.now();
        if (now - lastRing > 100) { lastRing = now; ring(0.95 * got / total); }
      }
      clearTimeout(watchdog);
      ring(0.95);
      await decode(URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' })));
    }
    function decode(url) {
      return new Promise((resolve, reject) => {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
        const t = setTimeout(() => reject(new Error('video stalled')), 20000);
        v.addEventListener('loadeddata', () => { clearTimeout(t); armSeek(v); resolve(); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(t); reject(new Error('video error')); }, { once: true });
      });
    }
    // Poster first, then the film: the poster wins the bandwidth race, the film streams behind the ring.
    function initOnce() {
      if (started) return;
      started = true;
      let go = false;
      const begin = () => {
        if (go) return; go = true;
        load().then(() => {
          ring(1); size(); hero.classList.add('ready');
          seekTo(progress() * (video.duration - 0.05));
        }).catch(() => hero.classList.add('failed'));
      };
      poster.addEventListener('load', begin, { once: true });
      poster.addEventListener('error', begin, { once: true });
      poster.src = poster.dataset.src;
      setTimeout(begin, 4000);
    }
    addEventListener('resize', () => {
      if (!mode) return;
      measure();
      if (size() && video && video.readyState >= 2) paint(video, video.videoWidth, video.videoHeight);
      frame(shown, performance.now());
    });
    return {
      mode: () => mode,
      tone: () => tone,
      enable(m) {
        if (mode === m) return;
        if (mode) this.disable();
        mode = m;
        document.documentElement.classList.add(m);
        if (loadStart === null) loadStart = performance.now();
        if (m === 'scrub') initOnce();
        measure(); size();
        addEventListener('scroll', onScroll, { passive: true });
        shown = target = progress();
        if (raf === null) raf = requestAnimationFrame(tick);
      },
      disable() {
        if (!mode) return;
        document.documentElement.classList.remove(mode);
        mode = ''; tone = 'ink';
        removeEventListener('scroll', onScroll);
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; last = 0; }
        vars = new WeakMap();
        for (const el of [stage, view, ...halves, ...bands.map(b => b.el)]) el.removeAttribute('style');
      }
    };
  })();
  // Reduced motion starts the hero still, but the visitor can opt in (remembered on this device).
  let filmOptIn = store.get('bh-film', false);
  const optWrap = $('.film-opt'), optBtn = $('.film-opt-btn');
  function applyHeroMode() {
    if (!Film) return;
    const off = hero.closest('.view')?.hidden;      // one-page version: the hero only runs on the home view
    const small = MQLS.slice(0, 4).some(m => m.matches);
    const calm = reduced.matches;
    if (optWrap) {
      optWrap.hidden = !calm;                       // the choice only exists where the device asks for less motion
      optBtn.setAttribute('aria-pressed', String(filmOptIn));
      $('span', optBtn).textContent = filmOptIn ? optBtn.dataset.on : optBtn.dataset.off;
    }
    if (off || (calm && !filmOptIn)) Film.disable();
    else Film.enable(small ? 'reveal' : 'scrub');   // phones and portrait tablets never load the film
    ambient();
    navState();
  }
  optBtn?.addEventListener('click', () => {
    filmOptIn = !filmOptIn;
    store.set('bh-film', filmOptIn);
    applyHeroMode();
  });
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
  film = Film;

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
      // never enlarge a ~620px photo more than 1.3x
      lbImg.style.maxWidth = src.naturalWidth ? `min(92vw, ${Math.round(src.naturalWidth * 1.3)}px)` : '';
      lb.dataset.space = gal.dataset.space;
      cap.textContent = src.alt;
      count.textContent = `${at + 1} ${U.lightboxOf} ${shots.length}`;
    }
    $$('[data-gallery]').forEach(g => {
      g.addEventListener('click', e => {
        const b = e.target.closest('.shot-btn'); if (!b) return;
        gal = g;
        shots = $$('.shot-btn', g);                    // every photo of the space, folded chapters included
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

  /* ---------- room chapters: long ones fold after eight photos ---------- */
  $$('.chapter-more').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    const ch = b.closest('.chapter');
    $$('[data-extra]', ch).forEach(li => { li.hidden = !open; });
    b.setAttribute('aria-expanded', String(open));
    b.textContent = open ? b.dataset.less : b.dataset.more;
    if (!open && ch.getBoundingClientRect().top < 0) ch.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  }));

  /* ---------- five doors: hover flips through three rooms; phones swipe with snap and dots ---------- */
  $$('[data-door]').forEach(door => {
    const imgs = $$('.door-img', door), labels = $$('.door-rooms li', door), ticks = $$('.door-ticks i', door);
    const link = $('.door-link', door);
    let at = 0, timer = null;
    const show = i => {
      at = i;
      [imgs, labels, ticks].forEach(set => set.forEach((el, n) => el.classList.toggle('on', n === i)));
    };
    show(0);
    const start = () => {
      if (timer !== null || reduced.matches || imgs.length < 2) return;
      timer = setTimeout(function next() { show((at + 1) % imgs.length); timer = setTimeout(next, 1400); }, 420);
    };
    const stop = () => { clearTimeout(timer); timer = null; show(0); };
    link.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') start(); });
    link.addEventListener('pointerleave', stop);
    link.addEventListener('focus', () => { if (link.matches(':focus-visible')) start(); });
    link.addEventListener('blur', stop);
  });
  if (doorRow) {
    const dots = $$('.dot');
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const i = doorEls.indexOf(en.target);
        dots.forEach((d, n) => (n === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
      }
    }, { root: doorRow, threshold: 0.6 });
    doorEls.forEach(d => io.observe(d));
    dots.forEach((d, i) => d.addEventListener('click', () => {
      const el = doorEls[i];
      doorRow.scrollTo({ left: el.offsetLeft - doorRow.offsetLeft - (doorRow.clientWidth - el.offsetWidth) / 2, behavior: reduced.matches ? 'auto' : 'smooth' });
    }));
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
  function showRoute(hash, first) {
    if (!routes.length) return;
    const raw = decodeURIComponent((hash || '').replace(/^#/, ''));
    const name = raw.split('--')[0];
    const route = routes.find(r => r.dataset.route === name) || (raw ? null : routes[0]);
    if (!route) return;                              // e.g. #main: leave it to the browser
    const changed = route.hidden;
    const swap = () => {
      if (changed) {
        routes.forEach(r => { r.hidden = r !== route; });
        app.dataset.page = route.dataset.route;
        document.title = route.dataset.title;
        $$('#drawer a').forEach(a => a.toggleAttribute('aria-current', a.hash === '#' + route.dataset.route));
        applyHeroMode(); markPre(route); drawLines();
      }
      const target = raw.includes('--') && document.getElementById(raw);
      if (target) target.scrollIntoView({ behavior: changed || reduced.matches ? 'instant' : 'smooth' });
      else if (changed) scrollTo({ top: 0, behavior: 'instant' });
      navState();
    };
    // Changing view: an arch wipe (CSS ::view-transition) instead of a hard cut. Reduced motion gets the plain cut.
    if (changed && !first && document.startViewTransition && !reduced.matches) document.startViewTransition(swap);
    else swap();
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
  if (routes.length && location.hash) showRoute(location.hash, true);
  if (Film) applyHeroMode(); else ambient();
  window.BH = { toast, film: Film };   // film exposed for testing: BH.film.enable() / disable()
})();
