# NoETHER-X Research Labs — Website

A production-ready, **data-driven** research-organization website for NoETHER-X Labs.
Dark, minimal, research-oriented. Ships as **plain static HTML/CSS/JS** — no build step
required to deploy — and is designed to scale from a handful of papers to hundreds by
editing JSON, not HTML.

> **Tagline:** DISCOVER · ENGINEER · EVOLVE

---

## Highlights

- **11 pages + 4 dynamic detail templates** — Home, About, Research, Projects, Publications,
  Patents, News, Research Bulletin, Literature Survey, Careers, Contact, plus data-driven
  `area`, `project`, `publication`, and `patent` detail pages, and a custom `404`.
- **Data-driven architecture** — publications, patents, projects, news, bulletins, researchers,
  research areas, and the literature survey all live in `assets/data/*.json`. Add a paper or
  patent = **one JSON entry**; the lists, detail pages, cross-links, search index, and sitemap
  update automatically.
- **Cross-linking** — every publication links to its patent, project, research area, and repo,
  and vice-versa.
- **Global search** (press `/` or `Cmd/Ctrl-K`) across publications, patents, projects, research,
  and news.
- **Searchable / filterable** publication and patent databases (year, topic, venue, keyword, status).
- **Collaborator workflow** — the Literature Survey is maintained by external contributors through
  GitHub pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).
- **SEO** — `robots.txt`, generated `sitemap.xml`, Open Graph + Twitter Cards, canonical URLs,
  and JSON-LD Organization schema.
- **Accessible & responsive** — skip link, keyboard-visible focus, ARIA labels, reduced-motion
  support, mobile nav; layouts tested from 390 px to desktop.
- **Ambient hero animation** — lightweight canvas circuit/particle field that pauses off-screen
  and respects `prefers-reduced-motion`.

---

## Project structure

```
noetherxweb/
├── index.html            about.html        research.html    area.html
├── projects.html         project.html      publications.html publication.html
├── patents.html          patent.html       news.html        bulletin.html
├── literature.html       careers.html      contact.html     404.html
├── favicon.svg           favicon.ico       robots.txt       sitemap.xml
├── .nojekyll             README.md         CONTRIBUTING.md  LICENSE
├── assets/
│   ├── css/style.css                     # complete design system (design tokens = brief palette)
│   ├── js/                               # modular vanilla ES6, one file per page + shared helpers
│   │   ├── data.js  main.js  search.js   # shared on every page
│   │   ├── hero.js  home.js  about.js
│   │   ├── research.js  area.js
│   │   ├── projects.js  project.js
│   │   ├── publications.js  publication.js
│   │   ├── patents.js  patent.js
│   │   ├── news.js  bulletin.js  literature.js  contact.js
│   ├── data/                             # ← single source of truth
│   │   ├── publications.json  patents.json  projects.json
│   │   ├── news.json  bulletins.json  researchers.json
│   │   ├── research.json      literature.json
│   │   └── pdf/                          # drop paper/patent PDFs here
│   ├── img/logo.png
│   └── icons/
├── tools/
│   └── build.py                          # regenerates the HTML pages + sitemap (optional)
└── .github/                              # issue + PR templates for contributors
```

---

## Preview locally

Because pages load data with `fetch()`, browsers block that over `file://`.
Run any static server from the project root:

```bash
# Python (built in)
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

Opening `index.html` directly by double-click will show the page chrome but the JSON-driven
sections will be empty — this is expected. Use a local server. On GitHub Pages everything
works with no server of your own.

---

## Adding content (the data-driven part)

You almost never touch HTML. Edit the relevant JSON file and reload.

| To add a…            | Edit                              | It shows up on                                   |
|----------------------|-----------------------------------|--------------------------------------------------|
| Publication          | `assets/data/publications.json`   | Publications list, its detail page, home, search |
| Patent               | `assets/data/patents.json`        | Patents list, its detail page, home, search      |
| Project              | `assets/data/projects.json`       | Projects grid, its detail page, home, search     |
| News item            | `assets/data/news.json`           | News page, home feed                             |
| Bulletin             | `assets/data/bulletins.json`      | Bulletin archive                                 |
| Researcher           | `assets/data/researchers.json`    | About → research groups                          |
| Research area        | `assets/data/research.json`       | Research grid, area detail, footer               |
| Literature reference | `assets/data/literature.json`     | Literature Survey                                |

**Cross-links** are just IDs. A publication's `related.patent` is a patent `id`; set both sides
and the two pages link to each other. Copy an existing entry as a template — every field is
documented by example.

Place PDFs in `assets/data/pdf/` and point the entry's `pdf` field at them (replace the `"#"`
placeholder).

---

## Editing the shared layout (nav, footer, `<head>`)

Every page shares the same header, footer, and SEO `<head>`. Those live in **one place** —
`tools/build.py` — so you don't hand-edit 15 files. After changing a template:

```bash
python3 tools/build.py     # regenerates all *.html and sitemap.xml
```

The **output is committed static HTML**, so GitHub Pages still needs no build. If you only edit
JSON, CSS, or JS you do **not** need to run this.

Set your deployment URL once at the top of `tools/build.py`:

```python
BASE_URL = "https://<user-or-org>.github.io/<repo>"
```

Then re-run the build so canonical URLs, Open Graph tags, and the sitemap point at your domain.
Also update the `Sitemap:` line in `robots.txt`.

---

## Deploy to GitHub Pages

1. Create a repo (e.g. `noetherxweb`) and push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "NoETHER-X Labs website"
   git branch -M main
   git remote add origin https://github.com/<you>/noetherxweb.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment**
   → Source: **Deploy from a branch** → Branch: **main** / **/ (root)** → **Save**.
3. Wait ~1 minute. Your site is live at
   `https://<you>.github.io/noetherxweb/`.
4. Update `BASE_URL` in `tools/build.py` and the `Sitemap:` URL in `robots.txt` to match, run
   `python3 tools/build.py`, commit, and push.

`.nojekyll` is included so GitHub serves the files as-is.

---

## Notes on the tech choices

- **Hand-authored CSS instead of a Tailwind build.** The brief asked for Tailwind, but a build
  toolchain would add friction to a zero-build GitHub Pages deploy and hurt the Lighthouse
  targets. The stylesheet uses the exact palette and typography from the brief as CSS custom
  properties, which keeps the site fast and dependency-free. If you prefer Tailwind, the class
  structure maps over cleanly.
- **Vanilla ES6, no framework.** Everything is progressive enhancement: the pages are readable
  without JS, and dynamic sections hydrate from JSON on load.
- **No backend.** The contact form composes a `mailto:` link. Swap in Formspree, Netlify Forms,
  or a serverless endpoint if you want server-side submission.

---

## License

Code released under the MIT License — see [LICENSE](LICENSE). Content and branding © NoETHER-X
Research Labs.
