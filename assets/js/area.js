/* area.js — renders a single research area detail (area.html?id=...). */
(async function () {
  "use strict";
  const { load, byId, qs, esc, icon } = NX;
  const root = document.getElementById("area-root");
  if (!root) return;
  const id = qs("id");
  try {
    const [areas, pubs, patents, projects] = await Promise.all([
      load("research"), load("publications"), load("patents"), load("projects"),
    ]);
    const a = byId(areas, id);
    if (!a) { notFound(root); return; }
    document.title = `${a.name} — NoETHER-X Research Labs`;

    const relPubs = (a.related.publications || []).map((pid) => byId(pubs, pid)).filter(Boolean);
    const relPats = (a.related.patents || []).map((pid) => byId(patents, pid)).filter(Boolean);
    const relProj = (a.related.projects || []).map((pid) => byId(projects, pid)).filter(Boolean);

    root.innerHTML = `
      <div class="detail-head">
        <div class="breadcrumb"><a href="research.html">Research</a> / ${esc(a.name)}</div>
        <div class="flex mt-2">
          <div class="area-card"><div class="icon" style="margin:0">${icon(a.icon)}</div></div>
          <h1 style="margin:0">${esc(a.name)}</h1>
        </div>
        <p class="lead mt-2">${esc(a.summary)}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-body">
          <p>${esc(a.description)}</p>
          <h2>Focus areas</h2>
          <ul>${a.focus.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>

          ${relProj.length ? `<h2>Projects</h2>${relProj.map((p) => `
            <a class="record" href="project.html?id=${p.id}">
              <div class="record__meta"><span class="venue">${esc(p.status)}</span></div>
              <h3>${esc(p.name)}</h3><p class="text-muted">${esc(p.tagline)}</p>
            </a>`).join("")}` : ""}

          ${relPubs.length ? `<h2>Publications</h2>${relPubs.map((p) => `
            <a class="record" href="publication.html?id=${p.id}">
              <div class="record__meta"><span class="venue">${esc(p.venue)}</span><span>${p.year}</span></div>
              <h3>${esc(p.title)}</h3>
            </a>`).join("")}` : ""}
        </div>
        <aside>
          <div class="card aside-card">
            <h4 class="mono text-muted" style="letter-spacing:.14em">RELATED PATENTS</h4>
            ${relPats.length ? relPats.map((p) => `
              <a class="card__link" style="display:block;margin-top:12px" href="patent.html?id=${p.id}">${esc(p.title)} <span class="arrow">&rarr;</span></a>`).join("")
              : '<p class="text-muted mt-2" style="font-size:.9rem">None yet.</p>'}
            <hr class="divider" style="margin:20px 0">
            <a class="btn btn--ghost btn--sm" href="${esc(a.related.repo)}" target="_blank" rel="noopener">${icon("github", 16)} GitHub</a>
          </div>
        </aside>
      </div>`;
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Couldn't load this area. Run a static server if viewing locally.</div>`;
  }

  function notFound(el) {
    el.innerHTML = `<div class="empty-state"><h3>Area not found</h3><p>Return to <a href="research.html">all research areas</a>.</p></div>`;
  }
})();
