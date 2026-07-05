/* contact.js — client-only contact form. Composes a mailto: link so the
   site needs no backend. Swap for a form endpoint (Formspree, Netlify, a
   serverless function) if you want server-side submission. */
(function () {
  "use strict";
  const send = document.getElementById("cf-send");
  if (!send) return;
  const note = document.getElementById("cf-note");

  send.addEventListener("click", () => {
    const name = val("cf-name"), email = val("cf-email"),
          topic = val("cf-topic"), msg = val("cf-msg");
    if (!name || !email || !msg) {
      note.textContent = "Please fill in your name, email, and message.";
      note.style.color = "#ffd166";
      return;
    }
    const subject = encodeURIComponent(`[${topic}] Message from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:info@noetherx.com?subject=${subject}&body=${body}`;
    note.textContent = "Opening your email client…";
    note.style.color = "var(--highlight)";
  });

  function val(id) { return (document.getElementById(id)?.value || "").trim(); }
})();
