/* data.js — shared data access + helpers.
   Exposes a global `NX` object used by page scripts. Classic script
   (no ES modules) so pages also work when opened over file:// after a
   local server. Data is fetched from assets/data/*.json — this is the
   single source of truth; adding a paper/patent/project = one JSON entry. */
window.NX = (function () {
  "use strict";

  const cache = {};

  /* Fetch + cache a JSON dataset by name (e.g. "publications"). */
  async function load(name) {
    if (cache[name]) return cache[name];
    try {
      const res = await fetch(`assets/data/${name}.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      cache[name] = data;
      return data;
    } catch (err) {
      console.error(`NX: failed to load ${name}.json`, err);
      throw err;
    }
  }

  /* Load several datasets at once → object keyed by name. */
  async function loadAll(names) {
    const out = {};
    await Promise.all(names.map(async (n) => { out[n] = await load(n); }));
    return out;
  }

  const qs = (key) => new URLSearchParams(location.search).get(key);
  const byId = (arr, id) => (arr || []).find((x) => x.id === id);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const statusClass = (s) => "status-" + String(s || "").toLowerCase().replace(/\s+/g, "-");

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  /* Inline SVG icon set (stroke inherits currentColor). */
  const ICONS = {
    chip: '<path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/><rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
    scan: '<path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3"/><path d="M3 12h18"/><circle cx="8" cy="9" r="1"/><circle cx="12" cy="9" r="1"/><circle cx="16" cy="9" r="1"/>',
    waveform: '<path d="M2 12h3l2-7 4 14 3-9 2 4h6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    flow: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.3 7.2 10.5 16M16.7 7.2 13.5 16M7.5 6h9"/>',
    helix: '<path d="M8 3c8 4-8 10 0 14 8 4-8 10 0 14M16 3c-8 4 8 10 0 14-8 4 8 10 0 14"/><path d="M9 6h6M8.5 12h7M9 18h6"/>',
    merge: '<path d="M6 3v6a6 6 0 0 0 6 6 6 6 0 0 1 6 6v0M18 3v6a6 6 0 0 1-6 6"/><circle cx="6" cy="3" r="1"/><circle cx="18" cy="3" r="1"/>',
    shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="m9.5 12 2 2 3.5-4"/>',
    brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 3 3 3 3 0 0 0 3-1V4a3 3 0 0 0-3-1ZM15 3a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-1 5 3 3 0 0 1-3 3 3 3 0 0 1-3-1"/>',
    molecule: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="17" r="2.4"/><circle cx="5" cy="16" r="1.7"/><path d="M8.1 7.2 15.6 8.1M7.3 8 10.7 15M16.5 9 13.2 15.2M6.8 14.6 10.2 16.1"/>',
    media: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9.2 5 2.8-5 2.8Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  };
  const icon = (name, size = 24) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.chip}</svg>`;

  return { load, loadAll, qs, byId, esc, statusClass, formatDate, icon };
})();
