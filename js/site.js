(() => {
// no native image dragging anywhere on the site
document.addEventListener('dragstart', e => { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer:fine)').matches;
const restart = (el, ...cls) => { el.classList.remove(...cls); void el.offsetWidth; el.classList.add(...cls); };
const glyphs = 'abcdefghijklmnopqrstuvwxyz0123456789@._-#%&';
// reveals
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal, .tl-item').forEach(el => io.observe(el));
// nav active
const links = $$('.nav-link');
const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); } }), { rootMargin: '-45% 0px -45% 0px' });
secs.forEach(s => so.observe(s));
const nav = $('#nav'), prog = $('#progress'), par = $$('[data-parallax]');
const track = $('#tkdTrack'), fill = $('#tkdFill'), belt = $('#belt'), steps = $$('#steps > div'), tkdArt = $('#tkdArt');
const tl = $('#tl'), tlLine = $('#tlLine');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// smoothed scroll value drives parallax/pinned effects; nav + progress use the raw value
let sy = scrollY, ty = scrollY;
function frame() {
  const h = innerHeight, max = document.documentElement.scrollHeight - h;
  nav.classList.toggle('solid', ty > 40);
  prog.style.transform = `scaleX(${max ? ty / max : 0})`;
  if (!reduce) par.forEach(el => { if (sy < h * 1.2) el.style.transform = `translate3d(0,${sy * +el.dataset.parallax}px,0)`; });
  if (track) {
    const r = track.getBoundingClientRect();
    const p = clamp(-(r.top + (ty - sy)) / (r.height - h), 0, 1);
    fill.style.clipPath = `inset(0 ${(1 - clamp(p * 1.4, 0, 1)) * 100}% 0 0)`;
    belt.style.transform = `translateY(-50%) scaleX(${clamp(p * 1.2, 0, 1)})`;
    steps.forEach((s, i) => s.classList.toggle('lit', p > (i + 1) / (steps.length + 1) - 0.12));
    if (tkdArt && !reduce) tkdArt.style.transform = `translate3d(0,${(p - .5) * 80}px,0) scale(${1.08 - p * .08})`;
  }
  if (tl) {
    const r = tl.getBoundingClientRect();
    tlLine.style.height = clamp((h * 0.7 - r.top) / r.height, 0, 1) * 100 + '%';
  }
}
let running = false;
function loop() {
  ty = scrollY;
  const d = ty - sy;
  if (Math.abs(d) > .5) { sy = reduce ? ty : sy + d * .12; frame(); requestAnimationFrame(loop); }
  else { sy = ty; frame(); running = false; }
}
const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
addEventListener('scroll', kick, { passive: true });
addEventListener('resize', kick);
// intro choreography: crest lands first, then the world fades in around it
setTimeout(() => document.documentElement.classList.add('ready'), reduce ? 0 : 900);
// the crown tip only lights once the crest has finished settling (ready + 1.3s landing)
setTimeout(() => document.documentElement.classList.add('settled'), reduce ? 0 : 2200);
// crown-tip burst now and then
const spark = $('#spark');
if (spark && !reduce) { const burst = () => { restart(spark, 'burst'); setTimeout(burst, 4000 + Math.random() * 6000); }; setTimeout(burst, 3000); }
// hero raven blinks occasionally
const eye = $('#eye');
const blinkOnce = () => { eye.classList.remove('twice', 'slow'); restart(eye, 'blink'); };
if (eye && !reduce) {
  const blink = () => {
    if (hero && (hero.classList.contains('storming') || hero.classList.contains('possessed') || hero.classList.contains('waking') || hero.classList.contains('glaring') || hero.classList.contains('summoning') || hero.classList.contains('annoyed'))) { setTimeout(blink, 1500); return; }
    blinkOnce();
    const r = Math.random();
    if (r < .25) eye.classList.add('twice'); else if (r < .33) eye.classList.add('slow');
    setTimeout(blink, 2800 + Math.random() * 5200);
  };
  setTimeout(blink, 2600);
}
// the hero name's resting CSS filter; WAAPI filter keyframes on h1 must include it or the shadows vanish mid-animation
const DS = 'drop-shadow(0 3px 2px rgba(5,2,10,.9)) drop-shadow(0 14px 22px rgba(5,2,10,.85)) drop-shadow(0 0 40px rgba(180,107,255,.22))';
const hangul = '가나다라마바사아자차카타파하검도태권송암승필백학혜기답연마무예마이클스콰이어';
const scrambleText = (el, target, dur, cb, set = glyphs) => {
  const t0 = performance.now(), n = Math.max(el.textContent.length, target.length), tok = el._scr = {}; el._txt = target;
  const tick = now => {
    if (el._scr !== tok) return; // a newer scramble on this element takes over
    const p = Math.min(1, (now - t0) / dur), locked = Math.floor(p * target.length);
    let out = '';
    for (let i = 0; i < (p < .5 ? n : target.length); i++) out += i < locked ? target[i] : set[Math.random() * set.length | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick); else { el.textContent = target; cb && cb(); }
  };
  if (reduce) { el.textContent = target; cb && cb(); } else requestAnimationFrame(tick);
};
// crown: hop + smooth scroll to top
const crownLink = $('#crownLink'), lockup = crownLink && crownLink.closest('.lockup');
if (crownLink) crownLink.addEventListener('click', e => {
  e.preventDefault();
  if (!reduce && lockup) restart(lockup, 'hop');
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
});
// wordmark: click scrambles SqMK -> Michael Squires -> back
const brand = $('#brand');
if (brand) {
  const b1 = brand.querySelector('.b1'), b2 = brand.querySelector('.b2'), glyphSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&';
  let busy = false;
  const go = () => {
    if (busy) return; busy = true;
    lockup && lockup.classList.add('scrambling'); brand.classList.add('long');
    scrambleText(b1, b1.dataset.long, 650, null, glyphSet);
    scrambleText(b2, b2.dataset.long, 800, () => setTimeout(() => {
      brand.classList.remove('long');
      scrambleText(b1, b1.dataset.short, 600, null, glyphSet);
      scrambleText(b2, b2.dataset.short, 700, () => { lockup && lockup.classList.remove('scrambling'); busy = false; }, glyphSet);
    }, 2600), glyphSet);
  };
  brand.addEventListener('click', go);
  brand.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
}
// footer easter eggs
const yearEl = $('#year'), crest = $('#footCrest');
if (yearEl) new IntersectionObserver((es, o) => { if (!es[0].isIntersecting) return; o.disconnect(); const end = new Date().getFullYear(), t0 = performance.now(); const tick = now => { const p = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - p, 3); yearEl.textContent = Math.round(2007 + (end - 2007) * e); if (p < 1) requestAnimationFrame(tick); }; if (reduce) yearEl.textContent = end; else requestAnimationFrame(tick); }, { threshold: .5 }).observe(yearEl);
if (crest) {
  const wrap = crest.parentElement, talk = $('.talk');
  let fired = false;
  // one click: the crest pops and glows, and "Let's talk" scrambles into the Korean proverb
  crest.addEventListener('click', () => {
    if (fired) return;
    fired = true;
    wrap.style.setProperty('--g', 4); wrap.style.setProperty('--s', 0);
    restart(wrap, 'pulse');
    wrap.classList.add('done');
    const words = talk ? talk.querySelectorAll('.w') : [];
    const reset = () => {
      wrap.classList.remove('done', 'pulse'); wrap.style.setProperty('--g', 0);
      if (words.length === 2) { scrambleText(words[0], "Let's", 1000, () => talk.classList.remove('ko')); scrambleText(words[1], 'talk', 1200, () => { fired = false; setTimeout(() => talk.style.minHeight = '', 700); }); }
      else fired = false;
    };
    if (words.length === 2) {
      words.forEach(w => { w.querySelectorAll('i').forEach(i => { i.style.transition = 'none'; i.style.opacity = 1; i.style.transform = 'none'; }); });
      talk.style.minHeight = talk.offsetHeight + 'px'; // lock height so nothing below jumps when the text swaps
      setTimeout(() => {
        talk.classList.add('ko');
        scrambleText(words[0], '정신일도', 1300, null, hangul);
        scrambleText(words[1], '하사불성', 1700, () => setTimeout(reset, 4500), hangul);
      }, 250);
    } else setTimeout(reset, 2000);
    crest.title = '';
  });
}
const hero = $('.hero');
// crest parallax toward pointer
const logoWrap = $('#logoWrap');
// shared hero nodes, looked up once
const heroCrest = $('.hero-crest'), heroInner = $('.hero-inner'), evilEye = $('#evil'), meteorLight = $('#meteorlight'), meteorsFront = $('#meteorsFront');
if (logoWrap && !reduce && fine) {
  const set = (rx, ry, tx, ty, px = 0, py = 0) => { const s = logoWrap.style; s.setProperty('--rx', rx + 'deg'); s.setProperty('--ry', ry + 'deg'); s.setProperty('--tx', tx + 'px'); s.setProperty('--ty', ty + 'px'); s.setProperty('--px', px); s.setProperty('--py', py); };
  logoWrap.addEventListener('pointermove', e => { const r = logoWrap.getBoundingClientRect(); const cx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1), cy = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1); set(cx * 9, -cy * 7, cx * 14, cy * 10, cx, cy); });
  logoWrap.addEventListener('pointerleave', () => set(0, 0, 0, 0));
}
// storm: a meteor shower + lightning behind the hero while the quotes run
const stormEl = $('#storm'), bolt = stormEl && stormEl.querySelector('.bolt');
const crestEl = heroCrest;
let stormSeq = 0;
const storm = () => {
  if (reduce || !stormEl || !hero) return () => {};
  const sid = ++stormSeq;
  // clear any leftovers from a previous storm before building this one
  stormEl.querySelectorAll('.shm').forEach(x => x.remove()); const fr0 = meteorsFront; if (fr0) fr0.replaceChildren(); const bk0 = $('#meteorsBack'); if (bk0) bk0.replaceChildren();
  // three depths: far = thin, short, slow, faint; mid = current; near = thick, long, fast, soft-focus
  const k = innerWidth < 700 ? .5 : 1;
  // meteor shower in three depths: far = faint starlike specks, mid = gold meteors, near = rare bright fireballs.
  // each crosses in the first ~40% of its cycle and is dark the rest, so arrivals feel sporadic.
  const layers = [
    { cls: 'far', n: 34, l: [5, 6], d: [3.2, 2.4], o: [.35, .35] },
    { cls: 'mid', n: 16, l: [12, 10], d: [2.2, 1.6], o: [.55, .35] },
    { cls: 'near', n: 4, l: [24, 14], d: [2.6, 1.8], o: [.8, .2] }
  ];
  const rbox = stormEl.querySelector('.showerbox'), sub = {}; ['far', 'mid', 'near'].forEach(c => sub[c] = rbox && rbox.querySelector('.rb.' + c));
  const frags = { far: document.createDocumentFragment(), mid: document.createDocumentFragment(), near: document.createDocumentFragment() };
  // each meteor respawns at a fresh random x every time it loops, so no fixed lanes form
  const reseed = e => { const t = e.currentTarget; t.style.left = (10 + Math.random() * 150) + '%'; };
  layers.forEach(L => { const cnt = Math.round(L.n * k); for (let i = 0; i < cnt; i++) {
    const d = document.createElement('i'); d.className = 'shm ' + L.cls;
    d.style.left = (10 + (i + Math.random()) / cnt * 150) + '%';
    d.addEventListener('animationiteration', reseed);
    d.style.setProperty('--l', (L.l[0] + Math.random() * L.l[1]) + 'vh');
    d.style.setProperty('--d', (L.d[0] + Math.random() * L.d[1]) + 's');
    d.style.setProperty('--w', (.3 + Math.random() * 3) + 's');
    d.style.setProperty('--o', (L.o[0] + Math.random() * L.o[1]).toFixed(2));
    frags[L.cls].appendChild(d);
  } });
  Object.keys(frags).forEach(c => (sub[c] || rbox || stormEl).appendChild(frags[c]));
  const front = meteorsFront;
  // two giant meteors: the first tears past in front of the crest, the second strikes it
  const hcrest = heroCrest;
  const impact = (lx, ly, sx, sy, pw = 1) => {
    if (!hcrest) return;
    const debris = document.createDocumentFragment();
    // crater: molten core that cools orange -> red -> violet, inside a charred ring, kept on the bird
    const mk = c => { const e = document.createElement('i'); e.className = c + (pw > 1 ? ' mega' : ''); e.style.setProperty('--cx', lx.toFixed(1) + '%'); e.style.setProperty('--cy', ly.toFixed(1) + '%'); hcrest.appendChild(e); return e; };
    const ch = mk('crater-char'), ht = mk('crater-hot');
    ch.animate([{ opacity: 0 }, { opacity: 1, offset: .03 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 6200, easing: 'ease-in', fill: 'forwards' }).onfinish = () => ch.remove();
    ht.animate([{ opacity: 1 }, { opacity: 1, offset: .12 }, { opacity: .9, offset: .35 }, { opacity: .6, offset: .6 }, { opacity: 0 }], { duration: 5400, easing: 'ease-out', fill: 'forwards' }).onfinish = () => ht.remove();
    // sparks burst from the hit and fall
    const hr = hero.getBoundingClientRect(), px = sx - hr.left, py = sy - hr.top;
    for (let k = 0, n = Math.round((innerWidth < 700 ? 14 : 28) * (pw > 1 ? 1.35 : 1)); k < n; k++) { const s = document.createElement('i'); s.className = 'spk'; debris.appendChild(s);
      const ang = -Math.PI / 2 + (Math.random() - .5) * 3, v = (60 + Math.random() * 190) * (pw > 1 ? 1.7 : 1), ex = Math.cos(ang) * v, ey = Math.sin(ang) * v;
      s.animate([{ transform: `translate(${px}px,${py}px) scale(1)`, opacity: 1 }, { transform: `translate(${px + ex * .7}px,${py + ey * .7}px) scale(.8)`, opacity: 1, offset: .45 }, { transform: `translate(${px + ex}px,${py + ey + 70 + Math.random() * 60}px) scale(.3)`, opacity: 0 }], { duration: 650 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.5,1)', fill: 'forwards' }).onfinish = () => s.remove(); }
    // chunks of the crest blast off, spinning
    for (let k = 0, n = Math.round((innerWidth < 700 ? 6 : 12) * (pw > 1 ? 1.35 : 1)); k < n; k++) { const s = document.createElement('i'); s.className = 'shard'; debris.appendChild(s);
      const ang = -Math.PI / 2 + (Math.random() - .5) * 2.4, v = (70 + Math.random() * 150) * (pw > 1 ? 1.7 : 1), ex = Math.cos(ang) * v, ey = Math.sin(ang) * v, rot = (Math.random() - .5) * 900, sc = .7 + Math.random() * 1.4;
      s.animate([{ transform: `translate(${px}px,${py}px) rotate(0deg) scale(${sc})`, opacity: 1 }, { transform: `translate(${px + ex * .75}px,${py + ey * .75}px) rotate(${rot * .5}deg) scale(${sc})`, opacity: 1, offset: .4 }, { transform: `translate(${px + ex * 1.1}px,${py + ey + 160 + Math.random() * 80}px) rotate(${rot}deg) scale(${sc * .8})`, opacity: 0 }], { duration: 1000 + Math.random() * 600, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'forwards' }).onfinish = () => s.remove(); }
    // smoke rolls up out of the crater
    for (let k = 0; k < (pw > 1 ? 6 : 5); k++) { const s = document.createElement('i'); s.className = 'smoke' + (pw > 1 ? ' mega' : ''); debris.appendChild(s); const dx = (Math.random() - .5) * 50;
      s.animate([{ transform: `translate(${px}px,${py}px) scale(.3)`, opacity: 0 }, { opacity: .9, offset: .15 }, { transform: `translate(${px + dx}px,${py - 90 - Math.random() * 60}px) scale(${2 + Math.random() * 1.5})`, opacity: 0 }], { duration: 2200 + Math.random() * 1000, delay: k * 120, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'both' }).onfinish = () => s.remove(); }
    hero.appendChild(debris);
    // a searing flash, the whole hero is rocked, and the crest is knocked back hard
    const fl = document.createElement('i'); fl.className = 'iflash'; fl.style.setProperty('--fx', px + 'px'); fl.style.setProperty('--fy', py + 'px'); hero.appendChild(fl);
    fl.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: .4, offset: .25 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' }).onfinish = () => fl.remove();
    const hi = heroInner; if (hi && hi.animate) hi.animate([{ translate: '0 0' }, { translate: '-14px 10px' }, { translate: '12px -9px' }, { translate: '-10px 6px' }, { translate: '8px -5px' }, { translate: '-5px 3px' }, { translate: '3px -2px' }, { translate: '0 0' }], { duration: 560, easing: 'linear' });
    hcrest.animate([{ rotate: '0deg', scale: '1' }, { rotate: '-8deg', scale: '.9', offset: .1 }, { rotate: '3.5deg', scale: '1.02', offset: .32 }, { rotate: '-1.6deg', scale: '.99', offset: .55 }, { rotate: '.6deg', offset: .78 }, { rotate: '0deg', scale: '1' }], { duration: 1100, easing: 'ease-out' });
    const evq = evilEye; if (evq) { restart(evq, 'flare'); setTimeout(() => evq.classList.remove('flare'), 700); }
    if (pw > 1) {
      // reality glitches: the scene tears into shifted slices, colours split, the text jumps, then it snaps back
      if (!reduce) { restart(hero, 'glitch'); clearTimeout(hero._gl); hero._gl = setTimeout(() => hero.classList.remove('glitch'), 1100);
        const hw = $('.hero h1'); if (hw) hw.querySelectorAll('.w').forEach((w, i) => { const t = w._txt || w.textContent; scrambleText(w, t, 700 + i * 200); });
        // stepped jumps layered on top (composite add), so the elements' own entrance animations are never replaced or replayed
        const J = [['-10px 2px', '12deg'], ['14px -1px', '-6deg'], ['0 0', '0deg'], ['-6px 0', '4deg'], ['8px 1px', '0deg'], ['0 0', '0deg'], ['-3px 0', '-3deg'], ['0 0', '0deg']], O = [0, .1, .2, .3, .4, .55, .65, .8];
        const jf = J.map(([t, k], i) => ({ translate: t, transform: 'skewX(' + k + ')', offset: O[i], easing: 'steps(1)' })); jf.push({ translate: '0 0', transform: 'skewX(0deg)', offset: 1 });
        ['.hero h1', '.hero-sub', '.hero-actions'].forEach((q, i) => { const e = $(q); if (e && e.animate) e.animate(jf, { duration: 950, delay: i * 50, composite: 'add' }); }); }
      // the whole emblem goes white-hot purple, then cools
      const hg = document.createElement('i'); hg.className = 'hotglow'; hg.innerHTML = '<i></i>'; hg.firstChild.style.setProperty('--cx', lx.toFixed(1) + '%'); hg.firstChild.style.setProperty('--cy', ly.toFixed(1) + '%'); hcrest.appendChild(hg);
      hg.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: .95, offset: .3 }, { opacity: .6, offset: .6 }, { opacity: 0 }], { duration: 4200, easing: 'ease-out', fill: 'forwards' }).onfinish = () => hg.remove();
      // the colossal hit: a white-out, a massive shockwave, and a long violent quake
      fl.style.setProperty('--fx', px + 'px'); const wo = document.createElement('i'); wo.className = 'whiteout'; hero.appendChild(wo);
      wo.animate([{ opacity: 0 }, { opacity: 1, offset: .05 }, { opacity: .85, offset: .2 }, { opacity: 0 }], { duration: 1500, easing: 'ease-out' }).onfinish = () => wo.remove();
      // a gold ring leads the violet shockwave
      const R = Math.hypot(hr.width, hr.height) / 20, gs = document.createElement('i'); gs.className = 'shock gold'; const ring = (el, S, bw) => { el.style.width = el.style.height = 40 * S + 'px'; el.style.margin = -20 * S + 'px'; el.style.borderWidth = bw + 'px'; return .1 / S; }; const g0 = ring(gs, R * 1.3, 3); hero.appendChild(gs);
      gs.animate([{ transform: `translate(${px}px,${py}px) scale(${g0})`, opacity: 1 }, { opacity: 1, offset: .15 }, { transform: `translate(${px}px,${py}px) scale(1)`, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.05,.8,.25,1)', fill: 'both' }).onfinish = () => gs.remove();
      const sh = document.createElement('i'); sh.className = 'shock'; const s0 = ring(sh, R * 1.2, 2); hero.appendChild(sh);
      sh.animate([{ transform: `translate(${px}px,${py}px) scale(${s0})`, opacity: 1 }, { opacity: 1, offset: .2 }, { transform: `translate(${px}px,${py}px) scale(1)`, opacity: 0 }], { duration: 1200, delay: 120, easing: 'cubic-bezier(.05,.8,.25,1)', fill: 'both' }).onfinish = () => sh.remove();
      if (hi && hi.animate) hi.animate([{ translate: '0 0' }, { translate: '-26px 18px' }, { translate: '22px -16px' }, { translate: '-18px 12px' }, { translate: '15px -10px' }, { translate: '-11px 7px' }, { translate: '8px -5px' }, { translate: '-5px 3px' }, { translate: '0 0' }], { duration: 1100, easing: 'linear' });
      hcrest.animate([{ rotate: '0deg', scale: '1' }, { rotate: '-14deg', scale: '.84', offset: .1 }, { rotate: '6deg', scale: '1.03', offset: .3 }, { rotate: '-3deg', scale: '.98', offset: .52 }, { rotate: '1.2deg', offset: .75 }, { rotate: '0deg', scale: '1' }], { duration: 1500, easing: 'ease-out' });
    }
    const ml = meteorLight; if (ml) { ml.style.setProperty('--mlx', lx + '%'); ml.style.setProperty('--mly', ly + '%'); ml.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' }); }
  };
  const launchBig = (wait, strike, onHit, mega, layer) => {
    const front = layer || meteorsFront; if (!front) return;
    const b = document.createElement('i'); b.className = 'bigm' + (mega ? ' mega' : '');
    // aim the path so the fireball head crosses the crest (path runs down-left at 42°, tan ≈ .9)
    const vh = innerHeight / 100, fr = front.getBoundingClientRect(), tr = (crestEl || hero).getBoundingClientRect();
    // strikers aim near the middle; passers cross anywhere on the emblem (random point in its disc, spread evenly by area),
    // nudged away from the last passer's line so consecutive ones don't retrace the same path
    let ax = .5, ay = .5;
    if (strike) { ax = .4 + Math.random() * .2; ay = .42 + Math.random() * .16; }
    else { let r, th, tries = 0; do { r = .44 * Math.sqrt(Math.random()); th = Math.random() * Math.PI * 2; ax = .5 + Math.cos(th) * r; ay = .5 + Math.sin(th) * r; } while (++tries < 6 && Math.abs((ax + .9 * ay) - (launchBig.last ?? 9)) < .22); launchBig.last = ax + .9 * ay; }
    const tx = tr.left + tr.width * ax, ty = tr.top + tr.height * ay;
    const hy0 = fr.top - 75 * vh + 42.5 * vh + 31.6 * vh, hx0 = tx + .9 * (ty - hy0);
    b.style.left = (hx0 + 28.4 * vh - 8 - fr.left) + 'px'; b.style.setProperty('--w', wait.toFixed(2) + 's'); front.appendChild(b);
    // a zero-size marker at the fireball's head gives its true on-screen position every frame
    const head = document.createElement('b'); head.style.cssText = 'position:absolute;left:50%;bottom:-12px;width:0;height:0'; b.appendChild(head);
    // correct the aim from real measurements: the estimate above assumes innerHeight === 1vh*100, which isn't true on
    // iOS Safari (vh is the toolbar-hidden height) and drifts with the hero's scroll parallax. measure the head's actual
    // start point and the real flight direction (-170vh, 189vh), then slide the meteor sideways so its line hits the target.
    { const pr = document.createElement('i'); pr.style.cssText = 'position:fixed;top:0;height:100vh;width:0;visibility:hidden'; document.body.appendChild(pr); const cvh = pr.getBoundingClientRect().height / 100; pr.remove();
      const h0 = head.getBoundingClientRect(), dx = -170 * cvh, dy = 189 * cvh;
      const off = (tx - h0.left) - (ty - h0.top) * dx / dy;
      if (isFinite(off)) b.style.left = (parseFloat(b.style.left) + off) + 'px'; }
    const ml = layer ? null : meteorLight, anim = b.getAnimations && b.getAnimations()[0]; // meteors behind the emblem don't light it
    let hit = false, fno = 0, crc = null;
    // the strike always lands on its target point, however it's triggered (position check, progress check, or the flight ending)
    const doHit = (hx, hy) => { if (hit || !crestEl || !hero.classList.contains('storming')) { if (!hit) b.remove(); return; } hit = true; if (anim) anim.pause(); b.classList.add('hit');
      const cr = crestEl.getBoundingClientRect();
      // the head is spent on impact, but its burning trail hangs in the air and fades out
      b.animate([{ opacity: 1, filter: 'brightness(1.4)' }, { opacity: .8, filter: 'brightness(1)', offset: .2 }, { opacity: 0, filter: 'brightness(.7)' }], { duration: 1400, easing: 'ease-out', fill: 'forwards' }).onfinish = () => b.remove(); if (ml) ml.style.opacity = 0;
      // land where the head actually is (the crest may have moved since launch); fall back to the aim point if the head was never measured
      const sx = hx ?? cr.left + cr.width * ax, sy = hy ?? cr.top + cr.height * ay;
      impact((sx - cr.left) / cr.width * 100, (sy - cr.top) / cr.height * 100, sx, sy, mega ? 2.5 : 1); if (onHit) onHit(); };
    // on slow phones a frame can skip past the crest, or the flight can end between frames: never let a strike go missing
    b.addEventListener('animationend', () => { if (strike && !hit) doHit(); else if (!hit) b.remove(); });
    if (!anim || !crestEl) { if (strike) setTimeout(doHit, (wait + (mega ? .75 : .6) * .85) * 1000); return; }
    const tick = () => {
      if (!b.isConnected || hit || !hero.classList.contains('storming')) { if (ml && !hit) ml.style.opacity = 0; return; }
      if (strike && anim.playState === 'finished') { doHit(); return; } // flew past between frames: land on the aim point
      const p = anim.effect.getComputedTiming().progress;
      if (p != null && p > .04) { const hr = head.getBoundingClientRect(); if (!crc || fno % 12 === 0) crc = crestEl.getBoundingClientRect(); const cr = crc, x = hr.left, y = hr.top; fno++;
        const lx = (x - cr.left) / cr.width * 100, ly = (y - cr.top) / cr.height * 100, d = Math.hypot((lx - 50) / 100, (ly - 50) / 100);
        if (strike && y >= cr.top + cr.height * ay) { doHit(x, y); return; }
        if (ml && fno % 2 === 0) { const o = Math.max(0, Math.min(1, (.75 - d) / .4)); if (o > 0 || ml._o > 0) { ml.style.setProperty('--mlx', lx.toFixed(1) + '%'); ml.style.setProperty('--mly', ly.toFixed(1) + '%'); ml.style.opacity = o.toFixed(3); } ml._o = o; }
      } else if (ml) ml.style.opacity = 0;
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  launchBig(3 + Math.random() * 1.2, false);
  launchBig(6.3 + Math.random() * .5, true); // launched .7s later since it now flies 2.5x faster, so it still lands on the same beat
  // levitate as high as the room above allows (never into the nav): up to 90px
  if (crestEl) { const nb = ($('.nav') || { getBoundingClientRect: () => ({ bottom: 0 }) }).getBoundingClientRect().bottom, cty = parseFloat((getComputedStyle(crestEl).translate || '0 0').split(' ')[1]) || 0, ct = crestEl.getBoundingClientRect().top - cty; hero.style.setProperty('--lift', Math.max(16, Math.min(90, ct - nb - 18 - 16)) + 'px'); /* measured from the un-sunk baseline, with room for the float bob */ }
  hero.classList.add('storming');
  // visible branching bolt + strike light on the crest and name
  const bsvg = stormEl.querySelector('.boltsvg'), rim = $('#rim'), h1 = $('.hero h1'), NS = 'http://www.w3.org/2000/svg';
  // fine, jagged, dendritic bolts like the ones crackling in the crest artwork
  let AR = 1; // storm height/width, so x steps keep true angles in the stretched 0–100 svg
  const crack = (x, y, ang, len, seg) => { const p = [[x, y]]; let a = ang; for (let d = 0; d < len; d += seg) { a += (Math.random() - .5) * 1.1; a = ang + Math.max(-.7, Math.min(.7, a - ang)); x += Math.cos(a) * seg * AR * (.6 + Math.random() * .8); y += Math.sin(a) * seg * (.6 + Math.random() * .8); p.push([x, y]); } return p; };
  const toD = p => 'M' + p.map(q => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' L');
  // bolts erupt from behind the crest and arc out into the sky, as if the bird is summoning them
  const drawBolt = (ox, oy) => {
    if (!bsvg) return;
    const g = document.createElementNS(NS, 'g'), parts = [];
    const mk = (cls, d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; g.appendChild(p); parts.push(p); return p; };
    // any direction around the emblem; downward bolts are a little shorter so they don't run off the bottom
    const mang = Math.random() * Math.PI * 2, down = Math.max(0, Math.sin(mang));
    const main = crack(ox, oy, mang, (55 + Math.random() * 25) * (1 - down * .35), 1.8);
    const md = toD(main); mk('hz3', md); mk('hz2', md); mk('hz1', md); mk('glow', md); mk('edge', md); mk('core', md);
    const grow = (from, depth) => {
      const n = depth === 0 ? 3 + (Math.random() * 3 | 0) : 1 + (Math.random() * 2 | 0);
      for (let k = 0; k < n; k++) {
        const i = 1 + (Math.random() * (from.length - 2) | 0), [x, y] = from[i], side = Math.random() < .5 ? -1 : 1;
        const ang = mang + side * (.5 + Math.random() * .7), br = crack(x, y, ang, (depth === 0 ? 10 + Math.random() * 16 : 4 + Math.random() * 7), 1.3);
        const d = toD(br); mk(depth === 0 ? 'bedge' : 'twig', d); if (depth === 0) mk('branch', d);
        if (depth < 1) grow(br, depth + 1);
      }
    };
    grow(main, 0);
    bsvg.appendChild(g);
    parts.forEach(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 60 + Math.random() * 40, easing: 'linear', fill: 'forwards' }));
    g.animate([{ opacity: 1 }, { opacity: .15, offset: .15 }, { opacity: .95, offset: .25 }, { opacity: .1, offset: .45 }, { opacity: .5, offset: .55 }, { opacity: 0 }], { duration: 560, easing: 'linear', fill: 'forwards' }).onfinish = () => g.remove();
    return main;
  };
  const evil = evilEye;
  let lastFlash = 0;
  const flash = () => {
    const nowF = performance.now(); if (nowF - lastFlash < 180) return; lastFlash = nowF; // overlapping bolts cost frames and read as one anyway
    const sr = stormEl.getBoundingClientRect(), cr0 = (crestEl || hero).getBoundingClientRect();
    AR = sr.height / (sr.width || 1);
    const ox = ((cr0.left + cr0.width * (.42 + Math.random() * .16)) - sr.left) / sr.width * 100, oy = ((cr0.top + cr0.height * (.4 + Math.random() * .15)) - sr.top) / sr.height * 100;
    const bx = ox;
    if (evil) { restart(evil, 'flare'); setTimeout(() => evil.classList.remove('flare'), 700); }
    setTimeout(() => {
    const rs = []; // [el, class] pairs restarted together after all reads/writes
    bolt.style.setProperty('--bx', bx + '%'); rs.push([bolt, 'flash']);
    const hz = $('#horizon'); if (hz) rs.push([hz, 'lit']);
    const path = drawBolt(ox, oy) || [[ox, oy]];
    const [ex, ey] = path[path.length - 1];
    // stars peek through a soft seam that follows the whole bolt, widest near the top and tapering down
    const rift = $('#rift');
    if (rift) {
      const st = Math.max(1, Math.ceil(path.length / 10)), pts = path.filter((_, i) => i % st === 0 || i === path.length - 1); // ≤ ~11 mask gradients
      const n = pts.length, m = pts.map(([x, y], i) => { const t = i / Math.max(1, n - 1), w = (6.5 - t * 3.5).toFixed(2), hh = (5 - t * 1.5).toFixed(2); return `radial-gradient(ellipse ${w}% ${hh}% at ${(x + (Math.random() - .5) * 1.5).toFixed(2)}% ${Math.max(0, y).toFixed(2)}%,#000 0 25%,transparent 100%)`; }).join(',');
      rift.style.webkitMaskImage = m; rift.style.maskImage = m;
      rift.style.setProperty('--bx', bx + '%'); rs.push([rift, 'open']);
    }
    if (rim && crestEl) {
      const hr = hero.getBoundingClientRect(), cr = crestEl.getBoundingClientRect();
      const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2, px = hr.left + hr.width * ex / 100, py = hr.top + hr.height * ey / 100;
      const dx = px - cx, dy = py - cy, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      rim.style.setProperty('--lx', (50 + ux * 42) + '%'); rim.style.setProperty('--ly', (50 + uy * 42) + '%');
      rim.style.setProperty('--la', (Math.atan2(-ux, uy) * 180 / Math.PI) + 'deg');
      rs.push([rim, 'flash']);
    }
    if (h1) rs.push([h1, 'lit']);
    // the purple glow behind the crest surges with each strike, then falls back into its slow pulse
    const dp = $('#darkPulse'); if (dp) { rs.push([dp, 'surge']); clearTimeout(dp._z); dp._z = setTimeout(() => dp.classList.remove('surge'), 950); }
    rs.forEach(([e, c]) => e.classList.remove(c)); void hero.offsetWidth; rs.forEach(([e, c]) => e.classList.add(c));
    }, 140);
  };
  const ts = [500, 2000, 3500, 5000, 6300, 7400].map(t => setTimeout(flash, t + Math.random() * 400));
  const stopper = () => { ts.forEach(clearTimeout); hero.classList.remove('storming');
    setTimeout(() => { if (!hero.classList.contains('storming')) document.querySelectorAll('.meteor-layer .bigm').forEach(x => x.remove()); }, 950);
    const ml0 = meteorLight; if (ml0) { ml0.style.opacity = 0; ml0._o = 0; }
    if (hcrest) hcrest.querySelectorAll('.crater-char,.crater-hot,.hotglow').forEach(x => { x.getAnimations().forEach(a => a.pause()); const o = getComputedStyle(x).opacity; x.getAnimations().forEach(a => a.cancel()); x.animate([{ opacity: o }, { opacity: 0 }], { duration: 1800, easing: 'ease-in', fill: 'forwards' }).onfinish = () => x.remove(); });
    const ag = $('#afterglow'); if (ag) { hero.classList.add('clearing'); restart(ag, 'go'); setTimeout(() => hero.classList.remove('clearing'), 1900); } setTimeout(() => { if (sid !== stormSeq || hero.classList.contains('storming')) return; stormEl.querySelectorAll('.shm').forEach(x => x.remove()); const fr = meteorsFront; if (fr) fr.replaceChildren(); }, 1000); };
    // extension time: more lightning, and every ~3.5s of it a regular meteor streaks past (only the finale strikes)
  // passing meteors ride a fixed schedule through the added time (one every ~3.5s), so rapid clicks never bunch them up
  const t0 = performance.now(); let nextPass = 8500;
  // lvl = clicks so far: each click packs the lightning tighter and throws that many extra bolts right away
  stopper.more = (ms, from = 0, lvl = 1) => {
    const g = Math.max(.4, 1 - .15 * lvl);
    for (let t = 250; t < ms; t += (1100 + Math.random() * 700) * g) ts.push(setTimeout(flash, from + t));
    for (let k = 0; k < lvl; k++) ts.push(setTimeout(flash, 120 + k * (2400 / lvl) + Math.random() * 200));
    const now = performance.now() - t0, end = now + from + ms;
    while (nextPass < end - 2500) { const at = Math.max(nextPass, now + 400) + (Math.random() - .5) * 400; ts.push(setTimeout(() => launchBig(0, false), at - now)); nextPass += 3500; }
  };
  // the finale: the lightning goes frantic as the colossal meteor comes in; its strike hurls the emblem back, and it springs home
  stopper.finale = onHit => { for (let t = 0; t < 2600; t += 380 + Math.random() * 260) ts.push(setTimeout(flash, t));
    // the meteor now falls ~2.5x faster, so it launches .9s later to keep its impact on the same beat
    // a barrage of meteors streaks past, in front of and behind the emblem, right before the colossal one lands
    if (!reduce) { const back = $('#meteorsBack'), n = 6 + (Math.random() * 3 | 0); for (let k = 0; k < n; k++) launchBig(.05 + k / n * .7 + Math.random() * .12, false, null, false, back && Math.random() < .5 ? back : null); }
    launchBig(.95, true, () => {
      if (logoWrap && !reduce && logoWrap.animate) logoWrap.animate([
        { translate: '0 0', scale: '1' },
        { translate: '-70px 62px', scale: '.72', offset: .12, easing: 'cubic-bezier(.2,.6,.3,1)' },
        { translate: '-76px 68px', scale: '.7', offset: .3, easing: 'cubic-bezier(.5,0,.3,1)' },
        { translate: '12px -10px', scale: '1.06', offset: .58 },
        { translate: '-5px 4px', scale: '.98', offset: .74 },
        { translate: '2px -1px', scale: '1.01', offset: .87 },
        { translate: '0 0', scale: '1' }
      ], { duration: 2200, easing: 'ease-out', composite: 'add' });
      onHit();
    }, true); };
  return stopper;
};
// crest click: four clicks of rising anger, the fifth summons the storm; the name becomes the tenets quotes and back
if (logoWrap) {
  const h1 = $('.hero h1'), ws = h1 ? h1.querySelectorAll('.w') : [], NAME = [...ws].map(w => w.textContent);
  let busy = false;
  // four clicks of rising anger, then the fifth makes it snap. stop clicking and it cools off.
  const LEVELS = 4;
  let anger = 0, calmT = 0, stormEndT = 0, stormEndFn = null, stormEndAt = 0, stormCtl = null, finaleSet = false, stormFeeds = 0;
  // storm timeline. base 7s once the name has turned; each click adds EXT (never more than MAX_AHEAD left on the clock).
  // the FEEDS-th click locks it: no more extension, and the colossal meteor is timed to strike when the clock runs out.
  const EXT = 3000, MAX_AHEAD = 14000, FEEDS = 5, HIT_LEAD = 1500, MIN_WAIT = 3500;
  const setEnd = at => { const now = performance.now(); stormEndAt = at; clearTimeout(stormEndT); if (stormEndFn) stormEndT = setTimeout(stormEndFn, Math.max(0, at - now)); };
  // each click: the eye burns hotter (violet toward white) and the lightning quickens
  // the storm speaks in the five tenets (예의 염치 인내 극기 백절불굴), each one breaking; the last click: one strike, certain death
  const QUOTES = [['예의는 끝났다', 'Courtesy ends here.'], ['염치가 시험받는다', 'Integrity is tested.'], ['인내는 너보다 길다', 'Perseverance outlasts you.'], ['극기는 사라졌다', 'Self-control is gone.'], ['백절불굴이 깨어난다', 'The indomitable spirit wakes.'], ['일격필살', 'One strike. Certain death.']];
  // tenet tracker: built only when a storm starts (kept out of the page markup so search engines and link previews read the heading as just the name)
  const tenetBox = document.createElement('span'); tenetBox.className = 'tenets'; tenetBox.setAttribute('aria-hidden', 'true');
  ['예의', '염치', '인내', '극기', '백절불굴'].forEach(t => { const i = document.createElement('i'); i.textContent = t; tenetBox.appendChild(i); });
  const tenetEls = tenetBox.querySelectorAll('i');
  const setTenets = i => { if (h1 && !tenetBox.isConnected) h1.appendChild(tenetBox); tenetEls.forEach((t, k) => { t.classList.toggle('on', k <= i); t.classList.toggle('cur', k === i); }); };
  const showQuote = (i, d = 700) => { const q = QUOTES[Math.min(i, QUOTES.length - 1)]; setTenets(i);
    const fin = i >= QUOTES.length - 1, was = h1.classList.contains('final');
    // going to the final tenet the quote collapses from two lines to one: swap it in one step (the slam covers it) and glide the subtitle + tenet row to their new spots (FLIP) instead of letting them jump
    const glide = fin && !was && !reduce ? [ws[1], h1.querySelector('.tenets')].filter(Boolean) : [], y0 = glide.map(e => e.getBoundingClientRect().top);
    h1.classList.toggle('final', fin);
    if (glide.length) { ws[0]._scr = null; ws[0].textContent = ws[0]._txt = q[0]; ws[1]._scr = null; ws[1].textContent = ws[1]._txt = q[1];
      glide.forEach((e, k) => { const dy = y0[k] - e.getBoundingClientRect().top; if (Math.abs(dy) > 1 && e.animate) e.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 750, delay: k * 40, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }); });
      scrambleText(ws[1], q[1], d, null); }
    else { scrambleText(ws[0], q[0], d * .8, null, hangul); scrambleText(ws[1], q[1], d); }
    // the last tenet is a declaration of war: it slams in white-hot, then burns violet with a throbbing glow until the storm breaks
    if (fin && !was && !reduce && ws[0].animate) { const w = ws[0];
      w.animate([{ scale: '2.4', opacity: 0, filter: 'blur(10px) brightness(3)' }, { scale: '.92', opacity: 1, filter: 'blur(0px) brightness(1.8)', offset: .32, easing: 'steps(1)' }, { scale: '1.06', filter: 'blur(0px) brightness(1.5)', offset: .45, easing: 'cubic-bezier(.2,.7,.2,1)' }, { scale: '1', filter: 'blur(0px) brightness(1)' }], { duration: 700, easing: 'cubic-bezier(.6,0,.9,.3)' });
      if (w._war) w._war.cancel();
      w._war = w.animate([{ textShadow: '0 0 6px rgba(255,240,255,.9),0 0 18px rgba(200,130,255,.9),0 0 40px rgba(160,70,255,.7),0 0 80px rgba(139,61,255,.45)' }, { textShadow: '0 0 10px rgba(255,245,255,1),0 0 28px rgba(210,140,255,1),0 0 64px rgba(170,70,255,.95),0 0 130px rgba(139,61,255,.75)' }], { duration: 650, delay: 300, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); } };
  const feedFx = lvl => {
    const ev = evilEye; if (ev) ev.style.setProperty('--feed', (lvl / FEEDS).toFixed(2));
    // not while the first quote is still forming: that scramble's callback starts the storm clock (and catches up on early clicks)
    if (stormEndFn && h1 && ws.length === 2) showQuote(lvl, lvl >= FEEDS ? 1000 : 650);
  };
  const feedStorm = () => {
    if (finaleSet || !stormCtl) return;
    const now = performance.now(), oldEnd = stormEndAt || now + 7000, newEnd = Math.min(Math.max(oldEnd, now) + EXT, now + MAX_AHEAD);
    feedFx(++stormFeeds); if (stormFeeds < FEEDS) { if (newEnd > oldEnd) { setEnd(newEnd); } if (stormCtl.more) stormCtl.more(Math.max(0, newEnd - oldEnd), Math.max(0, oldEnd - now), stormFeeds); return; }
    finaleSet = true; const ctl = stormCtl, launch = Math.max(newEnd - HIT_LEAD, now + MIN_WAIT) - now;
    if (ctl.more) ctl.more(Math.max(0, newEnd - oldEnd), Math.max(0, oldEnd - now), FEEDS);
    setEnd(now + launch + 6000); // fallback if the hit is never registered (e.g. tab hidden)
    setTimeout(() => { if (stormCtl !== ctl) return; ctl.finale(() => setEnd(performance.now() + 1100)); }, launch);
  };
  // at full fury the lights stutter: rapid, random, drastic flicker of the scene
  let flickT = 0;
  const bgEl = $('.hero-bg');
  const flicker = on => {
    clearTimeout(flickT);
    if (!bgEl) return;
    if (!on) { bgEl.style.opacity = ''; return; }
    const step = () => { const r = Math.random(); bgEl.style.opacity = r < .35 ? (.05 + Math.random() * .2).toFixed(2) : r < .5 ? '.5' : '1'; flickT = setTimeout(step, 30 + Math.random() * (r < .35 ? 90 : 220)); };
    step();
  };
  // dust shaken loose, drifting down around the crest
  let dustT = 0;
  const dust = on => {
    clearTimeout(dustT);
    if (!on || !hero) return;
    const spawn = () => {
      const hr = hero.getBoundingClientRect(), cr = (crestEl || hero).getBoundingClientRect();
      const x = cr.left - hr.left + (Math.random() * 1.6 - .3) * cr.width, y = cr.top - hr.top - Math.random() * cr.height * .4;
      const d = document.createElement('i'); d.className = 'dust'; hero.appendChild(d);
      const fall = 120 + Math.random() * 200, dx = (Math.random() - .5) * 40, sc = .5 + Math.random();
      d.animate([{ transform: `translate(${x}px,${y}px) scale(${sc})`, opacity: 0 }, { opacity: .85, offset: .15 }, { transform: `translate(${x + dx}px,${y + fall}px) scale(${sc})`, opacity: 0 }], { duration: 1400 + Math.random() * 1200, easing: 'cubic-bezier(.4,.1,.7,.9)', fill: 'forwards' }).onfinish = () => d.remove();
      dustT = setTimeout(spawn, 70 + Math.random() * 160);
    };
    spawn();
  };
  const setAnger = n => { anger = n; if (!hero) return; flicker(n >= LEVELS && !reduce); dust(n >= LEVELS && !reduce); hero.classList.toggle('furious', n >= LEVELS); hero.style.setProperty('--ang', (n / LEVELS).toFixed(3)); hero.classList.toggle('annoyed', n > 0); hero.classList.toggle('glinting', n >= 2); };
  const calm = () => setAnger(0);
  const hcr = heroCrest;
  logoWrap.addEventListener('dragstart', e => e.preventDefault());
  logoWrap.addEventListener('mousedown', e => { if (e.detail > 1) e.preventDefault(); }); // no double-click selection flash
  if (ws.length === 2) logoWrap.addEventListener('click', () => {
    if (busy) {
      // mid-storm: each click feeds the storm (more time, denser lightning, the next quote); the 5th calls the finale
      if (stormCtl && hero && hero.classList.contains('storming')) {
        // the bird always answers a click: it swells with power and the violet glow behind it surges
        if (!reduce) {
          if (hcr) hcr.animate([{ scale: '1', rotate: '0deg' }, { scale: '1.09', rotate: '-1.5deg', offset: .18 }, { scale: '.98', rotate: '1deg', offset: .45 }, { scale: '1.02', offset: .7 }, { scale: '1', rotate: '0deg' }], { duration: 650, easing: 'ease-out' });
          const dp = $('#darkPulse'); if (dp) { restart(dp, 'surge'); clearTimeout(dp._z); dp._z = setTimeout(() => dp.classList.remove('surge'), 950); }
        }
        feedStorm();
      }
      return;
    }
    if (!reduce && hero && anger < LEVELS) {
      clearTimeout(calmT); setAnger(anger + 1);
      const k = anger / LEVELS, r = 2.4 + k * 7, sc = 1 + k * .09;
      // each shake is harder and longer than the last
      if (hcr) hcr.animate([{ rotate: '0deg', scale: '1' }, { rotate: -r + 'deg', scale: String(sc), offset: .12 }, { rotate: r * .9 + 'deg', offset: .27 }, { rotate: -r * .65 + 'deg', offset: .44 }, { rotate: r * .4 + 'deg', offset: .62 }, { rotate: -r * .18 + 'deg', offset: .8 }, { rotate: '0deg', scale: '1' }], { duration: 420 + k * 520, easing: 'ease-out' });
      // the whole hero flinches with it, harder each time
      const hi = heroInner, j = 2 + k * 7; if (hi && hi.animate) hi.animate([{ translate: '0 0' }, { translate: -j + 'px ' + j * .6 + 'px' }, { translate: j * .8 + 'px ' + -j * .5 + 'px' }, { translate: -j * .5 + 'px ' + j * .3 + 'px' }, { translate: '0 0' }], { duration: 260 + k * 160, easing: 'linear' });
      if (anger >= 2 && h1) h1.animate([{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }, { opacity: .55 }, { opacity: 1 }], { duration: 420, delay: 120 });
      // 3rd click: the faintest flicker of a glitch, a couple of tiny jumps, a thin colour split and a brief scramble
      if (anger === LEVELS - 1 && h1 && !reduce) { h1.animate([{ translate: '-2px 0', transform: 'skewX(3deg)', textShadow: '-1px 0 rgba(255,40,190,.5),1px 0 rgba(0,235,255,.5)', easing: 'steps(1)' }, { translate: '0 0', transform: 'none', textShadow: 'none', offset: .3, easing: 'steps(1)' }, { translate: '2px 0', transform: 'skewX(-2deg)', textShadow: '-1px 0 rgba(255,40,190,.4),1px 0 rgba(0,235,255,.4)', offset: .55, easing: 'steps(1)' }, { translate: '0 0', transform: 'none', textShadow: 'none', offset: .75 }, { translate: '0 0', transform: 'none', textShadow: 'none' }], { duration: 300, delay: 90, composite: 'add' });
        ws.forEach((w, i) => setTimeout(() => scrambleText(w, NAME[i], 170 + i * 60), 90)); // a quick, short scramble (click 4 runs ~2x longer)
      }
      // 4th click: the name glitches, a small taste of what's coming (short slice jumps + colour split, then it reassembles)
      if (anger === LEVELS && h1 && !reduce) {
        h1.animate([{ translate: '-6px 1px', transform: 'skewX(8deg)', textShadow: '-3px 0 rgba(255,40,190,.8),3px 0 rgba(0,235,255,.8)', easing: 'steps(1)' }, { translate: '7px 0', transform: 'skewX(-4deg)', offset: .18, easing: 'steps(1)' }, { translate: '0 0', transform: 'none', textShadow: 'none', offset: .32, easing: 'steps(1)' }, { translate: '-3px 0', transform: 'skewX(3deg)', textShadow: '-2px 0 rgba(255,40,190,.7),2px 0 rgba(0,235,255,.7)', offset: .5, easing: 'steps(1)' }, { translate: '0 0', transform: 'none', textShadow: 'none', offset: .66 }, { translate: '0 0', transform: 'none', textShadow: 'none' }], { duration: 520, delay: 90, composite: 'add' });
        ws.forEach((w, i) => setTimeout(() => scrambleText(w, NAME[i], 380 + i * 90), 90));
      }
      calmT = setTimeout(calm, 3800 + anger * 500);
      return;
    }
    clearTimeout(calmT);
    const snapped = anger >= LEVELS && !reduce;
    if (anger) { setAnger(LEVELS); flicker(false); dust(false); hero.classList.remove('furious'); } // stay furious-looking through the glare; released when the storm breaks
    busy = true;
    if (snapped) {
      // 5th click: the name breaks up hard. longer, wider jumps, a heavier colour split, flicker and a double scramble through Hangul
      if (h1 && !reduce) {
        const G = ['rgba(255,40,190,.9)', 'rgba(0,235,255,.9)'], sp = d => `-${d}px 0 ${G[0]},${d}px 0 ${G[1]}`, f = [];
        [[-14, 2, 14, 6], [18, -2, -8, 8], [0, 0, 0, 0], [-22, 1, 18, 10], [9, 0, -5, 4], [-6, -2, 6, 7], [0, 0, 0, 0], [24, 1, -14, 9], [-11, 0, 8, 5], [4, 0, -3, 3], [0, 0, 0, 0], [-7, 0, 5, 4], [0, 0, 0, 0]]
          .forEach(([x, y, k, d], i, A) => f.push({ translate: x + 'px ' + y + 'px', transform: 'skewX(' + k + 'deg)', textShadow: d ? sp(d) : 'none', opacity: d > 7 ? .55 : 1, offset: i / (A.length - 1) * .92, easing: 'steps(1)' }));
        f.push({ translate: '0 0', transform: 'none', textShadow: 'none', opacity: 1 });
        h1.animate(f, { duration: 1100, delay: 60, composite: 'add' });
        ws.forEach((w, i) => { const t = NAME[i]; setTimeout(() => scrambleText(w, t, 420 + i * 80, () => setTimeout(() => { if (!h1.classList.contains('quote')) scrambleText(w, t, 380 + i * 100, null, hangul); }, 90), hangul), 60); });
      }
      // the glint flares into a sharp violet star, then goes out
      hero.classList.add('glintflare'); setTimeout(() => { hero.classList.remove('glintflare', 'glinting'); }, 750);
      // the lights go haywire, harder and faster than ever, then everything sinks into the dark
      const hi = heroInner, t0 = performance.now();
      const haywire = () => {
        const t = performance.now() - t0, r = Math.random();
        if (t > 1100) { if (bgEl) bgEl.style.opacity = ''; if (hi) hi.style.filter = ''; hero.classList.add('darkened'); return; }
        if (bgEl) bgEl.style.opacity = r < .5 ? (Math.random() * .08).toFixed(2) : r < .7 ? '.45' : '1';
        if (hi) hi.style.filter = r < .45 ? 'brightness(' + (.15 + Math.random() * .25).toFixed(2) + ')' : r < .6 ? 'brightness(1.35)' : '';
        setTimeout(haywire, 18 + Math.random() * 55);
      };
      haywire();
    }
    // first the bird goes still and slowly narrows its eyes at you, then the build-up begins
    const PRE = reduce ? 0 : 2600;
    if (hero && !reduce) hero.classList.add('glaring');
    setTimeout(() => {
    // the build-up: the bird locks eyes and the room goes quiet, a shadow creeps down its face,
    // a slow heavy blink, and when the lid lifts a violet spark sputters and catches in a black socket.
    // when the starburst reaches full length: the flash, and the storm.
    const lidShut = reduce ? 0 : 900, lidOpen = reduce ? 0 : 2050;
    if (hero && !reduce) {
      hero.classList.add('summoning');
      // violet motes drift in from the edges, speeding up, and are swallowed by the eye as it ignites
      const ev = evilEye, hr = hero.getBoundingClientRect();
      if (ev) { const er = ev.getBoundingClientRect(), ex = er.left + er.width / 2 - hr.left, ey = er.top + er.height / 2 - hr.top, n = innerWidth < 700 ? 9 : 16;
        for (let k = 0; k < n; k++) {
          const m = document.createElement('i'); m.className = 'mote'; hero.appendChild(m);
          const a = Math.random() * Math.PI * 2, r = Math.max(hr.width, hr.height) * (.45 + Math.random() * .25);
          const sx = ex + Math.cos(a) * r, sy = ey + Math.sin(a) * r * .7, cx = ex + Math.cos(a + 1.1) * r * .35, cy = ey + Math.sin(a + 1.1) * r * .3;
          const dur = 1600 + Math.random() * 300, delay = 1920 - dur - Math.random() * 120, sc = .6 + Math.random() * .9;
          m.animate([{ transform: `translate(${sx}px,${sy}px) scale(${sc})`, opacity: 0 }, { opacity: .9, offset: .25 }, { transform: `translate(${cx}px,${cy}px) scale(${sc})`, offset: .6 }, { transform: `translate(${ex}px,${ey}px) scale(.2)`, opacity: 1 }], { duration: dur, delay: Math.max(0, delay), easing: 'cubic-bezier(.4,0,.85,.55)', fill: 'both' }).onfinish = () => m.remove();
        } }
    }
    // the squinting lids clamp fully shut (no separate blink, so nothing jumps), the socket swaps while they're closed,
    // then they slowly part on the evil eye
    if (eye && !reduce) { setTimeout(() => { if (hero) { hero.classList.remove('glaring'); hero.classList.add('lidshut'); } }, 620); setTimeout(() => hero && hero.classList.remove('lidshut'), 1330); }
    // just before the shockwave, the bio, buttons and scroll cue are sucked into the eye: pulled toward it, shrinking and blurring away
    if (hero && !reduce) setTimeout(() => { const ev = evilEye; if (!ev) return; const er = ev.getBoundingClientRect(), ex = er.left + er.width / 2, ey = er.top + er.height / 2;
      ['.hero-actions', '.hero-sub', '.scroll-cue'].forEach((s, k) => { const el = $(s); if (!el || !el.animate) return; const r = el.getBoundingClientRect(), dx = (ex - (r.left + r.width / 2)) * .8, dy = (ey - (r.top + r.height / 2)) * .8, F = 'brightness(.22) grayscale(1) ';
        el.animate([{ translate: '0 0', scale: '1', opacity: 1, filter: F + 'blur(0px)' }, { translate: `${dx * .15}px ${dy * .15}px`, scale: '.9', opacity: 1, filter: F + 'blur(1px)', offset: .4 }, { translate: `${dx}px ${dy}px`, scale: '.12', opacity: 0, filter: F + 'blur(6px)' }], { duration: 440, delay: k * 50, easing: 'cubic-bezier(.6,0,.9,.4)', fill: 'forwards' }).onfinish = function () { hero.classList.add('absorbed'); this.cancel(); }; });
    }, lidOpen - 480);
    // the name is drawn up toward the eye, then the shockwave blows it apart; the quote re-forms out of the blast, white-hot and violet, then cools
    if (h1 && !reduce) setTimeout(() => { const F = (bl, br) => DS + ' blur(' + bl + 'px) brightness(' + br + ')';
      // text-shadow always as [violet split, gold split, glow] so every step interpolates
      const T = (x, a, g, ga) => `-${x}px 0 rgba(180,107,255,${a}),${x}px 0 rgba(224,179,74,${a}),0 0 ${g}px rgba(200,140,255,${ga})`;
      h1.animate([
        { translate: '0 0', scale: '1', filter: F(0, 1), opacity: 1, textShadow: T(0, 0, 0, 0), easing: 'cubic-bezier(.6,0,.95,.4)' },
        { translate: '0 -22px', scale: '.84', filter: F(0, .7), opacity: 1, textShadow: T(2, .5, 6, .4), offset: .22, easing: 'steps(1)' },
        { translate: '3px -20px', scale: '.83', filter: F(0, .9), opacity: 1, textShadow: T(4, .7, 8, .5), offset: .24, easing: 'cubic-bezier(.05,1,.2,1)' },
        { translate: '0 70px', scale: '2 .3', filter: F(26, 4.5), opacity: 0, textShadow: T(40, 1, 40, 1), offset: .3, easing: 'steps(1)' },
        { translate: '0 0', scale: '1.6', filter: F(16, 3.2), opacity: 0, textShadow: T(30, 1, 50, 1), offset: .33, easing: 'cubic-bezier(.05,.9,.2,1)' },
        { translate: '0 0', scale: '.93', filter: F(0, 1.8), opacity: 1, textShadow: T(8, .9, 26, .9), offset: .47, easing: 'steps(1)' },
        { translate: '-6px 0', scale: '1.04', filter: F(0, 1.5), opacity: 1, textShadow: T(5, .8, 22, .85), offset: .5, easing: 'steps(1)' },
        { translate: '4px 0', scale: '1.02', filter: F(0, 1.4), opacity: 1, textShadow: T(3, .6, 20, .8), offset: .53, easing: 'cubic-bezier(.3,.6,.3,1)' },
        { translate: '0 0', scale: '1', filter: F(0, 1.15), opacity: 1, textShadow: T(0, 0, 16, .6), offset: .65, easing: 'cubic-bezier(.3,.6,.3,1)' },
        { translate: '0 0', scale: '1', filter: F(0, 1), opacity: 1, textShadow: T(0, 0, 0, 0) }
      ], { duration: 1200 }); }, lidOpen - 360);
    setTimeout(() => {
      if (!hero) return;
      // the lid is shut: clear the angry squint and glint so nothing sits over the evil eye as it opens
      setAnger(0);
      if (!reduce) hero.classList.add('igniting');
      hero.classList.add('possessed');
    }, lidShut);
    setTimeout(() => {
      if (!hero) return;
      if (eye) eye.classList.remove('heavy');
      const pf = $('#pflash'), ev = evilEye;
      if (pf && ev && !reduce) {
        const hr = hero.getBoundingClientRect(), er = ev.getBoundingClientRect();
        pf.style.setProperty('--fx', (er.left + er.width / 2 - hr.left) + 'px'); pf.style.setProperty('--fy', (er.top + er.height / 2 - hr.top) + 'px');
        restart(pf, 'go'); restart(hero, 'possessing'); setTimeout(() => hero.classList.remove('possessing'), 600);
        // shockwave: a ring blasts outward from the eye
        const sx = er.left + er.width / 2 - hr.left, sy = er.top + er.height / 2 - hr.top, R = Math.hypot(Math.max(sx, hr.width - sx), Math.max(sy, hr.height - sy)) / 20;
        const sh = document.createElement('i'); sh.className = 'shock'; hero.appendChild(sh);
        sh.animate([{ transform: `translate(${sx}px,${sy}px) scale(.1)`, opacity: 1, borderWidth: '10px' }, { opacity: 1, offset: .2 }, { transform: `translate(${sx}px,${sy}px) scale(${R * 1.15})`, opacity: 0 }], { duration: 780, easing: 'cubic-bezier(.05,.8,.25,1)', fill: 'both' }).onfinish = () => sh.remove();
        // the blast jolts the whole hero
        const hi = heroInner; if (hi && hi.animate) hi.animate([{ translate: '0 0' }, { translate: '-9px 6px' }, { translate: '8px -7px' }, { translate: '-6px -4px' }, { translate: '5px 5px' }, { translate: '-3px 2px' }, { translate: '0 0' }], { duration: 420, easing: 'linear' });
      }
      hero.classList.remove('summoning', 'igniting', 'darkened');
    }, lidOpen - 60);
    setTimeout(() => {
    stormEndAt = 0; stormFeeds = 0; finaleSet = false; const endStorm = storm(); stormCtl = endStorm;
    ws.forEach(w => { w.style.animation = 'none'; w.style.opacity = 1; w.style.transform = 'none'; });
    h1.style.minHeight = h1.style.height = h1.offsetHeight + 'px'; // lock height so the crest doesn't shift; the bigger quote + tenets spill down into the space the bio and buttons left
    setTenets(0);
    h1.style.transition = 'none'; // size/font change happens while hidden: no visible zoom
    h1.classList.add('quote', 'ko'); void h1.offsetWidth; requestAnimationFrame(() => { h1.style.transition = ''; });
    scrambleText(ws[0], QUOTES[0][0], 900, null, hangul);
    scrambleText(ws[1], QUOTES[0][1], 1200, () => { stormEndFn = () => {
      stormEndFn = null; stormCtl = null; finaleSet = false; stormFeeds = 0; stormEndAt = 0; { const ev = evilEye; if (ev) ev.style.removeProperty('--feed'); }
      endStorm();
      // starburst fades out on its own, then the bird blinks a few times as it comes to
      setTimeout(() => {
        if (!hero) return;
        hero.classList.add('waking'); hero.classList.remove('possessed'); hero.classList.remove('absorbed'); // the bio and buttons rise back in
        // the starburst retracts and the violet point gutters out; the lid drops heavy, the socket
        // is swapped back while it's shut, the eye opens dazed, then a few quick flutters as it comes to
        if (eye && !reduce) {
          setTimeout(() => { eye.classList.remove('twice', 'slow'); eye.classList.add('heavy'); restart(eye, 'blink'); }, 1150);
          setTimeout(() => eye.classList.remove('heavy'), 2500);
          [2750, 3000, 3300].forEach(t => setTimeout(blinkOnce, t));
        }
        setTimeout(() => hero.classList.remove('waking'), reduce ? 0 : 3800);
      }, 600);
      // back to the name: the layout/font swap happens while the quote is faded out, so nothing jumps
      const toName = () => {
        if (ws[0]._war) { ws[0]._war.cancel(); ws[0]._war = null; }
        tenetBox.remove(); h1.style.transition = 'none'; h1.classList.remove('ko', 'final', 'quote'); void h1.offsetWidth; requestAnimationFrame(() => { h1.style.transition = ''; });
        ws.forEach(w => { w.style.animation = 'none'; w.style.opacity = ''; w.style.transform = ''; });
        // no scramble: the name simply reappears whole (scrambling glyphs change width and make the words jostle)
        ws.forEach(w => { w._scr = null; }); ws[0].textContent = 'Michael'; ws[1].textContent = 'Squires'; ws[0]._txt = 'Michael'; ws[1]._txt = 'Squires';
        setTimeout(() => busy = false, 3900); setTimeout(() => { h1.style.minHeight = h1.style.height = ''; }, 1500);
      };
      if (reduce || !h1.animate) toName(); else {
        // calm: the quote exhales, drifting up and softening away; then the name settles back in one word at a time, with a warm glow that fades
        const out = h1.animate([{ opacity: 1, translate: '0 0', filter: DS + ' blur(0px)' }, { opacity: 0, translate: '0 -10px', filter: DS + ' blur(6px)' }], { duration: 750, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
        out.onfinish = () => { toName(); out.cancel();
          ws.forEach((w, i) => w.animate([
            { opacity: 0, translate: '0 14px', filter: 'blur(5px)', textShadow: '0 0 28px rgba(246,220,140,.55)' },
            { opacity: 1, translate: '0 0', filter: 'blur(0px)', textShadow: '0 0 18px rgba(246,220,140,.35)', offset: .6 },
            { opacity: 1, translate: '0 0', filter: 'blur(0px)', textShadow: '0 0 0 rgba(246,220,140,0)' }
          ], { duration: 1600, delay: 150 + i * 260, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'backwards' })); };
      }
    }; setEnd(stormEndAt || performance.now() + 7000); if (stormFeeds) showQuote(stormFeeds, 500); });
    }, lidOpen);
    }, PRE);
  });
}
// magnetic buttons
if (!reduce && fine) $$('.btn').forEach(b => {
  b.addEventListener('pointermove', e => { b.style.animation = 'none'; b.style.opacity = '1'; const r = b.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); b.style.transform = `translate(${dx * .22}px,${dy * .3}px)`; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});
// email: assembled at runtime from reversed parts so crawlers never see it in markup
const rev = s => [...s].reverse().join('');
function scrambleLink(el, opts = {}) {
  const addr = rev(el.dataset.u) + '@' + el.dataset.d + '.' + rev(el.dataset.t);
  const span = el.querySelector('span');
  let done = false;
  const show = () => {
    if (done) return; done = true;
    el.href = 'mailto:' + addr;
    if (reduce) { span.textContent = addr; return; }
    el.classList.add('scrambling');
    const t0 = performance.now(), dur = opts.dur || 1400, n = addr.length;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), locked = Math.floor(p * n);
      let out = '';
      for (let i = 0; i < n; i++) out += i < locked || addr[i] === '@' || addr[i] === '.' ? addr[i] : glyphs[Math.random() * glyphs.length | 0];
      span.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else { span.textContent = addr; el.classList.remove('scrambling'); }
    };
    requestAnimationFrame(tick);
  };
  el.addEventListener('pointerenter', show, { once: true });
  el.addEventListener('focus', show, { once: true });
  el.addEventListener('click', e => { if (!el.href.startsWith('mailto:')) { e.preventDefault(); show(); } });
  return show;
}
const em = $('#email');
if (em) { const show = scrambleLink(em); new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setTimeout(show, 500); o.disconnect(); } }, { threshold: .5 }).observe(em); }
const navEm = $('#navEmail');
const navShow = navEm ? scrambleLink(navEm, { dur: 1100 }) : null;
if (navShow) setTimeout(navShow, reduce ? 0 : 1500);
// pause looping animations in sections that aren't visible (saves battery on phones)
const pauser = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting)), { rootMargin: '100px 0px' });
['.hero', '.marquee', '.contact'].forEach(s => { const el = $(s); if (el) pauser.observe(el); });
frame();
})();
