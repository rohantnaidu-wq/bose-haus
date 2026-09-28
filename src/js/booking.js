/* Bose Haus · booking.js · BOOKING SIMULATION (preview only)
   Nothing is sent anywhere. Replace the [data-booking] block in the space pages with the
   Lodgify widget and delete this file from the page to go live.
   Rules: sample booked dates, no same-day check-in, minimum nights, guests capped per space,
   weekday and Friday/Saturday rates, long-stay discount (percent), cleaning fee, tax (percent). */
(() => {
  'use strict';
  document.querySelectorAll('[data-booking-root]').forEach(root => {   // one per space page
  const space = root.closest('[data-booking]').dataset.booking;
  const S = SETTINGS, sp = S.spaces[space], U = COPY.ui, B = U.booking, NAME = COPY.spaces[space].name;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tbu = what => `<span class="tbu" data-tbu="${esc(what)}">${esc(U.toUpdate)}</span>`;
  const ICON = p => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = { left: ICON('<path d="M15 5l-7 7 7 7"/>'), right: ICON('<path d="M9 5l7 7-7 7"/>'),
              minus: ICON('<path d="M5 12h14"/>'), plus: ICON('<path d="M5 12h14M12 5v14"/>'), arrow: ICON('<path d="M4 12h16M14 6l6 6-6 6"/>') };

  /* ---------- dates ---------- */
  const day = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return day(x); };
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmt = d => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = day(new Date()), tomorrow = add(today, 1);

  // Sample booked nights: seeded per space so they stay the same on every visit
  const booked = new Set();
  (() => {
    let s = [...space].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 1; i < 200;) {
      if (r() < 0.16) { const len = 2 + Math.floor(r() * 4); for (let j = 0; j < len; j++) booked.add(key(add(today, i + j))); i += len + 2; }
      else i++;
    }
  })();

  const minSet = sp.minNights ?? S.minNightsDefault;
  const minN = minSet || 1;
  const state = { step: 0, inD: null, outD: null, guests: Math.min(2, sp.guests), month: 0,
                  form: { name: '', phone: '', email: '', note: '' }, errors: {}, msg: '', ref: '' };

  /* ---------- price ---------- */
  function nightsOf(a, b) { const out = []; for (let d = a; d < b; d = add(d, 1)) out.push(d); return out; }
  function quote() {
    if (!state.inD || !state.outD) return null;
    const nights = nightsOf(state.inD, state.outD);
    const wkend = nights.filter(d => d.getDay() === 5 || d.getDay() === 6).length;
    const wk = nights.length - wkend;
    const weekendRate = sp.weekend || sp.nightly;
    const sub = wk * sp.nightly + wkend * weekendRate;
    const disc = nights.length >= S.longStay.nights && S.longStay.discount ? Math.round(sub * S.longStay.discount / 100) : 0;
    const tax = Math.round((sub - disc + sp.cleaning) * S.taxRate / 100);
    return { n: nights.length, wk, wkend, weekendRate, sub, disc, tax, total: sub - disc + sp.cleaning + tax };
  }
  const money = (v, what) => v ? `${esc(S.currency)}${v.toLocaleString('en-IN')}`
    : `<span class="tbu tbu-price" data-tbu="${esc(what)}">${esc(S.currency)}0 · ${esc(U.toUpdate)}</span>`;

  /* ---------- rules ---------- */
  function pick(d) {
    state.msg = '';
    if (d < tomorrow) { state.msg = B.errSameDay; return; }
    const choosingOut = state.inD && !state.outD && d > state.inD;
    if (!choosingOut) {
      if (booked.has(key(d))) { state.msg = B.errBooked.replace('{date}', fmt(d)); return; }
      state.inD = d; state.outD = null; return;
    }
    const clash = nightsOf(state.inD, d).find(n => booked.has(key(n)));
    if (clash) { state.msg = B.errBooked.replace('{date}', fmt(clash)); return; }
    if (nightsOf(state.inD, d).length < minN) { state.msg = B.errMin.replace('{n}', minN); return; }
    state.outD = d;
  }
  function validate() {
    const f = state.form, e = {};
    if (f.name.trim().length < 2) e.name = B.errName;
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = B.errPhone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = B.errEmail;
    state.errors = e;
    return !Object.keys(e).length;
  }
  /* ---------- drawing ---------- */
  const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  function month(offset) {
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const title = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    let cells = DOW.map(d => `<span class="cal-dow" aria-hidden="true">${d}</span>`).join('');
    const lead = (first.getDay() + 6) % 7;
    cells += '<span></span>'.repeat(lead);
    for (let d = first; d.getMonth() === first.getMonth(); d = add(d, 1)) {
      const k = key(d), past = d < tomorrow, isB = booked.has(k);
      const cls = ['day'];
      if (isB) cls.push('booked');
      if (+d === +today) cls.push('today');
      if (state.inD && +d === +state.inD) cls.push('in');
      if (state.outD && +d === +state.outD) cls.push('out');
      if (state.inD && state.outD && d > state.inD && d < state.outD) cls.push('range');
      const label = `${fmt(d)}${isB ? ', ' + B.legendBooked : ''}`;
      cells += `<button type="button" class="${cls.join(' ')}" data-day="${k}" aria-label="${esc(label)}"${past ? ' disabled' : ''}${cls.includes('in') || cls.includes('out') ? ' aria-pressed="true"' : ''}>${d.getDate()}</button>`;
    }
    return `<div class="cal-month"><p class="cal-title">${esc(title)}</p><div class="cal-grid">${cells}</div></div>`;
  }
  function summary() {
    const q = quote();
    const dates = `<dl class="bk-dates"><div><dt>${esc(B.checkIn)}</dt><dd>${state.inD ? esc(fmt(state.inD)) : '·'}</dd></div>
      <div><dt>${esc(B.checkOut)}</dt><dd>${state.outD ? esc(fmt(state.outD)) : '·'}</dd></div></dl>`;
    const guests = `<div class="stepper"><span>${esc(B.guests)}</span><div>
      <button type="button" data-g="-1" aria-label="${esc(B.fewer)}"${state.guests <= 1 ? ' disabled' : ''}>${I.minus}</button>
      <output aria-live="polite">${state.guests}</output>
      <button type="button" data-g="1" aria-label="${esc(B.more)}"${state.step ? ' disabled' : ''}>${I.plus}</button></div></div>`;
    let lines = `<div><span>${esc(B.minStay)}</span><span>${minSet ? `${minSet} ${esc(B.nights)}` : tbu(NAME + ': minimum nights')}</span></div>`;
    if (q) {
      lines += `<div><span>${esc(B.weeknights)} · ${q.wk} × ${money(sp.nightly, NAME + ': nightly price')}</span><span>${money(q.wk * sp.nightly, NAME + ': nightly price')}</span></div>`;
      if (q.wkend) lines += `<div><span>${esc(B.weekendNights)} · ${q.wkend} × ${money(q.weekendRate, NAME + ': weekend price')}</span><span>${money(q.wkend * q.weekendRate, NAME + ': weekend price')}</span></div>`;
      if (q.n >= S.longStay.nights) lines += `<div><span>${esc(B.longStay)}</span><span>${q.disc ? '−' + money(q.disc) : tbu('Long-stay discount')}</span></div>`;
      lines += `<div><span>${esc(B.cleaning)}</span><span>${money(sp.cleaning, NAME + ': cleaning fee')}</span></div>`;
      lines += `<div><span>${esc(B.tax)}</span><span>${S.taxRate ? money(q.tax) : tbu('Tax rate')}</span></div>`;
      lines += `<div class="total"><span>${esc(B.total)} · ${q.n} ${esc(q.n === 1 ? B.night : B.nights)}</span><span>${money(q.total, NAME + ': prices')}</span></div>`;
    } else {
      lines += `<div><span>${esc(B.perNight)}</span><span>${money(sp.nightly, NAME + ': nightly price')}</span></div>`;
    }
    return `<aside class="bk-card bk-sum"><h3>${esc(NAME)}</h3>${dates}${guests}<div class="lines">${lines}</div>
      <p class="bk-msg" role="alert">${esc(state.msg)}</p>${actions()}</aside>`;
  }
  function actions() {
    if (state.step === 0) return `<div class="bk-actions"><button type="button" class="btn btn-accent" data-go="1">${esc(B.continue)}${I.arrow}</button>
      ${state.inD ? `<button type="button" class="btn btn-ghost" data-clear>${esc(B.clear)}</button>` : ''}</div>`;
    return '';
  }
  function field(id, label, type, hint, auto) {
    const err = state.errors[id] || '';
    const fid = `bk-${space}-${id}`;
    return `<div class="field"${err ? ' data-error' : ''}><label for="${fid}">${esc(label)}</label>
      <input id="${fid}" name="${id}" type="${type}" autocomplete="${auto}" value="${esc(state.form[id])}"
        aria-describedby="${hint ? fid + '-hint ' : ''}${fid}-err"${err ? ' aria-invalid="true"' : ''}>
      ${hint ? `<small id="${fid}-hint">${esc(hint)}</small>` : ''}<p class="err" id="${fid}-err">${esc(err)}</p></div>`;
  }
  function pane() {
    if (state.step === 0) {
      const two = matchMedia('(min-width: 700px)').matches;
      const hint = !state.inD ? B.pickIn : !state.outD ? B.pickOut : '';
      return `<div class="bk-card"><div class="cal-head"><p>${esc(hint || `${fmt(state.inD)} → ${fmt(state.outD)}`)}</p>
        <div class="cal-nav"><button type="button" data-m="-1" aria-label="${esc(B.prevMonth)}"${state.month <= 0 ? ' disabled' : ''}>${I.left}</button>
        <button type="button" data-m="1" aria-label="${esc(B.nextMonth)}"${state.month >= 5 ? ' disabled' : ''}>${I.right}</button></div></div>
        <div class="cal-months">${month(state.month)}${two ? month(state.month + 1) : ''}</div>
        <p class="cal-legend"><span><i class="lg-free"></i>${esc(B.legendFree)}</span><span><i class="lg-booked"></i>${esc(B.legendBooked)}</span>
        <span><i class="lg-picked"></i>${esc(B.legendPicked)}</span></p></div>`;
    }
    if (state.step === 1) {
      const bad = Object.keys(state.errors).length;
      return `<form class="bk-card" data-form novalidate><h3 class="h-section" tabindex="-1" data-focus>${esc(B.steps[1])}</h3>
        ${bad ? `<p class="bk-msg" role="alert">${esc(B.errSummary)}</p>` : ''}
        ${field('name', B.name, 'text', '', 'name')}${field('phone', B.phone, 'tel', B.phoneHint, 'tel')}${field('email', B.email, 'email', '', 'email')}
        <div class="field"><label for="bk-${space}-note">${esc(B.note)}</label><textarea id="bk-${space}-note" name="note" rows="3" aria-describedby="bk-${space}-note-hint">${esc(state.form.note)}</textarea>
        <small id="bk-${space}-note-hint">${esc(B.noteHint)}</small></div>
        <div class="bk-actions"><button type="button" class="btn btn-ghost" data-go="0">${esc(B.back)}</button>
        <button type="submit" class="btn btn-accent">${esc(B.continue)}${I.arrow}</button></div></form>`;
    }
    if (state.step === 2) {
      const q = quote(), f = state.form;
      const row = (k, v) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
      return `<div class="bk-card"><h3 class="h-section" tabindex="-1" data-focus>${esc(B.reviewTitle)}</h3><dl class="review">
        ${row(NAME, `${esc(fmt(state.inD))} → ${esc(fmt(state.outD))} · ${q.n} ${esc(q.n === 1 ? B.night : B.nights)}`)}
        ${row(B.guests, state.guests)}${row(B.name, esc(f.name))}${row(B.phone, esc(f.phone))}${row(B.email, esc(f.email))}
        ${f.note ? row(B.note, esc(f.note)) : ''}${row(B.total, money(q.total, NAME + ': prices'))}</dl>
        <p class="preview-pill">${esc(COPY.site.previewLabel)}</p>
        <div class="bk-actions"><button type="button" class="btn btn-ghost" data-go="1">${esc(B.edit)}</button>
        <button type="button" class="btn btn-accent" data-send>${esc(B.send)}${I.arrow}</button></div></div>`;
    }
    const t = S.times;
    return `<div class="bk-card sent"><h3 class="h-section" tabindex="-1" data-focus>${esc(B.sentTitle)}</h3>
      <p>${esc(B.reference)}</p><p class="ref">${esc(state.ref)}</p>
      <h4 class="kicker">${esc(B.nextTitle)}</h4><ol>
      <li>${esc(B.next1)}</li><li>${esc(B.next2)} ${S.paymentProcess ? esc(S.paymentProcess) : tbu('How guests pay')}</li>
      <li>${esc(B.next3)} ${t.checkIn ? esc(t.checkIn) : tbu('Check-in time')}.</li><li>${esc(B.next4)}</li></ol>
      <p class="preview-pill">${esc(COPY.site.previewLabel)}</p>
      <div class="bk-actions"><button type="button" class="btn btn-ghost" data-restart>${esc(B.another)}</button></div></div>`;
  }
  function render(focus) {
    const steps = B.steps.map((s, i) => `<li class="${i === state.step ? 'on' : i < state.step ? 'done' : ''}"${i === state.step ? ' aria-current="step"' : ''}>${esc(s)}</li>`).join('');
    root.innerHTML = `<ol class="bk-steps">${steps}</ol><div class="bk">${pane()}${state.step < 3 ? summary() : ''}</div>`;
    if (focus) (root.querySelector('[aria-invalid]') || root.querySelector('[data-focus]'))?.focus();
  }

  /* ---------- events ---------- */
  root.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.day) { pick(day(new Date(t.dataset.day + 'T00:00'))); render(); root.querySelector(`[data-day="${t.dataset.day}"]`)?.focus(); return; }
    if (t.dataset.m) { state.month = Math.max(0, Math.min(5, state.month + Number(t.dataset.m))); render(); root.querySelector(`[data-m="${t.dataset.m}"]`)?.focus(); return; }
    if (t.dataset.g) {
      const g = state.guests + Number(t.dataset.g);
      const largest = sp.guests >= Math.max(...Object.values(S.spaces).map(x => x.guests));
      state.msg = g > sp.guests ? (largest ? B.errGuestsLargest : B.errGuests).replace('{space}', NAME).replace('{n}', sp.guests) : '';
      state.guests = Math.max(1, Math.min(sp.guests, g)); render(); root.querySelector(`[data-g="${t.dataset.g}"]`)?.focus(); return;
    }
    if (t.hasAttribute('data-clear')) { state.inD = state.outD = null; state.msg = ''; render(); return; }
    if (t.dataset.go === '1' && state.step === 0) {
      if (!state.inD || !state.outD) { state.msg = B.errNoDates; render(); root.querySelector('.bk-msg')?.focus(); return; }
      state.step = 1; state.msg = ''; render(true); return;
    }
    if (t.dataset.go) { state.step = Number(t.dataset.go); render(true); return; }
    if (t.hasAttribute('data-send')) {
      state.ref = `BH-${space.slice(0, 3).toUpperCase()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      state.step = 3; render(true); return;
    }
    if (t.hasAttribute('data-restart')) {
      Object.assign(state, { step: 0, inD: null, outD: null, msg: '', errors: {}, ref: '', guests: Math.min(2, sp.guests),
                             form: { name: '', phone: '', email: '', note: '' } });
      render(true);
    }
  });
  root.addEventListener('input', e => { if (e.target.name in state.form) state.form[e.target.name] = e.target.value; });
  root.addEventListener('submit', e => { e.preventDefault(); state.step = validate() ? 2 : 1; render(true); });
  matchMedia('(min-width: 700px)').addEventListener('change', () => { if (state.step === 0) render(); });
  render();
  });
})();
