# Assembles the pages from src/*.html with a shared header and footer.
# You don't need this to host the site; the finished pages are in the folder.
import pathlib, re
root = pathlib.Path(__file__).parent
PAGES = [("index.html", "Home"), ("work.html", "Work"),
         ("philosophy.html", "Philosophy"), ("community.html", "Community")]

# Section links shown under the header on a section's main page and its sub-pages.
# First item is the section's main page. Add a page here to put it in the row.
SECTIONS = {
    "work.html": [("work.html", "Overview"), ("research.html", "Research"), ("writing.html", "Writing"),
                  ("teaching.html", "Teaching"), ("design.html", "Design")],
    "philosophy.html": [("philosophy.html", "Overview"), ("philosophy-statement.html", "Statement")],
    "community.html": [("community.html", "Overview"), ("toolkit.html", "Toolkit"),
                       ("glossary.html", "Getting involved"), ("resources.html", "Resources")],
}
# Sub-pages that should light up their parent's link in the section row
RESEARCH_PAGES = ("who-gets-a-say.html", "third-places.html", "kids-places.html")
def ROW_PARENT(f):
    if f.startswith("design-"): return "design.html"
    if f.startswith("writing-"): return "writing.html"
    if f in RESEARCH_PAGES: return "research.html"
    if f == "philosophy-statement.html": return "philosophy.html"
    return f
NAMES = dict(PAGES)
CUR = ' aria-current="page"'

# Section links go inside the page's title area (set False to put them back under the header)
SUBNAV_IN_HERO = True

def hero_subnav(section, page):
    items = SECTIONS.get(section)
    if not items:
        return ""
    lis = "".join(
        f'<li><a href="{f}"{CUR if f == ROW_PARENT(page) else ""}>{n}</a></li>'
        for f, n in items)
    return f'\n    <nav class="hero-subnav" aria-label="{NAMES[section]} section"><ul>{lis}</ul></nav>'

def subnav(section, page):
    items = SECTIONS.get(section)
    if not items:
        return ""
    lis = "\n".join(
        f'      <li><a href="{f}"{CUR if f == ROW_PARENT(page) else ""}>{n}</a></li>'
        for f, n in items)
    return f'''<nav class="subnav" aria-label="{NAMES[section]} section">
  <div class="wrap">
    <a class="subnav-home" href="{section}">{NAMES[section]}</a>
    <ul>
{lis}
    </ul>
  </div>
</nav>
'''

# Home page only: puts the navy intro screen up before the first paint (first visit per session)
SPLASH = r'''<script>try{if(/\/(index\.html)?$/.test(location.pathname)&&sessionStorage.getItem('ad-intro')!=='1'&&localStorage.getItem('ad-intro-seen')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('splash')}catch(e){}</script>'''

SITE = "https://annadanielson.site/"

# Pages with their own link-preview card (others use the main one)
OG_IMG = {"who-gets-a-say.html": "og/og-who-gets-a-say.png", "third-places.html": "og/og-common-ground.png",
          "philosophy.html": "og/og-philosophy.png", "philosophy-statement.html": "og/og-philosophy.png",
          "writing.html": "og/og-writing.png", "writing-udhr.html": "og/og-writing-udhr.png"}

def head(title, desc, f="index.html", extra=""):
    url = SITE + ("" if f == "index.html" else f)
    img = OG_IMG.get(f, "og/og-home.png")
    alt = (title.split(" | ")[0] + " | Anna Danielson") if f in OG_IMG else "Anna Danielson: Sociology, Child Development, Education"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
{extra}<meta property="og:type" content="website">
<meta property="og:site_name" content="Anna Danielson">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}assets/{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="assets/jost-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css">
{SPLASH}
<script src="assets/motion.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''

# Main menu: Home, then three dropdowns. (file, name, one-line description)
MENU = [
    ("Work", "work.html", [
        ("work.html", "Overview", "All my work in one place"),
        ("research.html", "Research", "Studies in my own neighborhoods"),
        # (held back) ("writing.html", "Writing", "Essays and reflections"),
        # (held back) ("teaching.html", "Teaching", "Workshops, groups, and classes"),
        ("design.html", "Design", "School and community design")]),
    ("About", "about.html", [
        ("about.html", "Overview", "Where I stand and where it comes from"),
        ("philosophy.html", "Philosophy of education", "What I believe about how kids learn"),
        ("community.html", "Community organizing", "A decade with SF families")]),
    ("For families", "families.html", [
        ("families.html", "Overview", "Everything for families in one place"),
        ("glossary.html", "Getting involved at school", "Plain answers for new parents"),
        ("resources.html", "Resources for SF families", "Crisis lines, immigration, food, enrollment"),
        ("toolkit.html", "Family meeting toolkit", "Printable guides for meetings")]),
]

def menu_spot(page):
    """Which dropdown and which item a page lives under."""
    item = ROW_PARENT(page)
    for gi, (g, gh, items) in enumerate(MENU):
        for f, n, d in items:
            if f == item:
                return gi, f, n
    return None, None, None

CARET = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'

def header(current, page=""):
    page = page or current
    gi_cur, item_cur, _ = menu_spot(page)
    home_cur = ' aria-current="page"' if page == "index.html" else ""
    groups = []
    for gi, (g, gh, items) in enumerate(MENU):
        gid = "dd-" + g.lower().replace(" ", "-")
        lis = "".join(
            f'<li><a href="{f}"{(CUR if f == page else " class=" + chr(34) + "here" + chr(34)) if f == item_cur else ""}><b>{n}</b><small>{d}</small></a></li>'
            for f, n, d in items)
        cls = "has cur" if gi == gi_cur else "has"
        here = CUR if page == gh else ""
        groups.append(f'      <li class="{cls}"><a class="dd-link" href="{gh}"{here}>{g}</a><button class="dd-btn" type="button" aria-expanded="false" aria-controls="{gid}" aria-label="Show {g} pages">{CARET}</button><ul class="dd" id="{gid}">{lis}</ul></li>')
    groups = "\n".join(groups)
    return f'''<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Anna Danielson, home">
      <img src="assets/mark-small.svg" alt="" width="40" height="40">
      <span class="wordmark">Anna <span class="dot">&bull;</span> Danielson</span>
    </a>
    <nav aria-label="Main" class="main-nav">
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu">Menu <span class="burger" aria-hidden="true"><i></i><i></i></span></button>
    <ul class="nav" id="menu">
      <li><a href="index.html"{home_cur}>Home</a></li>
{groups}
    </ul>
    </nav>
  </div>
</header>
<script>
(function(){{
  var nav=document.querySelector('.main-nav'); if(!nav) return;
  var btns=nav.querySelectorAll('.dd-btn'), tog=nav.querySelector('.menu-toggle');
  function closeAll(except){{ btns.forEach(function(b){{ if(b!==except){{ b.setAttribute('aria-expanded','false'); b.parentNode.classList.remove('open'); }} }}); }}
  btns.forEach(function(b){{ b.addEventListener('click',function(){{
    var li=b.parentNode; if(li.dataset.hov){{ delete li.dataset.hov; return; }}
    var o=b.getAttribute('aria-expanded')==='true'; closeAll(b);
    b.setAttribute('aria-expanded',String(!o)); b.parentNode.classList.toggle('open',!o); }}); }});
  tog.addEventListener('click',function(){{ var o=tog.getAttribute('aria-expanded')==='true';
    tog.setAttribute('aria-expanded',String(!o)); document.documentElement.classList.toggle('menu-open',!o); }});
  document.addEventListener('click',function(e){{ if(!nav.contains(e.target)) closeAll(); }});
  // Hover on computers: open right away, close after a short pause so the mouse can travel to the panel
  if(window.matchMedia('(hover: hover)').matches){{
    nav.querySelectorAll('.has').forEach(function(li){{
      var t, b=li.querySelector('.dd-btn');
      li.addEventListener('mouseenter',function(){{ if(window.innerWidth<761) return; clearTimeout(t); closeAll(b); if(!li.classList.contains('open')) li.dataset.hov='1'; b.setAttribute('aria-expanded','true'); li.classList.add('open'); }});
      li.addEventListener('mouseleave',function(){{ if(window.innerWidth<761) return; delete li.dataset.hov; t=setTimeout(function(){{ b.setAttribute('aria-expanded','false'); li.classList.remove('open'); }},350); }});
    }});
  }}
  document.addEventListener('keydown',function(e){{ if(e.key==='Escape'){{ var open=nav.querySelector('.has.open .dd-btn'); closeAll();
    if(document.documentElement.classList.contains('menu-open')){{ document.documentElement.classList.remove('menu-open'); tog.setAttribute('aria-expanded','false'); tog.focus(); }} else if(open) open.focus(); }} }});
}})();
</script>
'''

def crumb(page, title):
    gi, item, iname = menu_spot(page)
    if gi is None or page == MENU[gi][1] == item and MENU[gi][2][0][0] == page:
        return ""
    g, gh, items = MENU[gi]
    parts = [f'<a href="{gh}">{g}</a>' if gh and gh != page else f'<span>{g}</span>']
    short = title.split(" | ")[0]
    if item != page:
        parts.append(f'<a href="{item}">{iname}</a>')
        parts.append(f'<span aria-current="page">{short}</span>')
    else:
        parts.append(f'<span aria-current="page">{iname}</span>')
    return '\n    <p class="crumb">' + '<span class="sep">/</span>'.join(parts) + '</p>'

FOOTER = '''<footer class="site-footer footer-signoff" id="contact">
  <div class="footer-fan" aria-hidden="true"><img src="assets/footer-fan.svg" alt="" width="120" height="64"></div>
  <div class="wrap footer-center">
    <img class="footer-mark" src="assets/mark-small.svg" alt="" width="72" height="72">
    <p class="wordmark footer-name">Anna <span class="dot">&bull;</span> Danielson</p>
    <p class="footer-tag">Sociology &bull; Child Development &bull; Education</p>
    <a class="open-chip" href="index.html#open-to-work"><i></i>Open to work</a>
    <p class="social">
        <a href="https://www.linkedin.com/in/anna-danielson" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/><circle cx="7.5" cy="7.6" r="1.6" fill="#120C2E"/><rect x="6.1" y="10" width="2.8" height="8" fill="#120C2E"/><path d="M11 10h2.7v1.2c.5-.8 1.5-1.4 2.8-1.4 2.2 0 3 1.4 3 3.7V18h-2.8v-4c0-1.1-.3-1.9-1.4-1.9s-1.6.8-1.6 1.9v4H11z" fill="#120C2E"/></svg>
        </a>
        <a href="https://www.instagram.com/annadanielson.sf/" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>
        </a>
        <a href="mailto:annajhoop@gmail.com" aria-label="Email">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 7l8.5 6.2L20.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
    </p>
    <p class="small land">I live and work on the unceded homeland of the Ramaytush Ohlone,<br>the original peoples of the San Francisco Peninsula.</p>
    <p class="small land-links"><a href="https://www.ramaytush.org/">Association of Ramaytush Ohlone</a> &middot; <a href="https://ramaytush.kindful.com/?campaign=1199658">Yunakin Land Tax</a> &middot; <a href="https://sogoreate-landtrust.org/">Sogorea Te&rsquo; Land Trust</a> &middot; <a href="https://sogoreate-landtrust.org/shuumi-land-tax/">Shuumi Land Tax</a></p>
    <p class="small">San Francisco &nbsp;&middot;&nbsp; &copy; 2026 Anna Danielson</p>
  </div>
</footer>
</body>
</html>
'''

# Pages that aren't in the nav, and which nav item they belong under
EXTRA = [("philosophy-statement.html", "philosophy.html"), ("teaching.html", "work.html"), ("research.html", "work.html"), ("about.html", ""), ("families.html", ""), ("404.html", ""), ("who-gets-a-say.html", "work.html"), ("third-places.html", "work.html"), ("kids-places.html", "work.html"), ("path.html", "index.html"), ("toolkit.html", "community.html"), ("glossary.html", "community.html"), ("resources.html", "community.html"), ("reflections.html", "index.html"), ("design.html", "work.html"), ("design-monroe.html", "work.html"), ("design-sfecu.html", "work.html"), ("design-mixtape.html", "work.html"), ("design-identity.html", "work.html"), ("writing.html", "work.html"), ("writing-school-culture.html", "work.html"), ("writing-du-bois.html", "work.html"), ("writing-udhr.html", "work.html"), ("writing-counterstories.html", "work.html"), ("writing-addams.html", "work.html"), ("writing-constrained-choice.html", "work.html"), ("writing-peace.html", "work.html"), ("writing-mixtape.html", "work.html")]  # teaching: not linked yet

for f, nav in [(f, f) for f, _ in PAGES] + EXTRA:
    src = (root / "src" / f).read_text()
    m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)-->\n", src, re.S)
    title, desc = m.group(1).strip(), m.group(2).strip()
    body = src[m.end():]
    extra = '<base href="/">\n<meta name="robots" content="noindex">\n' if f == "404.html" else ""
    top = ""
    marker = '<section class="page-hero" aria-labelledby="page-title">\n  <div class="wrap">'
    cr = crumb(f, title)
    if cr and marker in body:
        body = body.replace(marker, marker + cr, 1)
    (root / f).write_text(head(title, desc, f, extra) + header(nav, f) + top + body + FOOTER)
print("built")
