# Assembles the pages from src/*.html with a shared header and footer.
# You don't need this to host the site; the finished pages are in the folder.
import pathlib, re
root = pathlib.Path(__file__).parent
PAGES = [("index.html", "Home"), ("research.html", "Research"),
         ("philosophy.html", "Philosophy"), ("community.html", "Community")]

# Home page only: puts the navy intro screen up before the first paint (first visit per session)
SPLASH = r'''<script>try{if(/\/(index\.html)?$/.test(location.pathname)&&sessionStorage.getItem('ad-intro')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('splash')}catch(e){}</script>'''

SITE = "https://annadanielson.site/"

def head(title, desc, f="index.html", extra=""):
    url = SITE + ("" if f == "index.html" else f)
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
<meta property="og:image" content="{SITE}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Anna Danielson: Sociology, Child Development, Education">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="assets/jost-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css">
{SPLASH}
<script src="assets/motion.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''

def header(current):
    cur = ' aria-current="page"'
    links = "\n".join(
        f'      <li><a href="{f}"{cur if f == current else ""}>{n}</a></li>'
        for f, n in PAGES)
    return f'''<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Anna Danielson, home">
      <img src="assets/mark-small.svg" alt="" width="40" height="40">
      <span class="wordmark">Anna <span class="dot">&bull;</span> Danielson</span>
    </a>
    <nav aria-label="Main">
    <ul class="nav">
{links}
    </ul>
    </nav>
  </div>
</header>
'''

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
    <p class="small">San Francisco &nbsp;&middot;&nbsp; &copy; 2026 Anna Danielson</p>
  </div>
</footer>
</body>
</html>
'''

# Pages that aren't in the nav, and which nav item they belong under
EXTRA = [("philosophy-statement.html", "philosophy.html"), ("teaching.html", ""), ("404.html", "")]  # teaching: not linked yet

for f, nav in [(f, f) for f, _ in PAGES] + EXTRA:
    src = (root / "src" / f).read_text()
    m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)-->\n", src, re.S)
    title, desc = m.group(1).strip(), m.group(2).strip()
    body = src[m.end():]
    extra = '<base href="/">\n<meta name="robots" content="noindex">\n' if f == "404.html" else ""
    (root / f).write_text(head(title, desc, f, extra) + header(nav) + body + FOOTER)
print("built")
