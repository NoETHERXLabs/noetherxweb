/* research.js — renders the research area cards grid. */
(async function () {
  "use strict";
  const { load, esc, icon } = NX;
  const grid = document.getElementById("research-grid");
  if (!grid) return;
  try {
    const areas = await load("research");
    grid.innerHTML = areas.map((a, i) => `
      <a class="card area-card" href="area.html?id=${a.id}" data-reveal data-delay="${i % 3}">
        <div class="icon">${icon(a.icon)}</div>
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.summary)}</p>
        <span class="card__link">Explore area <span class="arrow">&rarr;</span></span>
      </a>`).join("");
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Couldn't load research areas. If you're viewing locally, run a static server (see README).</div>`;
  }
})();
