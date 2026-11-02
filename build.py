# Assembles the pages from src/*.html with a shared header and footer.
# You don't need this to host the site; the finished pages are in the folder.
import pathlib, re
root = pathlib.Path(__file__).parent
PAGES = [("index.html", "Home"), ("research.html", "Research"),
         ("philosophy.html", "Philosophy"), ("community.html", "Community")]

def head(title, desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
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

FOOTER = '''<footer class="site-footer" id="contact">
  <div class="wrap">
    <div>
      <h2>Get in touch</h2>
      <!-- EDIT: add the email address you want public, e.g. <p><a href="mailto:you@example.com">you@example.com</a></p> -->
      <p class="social">
        <a href="https://www.linkedin.com/in/anna-danielson" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/><circle cx="7.5" cy="7.6" r="1.6" fill="#120C2E"/><rect x="6.1" y="10" width="2.8" height="8" fill="#120C2E"/><path d="M11 10h2.7v1.2c.5-.8 1.5-1.4 2.8-1.4 2.2 0 3 1.4 3 3.7V18h-2.8v-4c0-1.1-.3-1.9-1.4-1.9s-1.6.8-1.6 1.9v4H11z" fill="#120C2E"/></svg>
        </a>
        <a href="https://www.instagram.com/annadanielson.sf/" aria-label="Instagram">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>
        </a>
      </p>
      <p class="small">San Francisco, Excelsior and Ingleside</p>
    </div>
    <p class="small">&copy; 2026 Anna Danielson</p>
  </div>
</footer>
</body>
</html>
'''

# Pages that aren't in the nav, and which nav item they belong under
EXTRA = [("philosophy-statement.html", "philosophy.html")]

for f, nav in [(f, f) for f, _ in PAGES] + EXTRA:
    src = (root / "src" / f).read_text()
    m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)-->\n", src, re.S)
    title, desc = m.group(1).strip(), m.group(2).strip()
    body = src[m.end():]
    (root / f).write_text(head(title, desc) + header(nav) + body + FOOTER)
print("built")
