// Shared behaviour: mobile nav, reveal-on-scroll, current-page marking, utilities.
document.documentElement.classList.remove("no-js");

(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Mobile: keep the header to one row — the currency switch lives inside the menu panel
  var switchEl = document.querySelector(".currency-switch");
  var navPanel = document.getElementById("site-nav");
  if (switchEl && navPanel) {
    var mq = window.matchMedia("(max-width: 780px)");
    var headerInner = switchEl.parentElement;
    var placeSwitch = function () {
      if (mq.matches) {
        navPanel.insertBefore(switchEl, navPanel.firstChild);
      } else if (switchEl.parentElement !== headerInner) {
        headerInner.insertBefore(switchEl, navPanel.nextSibling);
      }
    };
    placeSwitch();
    if (mq.addEventListener) mq.addEventListener("change", placeSwitch);
  }

  // Reveal on scroll (gentle, reduced-motion handled in CSS)
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }
})();

// Welcome popup — shown once per visit (any page can be the entry point)
(function () {
  "use strict";
  var overlay = document.querySelector(".welcome-overlay");
  if (!overlay) return;

  var seen = false;
  try { seen = sessionStorage.getItem("vuw-welcome-seen") === "1"; } catch (e) {}
  if (seen) return;

  var closeBtn = overlay.querySelector(".welcome-btn");
  var lastFocus = document.activeElement;

  var close = function () {
    overlay.classList.remove("is-open");
    try { sessionStorage.setItem("vuw-welcome-seen", "1"); } catch (e) {}
    setTimeout(function () { overlay.hidden = true; }, 260);
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  var onKey = function (e) {
    if (e.key === "Escape") close();
  };

  overlay.hidden = false;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", onKey);
  if (closeBtn) closeBtn.focus();
})();
