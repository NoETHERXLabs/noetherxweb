/* about.js — renders the leadership / research group list from JSON. */
(async function () {
  "use strict";
  const { load, esc, icon } = NX;
  const grid = document.getElementById("about-leadership");
  if (!grid) return;
  try {
    const people = await load("researchers");
    grid.innerHTML = people.map((p, i) => `
      <div class="card" data-reveal data-delay="${i % 3}">
        <div class="area-card"><div class="icon" style="margin:0 0 8px">${icon("brain")}</div></div>
        <h3>${esc(p.name)}</h3>
        <p class="mono text-primary" style="font-size:.78rem">${esc(p.role)}</p>
        <p class="mt-1">${esc(p.bio)}</p>
        <p class="mono text-muted mt-2" style="font-size:.75rem">${esc(p.area)}</p>
      </div>`).join("");
    grid.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Couldn't load the team. Run a static server if viewing locally.</div>`;
  }
})();
