/* patents.js — searchable, filterable patent portfolio. */
(async function () {
  "use strict";
  const { load, esc, statusClass, formatDate } = NX;
  const listEl = document.getElementById("pat-list");
  if (!listEl) return;

  const q = document.getElementById("pat-q");
  const fStatus = document.getElementById("pat-status");
  const fArea = document.getElementById("pat-area");
  const fYear = document.getElementById("pat-year");
  const countEl = document.getElementById("pat-count");

  let patents = [];
  try {
    patents = await load("patents");
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load patents. Run a static server if viewing locally (see README).</div>`;
    return;
  }

  fillOptions(fStatus, unique(patents.map((p) => p.status)).sort());
  fillOptions(fArea, unique(patents.map((p) => p.areaName)).sort());
  fillOptions(fYear, unique(patents.map((p) => p.filed.slice(0, 4))).sort().reverse());

  [q, fStatus, fArea, fYear].forEach((el) => el && el.addEventListener("input", render));
  render();

  function render() {
    const term = (q?.value || "").toLowerCase().trim();
    const filtered = patents.filter((p) => {
      if (fStatus?.value && p.status !== fStatus.value) return false;
      if (fArea?.value && p.areaName !== fArea.value) return false;
      if (fYear?.value && p.filed.slice(0, 4) !== fYear.value) return false;
      if (term) {
        const hay = (p.title + " " + p.number + " " + p.inventors.join(" ") + " " + p.abstract + " " + p.areaName).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    }).sort((a, b) => (b.granted || b.filed).localeCompare(a.granted || a.filed));

    countEl.textContent = `${filtered.length} of ${patents.length}`;

    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state"><h3>No matching patents</h3><p>Try clearing a filter or search term.</p></div>`;
      return;
    }

    listEl.innerHTML = filtered.map((p) => `
      <article class="record">
        <div class="record__meta">
          <span class="mono">${esc(p.number)}</span>
          <span>${esc(p.country)}</span>
          <span>Filed ${formatDate(p.filed)}</span>
          ${p.granted ? `<span>Granted ${formatDate(p.granted)}</span>` : ""}
        </div>
        <div class="flex" style="justify-content:space-between">
          <h3 style="margin:8px 0"><a href="patent.html?id=${p.id}">${esc(p.title)}</a></h3>
          <span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span>
        </div>
        <p class="record__authors">Inventors: ${p.inventors.map(esc).join(", ")}</p>
        <p class="record__abstract">${esc(p.abstract)}</p>
        <div class="record__actions">
          <a class="btn btn--ghost btn--sm" href="patent.html?id=${p.id}">Details & timeline</a>
          <a class="btn btn--ghost btn--sm" href="${esc(p.pdf)}"${p.pdf === "#" ? " aria-disabled=\"true\"" : ""}>Patent PDF</a>
          ${p.related.publication ? `<a class="btn btn--ghost btn--sm" href="publication.html?id=${p.related.publication}">Linked paper</a>` : ""}
        </div>
      </article>`).join("");
  }

  function unique(a) { return [...new Set(a)]; }
  function fillOptions(sel, values) {
    if (!sel) return;
    values.forEach((v) => { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); });
  }
})();
