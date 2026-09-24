// Calculators: NCEA rank score, international fee estimator, NZ 9-point GPA.
(function () {
  "use strict";

  /* 1. NCEA rank score — best 80 L3 credits, E=4 M=3 A=2, max 320 */
  var rankForm = document.getElementById("rank-form");
  var rankOut = document.getElementById("rank-out");

  rankForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var e4 = Math.max(0, Number(document.getElementById("r-e").value) || 0);
    var m3 = Math.max(0, Number(document.getElementById("r-m").value) || 0);
    var a2 = Math.max(0, Number(document.getElementById("r-a").value) || 0);
    var remaining = 80;
    var score = 0;
    [["E", e4, 4], ["M", m3, 3], ["A", a2, 2]].forEach(function (tier) {
      var used = Math.min(tier[1], remaining);
      score += used * tier[2];
      remaining -= used;
    });

    var total = e4 + m3 + a2;
    var verdict;
    if (score >= 200) verdict = "Excellent — strong for scholarships and competitive selection.";
    else if (score >= 180) verdict = "Above the historic 180 bar used for Architecture and Building Science.";
    else if (score >= 150) verdict = "Above the historic 150 undergraduate bar.";
    else verdict = "Below the historic bars — but guaranteed entry now depends on University Entrance, not rank score.";

    rankOut.innerHTML =
      '<div class="calc-out"><p style="margin:0">Rank score</p>' +
      "<p style='margin:0.2rem 0'><b>" + score + "</b> / 320 <span style='color:var(--muted)'>(" + total + " L3 credits entered, best 80 counted)</span></p>" +
      "<p style='margin:0.6rem 0 0;font-size:0.95rem'>" + verdict + "</p></div>";
  });

  /* 2. Fee estimator */
  var feeForm = document.getElementById("fee-form");
  var feeOut = document.getElementById("fee-out");
  var facultySel = document.getElementById("fee-faculty");

  FACULTIES.forEach(function (f) {
    var opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = f.name;
    facultySel.appendChild(opt);
  });

  feeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var fid = facultySel.value;
    var lvl = document.getElementById("fee-level").value;
    var years = Math.max(1, Number(document.getElementById("fee-years").value) || 3);
    var living = Math.max(0, Number(document.getElementById("fee-living").value) || 0);
    var range = FEE_RANGES[fid][lvl];

    var lowTotal = range[0] * years + living * years;
    var highTotal = range[1] * years + living * years;
    var fname = FACULTIES.find(function (f) { return f.id === fid; }).name;
    var levelName = lvl === "ug" ? "undergraduate" : "postgraduate";

    feeOut.innerHTML =
      '<div class="calc-out"><p style="margin:0">' + fname + " · " + levelName + " · " + years + " year" + (years > 1 ? "s" : "") + "</p>" +
      "<dl>" +
      "<dt>Tuition / year</dt><dd>" + Currency.money(range[0]) + " – " + Currency.money(range[1]) + " (indicative)</dd>" +
      "<dt>Living / year</dt><dd>" + Currency.money(living) + " (your figure)</dd>" +
      "<dt>Total estimate</dt><dd><b>" + Currency.money(lowTotal) + " – " + Currency.money(highTotal) + "</b></dd>" +
      "</dl>" +
      "<p style='font-size:0.85rem;color:var(--muted);margin:0.7rem 0 0'>Excludes flights, insurance, and the Student Services Fee. The NZ International Student Grant of " + Currency.money(5000) + "–" + Currency.money(10000) + " can reduce this.</p></div>";
  });

  /* 3. NZ GPA, 9-point scale */
  var GRADES = [
    ["A+", 9], ["A", 8], ["A-", 7], ["B+", 6], ["B", 5], ["B-", 4], ["C+", 3], ["C", 2], ["C-", 1]
  ];
  var gpaForm = document.getElementById("gpa-form");
  var gpaOut = document.getElementById("gpa-out");
  var gpaFields = document.getElementById("gpa-fields");

  GRADES.forEach(function (g) {
    var wrap = document.createElement("div");
    wrap.className = "field";
    var label = document.createElement("label");
    label.setAttribute("for", "g-" + g[0]);
    label.textContent = g[0] + " papers";
    var input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = "0";
    input.id = "g-" + g[0];
    input.setAttribute("aria-label", "Number of papers graded " + g[0]);
    wrap.appendChild(label);
    wrap.appendChild(input);
    gpaFields.appendChild(wrap);
  });

  gpaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var papers = 0, points = 0;
    GRADES.forEach(function (g) {
      var n = Math.max(0, Number(document.getElementById("g-" + g[0]).value) || 0);
      papers += n;
      points += n * g[1];
    });
    if (!papers) {
      gpaOut.innerHTML = '<p class="form-error">Enter at least one paper.</p>';
      return;
    }
    var gpa = (points / papers).toFixed(2);
    var band = gpa >= 8 ? "A range — first-class territory" : gpa >= 6 ? "B+ range — solid honours" : gpa >= 4 ? "B- range — degree complete" : "C range — just passing";
    gpaOut.innerHTML =
      '<div class="calc-out"><p style="margin:0">GPA (NZ 9-point scale)</p>' +
      "<p style='margin:0.2rem 0'><b>" + gpa + "</b> / 9 <span style='color:var(--muted)'>(" + papers + " papers)</span></p>" +
      "<p style='margin:0.5rem 0 0;font-size:0.95rem'>" + band + "</p></div>";
  });

  // Re-run the money calculators when the € / NZ$ switch changes displayed amounts
  document.addEventListener("currencychange", function () {
    if (rankOut.textContent.trim()) {
      rankForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
    if (feeOut.textContent.trim()) {
      feeForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  });
})();
