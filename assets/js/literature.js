/* literature.js — renders the collaborator-maintained literature survey.
   The survey is sourced entirely from assets/data/literature.json, which
   external collaborators update through GitHub pull requests (see
   CONTRIBUTING.md). Adding a reference = one JSON entry. */
(async function () {
  "use strict";
  const { load, esc } = NX;
  const listEl = document.getElementById("lit-list");
  if (!listEl) return;
  const q = document.getElementById("lit-q");
  const fTopic = document.getElementById("lit-topic");
  const countEl = document.getElementById("lit-count");

  let refs = [];
  try {
    refs = await load("literature");
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load the literature survey. Run a static server if viewing locally.</div>`;
    return;
  }
  refs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  if (fTopic) {
    [...new Set(refs.map((r) => r.topic))].sort().forEach((t) => {
      const o = document.createElement("option"); o.value = t; o.textContent = t; fTopic.appendChild(o);
    });
  }
  [q, fTopic].forEach((el) => el && el.addEventListener("input", render));
  render();

  function render() {
    const term = (q?.value || "").toLowerCase().trim();
    const topic = fTopic?.value;
    const items = refs.filter((r) => {
      if (topic && r.topic !== topic) return false;
      if (term) {
        const hay = (r.title + " " + r.authors + " " + r.venue + " " + r.topic + " " + r.note).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    if (countEl) countEl.textContent = `${items.length} of ${refs.length}`;
    if (!items.length) { listEl.innerHTML = `<div class="empty-state"><h3>No matching references</h3></div>`; return; }

    listEl.innerHTML = items.map((r) => `
      <article class="record">
        <div class="record__meta"><span class="venue">${esc(r.topic)}</span><span>${esc(r.venue)}</span><span>${r.year}</span></div>
        <h3 style="margin:8px 0"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a></h3>
        <p class="record__authors">${esc(r.authors)}</p>
        <p class="record__abstract">${esc(r.note)}</p>
        <div class="record__meta mt-2"><span>Added by ${esc(r.contributor)}</span></div>
      </article>`).join("");
  }
})();
