/* search.js — global search across publications, patents, projects,
   research areas, and news. Opens via the nav search button, the "/"
   key, or Cmd/Ctrl+K. Builds a lightweight in-memory index on first open. */
(function () {
  "use strict";
  const { load, esc } = NX;

  // Inject overlay markup once
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.id = "global-search";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Site search");
  overlay.innerHTML = `
    <div class="search-panel">
      <div class="search-panel__head">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" id="gs-input" placeholder="Search publications, patents, projects, research…" autocomplete="off" aria-label="Search query">
        <kbd>Esc</kbd>
      </div>
      <div class="search-results" id="gs-results"></div>
      <div class="search-hint">Type to search · <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to open</div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("#gs-input");
  const results = overlay.querySelector("#gs-results");
  let index = null, active = -1, items = [];

  async function buildIndex() {
    if (index) return index;
    const [pubs, patents, projects, research, news] = await Promise.all([
      load("publications"), load("patents"), load("projects"), load("research"), load("news"),
    ]).catch(() => [[], [], [], [], []]);
    index = [
      ...pubs.map((p) => ({ type: "Publication", title: p.title, meta: `${p.venue} · ${p.year}`, url: `publication.html?id=${p.id}`, hay: p.title + " " + p.authors.join(" ") + " " + p.keywords.join(" ") + " " + p.venue })),
      ...patents.map((p) => ({ type: "Patent", title: p.title, meta: `${p.number} · ${p.status}`, url: `patent.html?id=${p.id}`, hay: p.title + " " + p.number + " " + p.inventors.join(" ") + " " + p.areaName })),
      ...projects.map((p) => ({ type: "Project", title: p.name, meta: p.tagline, url: `project.html?id=${p.id}`, hay: p.name + " " + p.tagline + " " + p.tags.join(" ") })),
      ...research.map((a) => ({ type: "Research", title: a.name, meta: a.summary, url: `area.html?id=${a.id}`, hay: a.name + " " + a.summary + " " + a.focus.join(" ") })),
      ...news.map((n) => ({ type: "News", title: n.title, meta: n.category, url: n.link, hay: n.title + " " + n.summary + " " + n.category })),
    ];
    return index;
  }

  function open() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    buildIndex().then(() => { input.focus(); run(""); });
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    input.value = ""; active = -1;
  }

  function run(term) {
    term = term.toLowerCase().trim();
    items = term
      ? index.filter((x) => x.hay.toLowerCase().includes(term)).slice(0, 12)
      : index.slice(0, 8);
    active = -1;
    if (!items.length) {
      results.innerHTML = `<div class="search-hint">No results for "${esc(term)}".</div>`;
      return;
    }
    results.innerHTML = items.map((x, i) => `
      <a href="${esc(x.url)}" data-i="${i}">
        <div class="r-type">${esc(x.type)}</div>
        <div class="r-title">${esc(x.title)}</div>
        <div class="r-meta">${esc(x.meta)}</div>
      </a>`).join("");
  }

  function move(dir) {
    const links = [...results.querySelectorAll("a")];
    if (!links.length) return;
    active = (active + dir + links.length) % links.length;
    links.forEach((l, i) => l.classList.toggle("active", i === active));
    links[active].scrollIntoView({ block: "nearest" });
  }

  // Events
  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", open));
  input.addEventListener("input", () => run(input.value));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" && !isTyping(e)) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault(); open();
    } else if (e.key === "Escape" && overlay.classList.contains("open")) {
      close();
    } else if (overlay.classList.contains("open")) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter" && active >= 0) { const l = results.querySelectorAll("a")[active]; if (l) location.href = l.getAttribute("href"); }
    }
  });

  function isTyping(e) {
    const t = e.target.tagName;
    return t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable;
  }
})();
