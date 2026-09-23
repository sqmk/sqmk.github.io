(() => {
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
// crown-tip burst now and then
const spark = $('#spark');
if (spark && !reduce) { const burst = () => { restart(spark, 'burst'); setTimeout(burst, 4000 + Math.random() * 6000); }; setTimeout(burst, 1800); }
// hero raven blinks occasionally
const eye = $('#eye');
const blinkOnce = () => { eye.classList.remove('twice', 'slow'); restart(eye, 'blink'); };
if (eye && !reduce) {
  const blink = () => {
    if (hero && (hero.classList.contains('storming') || hero.classList.contains('possessed') || hero.classList.contains('waking'))) { setTimeout(blink, 1500); return; }
    blinkOnce();
    const r = Math.random();
    if (r < .25) eye.classList.add('twice'); else if (r < .33) eye.classList.add('slow');
    setTimeout(blink, 2800 + Math.random() * 5200);
  };
  setTimeout(blink, 2600);
}
const hangul = '가나다라마바사아자차카타파하검도태권송암승필백학혜기답연마무예마이클스콰이어';
const scrambleText = (el, target, dur, cb, set = glyphs) => {
  const t0 = performance.now(), n = Math.max(el.textContent.length, target.length);
  const tick = now => {
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
  let spins = 0, fired = false;
  crest.addEventListener('click', () => {
    if (fired) return;
    spins++;
    wrap.style.setProperty('--g', Math.min(spins, 4));
    wrap.style.setProperty('--s', [0, .06, .18, .45, 1][Math.min(spins, 4)]);
    restart(wrap, 'pulse');
    wrap.classList.add('charged');
    if (spins < 5) return;
    fired = true;
    wrap.classList.remove('charged');
    wrap.classList.add('done');
    const words = talk ? talk.querySelectorAll('.w') : [];
    const reset = () => {
      wrap.classList.remove('done', 'pulse', 'charged'); wrap.style.setProperty('--g', 0); wrap.style.setProperty('--s', 0);
      if (words.length === 2) { scrambleText(words[0], "Let's", 1000, () => talk.classList.remove('ko')); scrambleText(words[1], 'talk', 1200, () => { spins = 0; fired = false; }); }
      else { spins = 0; fired = false; }
    };
    if (words.length === 2) {
      words.forEach(w => { w.querySelectorAll('i').forEach(i => { i.style.transition = 'none'; i.style.opacity = 1; i.style.transform = 'none'; }); });
      setTimeout(() => {
        talk.classList.add('ko');
        scrambleText(words[0], '정신일도', 1300, null, hangul);
        scrambleText(words[1], '하사불성', 1700, () => setTimeout(reset, 4500), hangul);
      }, 600);
    } else setTimeout(reset, 2000);
    crest.title = '';
  });
}
// hero spotlight
const hero = $('.hero'), spot = $('#spot');
if (hero && spot && !reduce && fine) hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); spot.style.setProperty('--mx', (e.clientX - r.left) + 'px'); spot.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
// crest parallax toward pointer
const logoWrap = $('#logoWrap');
if (logoWrap && !reduce && fine) {
  const set = (rx, ry, tx, ty, px = 0, py = 0) => { const s = logoWrap.style; s.setProperty('--rx', rx + 'deg'); s.setProperty('--ry', ry + 'deg'); s.setProperty('--tx', tx + 'px'); s.setProperty('--ty', ty + 'px'); s.setProperty('--px', px); s.setProperty('--py', py); };
  logoWrap.addEventListener('pointermove', e => { const r = logoWrap.getBoundingClientRect(); const cx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1), cy = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1); set(cx * 9, -cy * 7, cx * 14, cy * 10, cx, cy); });
  logoWrap.addEventListener('pointerleave', () => set(0, 0, 0, 0));
}
// storm: rain + lightning behind the hero while the name is in Hangul
const stormEl = $('#storm'), bolt = stormEl && stormEl.querySelector('.bolt');
const crestEl = $('.hero-crest');
// per-column top/bottom of the crest artwork, so drips start and end on the logo itself
let cols = null;
const getCols = () => {
  if (cols) return cols;
  cols = [];
  try {
    const img = $('.hero-logo'), N = 100, c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    for (let x = 4; x < N - 4; x++) { let t = -1, b = -1; for (let y = 0; y < N; y++) if (d[(y * N + x) * 4 + 3] > 200) { if (t < 0) t = y; b = y; } if (t >= 0 && b - t > 20) cols.push([x, t, b]); }
  } catch (e) {}
  if (!cols.length) for (let x = 12; x < 88; x++) { const h = Math.sqrt(Math.max(0, 38 * 38 - (x - 50) ** 2)); cols.push([x, 52 - h, 52 + h]); }
  return cols;
};
const storm = () => {
  if (reduce || !stormEl || !hero) return () => {};
  const n = innerWidth < 700 ? 40 : 80, frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i'); d.className = 'drop';
    d.style.left = (Math.random() * 130) + '%';
    d.style.setProperty('--l', (8 + Math.random() * 10) + 'vh');
    d.style.setProperty('--d', (.45 + Math.random() * .35) + 's');
    d.style.setProperty('--w', (-Math.random()) + 's');
    d.style.opacity = .35 + Math.random() * .65;
    frag.appendChild(d);
  }
  const rainbox = stormEl.querySelector('.rainbox') || stormEl; rainbox.appendChild(frag);
  hero.classList.add('storming');
  // water sim: rain beads land and grow, neighbours merge, heavy drops slide with stick-slip,
  // leave wet trails and residue, pool at the bottom edge, then detach and fall
  let simStop = null;
  if (crestEl) {
    const cs = getCols(), colAt = {};
    cs.forEach(([x, t, b]) => colAt[x] = [t, b]);
    const H = () => crestEl.clientHeight || 1, W = () => crestEl.clientWidth || 1;
    const drops = [];
    let ending = false, last = performance.now(), spawnAcc = 0;
    const add = (x, y, m, state = 'bead') => {
      const el = document.createElement('i'); el.className = 'drip';
      crestEl.appendChild(el);
      const d = { el, x, y, m, vy: 0, vx: 0, state, stall: 0, lastMark: y, phase: Math.random() * 6.28, fade: 1, pts: [], path: null };
      drops.push(d); return d;
    };
    // continuous smoothed trails: one SVG layer, each run drawn as short curved chunks that dry off tail-first
    const NS = 'http://www.w3.org/2000/svg';
    let svg = crestEl.querySelector('.trails');
    if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'trails'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); crestEl.appendChild(svg); }
    const smooth = p => { let s = `M${p[0][0]} ${p[0][1]}`; for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; s += ` Q${p[i][0]} ${p[i][1]} ${mx} ${my}`; } const l = p[p.length - 1]; return s + ` L${l[0]} ${l[1]}`; };
    const dry = d => { if (!d.path) return; const p = d.path; d.path = null; requestAnimationFrame(() => p.classList.add('dry')); setTimeout(() => p.remove(), 2600); };
    const trace = d => {
      const last = d.pts[d.pts.length - 1];
      if (last && Math.hypot(d.x - last[0], d.y - last[1]) < .45) return;
      d.pts.push([+d.x.toFixed(2), +d.y.toFixed(2)]);
      if (!d.path) { d.path = document.createElementNS(NS, 'path'); svg.appendChild(d.path); }
      d.path.style.strokeWidth = (Math.max(.5, d.m) * 2.6).toFixed(2) + 'px';
      if (d.pts.length > 1) d.path.setAttribute('d', smooth(d.pts));
      if (d.pts.length >= 9) { dry(d); d.pts = [d.pts[d.pts.length - 1]]; }
    };
    const endTrail = d => { dry(d); d.pts = []; };
    // drops only form on the lower half of the crest (from the horizontal midline down)
    const src = cs.filter(([, t, b]) => b > 58).length ? cs.filter(([, t, b]) => b > 58) : cs;
    const pickSpot = () => { const [x, t, b] = src[Math.random() * src.length | 0], top = Math.max(t, 50); return [x + Math.random(), top + Math.random() * (b - top) * .55]; };
    const t0 = performance.now() + 1400; // first drops land after ~1.4s
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      // rain keeps landing while it storms
      const soak = Math.max(0, Math.min(1, (now - t0) / 3200));
      if (!ending && now > t0) { spawnAcc += dt * (4 + 16 * soak); while (spawnAcc > 1) { spawnAcc--;
        const [x, y] = pickSpot(), m = .18 + Math.random() * .3;
        const hit = drops.find(o => o.state !== 'fall' && Math.abs(o.x - x) < 2.2 && Math.abs(o.y - y) < 2.6);
        if (hit) hit.m = Math.min(1.8, hit.m + m * .7); else if (drops.length < 70) add(x, y, m);
      } }
      const hp = H(), wp = W();
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        const col = colAt[Math.round(d.x)] || colAt[Math.floor(d.x)];
        const bot = col ? col[1] : d.y;
        if (d.state === 'bead') {
          if (!ending) d.m += dt * (.08 + .3 * soak) * (.5 + Math.random());  // gathers rain faster as it soaks
          if (d.m > .9) d.state = 'slide';
        } else if (d.state === 'slide') {
          if (d.stall > 0) { d.stall -= dt; d.vy *= .6; }
          else {
            d.vy += (d.m - .6) * 90 * dt;                       // heavier = faster
            d.vy *= Math.pow(.25, dt);                          // surface friction
            if (Math.random() < dt * 1.6) d.stall = .12 + Math.random() * .35; // catches on texture
          }
          d.vy = Math.min(d.vy, 40);
          d.phase += dt * (2 + d.vy * .2);
          d.vx = Math.sin(d.phase) * .9 + (Math.random() - .5) * .6; // meanders
          d.x += d.vx * dt; d.y += d.vy * dt;
          trace(d);
          if (d.y - d.lastMark > .8) { d.lastMark = d.y; if (Math.random() < .12) { add(d.x, d.y - .6, .22 + Math.random() * .15); d.m -= .05; } d.m -= .004; }
          if (d.m < .7 && d.stall <= 0) { d.state = 'bead'; d.vy = 0; endTrail(d); }   // spent itself leaving residue
          if (!col || d.y >= bot) { d.y = Math.min(d.y, bot); trace(d); d.state = 'hang'; d.vy = 0; endTrail(d); }
        } else if (d.state === 'hang') {
          d.m += dt * .6;                                       // pools at the edge
          if (d.m > 1.4) { d.state = 'fall'; d.vy = 8; }
        } else if (d.state === 'fall') {
          d.vy += 260 * dt; d.y += d.vy * dt; d.fade -= dt * 2.2;
          if (d.fade <= 0) { d.el.remove(); drops.splice(i, 1); continue; }
        }
        // merge with anything we touch
        if (d.state === 'slide' || d.state === 'hang') {
          const r = (3.5 * d.m) / wp * 100, ry = (4.5 * d.m) / hp * 100;
          for (let j = drops.length - 1; j >= 0; j--) {
            const o = drops[j]; if (o === d || o.state === 'fall') continue;
            if (Math.abs(o.x - d.x) < r + 1 && Math.abs(o.y - d.y) < ry + 1.2) {
              d.m = Math.min(1.8, d.m + o.m * .55); d.vy += o.m * 4; endTrail(o); o.el.remove(); drops.splice(j, 1); if (j < i) i--;
            }
          }
        }
        const stretch = d.state === 'fall' ? Math.min(1.2, d.vy / 120) : d.state === 'slide' ? Math.min(.35, d.vy / 60) : d.state === 'hang' ? (d.m - 1) * .5 : 0;
        const el = d.el;
        el.style.left = d.x + '%'; el.style.top = d.y + '%';
        el.style.setProperty('--sz', d.m.toFixed(3));
        el.style.transform = `scale(${1 - stretch * .25},${1 + stretch})`;
        el.style.opacity = (ending ? d.fade : 1) * Math.min(1, .45 + d.m * .6);
        if (ending) d.fade -= dt * 1.2;
        if (ending && d.fade <= 0) { endTrail(d); el.remove(); drops.splice(i, 1); }
      }
      if (drops.length || !ending) raf = requestAnimationFrame(step);
    };
    let raf = requestAnimationFrame(step);
    simStop = () => { ending = true; drops.forEach(endTrail); };
  }
  // visible branching bolt + strike light on the crest and name
  const bsvg = stormEl.querySelector('.boltsvg'), rim = $('#rim'), h1 = $('.hero h1'), NS = 'http://www.w3.org/2000/svg';
  const zig = (x, y, yEnd, spread, step) => { const p = [[x, y]]; while (y < yEnd) { y += step * (.6 + Math.random() * .8); x += (Math.random() - .5) * spread; p.push([x, y]); } return p; };
  const toD = p => 'M' + p.map(q => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' L');
  const drawBolt = bx => {
    if (!bsvg) return;
    const g = document.createElementNS(NS, 'g'), main = zig(bx, -4, 48 + Math.random() * 22, 7, 4.5);
    const mk = (cls, d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; g.appendChild(p); return p; };
    const parts = [mk('glow', toD(main)), mk('core', toD(main))];
    for (let k = 0, n = 1 + (Math.random() * 2 | 0); k < n; k++) {
      const at = main[2 + (Math.random() * (main.length - 4) | 0)], dir = Math.random() < .5 ? -1 : 1;
      const br = zig(at[0], at[1], at[1] + 10 + Math.random() * 14, 5, 3).map((q, i) => [q[0] + dir * i * 1.6, q[1]]);
      parts.push(mk('branch', toD(br)));
    }
    bsvg.appendChild(g);
    parts.forEach(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 70, easing: 'linear', fill: 'forwards' }));
    g.animate([{ opacity: 1 }, { opacity: .15, offset: .15 }, { opacity: .95, offset: .25 }, { opacity: .1, offset: .45 }, { opacity: .5, offset: .55 }, { opacity: 0 }], { duration: 520, easing: 'linear', fill: 'forwards' }).onfinish = () => g.remove();
  };
  const evil = $('#evil');
  const flash = () => {
    const bx = 12 + Math.random() * 76;
    if (evil) { restart(evil, 'flare'); setTimeout(() => evil.classList.remove('flare'), 700); }
    setTimeout(() => {
    bolt.style.setProperty('--bx', bx + '%'); restart(bolt, 'flash');
    const rift = $('#rift'); if (rift) { rift.style.setProperty('--bx', bx + '%'); restart(rift, 'open'); }
    const hz = $('#horizon'); if (hz) restart(hz, 'lit');
    drawBolt(bx);
    if (rim) { rim.style.setProperty('--lx', Math.max(0, Math.min(100, (bx - 50) * 2.2 + 50)) + '%'); restart(rim, 'flash'); }
    if (h1) restart(h1, 'lit');
    }, 140);
  };
  // wind gusts shear the rain
  const rb = stormEl.querySelector('.rainbox');
  const gustT = [900, 2800, 4700, 6600].map(t => t + Math.random() * 600).map(t => setTimeout(() => { if (!rb) return; rb.classList.add('gust'); setTimeout(() => rb.classList.remove('gust'), 900 + Math.random() * 500); }, t));
  // rain ripples in the pool under the crest
  const puddle = $('#puddle');
  const ripT = puddle ? setInterval(() => {
    for (let k = 0; k < 2; k++) {
      const a = Math.random() * 6.283, r = Math.sqrt(Math.random()), p = document.createElement('i'); p.className = 'pring';
      p.style.left = (50 + Math.cos(a) * r * 44) + '%'; p.style.top = (50 + Math.sin(a) * r * 38) + '%'; p.style.setProperty('--w', (14 + Math.random() * 26) + 'px');
      puddle.appendChild(p); p.addEventListener('animationend', () => p.remove());
    }
  }, 160) : null;
  const ts = [500, 2000, 3500, 5000, 6300, 7400].map(t => setTimeout(flash, t + Math.random() * 400));
  return () => { ts.forEach(clearTimeout); gustT.forEach(clearTimeout); clearInterval(ripT); if (rb) rb.classList.remove('gust'); simStop && simStop(); hero.classList.remove('storming');
    const ag = $('#afterglow'); if (ag) { hero.classList.add('clearing'); restart(ag, 'go'); setTimeout(() => hero.classList.remove('clearing'), 1900); } setTimeout(() => { if (!hero.classList.contains('storming')) stormEl.querySelectorAll('.drop').forEach(x => x.remove()); }, 1000); };
};
// crest click: name scrambles into Hangul and back
if (logoWrap) {
  const h1 = $('.hero h1'), ws = h1 ? h1.querySelectorAll('.w') : [];
  let busy = false;
  if (ws.length === 2) logoWrap.addEventListener('click', () => {
    if (busy) return; busy = true;
    // blink -> eye turns while lid is shut -> storm + name change
    const lidShut = 130, lidOpen = 320;
    if (eye && !reduce) blinkOnce();
    setTimeout(() => {
      if (!hero) return;
      hero.classList.add('possessed');
      const pf = $('#pflash'), ev = $('#evil');
      if (pf && ev && !reduce) {
        const hr = hero.getBoundingClientRect(), er = ev.getBoundingClientRect();
        pf.style.setProperty('--fx', (er.left + er.width / 2 - hr.left) + 'px'); pf.style.setProperty('--fy', (er.top + er.height / 2 - hr.top) + 'px');
        restart(pf, 'go'); restart(hero, 'possessing'); setTimeout(() => hero.classList.remove('possessing'), 600);
      }
    }, reduce ? 0 : lidShut);
    setTimeout(() => {
    const endStorm = storm();
    ws.forEach(w => { w.style.animation = 'none'; w.style.opacity = 1; w.style.transform = 'none'; });
    h1.classList.add('ko');
    scrambleText(ws[0], '마이클', 900, null, hangul);
    scrambleText(ws[1], '스콰이어스', 1200, () => setTimeout(() => {
      endStorm();
      // starburst fades out on its own, then the bird blinks a few times as it comes to
      setTimeout(() => {
        if (!hero) return;
        hero.classList.add('waking'); hero.classList.remove('possessed');
        // after the evil fully fades (1.2s), a rapid flutter of blinks, then one slow one
        if (eye && !reduce) [1400, 1720, 2040, 2360, 3100].forEach(t => setTimeout(blinkOnce, t));
        setTimeout(() => hero.classList.remove('waking'), reduce ? 0 : 3600);
      }, 600);
      scrambleText(ws[0], 'Michael', 900, () => h1.classList.remove('ko'));
      scrambleText(ws[1], 'Squires', 1100, () => { ws.forEach(w => { w.style.animation = 'shine 6s ease-in-out infinite'; w.style.opacity = ''; w.style.transform = ''; }); setTimeout(() => busy = false, 3000); });
    }, 7000), hangul);
    }, reduce ? 0 : lidOpen);
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
frame();
})();
