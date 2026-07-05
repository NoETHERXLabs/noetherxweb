/* hero.js — ambient circuit / particle field for the home hero.
   Lightweight canvas animation. Pauses off-screen and respects
   prefers-reduced-motion (renders a single static frame instead). */
(function () {
  "use strict";
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CY = "0, 217, 255";   // primary
  const VI = "139, 92, 246";  // accent
  let w, h, dpr, nodes = [], raf = null, running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const density = Math.min(Math.floor((w * h) / 16000), 90);
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 0.6,
      hue: Math.random() > 0.5 ? CY : VI,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    // links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.28;
          ctx.strokeStyle = `rgba(${CY}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // nodes
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${n.hue}, 0.9)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      if (!reduced) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
    });
    if (!reduced && running) raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) { running = true; frame(); } }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

  window.addEventListener("resize", debounce(resize, 150));
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  // Pause when hero scrolls out of view
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? start() : stop()));
    }).observe(canvas);
  }

  resize();
  reduced ? frame() : start();

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
})();
