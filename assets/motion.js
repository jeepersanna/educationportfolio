// Light motion for annadanielson.site
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.documentElement.classList.add('motion');

  // Home intro: navy screen, mark builds and the name rises in under it, both glide to the lockup while the page comes up from below
  (function () {
    var root = document.documentElement;
    var hero = document.querySelector('.hero');
    var mark = hero && hero.querySelector('.hero-mark');
    var h1 = hero && hero.querySelector('h1');
    var main = document.querySelector('main');
    function off() { root.classList.remove('splash', 'rising'); }
    if (!mark || !h1 || !main) { off(); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('ad-intro') === '1'; sessionStorage.setItem('ad-intro', '1'); } catch (e) {}
    if (seen || (window.scrollY || window.pageYOffset) > 40) { off(); return; }
    root.classList.add('splash', 'intro');
    var W = window.innerWidth, H = window.innerHeight;

    // copy of the mark above the navy screen
    var cm = document.createElement('img');
    cm.src = 'assets/mark-large-animated.svg'; // intro pace (the hero itself uses the faster lockup version)
    cm.alt = ''; cm.setAttribute('aria-hidden', 'true'); cm.className = 'splash-mark';
    // copy of the name, letter by letter, styled like the real one
    var cn = document.createElement('div');
    cn.className = 'splash-name'; cn.setAttribute('aria-hidden', 'true');
    var hs = getComputedStyle(h1);
    ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'textTransform', 'color'].forEach(function (k) { cn.style[k] = hs[k]; });
    var i = 0;
    Array.prototype.slice.call(h1.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split('').forEach(function (c) {
          if (/\s/.test(c)) { cn.appendChild(document.createTextNode(' ')); return; }
          var sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c;
          sp.style.setProperty('--i', i++); cn.appendChild(sp);
        });
      } else if (n.nodeType === 1) {
        var d = n.cloneNode(true), ds = getComputedStyle(n);
        ['display', 'width', 'height', 'borderRadius', 'backgroundColor', 'color', 'overflow', 'verticalAlign', 'position', 'top', 'left', 'lineHeight', 'textIndent'].forEach(function (k) { d.style[k] = ds[k]; });
        d.classList.add('ch'); d.style.setProperty('--i', i++); cn.appendChild(d);
      }
    });
    mark.style.visibility = 'hidden';
    h1.style.opacity = '0'; // stays readable to screen readers during the intro
    document.body.appendChild(cm);
    document.body.appendChild(cn);

    var moving = false, done = false, anims = [];
    function textRect() {
      // where the name's letters sit (the dot hides its own text off to the side, so only text nodes count)
      var hr = h1.getBoundingClientRect(), L = Infinity, T = Infinity;
      Array.prototype.forEach.call(h1.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        var r = document.createRange(); r.selectNodeContents(n);
        Array.prototype.forEach.call(r.getClientRects(), function (b) { if (b.width && b.left >= hr.left - 2) { L = Math.min(L, b.left); T = Math.min(T, b.top); } });
      });
      return { left: L === Infinity ? hr.left : L, top: T === Infinity ? hr.top : T };
    }
    function fit() {
      W = window.innerWidth; H = window.innerHeight;
      var mr = mark.getBoundingClientRect(), tr = textRect();
      cm.style.left = mr.left + 'px'; cm.style.top = mr.top + 'px';
      cm.style.width = mr.width + 'px'; cm.style.height = mr.height + 'px';
      cn.style.left = tr.left + 'px'; cn.style.top = tr.top + 'px';
      var sc = Math.min(1.7, Math.min(W, H) * 0.4 / mr.width);
      var nw = cn.offsetWidth, nh = cn.offsetHeight;
      var bigH = mr.height * sc, gap = Math.max(18, bigH * 0.12);
      var top = H / 2 - (bigH + gap + nh) / 2; // mark and name together, centered on screen
      var mdx = W / 2 - (mr.left + mr.width / 2), mdy = top + bigH / 2 - (mr.top + mr.height / 2);
      var ndx = W / 2 - nw / 2 - tr.left, ndy = top + bigH + gap - tr.top;
      var a = 'translate(' + mdx.toFixed(1) + 'px,' + mdy.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
      var b = 'translate(' + ndx.toFixed(1) + 'px,' + ndy.toFixed(1) + 'px)';
      cm.style.transform = a; cn.style.transform = b;
      return [a, b];
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!moving) fit(); });
    window.addEventListener('resize', function () { if (!moving) fit(); });

    function finish() {
      if (done) return; done = true; clearTimeout(timer);
      anims.forEach(function (an) { try { an.cancel(); } catch (e) {} });
      // the mark copy takes the real mark's place, so its finished drawing stays put
      cm.removeAttribute('style'); cm.className = mark.className;
      cm.width = mark.width; cm.height = mark.height; cm.removeAttribute('aria-hidden');
      if (mark.parentNode) mark.parentNode.replaceChild(cm, mark);
      h1.style.opacity = '';
      if (cn.parentNode) cn.parentNode.removeChild(cn);
      off();
      EV.forEach(function (ev) { window.removeEventListener(ev, skip); });
    }
    function skip() { root.classList.add('intro-done'); finish(); }
    var timer = setTimeout(function () {
      moving = true;
      var t = fit();
      var ease = 'cubic-bezier(.6,0,.25,1)';
      if (!cm.animate) { finish(); return; }
      // navy screen drops away (the header behind it is the same navy) and the page rises from below
      var mt = main.getBoundingClientRect().top;
      var lift = Math.max(0, H - mt) + 60;
      root.classList.add('rising'); root.classList.remove('splash');
      anims.push(main.animate([{ transform: 'translateY(' + lift + 'px)' }, { transform: 'none' }], { duration: 1150, easing: 'cubic-bezier(.3,.05,.2,1)', fill: 'backwards' }));
      anims.push(cn.animate([{ transform: t[1] }, { transform: 'none' }], { duration: 900, easing: ease, fill: 'both', delay: 160 }));
      var a = cm.animate([{ transform: t[0] }, { transform: 'none' }], { duration: 900, easing: ease, fill: 'forwards' });
      anims.push(a);
      anims[0].onfinish = finish;
    }, 2550);
    // any tap, key, or scroll skips the intro
    var EV = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    EV.forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
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
