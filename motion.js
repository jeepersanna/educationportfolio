// Light motion for annadanielson.site
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.documentElement.classList.add('motion');

  // Lantern Storm: the home page intro. Plays once per browser session on the home page; the styles it needs travel with it.
  var introLift = 0;
  (function () {
    var css = `:root { --indigo: #120C2E; --cream: #FBF4E8; --pink: #FF4F9A; --teal: #2EC4B6; --yellow: #FFD23F; --ink: #120C2E; }
#ls .corner { position: fixed; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(130vmax 95vmax at 0% 0%, rgba(255,79,154,.42) 0%, rgba(255,79,154,.18) 28%, rgba(46,196,182,.10) 58%, rgba(18,12,46,0) 78%); }
#ls .blob { position: fixed; width: 62vmax; height: 62vmax; border-radius: 50%; filter: blur(90px); opacity: 0; pointer-events: none; will-change: transform, opacity; }
#ls .b1 { background: var(--pink); left: -22vmax; top: -30vmax; animation: drift1 9s ease-in-out infinite alternate; }
#ls .b2 { background: var(--teal); right: -26vmax; top: 4vmax; animation: drift2 11s ease-in-out infinite alternate; }
#ls .b3 { background: var(--yellow); left: 10vmax; bottom: -44vmax; animation: drift3 10s ease-in-out infinite alternate; }
@keyframes drift1 { to { transform: translate(8vmax, 6vmax) scale(1.1); } }
@keyframes drift2 { to { transform: translate(-6vmax, 8vmax) scale(.92); } }
@keyframes drift3 { to { transform: translate(-8vmax, -4vmax) scale(1.08); } }
#ls canvas { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
#ls .name { position: fixed; left: 0; top: 0; margin: 0; white-space: nowrap; font-weight: 300; text-transform: uppercase; letter-spacing: .28em; font-size: clamp(1.6rem, 4vw, 2.6rem); line-height: 1.2; color: var(--cream); transform-origin: 0 0; will-change: transform; }
#ls .name span { display: inline-block; }
#ls .name .dot { width: .2em; height: .2em; border-radius: 50%; background: var(--pink); vertical-align: middle; margin: 0 .38em 0 .1em; position: relative; top: -.06em; }
#ls .tag { position: fixed; left: 0; top: 0; margin: 0; white-space: nowrap; font-weight: 500; text-transform: uppercase; letter-spacing: .24em; font-size: .78rem; color: var(--teal); will-change: transform; }
#ls .tag .caret { display: inline-block; width: 2px; height: 1.05em; background: var(--yellow); vertical-align: -.2em; margin-left: .2em; animation: blink .7s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
#ls .hint { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); font: 500 .65rem/1 "Jost", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: rgba(251,244,232,.35); transition: opacity .4s; }
#ls { position: fixed; inset: 0; z-index: 9999; pointer-events: none; transition: opacity .8s ease; }
#ls .sky { position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; background: var(--indigo); }
#ls .sky > * { position: absolute; }
html.ls-on main { will-change: transform; }
#ls.out { opacity: 0; pointer-events: none; }
html.ls-on { overflow: hidden; }
/* the header: one gradient from the top-left corner, shared by the nav bar and the hero on every page */
.site-header, .hero, .page-hero { background: radial-gradient(130vmax 95vmax at 0% 0%, rgba(255,79,154,.42) 0%, rgba(255,79,154,.18) 28%, rgba(46,196,182,.10) 58%, rgba(18,12,46,0) 78%) fixed, var(--indigo); }
.hero .wrap { position: relative; }
.ls-mark { position: absolute; pointer-events: none; z-index: 1; }`;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var root = document.documentElement, hero = document.querySelector('.hero'), mainEl = document.querySelector('main');
  var markImg = hero && hero.querySelector('.hero-mark'), h1El = hero && hero.querySelector('h1'), tagP = hero && hero.querySelector('.tagline');
  if (!hero || !markImg || !h1El || !tagP || !mainEl) { root.classList.remove('splash'); return; }
  var C = { pink: '#FF4F9A', teal: '#2EC4B6', yellow: '#FFD23F', cream: '#FBF4E8', indigo: '#120C2E' };
  var BRAND = [C.pink, C.teal, C.yellow];
  var END = 6.9;
  var seen = false;
  // the intro plays on a visitor's first load only; every load after that gets the quiet build
  try { seen = localStorage.getItem('ad-intro-seen') === '1' || sessionStorage.getItem('ad-intro') === '1'; localStorage.setItem('ad-intro-seen', '1'); sessionStorage.setItem('ad-intro', '1'); } catch (e) {}
  var playing = !seen && (window.scrollY || 0) <= 40;
  var ls, sky, cv, ctx, nameEl, tagEl, blobs, corner, hint;
  if (playing) {
    ls = document.createElement('div'); ls.id = 'ls'; ls.setAttribute('aria-hidden', 'true');
    ls.innerHTML = '<div class="sky"><div class="corner"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><canvas></canvas></div>' +
      '<div class="name"></div><p class="tag"></p><div class="hint">click to skip</div>';
    document.body.appendChild(ls);
    sky = ls.querySelector('.sky'); cv = ls.querySelector('canvas'); ctx = cv.getContext('2d');
    nameEl = ls.querySelector('.name'); tagEl = ls.querySelector('.tag');
    blobs = ls.querySelectorAll('.blob'); corner = ls.querySelector('.corner'); hint = ls.querySelector('.hint');
    root.classList.add('ls-on');
  }

  // ---------- helpers
  function cl(x, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, x)); }
  function seg(t, a, b) { return cl((t - a) / (b - a)); }
  function lerp(a, b, p) { return a + (b - a) * p; }
  var E = {
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    in: function (t) { return t * t * t; },
    inOut: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: function (t) { var c = 1.9; return t <= 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    elastic: function (t) { return t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1; }
  };
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ---------- mark geometry (120-unit box, center at 0,0)
  var LINE_A = [-60, 0, 60, 120, 180, 240].map(function (d) { return d * Math.PI / 180; });
  var LINE_ORDER = [3, 0, 4, 1, 5, 2];
  function leafPath(c) {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(-8, -8, -8, -22, 0, -30); c.bezierCurveTo(8, -22, 8, -8, 0, 0); c.closePath();
  }
  function drawLeaf(x, y, rot, sc, color, alpha, S, shade, hx, hy) {
    if (alpha <= 0 || sc <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * S, sc * S);
    leafPath(ctx); ctx.fillStyle = color; ctx.fill();
    if (shade > 0) {
      // where the lamp sits, in this leaf's own space
      var px = hx - x, py = hy - y, c = Math.cos(-rot), s = Math.sin(-rot), lx = (px * c - py * s) / (sc * S), ly = (px * s + py * c) / (sc * S);
      ctx.save(); leafPath(ctx); ctx.clip();
      var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 50 / sc);
      g.addColorStop(0, 'rgba(255,230,140,' + (.32 * shade) + ')'); g.addColorStop(.3, 'rgba(255,230,140,0)'); g.addColorStop(.55, 'rgba(18,12,46,0)'); g.addColorStop(1, 'rgba(18,12,46,' + (.55 * shade) + ')');
      ctx.fillStyle = g; ctx.fillRect(-12, -32, 24, 34); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, -26); ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.strokeStyle = C.indigo; ctx.stroke();
    ctx.restore();
  }

  // ---------- deterministic scene data
  var stars = [], swarm = [], sparks = [];
  function build() {
    seed = 7; stars = []; swarm = []; sparks = [];
    for (var i = 0; i < 160; i++) stars.push({ x: rnd(), y: rnd(), r: .5 + rnd() * 1.4, b: rnd() * 1.1, ph: rnd() * 6.28, c: rnd() < .2 ? BRAND[i % 3] : C.cream });
    // the six real leaves + a storm of decoys
    for (var k = 0; k < 6; k++) swarm.push({ real: true, k: k, a0: rnd() * 6.28, spin: (rnd() < .5 ? -1 : 1) * (2.2 + rnd() * 1.6), st: 1.25 + [3, 0, 4, 1, 5, 2].indexOf(k) * .09, dur: 1.15, c: k % 2 ? C.teal : C.pink, sc: k % 2 ? .9 : 1.25 });
    for (var j = 0; j < 54; j++) {
      var st = 1.0 + rnd() * .9, du = .9 + rnd() * .7;
      var d = { real: false, a0: rnd() * 6.28, spin: (rnd() < .5 ? -1 : 1) * (2.5 + rnd() * 3), st: st, dur: du, c: BRAND[j % 3], sc: .35 + rnd() * .6, rot0: rnd() * 6.28 };
      swarm.push(d);
      for (var s = 0; s < 5; s++) { var a = rnd() * 6.28; sparks.push({ b: st + du, a: a, v: 40 + rnd() * 90, life: .5 + rnd() * .4, c: d.c, r: .8 + rnd() * 1.6 }); }
    }
    // the big flash burst when the lines lock
    for (var q = 0; q < 110; q++) { var aa = rnd() * 6.28; sparks.push({ b: 2.85 + rnd() * .08, a: aa, v: 160 + rnd() * 420, life: .7 + rnd() * .7, c: q % 4 ? BRAND[q % 3] : C.cream, r: 1 + rnd() * 2.2, big: true }); }
  }

  // ---------- layout
  var W, H, DPR, L = {}, nameW = 0, nameH = 0, tagW = 0;
  var NAME = [], TAG = tagP.textContent.replace(/\s+/g, ' ').trim();
  Array.prototype.forEach.call(h1El.childNodes, function (n) {
    if (n.nodeType === 3) n.textContent.toUpperCase().replace(/\s+/g, '').split('').forEach(function (ch) { NAME.push(ch); });
    else if (n.nodeType === 1) NAME.push('•');
  });
  var spans = [];
  function buildName() {
    nameEl.innerHTML = ''; spans = [];
    NAME.forEach(function (ch, i) {
      var s = document.createElement('span');
      if (ch === '•') { s.className = 'dot'; } else s.textContent = ch;
      s.setAttribute('aria-hidden', 'true');
      nameEl.appendChild(s); spans.push(s);
    });
    tagEl.innerHTML = '<span class="t"></span><span class="caret"></span>';
    tagEl.querySelector('.t').textContent = TAG;
    nameW = nameEl.offsetWidth; nameH = nameEl.offsetHeight; tagW = tagEl.offsetWidth;
    tagEl.querySelector('.t').textContent = '';
  }
  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var phone = W < 700;
    var big = Math.min(W, H) * (phone ? .5 : .4);
    L.S0 = big / 120; L.cx = W / 2; L.cy = H * .42;
    L.n0x = (W - nameW) / 2; L.n0y = L.cy + big / 2 + Math.max(22, big * .1);
    L.t0x = (W - tagW) / 2; L.t0y = L.n0y + nameH + 14;
    // where things sit on the real page underneath
    var sy = window.scrollY || 0;
    var mr = markImg.getBoundingClientRect(), hr = h1El.getBoundingClientRect();
    var tr = tagP.getBoundingClientRect(), hb = hero.getBoundingClientRect();
    L.HH = hb.bottom + sy;
    L.Sf = mr.width / 120; L.fx = mr.left + mr.width / 2; L.fy = mr.top + mr.height / 2 + sy;
    // match the overlay's name to the real h1: same tracking, and the dot spaced so both names are the same width
    var h1 = h1El, tn = Array.prototype.filter.call(h1.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    var r1 = document.createRange(); r1.selectNodeContents(tn[0]); var r2 = document.createRange(); r2.selectNodeContents(tn[tn.length - 1]);
    var left = r1.getBoundingClientRect().left, right = r2.getBoundingClientRect().right;
    nameEl.style.letterSpacing = getComputedStyle(h1).letterSpacing;
    var dot = nameEl.querySelector('.dot'); dot.style.marginLeft = '.1em'; dot.style.marginRight = '.38em';
    var extra = (right - left - nameEl.offsetWidth) / 2;
    if (extra > 0) { dot.style.marginLeft = 'calc(.1em + ' + extra.toFixed(1) + 'px)'; dot.style.marginRight = 'calc(.38em + ' + extra.toFixed(1) + 'px)'; }
    nameW = nameEl.offsetWidth; nameH = nameEl.offsetHeight;
    L.n0x = (W - nameW) / 2;
    L.nfx = left; L.nfy = hr.top + sy; L.tfx = tr.left; L.tfy = tr.top + sy; L.tagW = tr.width;
    introLift = (H - L.HH) + 60;
  }

  // ---------- scene drawing
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ*+#%&@✶✿❀';
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    var sm = function (x) { return x * x * x * (x * (x * 6 - 15) + 10); }; // smoothstep: no kick at the start or the end
    var mv = sm(seg(t, 4.5, 5.8)), mvS = sm(seg(t, 4.35, 5.45));
    var arc = Math.sin(Math.PI * mv) * Math.min(W, H) * .045;
    var mx = lerp(L.cx, L.fx, mv), my = lerp(L.cy, L.fy, mv) - arc, S = lerp(L.S0, L.Sf, mvS);
    var R = Math.max(W, H);

    // color blobs breathe in, get brighter on the flash
    var hand = sm(seg(t, 4.25, 5.7));
    var bo = (.32 * seg(t, 0, 1.6) + .25 * Math.max(0, 1 - Math.abs(t - 2.95) / .5)) * (1 - hand);
    for (var b = 0; b < blobs.length; b++) blobs[b].style.opacity = bo.toFixed(3);
    corner.style.opacity = hand.toFixed(3);

    // stars: twinkle in, get sucked toward the center, then blasted back out
    stars.forEach(function (s) {
      function kAt(tt) { return tt < 2.85 ? 1 - .88 * E.in(seg(tt, 1.55, 2.85)) : .12 + .88 * E.out(seg(tt, 2.85, 3.8)); }
      var k = kAt(t), k2 = kAt(t - .05);
      var bx = s.x * W, by = s.y * H;
      var x = mx + (bx - mx) * k, y = my + (by - my) * k, x2 = mx + (bx - mx) * k2, y2 = my + (by - my) * k2;
      var starK = 1 - .75 * sm(seg(t, 3.8, 6.0)), tw = lerp(2.2, .9, seg(t, 3.8, 6.0));
      var a = seg(t, s.b, s.b + .5) * (.35 + .65 * Math.abs(Math.sin(t * tw + s.ph))) * starK;
      ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = s.c;
      var dl = Math.hypot(x - x2, y - y2);
      if (dl > 2) { ctx.lineWidth = s.r; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.29); ctx.fill(); }
    });
    ctx.globalAlpha = 1;

    // ripples off the center
    [[.25, C.teal], [.5, C.pink], [.75, C.yellow], [2.85, C.cream], [2.95, C.pink]].forEach(function (r) {
      var p = seg(t, r[0], r[0] + 1.3); if (p <= 0 || p >= 1) return;
      ctx.globalAlpha = (1 - p) * .55; ctx.strokeStyle = r[1]; ctx.lineWidth = 2 + 6 * (1 - p);
      ctx.beginPath(); ctx.arc(mx, my, E.out(p) * R * .6, 0, 6.29); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // the lamp: flickers on early, then breathes; its glow and six faint cones of light sit under everything
    var lampRaw = seg(t, .3, .75), lamp = lampRaw < 1 ? lampRaw * (Math.sin(lampRaw * 40) > -.3 ? 1 : .08) : 1;
    var throb = 1 + .6 * Math.max(0, 1 - Math.abs(t - 2.86) / .25), breath = 1 + .035 * Math.sin(t * 1.7);
    var glow = lamp * E.out(seg(t, .3, 1.6)) * (1 - E.inOut(seg(t, 3.05, 3.9))); // the glow is a moment, not the end state
    if (glow > 0) {
      var gr = 125 * S * breath * throb, lg = ctx.createRadialGradient(mx, my, 0, mx, my, gr);
      lg.addColorStop(0, 'rgba(255,210,63,' + (.28 * glow) + ')'); lg.addColorStop(.3, 'rgba(255,210,63,' + (.07 * glow) + ')'); lg.addColorStop(1, 'rgba(255,210,63,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = lg; ctx.fillRect(mx - gr, my - gr, gr * 2, gr * 2);
      ctx.save(); ctx.translate(mx, my); ctx.rotate(lerp(-Math.PI / 4, 0, E.out(seg(t, .95, 2.7))));
      LINE_A.forEach(function (a) { var rg = ctx.createRadialGradient(0, 0, 4 * S, 0, 0, 95 * S); rg.addColorStop(0, 'rgba(255,230,140,' + (.05 * glow) + ')'); rg.addColorStop(1, 'rgba(255,230,140,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 95 * S, a - .11, a + .11); ctx.closePath(); ctx.fill(); });
      ctx.restore();
    }

    // dashed orbit rings spinning opposite ways, with moons
    var oa = seg(t, .7, 1.2) * (1 - seg(t, 2.9, 3.5));
    if (oa > 0) {
      [[62, .9, C.teal, [3, 7]], [76, -.6, C.pink, [10, 6]], [90, .4, C.yellow, [1, 9]]].forEach(function (o, i) {
        var rr = o[0] * S * lerp(1.25, 1, E.out(seg(t, .7, 1.6))) * lerp(1, .55, E.in(seg(t, 2.6, 3.4)));
        ctx.save(); ctx.globalAlpha = oa * .8; ctx.translate(mx, my); ctx.rotate(t * o[1] * 1.6);
        ctx.setLineDash(o[3].map(function (v) { return v * S * .5; })); ctx.strokeStyle = o[2]; ctx.lineWidth = 1.2 * S * .6;
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.29); ctx.stroke(); ctx.setLineDash([]);
        for (var m = 0; m < 3; m++) { var ang = m * 2.094 + i; ctx.fillStyle = o[2]; ctx.beginPath(); ctx.arc(Math.cos(ang) * rr, Math.sin(ang) * rr, (2.2 + i * .4) * S * .5, 0, 6.29); ctx.fill(); }
        ctx.restore();
      });
    }

    // the six lines shoot out as light beams while the whole star turns a touch
    var turn = lerp(-Math.PI / 4, 0, E.out(seg(t, .95, 2.7)));
    ctx.save(); ctx.translate(mx, my); ctx.rotate(turn);
    LINE_A.forEach(function (ang, i) {
      var st = 1.0 + LINE_ORDER[i] * .14, p = E.out(seg(t, st, st + .4));
      if (p <= 0) return;
      var len = 46 * S * p, ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
      ctx.save(); ctx.shadowColor = C.cream; ctx.shadowBlur = 18 * (1 - seg(t, st + .4, st + 1.2));
      ctx.strokeStyle = C.cream; ctx.lineWidth = Math.max(1, S * 1.05); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore();
      // comet head while drawing
      if (p < 1) { ctx.save(); ctx.shadowColor = C.yellow; ctx.shadowBlur = 20; ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(ex, ey, 3.2 * S * .5 + 1.5, 0, 6.29); ctx.fill(); ctx.restore(); }
      // tip dot snaps on
      var tp = E.back(seg(t, st + .38, st + .7));
      if (tp > 0) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(Math.cos(ang) * 46 * S, Math.sin(ang) * 46 * S, 2.4 * S * tp, 0, 6.29); ctx.fill(); }
    });
    ctx.restore();

    // leaf storm: dozens spiral in, six land in place, the rest burn up in the middle
    swarm.forEach(function (d) {
      var p = seg(t, d.st, d.st + d.dur); if (p <= 0) return;
      var e = E.inOut(p);
      if (d.real) {
        var tr = (d.k * 60) * Math.PI / 180, dx = Math.sin(tr), dy = -Math.cos(tr);
        var tx = dx * 16 * S, ty = dy * 16 * S; // landing spot relative to the center
        var r0 = R * .75, ta = Math.atan2(ty, tx);
        var a = ta + d.spin * (1 - e), rr = lerp(r0, 16 * S, e);
        var x = mx + Math.cos(a) * rr, y = my + Math.sin(a) * rr;
        var rot = tr + d.spin * 1.4 * (1 - e);
        var land = seg(t, d.st + d.dur - .05, d.st + d.dur + .45);
        var sc = p < 1 ? lerp(.5, 1, e) * d.sc : d.sc * (1 + .25 * Math.sin(land * Math.PI) * (1 - land));
        var settle = seg(t, d.st + d.dur, d.st + d.dur + .3) * lamp;
        if (settle > 0) for (var j = 3; j >= 1; j--) {
          var push = S * (3 + 3 * j) * settle * (1 - .4 * mv);
          ctx.save(); ctx.globalAlpha = .045 * settle; ctx.translate(x + dx * push, y + dy * push); ctx.rotate(rot); ctx.scale(sc * S, sc * S * (1 + push / (40 * S)));
          leafPath(ctx); ctx.fillStyle = C.indigo; ctx.fill(); ctx.restore();
        }
        drawLeaf(x, y, rot, sc, d.c, 1, S, settle * (.3 + .7 * glow / Math.max(lamp, .001)), mx, my);
      } else {
        if (p >= 1) return;
        var r0d = R * .8, a2 = d.a0 + d.spin * e, rr2 = lerp(r0d, 0, E.in(p) * .3 + e * .7);
        var x2 = mx + Math.cos(a2) * rr2, y2 = my + Math.sin(a2) * rr2;
        drawLeaf(x2, y2, d.rot0 + d.spin * 2 * e, d.sc * (1 - E.in(p) * .9), d.c, .9 * (1 - E.in(seg(p, .7, 1))), S);
      }
    });

    // sparks
    sparks.forEach(function (s) {
      var age = t - s.b; if (age <= 0 || age >= s.life) return;
      var p = age / s.life, dist = s.v * (1 - Math.pow(1 - p, 2)) * (s.big ? S * .9 : S * .5);
      ctx.globalAlpha = 1 - p; ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(mx + Math.cos(s.a) * dist, my + Math.sin(s.a) * dist, s.r * (1 - p * .5), 0, 6.29); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // white flash
    var fl = Math.max(0, 1 - Math.abs(t - 2.88) / .18);
    if (fl > 0) { var g = ctx.createRadialGradient(mx, my, 0, mx, my, R * .7); g.addColorStop(0, 'rgba(255,248,230,' + (.75 * fl) + ')'); g.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

    // yellow center: pops with a halo, throbs on the flash
    var hp = E.back(seg(t, .3, .7));
    if (hp > 0) {
      ctx.save(); ctx.globalAlpha = .35 + .65 * lamp; ctx.shadowColor = C.yellow; ctx.shadowBlur = (16 + 24 * (throb - 1)) * breath * glow;
      ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(mx, my, 6 * S * hp * throb, 0, 6.29); ctx.fill(); ctx.restore();
    }

    // three waves roll up from the bottom: pink, teal, then the cream page
    var waves = [];
    waves.forEach(function (w) {
      var p = seg(t, w[1], w[1] + 1.05); if (p <= 0) return;
      var e = E.out(p), top = lerp(H + 60, L.HH - w[2], e), amp = 26 * (1 - e) + 0;
      ctx.fillStyle = w[0]; ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W + 20; x += 20) ctx.lineTo(x, top + Math.sin(x * .011 + t * 5 + w[2]) * amp);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    });

    // name: letters scramble through glyphs, then lock in one by one
    spans.forEach(function (s, i) {
      var st = 2.25 + i * .045, lock = 2.75 + i * .07;
      if (t < st) { s.style.opacity = 0; return; }
      s.style.opacity = 1;
      var isDot = s.className === 'dot';
      if (isDot) { var dp = E.elastic(seg(t, lock, lock + .6)); s.style.transform = 'scale(' + dp.toFixed(3) + ')'; }
      else if (t < lock) {
        var gi = Math.floor(t * 22 + i * 7) % GLYPHS.length;
        s.textContent = GLYPHS[gi]; s.style.color = BRAND[(Math.floor(t * 14) + i) % 3];
        s.style.transform = 'translateY(' + (Math.sin(t * 30 + i) * 3).toFixed(1) + 'px)';
      } else {
        var lp = seg(t, lock, lock + .25);
        s.textContent = NAME[i]; s.style.color = C.cream;
        var lr = s.getBoundingClientRect(), ld = Math.hypot(lr.left + lr.width / 2 - mx, lr.top - my);
        s.style.opacity = (.68 + .32 * Math.exp(-ld / (320 * S))).toFixed(3);
        s.style.transform = 'translateY(' + ((1 - E.back(lp)) * -10).toFixed(1) + 'px)';
      }
      if (t > 4.3) {
        // out where it is, then re-formed in the lockup at full strength (the lamp fall-off only belongs to the centered moment)
        var base = isDot ? 1 : (parseFloat(s.style.opacity) || 1);
        var outP = sm(seg(t, 4.3, 4.8)), inP = sm(seg(t, 5.3 + i * .03, 5.75 + i * .03));
        if (t < 5.05) { s.style.opacity = (base * (1 - outP)).toFixed(3); s.style.transform = 'translateY(' + (-6 * outP).toFixed(1) + 'px)'; }
        else { s.style.opacity = inP.toFixed(3); s.style.transform = 'translateY(' + (8 * (1 - inP)).toFixed(1) + 'px)'; }
      }
    });
    var nx = t < 5.05 ? L.n0x : L.nfx, ny = t < 5.05 ? L.n0y : L.nfy;
    nameEl.style.transform = 'translate(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px)';

    // tagline types itself out
    var n = Math.floor(cl((t - 3.55) / .022, 0, TAG.length));
    var tt = tagEl.querySelector('.t'); if (tt.textContent.length !== n) tt.textContent = TAG.slice(0, n);
    tagEl.querySelector('.caret').style.display = t > 3.5 && t < 4.3 ? '' : 'none';
    var tagOut = sm(seg(t, 4.25, 4.7)), tagIn = sm(seg(t, 5.55, 5.95));
    tagEl.style.opacity = t < 5.05 ? (1 - tagOut).toFixed(3) : tagIn.toFixed(3);
    // in the lockup the tagline wraps exactly like the real one underneath
    if (t < 5.05) { tagEl.style.whiteSpace = 'nowrap'; tagEl.style.width = ''; } else { tagEl.style.whiteSpace = 'normal'; tagEl.style.width = L.tagW + 'px'; }
    var tx2 = t < 5.05 ? L.t0x : L.tfx, ty2 = (t < 5.05 ? L.t0y - 5 * tagOut : L.tfy + 6 * (1 - tagIn));
    tagEl.style.transform = 'translate(' + tx2.toFixed(1) + 'px,' + ty2.toFixed(1) + 'px)';

    var rp = sm(seg(t, 4.6, 5.95));
    var lift = (H - L.HH) + 60, off = lift * (1 - rp);
    if (t >= END) { mainEl.style.transform = ''; sky.style.height = '100%'; }
    else { mainEl.style.transform = 'translateY(' + off.toFixed(1) + 'px)'; sky.style.height = (rp > 0 ? (L.HH + off) : H + 10) + 'px'; }
    hint.style.opacity = t < 4.3 ? 1 : 0;
    if (t >= 6.05 && !done) finish(); // only once everything has come to rest
  }

  // ---------- the mark that stays on the page: the finished drawing, shadows and all, over the hero image
  var markCv = null;
  function settleMark() {
    var wrap = markImg.parentNode; if (!wrap) return;
    if (!markCv) { markCv = document.createElement('canvas'); markCv.className = 'ls-mark'; markCv.setAttribute('aria-hidden', 'true'); wrap.appendChild(markCv); markImg.style.visibility = 'hidden'; }
    var mr = markImg.getBoundingClientRect(), wr = wrap.getBoundingClientRect(), pad = Math.round(mr.width * .3), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = mr.width + pad * 2, h = mr.height + pad * 2;
    markCv.width = w * dpr; markCv.height = h * dpr; markCv.style.width = w + 'px'; markCv.style.height = h + 'px';
    markCv.style.left = (mr.left - wr.left - pad) + 'px'; markCv.style.top = (mr.top - wr.top - pad) + 'px';
    var c = markCv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    var S = mr.width / 120, mx = w / 2, my = h / 2, keep = ctx; ctx = c;
    for (var k = 0; k < 6; k++) {
      var tr = (k * 60) * Math.PI / 180, dx = Math.sin(tr), dy = -Math.cos(tr), x = mx + dx * 16 * S, y = my + dy * 16 * S, sc = k % 2 ? .9 : 1.25;
      for (var j = 3; j >= 1; j--) {
        var push = S * (3 + 3 * j) * .6;
        c.save(); c.globalAlpha = .045; c.translate(x + dx * push, y + dy * push); c.rotate(tr); c.scale(sc * S, sc * S * (1 + push / (40 * S)));
        leafPath(c); c.fillStyle = C.indigo; c.fill(); c.restore();
      }
    }
    c.strokeStyle = C.cream; c.lineWidth = Math.max(1, S * 1.05); c.lineCap = 'round';
    LINE_A.forEach(function (ang) { c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(ang) * 46 * S, my + Math.sin(ang) * 46 * S); c.stroke(); });
    for (k = 0; k < 6; k++) { tr = (k * 60) * Math.PI / 180; drawLeaf(mx + Math.sin(tr) * 16 * S, my - Math.cos(tr) * 16 * S, tr, k % 2 ? .9 : 1.25, k % 2 ? C.teal : C.pink, 1, S, .3, mx, my); }
    c.fillStyle = C.cream; LINE_A.forEach(function (ang) { c.beginPath(); c.arc(mx + Math.cos(ang) * 46 * S, my + Math.sin(ang) * 46 * S, 2.4 * S, 0, 6.29); c.fill(); });
    c.fillStyle = C.yellow; c.beginPath(); c.arc(mx, my, 6 * S, 0, 6.29); c.fill();
    ctx = keep;
  }
  window.addEventListener('resize', function () { if (markCv && !quiet) settleMark(); });
  // the small, low-key build for the lockup on repeat visits: lamp blinks on, lines and leaves come in, the name settles, the tagline follows (~1.5s)
  var quiet = false;
  function quietBuild() {
    var LO = [3, 0, 4, 1, 5, 2], LFO = [2, 5, 0, 3, 1, 4], orig = h1El.innerHTML, letters = [];
    Array.prototype.slice.call(h1El.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split('').forEach(function (ch) {
          if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
          var s = document.createElement('span'); s.textContent = ch; s.style.display = 'inline-block'; s.style.opacity = '0'; letters.push(s); frag.appendChild(s);
        });
        h1El.replaceChild(frag, n);
      } else if (n.nodeType === 1) { n.style.opacity = '0'; letters.push(n); }
    });
    tagP.style.opacity = '0';
    quiet = true; settleMark(); // places the canvas and hides the image
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000, c = markCv.getContext('2d');
      var w = parseFloat(markCv.style.width), h = parseFloat(markCv.style.height), S = markImg.getBoundingClientRect().width / 120, mx = w / 2, my = h / 2;
      var keep = ctx; ctx = c; c.clearRect(0, 0, w, h);
      var lamp = seg(t, .05, .3) * (1 - seg(t, .8, 1.3));
      if (lamp > 0) { var g = c.createRadialGradient(mx, my, 0, mx, my, 64 * S); g.addColorStop(0, 'rgba(255,210,63,' + (.22 * lamp) + ')'); g.addColorStop(1, 'rgba(255,210,63,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
      for (var k = 0; k < 6; k++) {
        var st = .45 + LFO.indexOf(k) * .06, p = E.back(seg(t, st, st + .35)); if (p <= 0) continue;
        var tr = (k * 60) * Math.PI / 180, dx = Math.sin(tr), dy = -Math.cos(tr), x = mx + dx * 16 * S, y = my + dy * 16 * S, sc = k % 2 ? .9 : 1.25, settle = seg(t, st + .25, st + .6);
        for (var j = 3; j >= 1; j--) {
          var push = S * (3 + 3 * j) * .6 * settle;
          c.save(); c.globalAlpha = .045 * settle; c.translate(x + dx * push, y + dy * push); c.rotate(tr); c.scale(sc * S, sc * S * (1 + push / (40 * S))); leafPath(c); c.fillStyle = C.indigo; c.fill(); c.restore();
        }
        drawLeaf(x, y, tr, sc * p, k % 2 ? C.teal : C.pink, 1, S, .3 * settle, mx, my);
      }
      c.strokeStyle = C.cream; c.lineWidth = Math.max(1, S * 1.05); c.lineCap = 'round';
      LINE_A.forEach(function (ang, i) {
        var st = .1 + LO[i] * .07, p = E.out(seg(t, st, st + .3)); if (p <= 0) return;
        c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(ang) * 46 * S * p, my + Math.sin(ang) * 46 * S * p); c.stroke();
        var tp = E.back(seg(t, st + .24, st + .46)); if (tp > 0) { c.fillStyle = C.cream; c.beginPath(); c.arc(mx + Math.cos(ang) * 46 * S, my + Math.sin(ang) * 46 * S, 2.4 * S * tp, 0, 6.29); c.fill(); }
      });
      var hp = E.back(seg(t, 0, .3)); if (hp > 0) { c.fillStyle = C.yellow; c.beginPath(); c.arc(mx, my, 6 * S * hp, 0, 6.29); c.fill(); }
      ctx = keep;
      letters.forEach(function (s, i) { var lp = E.out(seg(t, .4 + i * .03, .75 + i * .03)); s.style.opacity = lp.toFixed(3); s.style.transform = 'translateY(' + (4 * (1 - lp)).toFixed(2) + 'px)'; });
      tagP.style.opacity = seg(t, .85, 1.25).toFixed(3);
      if (t < 1.5) requestAnimationFrame(frame);
      else { h1El.innerHTML = orig; tagP.style.opacity = ''; quiet = false; settleMark(); }
    }
    requestAnimationFrame(frame);
  }

  // ---------- run
  var last = 0, tNow = 0, raf = 0, done = false, EV = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  function finish() {
    if (done) return; done = true;
    mainEl.style.transform = ''; root.classList.remove('ls-on', 'splash');
    settleMark();
    ls.classList.add('out');
    setTimeout(function () { if (ls.parentNode) ls.parentNode.removeChild(ls); cancelAnimationFrame(raf); }, 900);
    EV.forEach(function (ev) { window.removeEventListener(ev, skip); });
    window.removeEventListener('resize', onResize);
  }
  function loop(ts) {
    if (!last) last = ts;
    tNow += (ts - last) / 1000; last = ts;
    frame(Math.min(tNow, END));
    if (tNow > .05) root.classList.remove('splash'); // the overlay has its own navy; the pre-paint cover can go
    if (!done) raf = requestAnimationFrame(loop);
  }
  function skip() { if (tNow < END) { tNow = END; } }
  function onResize() { size(); }
  if (!playing) {
    // repeat visit: no intro; the lockup builds itself quietly in place instead
    root.classList.remove('splash');
    quietBuild();
    return;
  }
  build(); buildName(); size();
  window.addEventListener('resize', onResize);
  EV.forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { buildName(); size(); });
  window.addEventListener('load', function () { if (!done) { buildName(); size(); } });
  raf = requestAnimationFrame(loop);
  setTimeout(function () { if (!done) skip(); }, 9000); // failsafe
  window.__lsSeek = function (t) { cancelAnimationFrame(raf); raf = 0; tNow = t; frame(t); if (t < END && !done) raf = requestAnimationFrame(loop); };
  })();

  // Soft fade-up as things scroll into view
  var sel = 'main section > .wrap > *, .card, .commitment, .project, .stats-row > div, .open-banner, .roots-quote, .about-photo';
  sel += ', .split > div > *:not(.cv), .cv > div';
  sel += ', .project-meta, .project-body > *, .project-body li, .prose > *, .roots-grid > *';
  var all = Array.prototype.slice.call(document.querySelectorAll(sel));
  // reveal the smallest pieces: skip anything that holds another piece
  var items = all.filter(function (el) { return !all.some(function (o) { return o !== el && el.contains(o); }); });
  items.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) return; // already on screen at load: leave it alone
    el.classList.add('reveal');
  });
  document.querySelectorAll('main section').forEach(function (s) { s.classList.add('watch'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains('reveal')) {
          // items that arrive together come in one after another
          var d = Math.min(n, 6) * 0.08;
          if (d) {
            el.style.transitionDelay = d + 's';
            setTimeout(function () { el.style.transitionDelay = ''; }, (d + 0.8) * 1000);
          }
          n++;
        }
        el.classList.add('in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal, main section.watch').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, main section.watch').forEach(function (el) { el.classList.add('in'); });
  }

  // Parallax: header leaves drift slower than the page; card leaves shift a little
  var heroes = document.querySelectorAll('.page-hero, .hero');
  var cards = document.querySelectorAll('.commitment');
  var photo = null;
  var ticking = false;
  function update() {
    var y = window.scrollY || window.pageYOffset;
    heroes.forEach(function (h) { h.style.setProperty('--py', (y * 0.35).toFixed(1) + 'px'); });
    var vh = window.innerHeight;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var mid = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around the middle of the screen
      c.style.setProperty('--cy', (mid * -18).toFixed(1) + 'px');
    });
    if (photo) {
      var pr = photo.getBoundingClientRect();
      var pm = (pr.top + pr.height / 2 - vh / 2) / vh;
      photo.style.setProperty('--ly', (pm * -14).toFixed(1) + 'px');
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
