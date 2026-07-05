/* publication.js — single publication page auto-generated from JSON. */
(async function () {
  "use strict";
  const { load, byId, qs, esc, icon } = NX;
  const root = document.getElementById("publication-root");
  if (!root) return;
  const id = qs("id");
  try {
    const [pubs, patents, projects, areas] = await Promise.all([
      load("publications"), load("patents"), load("projects"), load("research"),
    ]);
    const p = byId(pubs, id);
    if (!p) { root.innerHTML = `<div class="empty-state"><h3>Publication not found</h3><p><a href="publications.html">Back to publications</a></p></div>`; return; }
    document.title = `${p.title} — NoETHER-X Research Labs`;

    const relPatent = byId(patents, p.related.patent);
    const relProject = byId(projects, p.related.project);
    const relArea = byId(areas, p.area);
    const cite = `${p.authors.join(", ")}. "${p.title}." ${p.venue}, ${p.year}.`;

    root.innerHTML = `
      <div class="detail-head">
        <div class="breadcrumb"><a href="publications.html">Publications</a> / ${p.year}</div>
        <div class="record__meta mt-2"><span class="venue">${esc(p.venue)}</span><span>${p.year}</span><span>${esc(p.type)}</span></div>
        <h1>${esc(p.title)}</h1>
        <p class="record__authors">${p.authors.map(esc).join(", ")}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-body">
          <h2>Abstract</h2><p>${esc(p.abstract)}</p>
          <h2>Keywords</h2>
          <div class="chips">${p.keywords.map((k) => `<a class="chip chip--link" href="publications.html?keyword=${encodeURIComponent(k)}">${esc(k)}</a>`).join("")}</div>
          <h2>Cite this work</h2>
          <p class="text-muted" style="font-size:.92rem">${esc(cite)}</p>
          <h2>BibTeX</h2>
          <div class="bibtex" id="bibtex">${esc(p.bibtex)}</div>
          <button class="btn btn--ghost btn--sm mt-2" id="copy-bibtex">Copy BibTeX</button>
        </div>
        <aside>
          <div class="card aside-card">
            <div class="kv">
              <div><span>DOI</span><b>${esc(p.doi)}</b></div>
              <div><span>Venue</span><b>${esc(p.venue)}</b></div>
              <div><span>Year</span><b>${p.year}</b></div>
              <div><span>Type</span><b>${esc(p.type)}</b></div>
            </div>
            <a class="btn btn--primary btn--sm mt-3" style="width:100%;justify-content:center" href="${esc(p.pdf)}"${p.pdf === "#" ? " aria-disabled=\"true\"" : ""}>Download PDF</a>
            <hr class="divider" style="margin:18px 0">
            <div class="mono text-muted" style="font-size:.72rem;letter-spacing:.14em">CROSS-LINKS</div>
            ${relArea ? `<a class="card__link" style="display:block;margin-top:10px" href="area.html?id=${relArea.id}">Research: ${esc(relArea.name)} <span class="arrow">&rarr;</span></a>` : ""}
            ${relProject ? `<a class="card__link" style="display:block;margin-top:8px" href="project.html?id=${relProject.id}">Project: ${esc(relProject.name)} <span class="arrow">&rarr;</span></a>` : ""}
            ${relPatent ? `<a class="card__link" style="display:block;margin-top:8px" href="patent.html?id=${relPatent.id}">Patent: ${esc(relPatent.number)} <span class="arrow">&rarr;</span></a>` : ""}
            ${p.related.repo ? `<a class="btn btn--ghost btn--sm mt-3" style="width:100%;justify-content:center" href="${esc(p.related.repo)}" target="_blank" rel="noopener">${icon("github", 16)} Repository</a>` : ""}
          </div>
        </aside>
      </div>`;

    const copyBtn = document.getElementById("copy-bibtex");
    copyBtn?.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(p.bibtex); copyBtn.textContent = "Copied ✓"; setTimeout(() => (copyBtn.textContent = "Copy BibTeX"), 1600); }
      catch { copyBtn.textContent = "Copy failed"; }
    });
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Couldn't load this publication. Run a static server if viewing locally.</div>`;
  }
})();
