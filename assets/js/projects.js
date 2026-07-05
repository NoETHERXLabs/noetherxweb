/* projects.js — renders the projects grid. */
(async function () {
  "use strict";
  const { load, esc, statusClass } = NX;
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  try {
    const projects = await load("projects");
    grid.innerHTML = projects.map((p, i) => `
      <a class="card" href="project.html?id=${p.id}" data-reveal data-delay="${i % 3}">
        <div class="flex" style="justify-content:space-between">
          <span class="card__tag">${esc(p.areaName)}</span>
          <span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span>
        </div>
        <h3 class="mt-2">${esc(p.name)}</h3>
        <p>${esc(p.tagline)}</p>
        <div class="flex mt-2 mono text-muted" style="font-size:.75rem;justify-content:space-between">
          <span>Progress</span><span>${p.progress}%</span>
        </div>
        <div class="progress"><i style="width:${p.progress}%"></i></div>
        <span class="card__link">Open project <span class="arrow">&rarr;</span></span>
      </a>`).join("");
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Couldn't load projects. Run a static server if viewing locally.</div>`;
  }
})();
