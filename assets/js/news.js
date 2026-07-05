/* news.js — renders the news feed with category filter. */
(async function () {
  "use strict";
  const { load, esc, formatDate } = NX;
  const listEl = document.getElementById("news-list");
  if (!listEl) return;
  const fCat = document.getElementById("news-cat");

  let news = [];
  try {
    news = await load("news");
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load news. Run a static server if viewing locally.</div>`;
    return;
  }
  news.sort((a, b) => b.date.localeCompare(a.date));

  if (fCat) {
    [...new Set(news.map((n) => n.category))].sort().forEach((c) => {
      const o = document.createElement("option"); o.value = c; o.textContent = c; fCat.appendChild(o);
    });
    fCat.addEventListener("input", render);
  }
  render();

  function render() {
    const cat = fCat?.value;
    const items = cat ? news.filter((n) => n.category === cat) : news;
    listEl.innerHTML = items.map((n) => `
      <a class="news-item" href="${esc(n.link)}" style="text-decoration:none">
        <div><div class="date">${formatDate(n.date)}</div></div>
        <div>
          <span class="cat">${esc(n.category)}</span>
          <h3 style="color:var(--text)">${esc(n.title)}</h3>
          <p class="text-muted">${esc(n.summary)}</p>
        </div>
      </a>`).join("");
  }
})();
