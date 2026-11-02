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
    links = "\n".join(
        f'      <li><a href="{f}"{" aria-current=\"page\"" if f == current else ""}>{n}</a></li>'
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
      <p><a href="https://www.linkedin.com/in/anna-danielson">LinkedIn</a></p>
      <p class="small">San Francisco, Excelsior and Ingleside</p>
    </div>
    <p class="small">&copy; 2026 Anna Danielson</p>
  </div>
</footer>
</body>
</html>
'''

for f, _ in PAGES:
    src = (root / "src" / f).read_text()
    m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)-->\n", src, re.S)
    title, desc = m.group(1).strip(), m.group(2).strip()
    body = src[m.end():]
    (root / f).write_text(head(title, desc) + header(f) + body + FOOTER)
print("built")
