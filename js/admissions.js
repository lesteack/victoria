// Admissions checker: dynamic qualification form + UE rule evaluation.
(function () {
  "use strict";

  var typeSel = document.getElementById("q-type");
  var fields = document.getElementById("q-fields");
  var result = document.getElementById("checker-result");
  var form = document.getElementById("checker-form");

  var RULES = {
    ncea: {
      intro: "NCEA University Entrance",
      inputs: [
        { id: "s1", label: "Credits in approved subject 1", min: 0, max: 60 },
        { id: "s2", label: "Credits in approved subject 2", min: 0, max: 60 },
        { id: "s3", label: "Credits in approved subject 3", min: 0, max: 60 },
        { id: "lit", label: "Literacy credits (Level 2+)", min: 0, max: 40 },
        { id: "num", label: "Numeracy credits (Level 1+)", min: 0, max: 40 }
      ],
      validate: function (v) {
        var subjects = [v.s1, v.s2, v.s3].map(Number);
        return [
          { label: "14+ credits in each of 3 approved subjects", pass: subjects.every(function (c) { return c >= 14; }), detail: "You have " + subjects.join(", ") + " credits — each needs 14 or more" },
          { label: "10 literacy credits (reading + writing)", pass: v.lit >= 10, detail: "You have " + v.lit + " of 10" },
          { label: "10 numeracy credits", pass: v.num >= 10, detail: "You have " + v.num + " of 10" }
        ];
      }
    },
    ib: {
      intro: "International Baccalaureate Diploma",
      inputs: [{ id: "points", label: "Total IB points (out of 45)", min: 0, max: 45 }],
      validate: function (v) {
        var p = Number(v.points);
        return [{ label: "24 points or more", pass: p >= 24, detail: "You have " + p + " of the 24 required" }];
      }
    },
    alevels: {
      intro: "GCE A-Levels / Cambridge",
      inputs: [
        { id: "g1", label: "Subject 1 grade", type: "select", options: ["A*", "A", "B", "C", "D", "E"] },
        { id: "g2", label: "Subject 2 grade", type: "select", options: ["A*", "A", "B", "C", "D", "E"] },
        { id: "g3", label: "Subject 3 grade", type: "select", options: ["A*", "A", "B", "C", "D", "E"] }
      ],
      validate: function (v) {
        var points = { "A*": 4, "A": 3, "B": 2, "C": 1, "D": 0, "E": -1 };
        var sorted = [v.g1, v.g2, v.g3].map(function (g) { return points[g]; }).sort(function (a, b) { return b - a; });
        // BBC = 2 + 2 + 1
        var pass = sorted[0] >= 2 && sorted[1] >= 2 && sorted[2] >= 1;
        return [{ label: "Grades of approximately BBC", pass: pass, detail: "Your grades: " + [v.g1, v.g2, v.g3].join(", ") }];
      }
    },
    frenchbac: {
      intro: "French Baccalauréat",
      inputs: [{ id: "moy", label: "Overall average (out of 20)", min: 0, max: 20, step: 0.1 }],
      validate: function (v) {
        var m = Number(v.moy);
        return [{ label: "12/20 overall or better (indicative)", pass: m >= 12, detail: "Your average: " + v.moy + "/20" }];
      }
    }
  };

  function buildFields() {
    var rule = RULES[typeSel.value];
    fields.innerHTML = "";
    rule.inputs.forEach(function (inp) {
      var wrap = document.createElement("div");
      wrap.className = "field";
      var label = document.createElement("label");
      label.setAttribute("for", "q-" + inp.id);
      label.textContent = inp.label;
      wrap.appendChild(label);
      var input;
      if (inp.type === "select") {
        input = document.createElement("select");
        inp.options.forEach(function (o) {
          var opt = document.createElement("option");
          opt.value = o;
          opt.textContent = o;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement("input");
        input.type = "number";
        input.min = inp.min;
        input.max = inp.max;
        if (inp.step) input.step = inp.step;
        input.inputMode = "decimal";
      }
      input.id = "q-" + inp.id;
      wrap.appendChild(input);
      fields.appendChild(wrap);
    });
  }

  function collect() {
    var v = {};
    var rule = RULES[typeSel.value];
    rule.inputs.forEach(function (inp) {
      v[inp.id] = document.getElementById("q-" + inp.id).value;
    });
    return v;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var rule = RULES[typeSel.value];
    var checks = rule.validate(collect());
    var ielts = document.getElementById("q-ielts").value;
    var band = document.getElementById("q-band").value;

    if (ielts !== "") {
      var overall = Number(ielts);
      checks.push({
        label: "IELTS 6.0 overall (if English is not your first language)",
        pass: overall >= 6,
        detail: "Your overall: " + ielts + (overall < 6 ? " — below the 6.0 requirement" : " — meets the requirement")
      });
      if (band !== "") {
        checks.push({
          label: "No IELTS band below 5.5",
          pass: Number(band) >= 5.5,
          detail: "Your lowest band: " + band
        });
      }
    }

    var allPass = checks.every(function (c) { return c.pass; });
    var icon = allPass ? "✓" : "✗";
    var cls = allPass ? "panel panel--ok" : "panel panel--no";
    var title = allPass
      ? "Meets the standard entry requirements"
      : "Not there yet — see the details below";

    var html = '<div class="' + cls + '"><h3>' + icon + " " + title + "</h3><ul>" +
      checks.map(function (c) {
        return "<li>" + (c.pass ? "✓" : "✗") + " <strong>" + c.label + "</strong> — " + c.detail + "</li>";
      }).join("") +
      "</ul><p style='font-size:0.86rem;color:var(--muted)'>Demo checker for a class presentation — confirm on the <a href='https://www.wgtn.ac.nz/study/apply-enrol/admissions' target='_blank' rel='noopener'>official admissions pages</a>. Limited-entry programmes (Architecture, Music, Teaching) have extra requirements.</p></div>";

    result.innerHTML = html;
  });

  typeSel.addEventListener("change", buildFields);
  buildFields();
})();
