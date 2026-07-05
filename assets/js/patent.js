/* patent.js — single patent page with timeline + cross-links. */
(async function () {
  "use strict";
  const { load, byId, qs, esc, statusClass, formatDate, icon } = NX;
  const root = document.getElementById("patent-root");
  if (!root) return;
  const id = qs("id");
  try {
    const [patents, pubs, projects, areas] = await Promise.all([
      load("patents"), load("publications"), load("projects"), load("research"),
    ]);
    const p = byId(patents, id);
    if (!p) { root.innerHTML = `<div class="empty-state"><h3>Patent not found</h3><p><a href="patents.html">Back to patents</a></p></div>`; return; }
    document.title = `${p.title} — NoETHER-X Research Labs`;

    const relPub = byId(pubs, p.related.publication);
    const relProject = byId(projects, p.related.project);
    const relArea = byId(areas, p.area);

    const timeline = [
      { when: formatDate(p.filed), what: "Application filed", note: p.application },
    ];
    if (p.granted) timeline.push({ when: formatDate(p.granted), what: "Patent granted", note: p.number });
    else timeline.push({ when: "Pending", what: "Under examination", note: "Awaiting grant" });

    root.innerHTML = `
      <div class="detail-head">
        <div class="breadcrumb"><a href="patents.html">Patents</a> / ${esc(p.areaName)}</div>
        <div class="flex mt-2" style="justify-content:space-between">
          <h1 style="margin:0">${esc(p.title)}</h1>
          <span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span>
        </div>
        <p class="mono text-muted mt-1">${esc(p.number)}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-body">
          <h2>Abstract</h2><p>${esc(p.abstract)}</p>
          <h2>Patent timeline</h2>
          <ul class="timeline">${timeline.map((t) => `<li><div class="when">${esc(t.when)}</div><div class="what">${esc(t.what)}</div><div class="note">${esc(t.note)}</div></li>`).join("")}</ul>
          <h2>Drawings</h2>
          <div class="map-placeholder">Patent drawings placeholder — <a href="${esc(p.drawings)}">open figures</a></div>
        </div>
        <aside>
          <div class="card aside-card">
            <div class="kv">
              <div><span>Patent no.</span><b>${esc(p.number)}</b></div>
              <div><span>Application</span><b>${esc(p.application)}</b></div>
              <div><span>Status</span><b>${esc(p.status)}</b></div>
              <div><span>Filed</span><b>${formatDate(p.filed)}</b></div>
              <div><span>Granted</span><b>${p.granted ? formatDate(p.granted) : "—"}</b></div>
              <div><span>Country</span><b>${esc(p.country)}</b></div>
              <div><span>Area</span><b>${esc(p.areaName)}</b></div>
            </div>
            <a class="btn btn--primary btn--sm mt-3" style="width:100%;justify-content:center" href="${esc(p.pdf)}"${p.pdf === "#" ? " aria-disabled=\"true\"" : ""}>Patent PDF</a>
            <hr class="divider" style="margin:18px 0">
            <div class="mono text-muted" style="font-size:.72rem;letter-spacing:.14em">CROSS-LINKS</div>
            ${relArea ? `<a class="card__link" style="display:block;margin-top:10px" href="area.html?id=${relArea.id}">Research: ${esc(relArea.name)} <span class="arrow">&rarr;</span></a>` : ""}
            ${relPub ? `<a class="card__link" style="display:block;margin-top:8px" href="publication.html?id=${relPub.id}">Paper: ${esc(relPub.title)} <span class="arrow">&rarr;</span></a>` : ""}
            ${relProject ? `<a class="card__link" style="display:block;margin-top:8px" href="project.html?id=${relProject.id}">Project: ${esc(relProject.name)} <span class="arrow">&rarr;</span></a>` : ""}
            ${p.related.repo ? `<a class="btn btn--ghost btn--sm mt-3" style="width:100%;justify-content:center" href="${esc(p.related.repo)}" target="_blank" rel="noopener">${icon("github", 16)} Repository</a>` : ""}
          </div>
        </aside>
      </div>`;
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Couldn't load this patent. Run a static server if viewing locally.</div>`;
  }
})();
