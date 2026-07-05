/* home.js — populates the home page's dynamic sections from JSON. */
(async function () {
  "use strict";
  const { load, esc, statusClass, formatDate, icon } = NX;

  try {
    const [research, pubs, patents, news, projects] = await Promise.all([
      load("research"), load("publications"), load("patents"), load("news"), load("projects"),
    ]);

    /* Research highlights (first 6 areas) */
    const rh = document.getElementById("home-research");
    if (rh) {
      rh.innerHTML = research.slice(0, 6).map((a, i) => `
        <a class="card area-card" data-reveal data-delay="${i % 3}" href="area.html?id=${a.id}">
          <div class="icon">${icon(a.icon)}</div>
          <h3>${esc(a.name)}</h3>
          <p>${esc(a.summary)}</p>
          <span class="card__link">Explore area <span class="arrow">&rarr;</span></span>
        </a>`).join("");
    }

    /* Latest publications (3 newest) */
    const lp = document.getElementById("home-pubs");
    if (lp) {
      const latest = [...pubs].sort((a, b) => b.year - a.year).slice(0, 3);
      lp.innerHTML = latest.map((p) => `
        <a class="record" href="publication.html?id=${p.id}" data-reveal>
          <div class="record__meta"><span class="venue">${esc(p.venue)}</span><span>${p.year}</span></div>
          <h3>${esc(p.title)}</h3>
          <p class="record__authors">${p.authors.map(esc).join(", ")}</p>
        </a>`).join("");
    }

    /* Featured patent (first granted) */
    const fp = document.getElementById("home-patent");
    if (fp) {
      const pat = patents.find((p) => p.status === "Granted") || patents[0];
      fp.innerHTML = `
        <span class="card__tag">Featured patent</span>
        <h3 class="mt-2">${esc(pat.title)}</h3>
        <p class="mono mt-1" style="color:var(--muted)">${esc(pat.number)}</p>
        <p class="mt-2">${esc(pat.abstract)}</p>
        <div class="flex mt-3">
          <span class="status-pill ${statusClass(pat.status)}">${esc(pat.status)}</span>
          <a class="card__link" href="patent.html?id=${pat.id}">View patent <span class="arrow">&rarr;</span></a>
        </div>`;
    }

    /* Latest news (4) */
    const ln = document.getElementById("home-news");
    if (ln) {
      const latest = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
      ln.innerHTML = latest.map((n) => `
        <a class="news-item" href="${esc(n.link)}" style="text-decoration:none">
          <div><div class="date">${formatDate(n.date)}</div></div>
          <div><span class="cat">${esc(n.category)}</span><h3 style="color:var(--text)">${esc(n.title)}</h3><p class="text-muted">${esc(n.summary)}</p></div>
        </a>`).join("");
    }

    /* Current projects (active) */
    const cp = document.getElementById("home-projects");
    if (cp) {
      const active = projects.filter((p) => p.status === "Active").slice(0, 3);
      cp.innerHTML = active.map((p, i) => `
        <a class="card" href="project.html?id=${p.id}" data-reveal data-delay="${i}">
          <div class="flex" style="justify-content:space-between">
            <span class="card__tag">${esc(p.areaName)}</span>
            <span class="status-pill ${statusClass(p.status)}">${esc(p.status)}</span>
          </div>
          <h3 class="mt-2">${esc(p.name)}</h3>
          <p>${esc(p.tagline)}</p>
          <div class="progress mt-3"><i style="width:${p.progress}%"></i></div>
          <span class="card__link">Open project <span class="arrow">&rarr;</span></span>
        </a>`).join("");
    }

    /* Live-count the stats where possible */
    setCount("stat-pubs", pubs.length);
    setCount("stat-patents", patents.length);
    setCount("stat-projects", projects.length);

    reveal();
  } catch (e) {
    console.error(e);
  }

  function setCount(id, n) {
    const el = document.getElementById(id);
    if (el) el.dataset.count = n;
  }
  function reveal() {
    // Re-run reveal observer for newly injected [data-reveal] nodes.
    document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
      new IntersectionObserver((es, o) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); o.disconnect(); } });
      }, { threshold: 0.1 }).observe(el);
    });
    document.querySelectorAll("[data-count]").forEach((el) => {
      new IntersectionObserver((es, o) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target, parseFloat(e.target.dataset.count));
            o.disconnect();
          }
        });
      }, { threshold: 0.5 }).observe(el);
    });
  }
  function animate(el, target) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = target; return; }
    const dur = 1200, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();
