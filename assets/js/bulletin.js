/* bulletin.js — monthly bulletin archive with search + category filter. */
(async function () {
  "use strict";
  const { load, esc } = NX;
  const listEl = document.getElementById("bulletin-list");
  if (!listEl) return;
  const q = document.getElementById("bul-q");
  const fCat = document.getElementById("bul-cat");
  const countEl = document.getElementById("bul-count");

  let bulletins = [];
  try {
    bulletins = await load("bulletins");
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load bulletins. Run a static server if viewing locally.</div>`;
    return;
  }
  bulletins.sort((a, b) => b.date.localeCompare(a.date));

  if (fCat) {
    [...new Set(bulletins.flatMap((b) => b.categories))].sort().forEach((c) => {
      const o = document.createElement("option"); o.value = c; o.textContent = c; fCat.appendChild(o);
    });
  }
  [q, fCat].forEach((el) => el && el.addEventListener("input", render));
  render();

  function render() {
    const term = (q?.value || "").toLowerCase().trim();
    const cat = fCat?.value;
    const items = bulletins.filter((b) => {
      if (cat && !b.categories.includes(cat)) return false;
      if (term) {
        const hay = (b.title + " " + b.summary + " " + b.categories.join(" ") + " " + b.month).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    if (countEl) countEl.textContent = `${items.length} of ${bulletins.length}`;

    if (!items.length) { listEl.innerHTML = `<div class="empty-state"><h3>No matching bulletins</h3></div>`; return; }

    listEl.innerHTML = items.map((b) => `
      <article class="record">
        <div class="record__meta"><span class="venue">${esc(b.issue)}</span><span>${esc(b.month)}</span></div>
        <h3 style="margin:8px 0">${esc(b.title)}</h3>
        <p class="record__abstract">${esc(b.summary)}</p>
        <div class="chips">${b.categories.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        <div class="record__actions">
          <a class="btn btn--ghost btn--sm" href="${esc(b.html)}">Read HTML</a>
          <a class="btn btn--ghost btn--sm" href="${esc(b.pdf)}">PDF</a>
          <a class="btn btn--ghost btn--sm" href="${esc(b.ascii)}">ASCII</a>
        </div>
      </article>`).join("");
  }
})();
