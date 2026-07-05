#!/usr/bin/env python3
"""
build.py — assembles the static HTML pages for the NoETHER-X Labs site.

Why a build step?  The *output* is plain static HTML that GitHub Pages serves
with zero build.  This script only exists so the shared <head>, navigation and
footer live in ONE place.  Edit the templates below, re-run `python tools/build.py`
from the project root, and every page is regenerated consistently.

    python tools/build.py
"""
import os, json, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE_URL = "https://noetherx-labs.github.io/noetherxweb"  # <-- change for your deployment

# --------------------------------------------------------------------------- #
# Navigation model
# --------------------------------------------------------------------------- #
NAV = [
    ("index.html", "Home"),
    ("about.html", "About"),
    ("research.html", "Research"),
    ("projects.html", "Projects"),
    ("publications.html", "Publications"),
    ("patents.html", "Patents"),
    ("news.html", "News"),
    ("bulletin.html", "Bulletin"),
    ("careers.html", "Careers"),
    ("contact.html", "Contact"),
]
GITHUB = "https://github.com/noetherx-labs"

ICON_SEARCH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'
ICON_MENU = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
ICON_GH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>'


def nav(active):
    links = "\n".join(
        f'      <a href="{href}"{" aria-current=\"page\"" if href == active else ""}>{label}</a>'
        for href, label in NAV
    )
    return f"""  <header class="nav">
    <div class="container nav__inner">
      <a class="brand" href="index.html" aria-label="NoETHER-X Research Labs home">
        <span class="brand__mark">NX</span>
        <span class="brand__name"><b>NoETHER-X</b><span>RESEARCH LABS</span></span>
      </a>
      <nav class="nav__links" id="nav-links" aria-label="Primary">
{links}
        <a href="{GITHUB}" target="_blank" rel="noopener">GitHub &#8599;</a>
      </nav>
      <div class="nav__actions">
        <button class="icon-btn" data-search-open aria-label="Search (press /)" title="Search  /">{ICON_SEARCH}</button>
        <a class="icon-btn" href="{GITHUB}" target="_blank" rel="noopener" aria-label="GitHub">{ICON_GH}</a>
        <button class="icon-btn nav__toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">{ICON_MENU}</button>
      </div>
    </div>
  </header>"""


FOOTER = f"""  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a class="brand" href="index.html">
            <span class="brand__mark">NX</span>
            <span class="brand__name"><b>NoETHER-X</b><span>RESEARCH LABS</span></span>
          </a>
          <p>Open research across semiconductor engineering, artificial intelligence, computational biology, advanced computing, and digital innovation.</p>
          <p class="footer__tag">DISCOVER · ENGINEER · EVOLVE</p>
        </div>
        <div>
          <h4>Research</h4>
          <ul>
            <li><a href="area.html?id=ai">Artificial Intelligence</a></li>
            <li><a href="area.html?id=semiconductor">Semiconductor Engineering</a></li>
            <li><a href="area.html?id=emerging-computing">Emerging Computing</a></li>
            <li><a href="area.html?id=genomics">Genomics &amp; Comp. Biology</a></li>
            <li><a href="area.html?id=digital-media">Digital Media</a></li>
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="publications.html">Publications</a></li>
            <li><a href="patents.html">Patents</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="literature.html">Literature Survey</a></li>
            <li><a href="bulletin.html">Research Bulletin</a></li>
            <li><a href="careers.html">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Connect</h4>
          <ul>
            <li><a href="{GITHUB}" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="mailto:info@noetherx.com">info@noetherx.com</a></li>
            <li><a href="news.html">News</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>&copy; <span id="year">2025</span> NoETHER-X Research Labs. Open research, freely shared.</span>
        <div class="social">
          <a href="{GITHUB}" target="_blank" rel="noopener" aria-label="GitHub">{ICON_GH}</a>
        </div>
      </div>
    </div>
  </footer>"""


def head(page):
    canonical = f"{BASE_URL}/{page['file']}"
    jsonld = ""
    if page["file"] == "index.html":
        org = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "NoETHER-X Research Labs",
            "url": BASE_URL,
            "logo": f"{BASE_URL}/assets/img/logo.png",
            "description": page["desc"],
            "sameAs": [GITHUB],
        }
        jsonld = f'\n  <script type="application/ld+json">{json.dumps(org)}</script>'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{page['title']}</title>
  <meta name="description" content="{page['desc']}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#05070B">
  <meta name="author" content="NoETHER-X Research Labs">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NoETHER-X Research Labs">
  <meta property="og:title" content="{page['title']}">
  <meta property="og:description" content="{page['desc']}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{BASE_URL}/assets/img/logo.png">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page['title']}">
  <meta name="twitter:description" content="{page['desc']}">
  <meta name="twitter:image" content="{BASE_URL}/assets/img/logo.png">

  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="assets/img/logo.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">{jsonld}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
{nav(page['file'])}
  <main id="main">
"""


def scripts(page):
    common = ['assets/js/data.js', 'assets/js/main.js', 'assets/js/search.js']
    extra = page.get("scripts", [])
    tags = "\n".join(f'  <script defer src="{s}"></script>' for s in (common[:2] + extra + common[2:]))
    return tags


def render(page):
    return head(page) + page["body"] + "\n  </main>\n" + FOOTER + "\n" + scripts(page) + "\n</body>\n</html>\n"


# --------------------------------------------------------------------------- #
# Page bodies
# --------------------------------------------------------------------------- #
def pagehead(eyebrow, h1, sub):
    return f"""    <section class="section pagehead">
      <div class="container">
        <span class="eyebrow">{eyebrow}</span>
        <h1>{h1}</h1>
        <p class="lead">{sub}</p>
      </div>
    </section>"""


HOME_BODY = """    <!-- HERO -->
    <section class="hero">
      <canvas id="hero-canvas" aria-hidden="true"></canvas>
      <div class="container hero__inner">
        <span class="eyebrow">DISCOVER · ENGINEER · EVOLVE</span>
        <h1>Engineering Intelligence.<br><span class="grad">Research at the frontier of silicon, computing, and life.</span></h1>
        <p class="hero__sub"><b>Open research. Open innovation. Open hardware.</b> A multidisciplinary lab spanning semiconductor engineering, artificial intelligence, computational biology, emerging computing, and digital media.</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="research.html">Explore Research</a>
          <a class="btn btn--ghost" href="projects.html">Projects</a>
          <a class="btn btn--ghost" href="publications.html">Publications</a>
        </div>
        <div class="hero__ticker">
          <span>Artificial Intelligence</span>
          <span>Semiconductor Engineering</span>
          <span>Emerging Computing</span>
          <span>Computational Biology</span>
          <span>Structural Biology</span>
          <span>Digital Media</span>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="section--tight">
      <div class="container">
        <div class="stats">
          <div class="stat" data-reveal><div class="stat__num"><span id="stat-pubs" data-count="8">8</span></div><div class="stat__label">Publications</div></div>
          <div class="stat" data-reveal data-delay="1"><div class="stat__num"><span id="stat-patents" data-count="6">6</span></div><div class="stat__label">Patents</div></div>
          <div class="stat" data-reveal data-delay="2"><div class="stat__num"><span id="stat-projects" data-count="5">5</span></div><div class="stat__label">Open Projects</div></div>
          <div class="stat" data-reveal data-delay="3"><div class="stat__num"><span data-count="6">6</span></div><div class="stat__label">Research Areas</div></div>
        </div>
      </div>
    </section>

    <!-- MISSION -->
    <section class="section">
      <div class="container split">
        <div data-reveal>
          <span class="eyebrow">Our mission</span>
          <h2 style="font-size:clamp(1.8rem,3.6vw,2.7rem);margin-top:14px">Advance science across silicon, computing, and life — openly and reproducibly.</h2>
          <p class="lead mt-2">We work from chips to cells: engineering next-generation semiconductors, building AI that accelerates discovery, exploring computing beyond the digital era, and applying it all to biology. Methods, data, and tooling are published so anyone can reproduce and build on the work.</p>
          <div class="hero__cta"><a class="btn btn--ghost" href="about.html">About the lab</a></div>
        </div>
        <div class="panel" data-reveal data-delay="1">
          <div class="spec-strip">
            <div><span>Approach</span><b>Open &amp; reproducible</b></div>
            <div><span>Silicon</span><b>RTL-to-GDS · DFT · Security</b></div>
            <div><span>Intelligence</span><b>Agentic AI · LLMs</b></div>
            <div><span>Frontier</span><b>Hybrid · DNA · Quantum-inspired</b></div>
            <div><span>Life</span><b>Genomics · Structural biology</b></div>
          </div>
        </div>
      </div>
    </section>

    <!-- RESEARCH HIGHLIGHTS -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Research highlights</span>
          <h2>Six areas, one connected mission</h2>
          <p>From transistors to proteins — our research areas share tools, data, and intelligence. Explore where the work concentrates.</p>
        </div>
        <div class="grid grid--3" id="home-research"></div>
        <div class="center mt-4"><a class="btn btn--ghost" href="research.html">All research areas</a></div>
      </div>
    </section>

    <!-- PROJECTS -->
    <section class="section">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Current projects</span><h2>What we're building now</h2></div>
        <div class="grid grid--3" id="home-projects"></div>
      </div>
    </section>

    <!-- PUBLICATIONS + PATENT -->
    <section class="section">
      <div class="container split">
        <div>
          <div class="section-head"><span class="eyebrow">Latest publications</span><h2>Recent papers</h2></div>
          <div id="home-pubs"></div>
          <a class="btn btn--ghost mt-2" href="publications.html">All publications</a>
        </div>
        <div class="card" id="home-patent" data-reveal></div>
      </div>
    </section>

    <!-- NEWS -->
    <section class="section">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Latest news</span><h2>From the lab</h2></div>
        <div id="home-news"></div>
        <a class="btn btn--ghost mt-3" href="news.html">All news</a>
      </div>
    </section>

    <!-- CTA -->
    <section class="section">
      <div class="container">
        <div class="cta-band" data-reveal>
          <span class="eyebrow" style="justify-content:center">Open collaboration</span>
          <h2 class="mt-2">Build the next generation of science with us</h2>
          <p>We publish everything and welcome partnerships with universities, companies, and independent researchers — across AI, silicon, computing, and biology.</p>
          <div class="hero__cta" style="justify-content:center">
            <a class="btn btn--primary" href="careers.html">Open positions</a>
            <a class="btn btn--ghost" href="contact.html">Get in touch</a>
          </div>
        </div>
      </div>
    </section>"""


ABOUT_BODY = pagehead("About the lab", "A multidisciplinary research organization.",
    "NoETHER-X Research Labs explores the frontiers of semiconductor engineering, artificial intelligence, computational biology, advanced computing, and digital innovation — publishing methods, code, and data that others can reproduce and extend.") + """
    <section class="section">
      <div class="container">
        <div class="grid grid--2">
          <div class="card" data-reveal><span class="card__tag">Mission</span><h3 class="mt-2">Reproducible, open, shared</h3><p>Advance science and engineering that anyone can reproduce — from RTL through test, from models to molecules — using open tooling and shared data.</p></div>
          <div class="card" data-reveal data-delay="1"><span class="card__tag">Vision</span><h3 class="mt-2">From silicon to living systems</h3><p>Engineer the next generation of chips and intelligence, push computing beyond the digital era, and turn those tools toward biology and human understanding.</p></div>
        </div>

        <div class="split mt-4">
          <div data-reveal>
            <span class="eyebrow">History</span>
            <h2 style="margin-top:12px">From a test-automation project to a multidisciplinary lab</h2>
            <p class="lead mt-2">NoETHER-X began with learning-guided test generation for silicon. As the tooling and the questions grew, so did the scope — AI systems, emerging computing, computational biology, and science communication — always kept open and reproducible.</p>
          </div>
          <div class="panel" data-reveal data-delay="1">
            <div class="spec-strip">
              <div><span>Origin</span><b>Learning-guided ATPG</b></div>
              <div><span>Grew into</span><b>AI · Silicon · Biology</b></div>
              <div><span>Now spans</span><b>6 research areas</b></div>
              <div><span>Flagship</span><b>Quantaris · The Forgotten Code</b></div>
              <div><span>Principle</span><b>Publish everything</b></div>
            </div>
          </div>
        </div>

        <hr class="divider">
        <div class="section-head"><span class="eyebrow">Research philosophy</span><h2>How we work</h2></div>
        <div class="grid grid--3">
          <div class="card" data-reveal><h3>Reproducibility first</h3><p>A result that can't be rerun isn't finished. Every project ships the flow that produced it.</p></div>
          <div class="card" data-reveal data-delay="1"><h3>Open by default</h3><p>Papers, code, and data are public. Open tools keep the work auditable end to end.</p></div>
          <div class="card" data-reveal data-delay="2"><h3>Cross-disciplinary</h3><p>AI, silicon, computing, and biology share tools and ideas rather than sitting in silos.</p></div>
        </div>

        <hr class="divider">
        <div class="section-head"><span class="eyebrow">Core values</span><h2>What we hold to</h2></div>
        <div class="grid grid--4">
          <div class="card" data-reveal><h3>Rigor</h3><p>Claims backed by measurements.</p></div>
          <div class="card" data-reveal data-delay="1"><h3>Openness</h3><p>Share the method, not just the result.</p></div>
          <div class="card" data-reveal data-delay="2"><h3>Curiosity</h3><p>Follow hard problems across fields.</p></div>
          <div class="card" data-reveal data-delay="3"><h3>Craft</h3><p>Clean flows, clean code, clean data.</p></div>
        </div>

        <hr class="divider">
        <div class="section-head"><span class="eyebrow">Organization &amp; leadership</span><h2>Research groups</h2><p>The lab is organized into research groups, each led by a principal researcher and connected through shared tooling.</p></div>
        <div class="grid grid--3" id="about-leadership"></div>
      </div>
    </section>"""


RESEARCH_BODY = pagehead("Research", "Six areas across science and engineering.",
    "From transistor-level design to protein structure prediction. Each card opens a dedicated area page with focus topics and related projects, papers, and patents.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="grid grid--3" id="research-grid"></div>
      </div>
    </section>"""


AREA_BODY = """    <section class="section pagehead">
      <div class="container" id="area-root"><div class="empty-state">Loading area…</div></div>
    </section>"""


PROJECTS_BODY = pagehead("Projects", "Open research projects.",
    "Each project ships an overview, objectives, status, roadmap, and a public repository. Everything is reproducible.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="grid grid--3" id="projects-grid"></div>
      </div>
    </section>"""


PROJECT_BODY = """    <section class="section pagehead">
      <div class="container" id="project-root"><div class="empty-state">Loading project…</div></div>
    </section>"""


PUBLICATIONS_BODY = pagehead("Publications", "Publication database.",
    "Search and filter the lab's papers by year, topic, venue, or keyword. Each entry links to its abstract, BibTeX, DOI, and related patent or project.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="toolbar">
          <label class="search-input" style="flex:1">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="pub-q" type="search" placeholder="Search titles, authors, abstracts…" aria-label="Search publications">
          </label>
          <select class="filter" id="pub-year" aria-label="Filter by year"><option value="">All years</option></select>
          <select class="filter" id="pub-area" aria-label="Filter by topic"><option value="">All topics</option></select>
          <select class="filter" id="pub-venue" aria-label="Filter by venue"><option value="">All venues</option></select>
          <select class="filter" id="pub-keyword" aria-label="Filter by keyword"><option value="">All keywords</option></select>
          <span class="result-count" id="pub-count">—</span>
        </div>
        <p class="form-note mb-3">Looking for tracked external work? See the community-maintained <a href="literature.html">literature survey</a>.</p>
        <div id="pub-list" aria-live="polite"><div class="empty-state">Loading publications…</div></div>
      </div>
    </section>"""


PUBLICATION_BODY = """    <section class="section pagehead">
      <div class="container" id="publication-root"><div class="empty-state">Loading publication…</div></div>
    </section>"""


PATENTS_BODY = pagehead("Patents", "Patent portfolio.",
    "Search and filter granted and pending patents. Each entry carries a full timeline and links to its related paper, project, and repository.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="toolbar">
          <label class="search-input" style="flex:1">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="pat-q" type="search" placeholder="Search titles, numbers, inventors…" aria-label="Search patents">
          </label>
          <select class="filter" id="pat-status" aria-label="Filter by status"><option value="">All statuses</option></select>
          <select class="filter" id="pat-area" aria-label="Filter by technology area"><option value="">All areas</option></select>
          <select class="filter" id="pat-year" aria-label="Filter by filing year"><option value="">All filing years</option></select>
          <span class="result-count" id="pat-count">—</span>
        </div>
        <div id="pat-list" aria-live="polite"><div class="empty-state">Loading patents…</div></div>
      </div>
    </section>"""


PATENT_BODY = """    <section class="section pagehead">
      <div class="container" id="patent-root"><div class="empty-state">Loading patent…</div></div>
    </section>"""


NEWS_BODY = pagehead("News", "Announcements from the lab.",
    "Paper acceptances, patent grants, releases, and collaborations.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="toolbar">
          <select class="filter" id="news-cat" aria-label="Filter news by category"><option value="">All categories</option></select>
        </div>
        <div id="news-list"><div class="empty-state">Loading news…</div></div>
      </div>
    </section>"""


BULLETIN_BODY = pagehead("Research Bulletin", "Monthly bulletin archive.",
    "Every issue in HTML, PDF, and ASCII. Search the archive or filter by category.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="toolbar">
          <label class="search-input" style="flex:1">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="bul-q" type="search" placeholder="Search bulletins…" aria-label="Search bulletins">
          </label>
          <select class="filter" id="bul-cat" aria-label="Filter by category"><option value="">All categories</option></select>
          <span class="result-count" id="bul-count">—</span>
        </div>
        <div id="bulletin-list"><div class="empty-state">Loading bulletins…</div></div>
      </div>
    </section>"""


CAREERS_BODY = pagehead("Careers", "Work at the frontier of silicon.",
    "We collaborate with engineers, students, and academic groups. Everything we build is open, so your work is public from day one.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Open positions</span><h2>Currently hiring</h2></div>
        <div class="grid grid--2">
          <div class="card" data-reveal><span class="card__tag">Full-time</span><h3 class="mt-2">Research Engineer — DFT &amp; ATPG</h3><p>Build scalable test generation and compression tooling in the ScanForge project. Strong C++/Python and digital design background.</p><a class="card__link" href="contact.html">Apply <span class="arrow">&rarr;</span></a></div>
          <div class="card" data-reveal data-delay="1"><span class="card__tag">Full-time</span><h3 class="mt-2">Research Engineer — ML for EDA</h3><p>Design learned cost models and surrogates for physical design in OpenFlow-X. Experience with graph learning and open EDA a plus.</p><a class="card__link" href="contact.html">Apply <span class="arrow">&rarr;</span></a></div>
          <div class="card" data-reveal><span class="card__tag">Internship</span><h3 class="mt-2">Research Intern</h3><p>A 3–6 month project in any of our research areas, ending in an open artifact and a bulletin write-up.</p><a class="card__link" href="contact.html">Apply <span class="arrow">&rarr;</span></a></div>
          <div class="card" data-reveal data-delay="1"><span class="card__tag">Graduate</span><h3 class="mt-2">Graduate Research Collaboration</h3><p>Co-advise a thesis with the lab on chiplets, hardware security, or emerging computing.</p><a class="card__link" href="contact.html">Enquire <span class="arrow">&rarr;</span></a></div>
        </div>

        <hr class="divider">
        <div class="split">
          <div data-reveal>
            <span class="eyebrow">Collaborations</span>
            <h2 style="margin-top:12px">Bring a problem, leave with an open result</h2>
            <p class="lead mt-2">We partner with universities and independent researchers. Collaborations produce public code, data, and papers — and often a filed patent that credits every contributor.</p>
          </div>
          <div class="panel" data-reveal data-delay="1">
            <div class="spec-strip">
              <div><span>Formats</span><b>Intern · Grad · Visiting</b></div>
              <div><span>Output</span><b>Open artifact + paper</b></div>
              <div><span>Areas</span><b>All 10 research tracks</b></div>
              <div><span>Apply via</span><b>Contact form</b></div>
            </div>
          </div>
        </div>

        <div class="cta-band mt-4" data-reveal>
          <h2>Don't see your role?</h2>
          <p>If your work touches silicon, test, or emerging computing, we'd still like to hear from you.</p>
          <div class="hero__cta" style="justify-content:center"><a class="btn btn--primary" href="contact.html">Introduce yourself</a></div>
        </div>
      </div>
    </section>"""


CONTACT_BODY = pagehead("Contact", "Get in touch.",
    "Questions, collaboration proposals, or applications — reach us directly. We read everything.") + """
    <section class="section" style="padding-top:0">
      <div class="container detail-grid">
        <div>
          <div class="section-head"><span class="eyebrow">Send a message</span><h2>Contact form</h2></div>
          <div class="form-grid" id="contact-form">
            <div class="grid grid--2">
              <div class="field"><label for="cf-name">Name</label><input id="cf-name" type="text" placeholder="Your name" required></div>
              <div class="field"><label for="cf-email">Email</label><input id="cf-email" type="email" placeholder="you@domain.com" required></div>
            </div>
            <div class="field"><label for="cf-topic">Topic</label>
              <select id="cf-topic"><option>General enquiry</option><option>Collaboration</option><option>Careers</option><option>Press / media</option></select>
            </div>
            <div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" placeholder="How can we help?" required></textarea></div>
            <div class="flex">
              <button class="btn btn--primary" id="cf-send" type="button">Send message</button>
              <span class="form-note" id="cf-note">Opens your email client — no data leaves your device.</span>
            </div>
          </div>
          <hr class="divider">
          <div class="map-placeholder">Map placeholder — NoETHER-X Research Labs</div>
        </div>
        <aside>
          <div class="card aside-card">
            <div class="mono text-muted" style="font-size:.72rem;letter-spacing:.14em">DIRECT</div>
            <div class="kv mt-2">
              <div><span>Email</span><b><a href="mailto:info@noetherx.com">info@noetherx.com</a></b></div>
              <div><span>GitHub</span><b><a href="https://github.com/noetherx-labs" target="_blank" rel="noopener">noetherx-labs</a></b></div>
              <div><span>LinkedIn</span><b><a href="#">/noetherx-labs</a></b></div>
              <div><span>YouTube</span><b><a href="#">@noetherx</a></b></div>
            </div>
            <hr class="divider" style="margin:18px 0">
            <p class="text-muted" style="font-size:.9rem">Prefer to browse first? Start with the <a href="research.html">research areas</a> or the <a href="publications.html">publications</a>.</p>
          </div>
        </aside>
      </div>
    </section>"""


LITERATURE_BODY = pagehead("Literature Survey", "Community-maintained reading list.",
    "A curated survey of external work the lab tracks. Maintained by collaborators through GitHub pull requests — see CONTRIBUTING.md to add a reference.") + """
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="toolbar">
          <label class="search-input" style="flex:1">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="lit-q" type="search" placeholder="Search the survey…" aria-label="Search literature survey">
          </label>
          <select class="filter" id="lit-topic" aria-label="Filter by topic"><option value="">All topics</option></select>
          <span class="result-count" id="lit-count">—</span>
        </div>
        <div class="card mb-3" style="border-style:dashed">
          <span class="card__tag">Contribute</span>
          <h3 class="mt-2">Add a reference via GitHub</h3>
          <p>Append one entry to <code class="mono">assets/data/literature.json</code> and open a pull request. The survey updates automatically on merge — no other files to touch.</p>
          <a class="btn btn--ghost btn--sm mt-2" href="https://github.com/noetherx-labs/noetherxweb/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">How to contribute &rarr;</a>
        </div>
        <div id="lit-list"><div class="empty-state">Loading survey…</div></div>
      </div>
    </section>"""


NOTFOUND_BODY = """    <section class="section pagehead" style="padding-top:120px">
      <div class="container center">
        <span class="eyebrow" style="justify-content:center">Error 404</span>
        <h1 style="font-size:clamp(3rem,10vw,6rem)">404</h1>
        <p class="lead" style="margin-inline:auto">This page drifted out of the netlist. Let's route you back.</p>
        <div class="hero__cta" style="justify-content:center"><a class="btn btn--primary" href="index.html">Back home</a><a class="btn btn--ghost" href="research.html">Research</a></div>
      </div>
    </section>"""


PAGES = [
    dict(file="index.html", title="NoETHER-X Research Labs — Engineering Intelligence",
         desc="Open, multidisciplinary research across semiconductor engineering, artificial intelligence, computational biology, emerging computing, and digital media.",
         body=HOME_BODY, scripts=["assets/js/hero.js", "assets/js/home.js"]),
    dict(file="about.html", title="About — NoETHER-X Research Labs",
         desc="The mission, vision, philosophy, and research groups behind NoETHER-X Research Labs.",
         body=ABOUT_BODY, scripts=["assets/js/about.js"]),
    dict(file="research.html", title="Research — NoETHER-X Research Labs",
         desc="Six research areas: artificial intelligence, semiconductor engineering, emerging computing, genomics and computational biology, structural biology, and digital media.",
         body=RESEARCH_BODY, scripts=["assets/js/research.js"]),
    dict(file="area.html", title="Research Area — NoETHER-X Research Labs",
         desc="A NoETHER-X research area with related projects, publications, and patents.",
         body=AREA_BODY, scripts=["assets/js/area.js"]),
    dict(file="projects.html", title="Projects — NoETHER-X Research Labs",
         desc="Open, reproducible research projects with public repositories and roadmaps.",
         body=PROJECTS_BODY, scripts=["assets/js/projects.js"]),
    dict(file="project.html", title="Project — NoETHER-X Research Labs",
         desc="A NoETHER-X research project: overview, objectives, status, roadmap, and repository.",
         body=PROJECT_BODY, scripts=["assets/js/project.js"]),
    dict(file="publications.html", title="Publications — NoETHER-X Research Labs",
         desc="Searchable publication database with filtering by year, topic, venue, and keyword.",
         body=PUBLICATIONS_BODY, scripts=["assets/js/publications.js"]),
    dict(file="publication.html", title="Publication — NoETHER-X Research Labs",
         desc="A NoETHER-X publication with abstract, keywords, DOI, BibTeX, and cross-links.",
         body=PUBLICATION_BODY, scripts=["assets/js/publication.js"]),
    dict(file="patents.html", title="Patents — NoETHER-X Research Labs",
         desc="Patent portfolio with search and filtering by status, technology area, and filing year.",
         body=PATENTS_BODY, scripts=["assets/js/patents.js"]),
    dict(file="patent.html", title="Patent — NoETHER-X Research Labs",
         desc="A NoETHER-X patent with full timeline and cross-links to related work.",
         body=PATENT_BODY, scripts=["assets/js/patent.js"]),
    dict(file="news.html", title="News — NoETHER-X Research Labs",
         desc="Latest news: paper acceptances, patent grants, releases, and collaborations.",
         body=NEWS_BODY, scripts=["assets/js/news.js"]),
    dict(file="bulletin.html", title="Research Bulletin — NoETHER-X Research Labs",
         desc="Archive of monthly research bulletins in HTML, PDF, and ASCII formats.",
         body=BULLETIN_BODY, scripts=["assets/js/bulletin.js"]),
    dict(file="literature.html", title="Literature Survey — NoETHER-X Research Labs",
         desc="A community-maintained survey of external research the lab tracks, updated via GitHub pull requests.",
         body=LITERATURE_BODY, scripts=["assets/js/literature.js"]),
    dict(file="careers.html", title="Careers — NoETHER-X Research Labs",
         desc="Research engineer, intern, graduate, and collaboration opportunities at NoETHER-X.",
         body=CAREERS_BODY, scripts=[]),
    dict(file="contact.html", title="Contact — NoETHER-X Research Labs",
         desc="Contact NoETHER-X Research Labs for enquiries, collaborations, and applications.",
         body=CONTACT_BODY, scripts=["assets/js/contact.js"]),
    dict(file="404.html", title="Page not found — NoETHER-X Research Labs",
         desc="The page you were looking for could not be found.",
         body=NOTFOUND_BODY, scripts=[]),
]


def build():
    for page in PAGES:
        html = render(page)
        (ROOT / page["file"]).write_text(html, encoding="utf-8")
        print("wrote", page["file"])
    write_sitemap()
    print("Done.")


def write_sitemap():
    today = datetime.date.today().isoformat()
    urls = [f"{BASE_URL}/{p['file']}" for p in PAGES if p["file"] != "404.html"]
    # dynamic detail URLs
    for name, param in [("publications", "publication"), ("patents", "patent"), ("projects", "project"), ("research", "area")]:
        data = json.loads((ROOT / "assets" / "data" / f"{name}.json").read_text())
        for item in data:
            urls.append(f"{BASE_URL}/{param}.html?id={item['id']}")
    body = "\n".join(
        f"  <url><loc>{u}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq></url>"
        for u in urls
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")
    print("wrote sitemap.xml")


if __name__ == "__main__":
    build()
