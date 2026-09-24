// Programme explorer: search + faculty/campus/level filters, URL param support.
(function () {
  "use strict";

  var grid = document.getElementById("programme-grid");
  var count = document.getElementById("result-count");
  var search = document.getElementById("f-search");
  var facultySel = document.getElementById("f-faculty");
  var campusSel = document.getElementById("f-campus");
  var levelChips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));

  var facultyNames = {};
  FACULTIES.forEach(function (f) { facultyNames[f.id] = f.name; });
  FACULTIES.forEach(function (f) {
    var opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = f.name;
    facultySel.appendChild(opt);
  });

  var state = { q: "", faculty: "", campus: "", level: "" };

  // Preselect faculty from ?faculty= (used by the homepage faculty cards)
  var params = new URLSearchParams(window.location.search);
  if (params.get("faculty") && facultyNames[params.get("faculty")]) {
    state.faculty = params.get("faculty");
    facultySel.value = state.faculty;
  }

  function levelName(l) { return l === "ug" ? "Undergraduate" : "Postgraduate"; }

  function applyFilters() {
    var q = state.q.trim().toLowerCase();
    var out = PROGRAMMES.filter(function (p) {
      if (state.faculty && p.faculty !== state.faculty) return false;
      if (state.campus && p.campus !== state.campus) return false;
      if (state.level && p.level !== state.level) return false;
      if (q) {
        var hay = (p.name + " " + p.blurb + " " + facultyNames[p.faculty]).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    render(out);
  }

  function card(p) {
    var tags =
      '<span class="chip">' + levelName(p.level) + "</span>" +
      '<span class="chip">' + p.campus + " campus</span>" +
      '<span class="chip">' + p.duration + " yr</span>";
    if (p.limited) tags += '<span class="chip chip--gold">' + p.limited + "</span>";
    return (
      '<article class="card">' +
      "<h3>" + p.name + "</h3>" +
      '<p>' + p.blurb + "</p>" +
      '<div class="tags">' + tags + "</div>" +
      '<p style="font-size:0.9rem;color:var(--teal-700);font-weight:600">' + Currency.money(p.fee) + " / yr · international (indicative)</p>" +
      '<p style="font-size:0.86rem;margin:0"><a href="https://www.wgtn.ac.nz/explore/' + p.slug + '" target="_blank" rel="noopener">Official programme page ↗</a></p>' +
      "</article>"
    );
  }

  function render(list) {
    count.innerHTML = "<b>" + list.length + "</b> programme" + (list.length === 1 ? "" : "s") + " match your filters";
    if (!list.length) {
      grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">No programmes match. Try clearing a filter.</p>';
      return;
    }
    grid.innerHTML = list.map(card).join("");
  }

  search.addEventListener("input", function () {
    state.q = search.value;
    applyFilters();
  });
  facultySel.addEventListener("change", function () {
    state.faculty = facultySel.value;
    applyFilters();
  });
  campusSel.addEventListener("change", function () {
    state.campus = campusSel.value;
    applyFilters();
  });
  levelChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      levelChips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      state.level = chip.getAttribute("data-level");
      applyFilters();
    });
  });
  document.getElementById("filters").addEventListener("submit", function (e) { e.preventDefault(); });

  // Re-render when the currency toggle changes displayed fees
  document.addEventListener("currencychange", applyFilters);

  applyFilters();
})();
