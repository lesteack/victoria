// Contact form: client-side validation + demo submission (no backend on GitHub Pages).
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  var success = document.getElementById("contact-success");

  function setError(id, show) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-err");
    err.hidden = !show;
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (show) input.setAttribute("aria-describedby", id + "-err");
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validate() {
    var ok = true;
    var focusTarget = null;

    var name = document.getElementById("c-name");
    if (!name.value.trim()) { setError("c-name", true); ok = false; focusTarget = focusTarget || name; }
    else setError("c-name", false);

    var email = document.getElementById("c-email");
    if (!validEmail(email.value.trim())) { setError("c-email", true); ok = false; focusTarget = focusTarget || email; }
    else setError("c-email", false);

    var topic = document.getElementById("c-topic");
    if (!topic.value) { setError("c-topic", true); ok = false; focusTarget = focusTarget || topic; }
    else setError("c-topic", false);

    var msg = document.getElementById("c-msg");
    if (msg.value.trim().length < 20) { setError("c-msg", true); ok = false; focusTarget = focusTarget || msg; }
    else setError("c-msg", false);

    if (!ok) focusTarget.focus();
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.innerHTML = "";
    if (!validate()) return;

    var name = document.getElementById("c-name").value.trim().split(/\s+/)[0];
    success.innerHTML =
      '<div class="form-success"><p style="margin:0"><strong>Thanks, ' + name + "!</strong> In a real deployment this would be sent to the university — for this class project the form is a front-end demo, so nothing was sent.</p>" +
      '<p style="margin:0.5rem 0 0;font-size:0.88rem;color:var(--muted)">For real enquiries use the official links beside the form.</p></div>';
    form.reset();
    var panel = success.querySelector(".form-success");
    panel.setAttribute("tabindex", "-1");
    panel.focus();
  });
})();
