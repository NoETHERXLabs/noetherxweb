/* project.js — single project detail (project.html?id=...). */
(async function () {
  "use strict";
  const { load, byId, qs, esc, statusClass, icon } = NX;
  const root = document.getElementById("project-root");
  if (!root) return;
  const id = qs("id");
  try {
    const [projects, pubs, patents] = await Promise.all([
      load("projects"), load("publications"), load("patents"),
    ]);
    const p = byId(projects, id);
    if (!p) { root.innerHTML = `<div class="empty-state"><h3>Project not found</h3><p><a href="projects.html">Back to projects</a></p></div>`; return; }
    document.title = `${p.name} — NoETHER-X Research Labs`;

    const relPubs = (p.related.publications || []).map((x) => byId(pubs, x)).filter(Boolean);
    const relPats = (p.related.patents || []).map((x) => byId(patents, x)).filter(Boolean);

    root.innerHTML = `
      <div class="detail-head">
        <div class="breadcrumb"><a href="projects.html">Projects</a> / ${esc(p.name)}</div>
        <div class="flex mt-2" style="justify-content:space-between">
          <h1 style="margin:0">${esc(p.name)}</h1>
          <span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span>
        </div>
        <p class="lead mt-2">${esc(p.tagline)}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-body">
          <h2>Overview</h2><p>${esc(p.overview)}</p>
          <h2>Objectives</h2><ul>${p.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
          <h2>Roadmap</h2>
          <ul class="timeline">${p.roadmap.map((r) => `
            <li><div class="when">${esc(r.when)}</div><div class="what">${esc(r.what)}</div><div class="note">${esc(r.note)}</div></li>`).join("")}</ul>
          <h2>Documentation & screenshots</h2>
          <p>Full documentation lives in the repository README. Architecture diagrams and result plots are published alongside each release.</p>
          <div class="map-placeholder mt-2">Screenshot / diagram placeholder</div>

          ${(relPubs.length || relPats.length) ? `<h2 class="mt-4">Related work</h2>` : ""}
          ${relPubs.map((x) => `<a class="record" href="publication.html?id=${x.id}"><div class="record__meta"><span class="venue">${esc(x.venue)}</span><span>${x.year}</span></div><h3>${esc(x.title)}</h3></a>`).join("")}
          ${relPats.map((x) => `<a class="record" href="patent.html?id=${x.id}"><div class="record__meta"><span class="venue">${esc(x.number)}</span></div><h3>${esc(x.title)}</h3></a>`).join("")}
        </div>
        <aside>
          <div class="card aside-card">
            <div class="mono text-muted" style="font-size:.75rem">CURRENT STATUS</div>
            <div class="flex mt-1" style="justify-content:space-between"><b>${esc(p.status)}</b><span class="mono text-primary">${p.progress}%</span></div>
            <div class="progress mt-1"><i style="width:${p.progress}%"></i></div>
            <div class="chips mt-3">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            <hr class="divider" style="margin:20px 0">
            <a class="btn btn--primary btn--sm" style="width:100%;justify-content:center" href="${esc(p.repo)}" target="_blank" rel="noopener">${icon("github", 16)} Repository</a>
            <a class="btn btn--ghost btn--sm mt-2" style="width:100%;justify-content:center" href="${esc(p.docs)}" target="_blank" rel="noopener">Documentation</a>
          </div>
        </aside>
      </div>`;
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Couldn't load this project. Run a static server if viewing locally.</div>`;
  }
})();
