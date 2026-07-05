/* publications.js — searchable, filterable publication database.
   Filters: text query, year, area (topic), venue, keyword. */
(async function () {
  "use strict";
  const { load, esc } = NX;
  const listEl = document.getElementById("pub-list");
  if (!listEl) return;

  const q = document.getElementById("pub-q");
  const fYear = document.getElementById("pub-year");
  const fArea = document.getElementById("pub-area");
  const fVenue = document.getElementById("pub-venue");
  const fKeyword = document.getElementById("pub-keyword");
  const countEl = document.getElementById("pub-count");

  let pubs = [];
  try {
    pubs = await load("publications");
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load publications. Run a static server if viewing locally (see README).</div>`;
    return;
  }

  // Build filter options
  fillOptions(fYear, uniqueSorted(pubs.map((p) => p.year)).reverse());
  fillOptions(fArea, unique(pubs.map((p) => p.areaName)).sort());
  fillOptions(fVenue, unique(pubs.map((p) => p.venue)).sort());
  fillOptions(fKeyword, unique(pubs.flatMap((p) => p.keywords)).sort());

  [q, fYear, fArea, fVenue, fKeyword].forEach((el) => el && el.addEventListener("input", render));

  // Deep-link: ?keyword=..., ?area=...
  const params = new URLSearchParams(location.search);
  if (params.get("keyword") && fKeyword) fKeyword.value = params.get("keyword");
  if (params.get("area") && fArea) fArea.value = params.get("area");

  render();

  function render() {
    const term = (q?.value || "").toLowerCase().trim();
    const filtered = pubs.filter((p) => {
      if (fYear?.value && String(p.year) !== fYear.value) return false;
      if (fArea?.value && p.areaName !== fArea.value) return false;
      if (fVenue?.value && p.venue !== fVenue.value) return false;
      if (fKeyword?.value && !p.keywords.includes(fKeyword.value)) return false;
      if (term) {
        const hay = (p.title + " " + p.authors.join(" ") + " " + p.abstract + " " + p.keywords.join(" ") + " " + p.venue).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    }).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

    countEl.textContent = `${filtered.length} of ${pubs.length}`;

    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state"><h3>No matching publications</h3><p>Try clearing a filter or search term.</p></div>`;
      return;
    }

    listEl.innerHTML = filtered.map((p) => `
      <article class="record">
        <div class="record__meta">
          <span class="venue">${esc(p.venue)}</span>
          <span>${p.year}</span>
          <span>${esc(p.type)}</span>
          <span>DOI: ${esc(p.doi)}</span>
        </div>
        <h3><a href="publication.html?id=${p.id}">${esc(p.title)}</a></h3>
        <p class="record__authors">${p.authors.map(esc).join(", ")}</p>
        <p class="record__abstract">${esc(truncate(p.abstract, 220))}</p>
        <div class="chips">
          ${p.keywords.map((k) => `<button class="chip chip--link" data-kw="${esc(k)}">${esc(k)}</button>`).join("")}
        </div>
        <div class="record__actions">
          <a class="btn btn--ghost btn--sm" href="publication.html?id=${p.id}">Details & citation</a>
          <a class="btn btn--ghost btn--sm" href="${esc(p.pdf)}"${p.pdf === "#" ? " aria-disabled=\"true\"" : ""}>PDF</a>
          ${p.related.patent ? `<a class="btn btn--ghost btn--sm" href="patent.html?id=${p.related.patent}">Linked patent</a>` : ""}
        </div>
      </article>`).join("");

    // keyword chip → filter
    listEl.querySelectorAll("[data-kw]").forEach((btn) =>
      btn.addEventListener("click", () => { if (fKeyword) { fKeyword.value = btn.dataset.kw; render(); window.scrollTo({ top: 0, behavior: "smooth" }); } })
    );
  }

  function truncate(s, n) { return s.length > n ? s.slice(0, n).trim() + "…" : s; }
  function unique(a) { return [...new Set(a)]; }
  function uniqueSorted(a) { return [...new Set(a)].sort((x, y) => x - y); }
  function fillOptions(sel, values) {
    if (!sel) return;
    values.forEach((v) => { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); });
  }
})();
