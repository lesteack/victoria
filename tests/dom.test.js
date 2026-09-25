// DOM-level tests for the Victoria University class site.
// Loads each page with jsdom, runs its scripts, simulates interaction, asserts results.
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = "/Users/macpro/projets/victoria";
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

function loadPage(file, { runScripts = true } = {}) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const dom = new JSDOM(html, {
    url: "http://localhost:8765/" + file,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  // Load external scripts manually (jsdom runScripts doesn't fetch external by default without resources)
  return dom;
}

// jsdom window.eval scopes don't share top-level `const` across calls (unlike real
// <script> tags), so all of a page's scripts are concatenated into one eval.
function evalScripts(dom, files) {
  const w = dom.window;
  if (!w.matchMedia) w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  const code = files.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  w.eval(code);
}

function grab(dom, expr) {
  return dom.window.eval(expr);
}

(async function () {
  // ---------- 1. Homepage loading ----------
  const home = loadPage("index.html", { runScripts: false });
  const homeDoc = home.window.document;
  evalScripts(home, ["js/currency.js", "js/main.js"]);
  check("homepage: title", /Victoria University of Wellington/.test(homeDoc.title));
  check("homepage: hero image referenced", !!homeDoc.querySelector(".hero-media img"));
  check("homepage: 6 stats", homeDoc.querySelectorAll(".stat").length === 6);
  check("homepage: 5 topic sections", homeDoc.querySelectorAll(".topic").length === 5, "got " + homeDoc.querySelectorAll(".topic").length);
  check("homepage: google maps embed", !!homeDoc.querySelector('iframe[src*="google.com/maps"]'));
  check("homepage: currency switch present", homeDoc.querySelectorAll(".currency-switch button").length === 2);
  check("homepage: skip link", !!homeDoc.querySelector(".skip-link"));
  check("homepage: nav has 5 links", homeDoc.querySelectorAll(".site-nav a").length === 5);
  check("homepage: aria-current on Home", homeDoc.querySelector('.site-nav a[aria-current="page"]')?.textContent === "Home");

  // ---------- 2. Programme filtering ----------
  const progDom = loadPage("programmes.html", { runScripts: false });
  evalScripts(progDom, ["js/currency.js", "js/data.js", "js/programmes.js"]);
  const pd = progDom.window.document;
  const win = progDom.window;
  const allCards = pd.querySelectorAll("#programme-grid .card").length;
  check("programmes: renders all " + 23 + " programmes", allCards === 23, "got " + allCards);

  // search filter
  pd.getElementById("f-search").value = "engineering";
  pd.getElementById("f-search").dispatchEvent(new win.Event("input", { bubbles: true }));
  check("programmes: search 'engineering' finds BE, ME + CS blurb", pd.querySelectorAll("#programme-grid .card").length === 3, "got " + pd.querySelectorAll("#programme-grid .card").length);

  // faculty filter via select
  pd.getElementById("f-search").value = "";
  pd.getElementById("f-search").dispatchEvent(new win.Event("input", { bubbles: true }));
  const fac = pd.getElementById("f-faculty");
  fac.value = "law";
  fac.dispatchEvent(new win.Event("change", { bubbles: true }));
  check("programmes: law faculty filter → 2", pd.querySelectorAll("#programme-grid .card").length === 2);

  // level chips
  fac.value = "";
  fac.dispatchEvent(new win.Event("change", { bubbles: true }));
  const pgChip = Array.from(pd.querySelectorAll(".filter-chip")).find(c => c.dataset.level === "pg");
  pgChip.dispatchEvent(new win.Event("click", { bubbles: true }));
  const pgCount = pd.querySelectorAll("#programme-grid .card").length;
  check("programmes: postgraduate chip → all PG", pgCount === 10 && pgChip.getAttribute("aria-pressed") === "true");

  // campus
  const camp = pd.getElementById("f-campus");
  camp.value = "Te Aro";
  camp.dispatchEvent(new win.Event("change", { bubbles: true }));
  const teAro = pd.querySelectorAll("#programme-grid .card").length;
  check("programmes: PG + Te Aro filter", teAro === 2, "got " + teAro);

  // no-results state
  pd.getElementById("f-search").value = "xyzzy";
  pd.getElementById("f-search").dispatchEvent(new win.Event("input", { bubbles: true }));
  check("programmes: empty state", pd.querySelectorAll("#programme-grid .card").length === 0 && /No programmes match/.test(pd.getElementById("programme-grid").textContent));

  // result count live region
  check("programmes: live region present", pd.getElementById("result-count").getAttribute("role") === "status");

  // ---------- 3. Admissions checker ----------
  const admDom = loadPage("admissions.html", { runScripts: false });
  evalScripts(admDom, ["js/admissions.js"]);
  const ad = admDom.window.document;
  const aw = admDom.window;
  check("admissions: NCEA fields built", !!ad.getElementById("q-s1") && !!ad.getElementById("q-num"));

  // NCEA pass case
  ["s1=16", "s2=14", "s3=18", "lit=12", "num=11"].forEach(pair => {
    const [k, v] = pair.split("=");
    ad.getElementById("q-" + k).value = v;
  });
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: NCEA 16/14/18 + lit/num → meets", /Meets the standard/.test(ad.getElementById("checker-result").textContent));

  // NCEA fail case
  ad.getElementById("q-s2").value = "10";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: NCEA 10 credits in subject 2 → fails", /Not there yet/.test(ad.getElementById("checker-result").textContent));

  // IB
  ad.getElementById("q-type").value = "ib";
  ad.getElementById("q-type").dispatchEvent(new aw.Event("change", { bubbles: true }));
  ad.getElementById("q-points").value = "23";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: IB 23 → fails", /Not there yet/.test(ad.getElementById("checker-result").textContent));
  ad.getElementById("q-points").value = "27";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: IB 27 → passes", /Meets the standard/.test(ad.getElementById("checker-result").textContent));

  // A-Levels: A*, B, C → passes (sorted A*>=B, B>=B, C>=C)
  ad.getElementById("q-type").value = "alevels";
  ad.getElementById("q-type").dispatchEvent(new aw.Event("change", { bubbles: true }));
  ["g1=A*", "g2=B", "g3=C"].forEach(pair => {
    const [k, v] = pair.split("=");
    ad.getElementById("q-" + k).value = v;
  });
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: A*BC → passes", /Meets the standard/.test(ad.getElementById("checker-result").textContent));
  // A-Levels: B, C, D → fails
  ["g1=B", "g2=C", "g3=D"].forEach(pair => {
    const [k, v] = pair.split("=");
    ad.getElementById("q-" + k).value = v;
  });
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: BCD → fails", /Not there yet/.test(ad.getElementById("checker-result").textContent));

  // French bac
  ad.getElementById("q-type").value = "frenchbac";
  ad.getElementById("q-type").dispatchEvent(new aw.Event("change", { bubbles: true }));
  ad.getElementById("q-moy").value = "11.5";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: French bac 11.5 → fails", /Not there yet/.test(ad.getElementById("checker-result").textContent));
  ad.getElementById("q-moy").value = "14";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  check("admissions: French bac 14 → passes", /Meets the standard/.test(ad.getElementById("checker-result").textContent));

  // IELTS check
  ad.getElementById("q-type").value = "ncea";
  ad.getElementById("q-type").dispatchEvent(new aw.Event("change", { bubbles: true }));
  ["s1=14", "s2=14", "s3=14", "lit=10", "num=10"].forEach(pair => {
    const [k, v] = pair.split("=");
    ad.getElementById("q-" + k).value = v;
  });
  ad.getElementById("q-ielts").value = "5.5";
  ad.getElementById("q-band").value = "5";
  ad.getElementById("checker-form").dispatchEvent(new aw.Event("submit", { bubbles: true, cancelable: true }));
  const ieltsTxt = ad.getElementById("checker-result").textContent;
  check("admissions: IELTS 5.5 flagged", /IELTS 6.0/.test(ieltsTxt) && /below the 6.0/.test(ieltsTxt));
  check("admissions: band 5.0 flagged", /No IELTS band below 5.5/.test(ieltsTxt));

  // ---------- 4. Calculators ----------
  const calcDom = loadPage("calculators.html", { runScripts: false });
  evalScripts(calcDom, ["js/currency.js", "js/data.js", "js/calculators.js"]);
  const cd = calcDom.window.document;
  const cw = calcDom.window;

  // Rank score: E=10 M=30 A=40 → 10*4+30*3+40*2 = 210
  cd.getElementById("r-e").value = "10";
  cd.getElementById("r-m").value = "30";
  cd.getElementById("r-a").value = "40";
  cd.getElementById("rank-form").dispatchEvent(new cw.Event("submit", { bubbles: true, cancelable: true }));
  check("calculator: rank score 210/320", /210/.test(cd.getElementById("rank-out").textContent) && /320/.test(cd.getElementById("rank-out").textContent));

  // Rank score cap at 80 credits: E=50 M=0 A=0 → 80 credits counted → 320
  cd.getElementById("r-e").value = "80";
  cd.getElementById("r-m").value = "0";
  cd.getElementById("r-a").value = "0";
  cd.getElementById("rank-form").dispatchEvent(new cw.Event("submit", { bubbles: true, cancelable: true }));
  check("calculator: rank score caps at best 80 credits → 320", /<b>320<\/b>/.test(cd.getElementById("rank-out").innerHTML));

  // Fee estimator: humss ug 3y, living 17500 → total 139500 – 151500
  cd.getElementById("fee-faculty").value = "humss";
  cd.getElementById("fee-level").value = "ug";
  cd.getElementById("fee-years").value = "3";
  cd.getElementById("fee-living").value = "17500";
  cd.getElementById("fee-form").dispatchEvent(new cw.Event("submit", { bubbles: true, cancelable: true }));
  const feeTxt = cd.getElementById("fee-out").textContent;
  check("calculator: fee total low €69,750", feeTxt.includes("€69,750"), feeTxt);
  check("calculator: fee total high €75,750", feeTxt.includes("€75,750"), feeTxt);

  // GPA: 3×A+ (9), 1×B (5) → (27+5)/4 = 8
  cd.getElementById("g-A+").value = "3";
  cd.getElementById("g-B").value = "1";
  cd.getElementById("gpa-form").dispatchEvent(new cw.Event("submit", { bubbles: true, cancelable: true }));
  check("calculator: GPA = 8.00", /8\.00/.test(cd.getElementById("gpa-out").textContent));

  // GPA no papers → error
  ["A+","A","A-","B+","B","B-","C+","C","C-"].forEach(g => cd.getElementById("g-" + g).value = "0");
  cd.getElementById("gpa-form").dispatchEvent(new cw.Event("submit", { bubbles: true, cancelable: true }));
  check("calculator: GPA zero papers → error", /Enter at least one paper/.test(cd.getElementById("gpa-out").textContent));

  // ---------- 6. External links ----------
  const extLinks = new Set();
  for (const page of ["index.html", "programmes.html", "admissions.html", "calculators.html", "student-life.html"]) {
    const d = loadPage(page, { runScripts: false }).window.document;
    d.querySelectorAll('a[href^="http"]').forEach(a => extLinks.add(a.getAttribute("href")));
  }
  check("external links: found " + extLinks.size + " unique", extLinks.size >= 13);

  // ---------- 7. Keyboard navigation essentials ----------
  const navDom = loadPage("index.html", { runScripts: false });
  evalScripts(navDom, ["js/main.js"]);
  const nd = navDom.window.document;
  const nw = navDom.window;
  const toggle = nd.querySelector(".nav-toggle");
  const nav = nd.getElementById("site-nav");
  toggle.dispatchEvent(new nw.Event("click", { bubbles: true }));
  check("keyboard: menu toggles open + aria-expanded", nav.classList.contains("open") && toggle.getAttribute("aria-expanded") === "true");
  nd.dispatchEvent(new nw.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  check("keyboard: Escape closes menu", !nav.classList.contains("open") && toggle.getAttribute("aria-expanded") === "false");
  check("keyboard: skip link first in DOM", nd.body.firstElementChild.className === "skip-link");
  check("keyboard: all inputs have labels", (function () {
    const d = loadPage("admissions.html", { runScripts: false }).window.document;
    return Array.from(d.querySelectorAll("input, select, textarea")).every(i => i.id && d.querySelector('label[for="' + i.id + '"]'));
  })());

  
  // ---------- Currency toggle ----------
  var curDom = loadPage("programmes.html", { runScripts: false });
  evalScripts(curDom, ["js/currency.js", "js/data.js", "js/programmes.js"]);
  curDom.window.eval("Currency.init()");
  var curd = curDom.window.document;
  var curw = curDom.window;
  var firstCardFee = curd.querySelector("#programme-grid .card p[style]").textContent;
  check("currency: default EUR on programme cards", firstCardFee.includes("€14,700"), "got: " + firstCardFee);

  var nzdBtn = curd.querySelector('.currency-switch button[data-cur="nzd"]');
  nzdBtn.dispatchEvent(new curw.Event("click", { bubbles: true }));
  firstCardFee = curd.querySelector("#programme-grid .card p[style]").textContent;
  check("currency: toggle to NZD updates cards", firstCardFee.includes("NZ$29,400"), "got: " + firstCardFee);
  check("currency: aria-pressed synced", nzdBtn.getAttribute("aria-pressed") === "true" && curd.querySelector('.currency-switch button[data-cur="eur"]').getAttribute("aria-pressed") === "false");
  check("currency: localStorage persisted", curw.localStorage.getItem("vuw-currency") === "nzd");

  // Fee estimator follows the toggle
  var feeDom2 = loadPage("calculators.html", { runScripts: false });
  evalScripts(feeDom2, ["js/currency.js", "js/data.js", "js/calculators.js"]);
  feeDom2.window.eval("Currency.init()");
  var fd2 = feeDom2.window.document;
  var fw2 = feeDom2.window;
  fd2.getElementById("fee-faculty").value = "humss";
  fd2.getElementById("fee-years").value = "3";
  fd2.getElementById("fee-living").value = "17500";
  fd2.getElementById("fee-form").dispatchEvent(new fw2.Event("submit", { bubbles: true, cancelable: true }));
  var eurOut = fd2.getElementById("fee-out").textContent;
  check("currency: fee estimator in EUR default", eurOut.includes("€14,500"), "got: " + eurOut);
  fd2.querySelector('.currency-switch button[data-cur="nzd"]').dispatchEvent(new fw2.Event("click", { bubbles: true }));
  var nzdOut = fd2.getElementById("fee-out").textContent;
  check("currency: fee estimator re-renders in NZD", nzdOut.includes("NZ$29,000") && nzdOut.includes("139,500"), "got: " + nzdOut);

  // Static data-nzd spans on homepage update too
  var hDom2 = loadPage("index.html", { runScripts: false });
  evalScripts(hDom2, ["js/currency.js"]);
  hDom2.window.eval("Currency.init()");
  var hd2 = hDom2.window.document;
  check("currency: homepage static spans in EUR", hd2.querySelector('[data-nzd="29400"]').textContent === "€14,700", "got: " + hd2.querySelector('[data-nzd="29400"]').textContent);

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
