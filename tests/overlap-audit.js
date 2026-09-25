const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
  const widths = [320, 360, 393, 430];
  const pages = ["index.html", "programmes.html", "admissions.html", "calculators.html", "student-life.html"];
  const report = {};
  for (const w of widths) {
    for (const p of pages) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 844, isMobile: true, hasTouch: true });
      await page.goto("http://localhost:8765/" + p, { waitUntil: "networkidle0" });
      await new Promise(r => setTimeout(r, 300));
      const overlaps = await page.evaluate(() => {
        // Collect per-line-box rects of every text node's parent element
        const boxes = [];
        document.querySelectorAll("body *").forEach(el => {
          if (el.children.length > 0) return;
          const txt = (el.textContent || "").trim();
          if (!txt) return;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return;
          const rects = el.getClientRects(); // one per line box — no union artifacts
          for (const r of rects) {
            if (r.width >= 2 && r.height >= 2) boxes.push({ el, r, txt: txt.slice(0, 24) });
          }
        });
        const bad = [];
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.el === b.el) continue;
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
            const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
            if (ix > 3 && iy > Math.min(a.r.height, b.r.height) * 0.4) {
              bad.push({ a: a.txt + " [" + Math.round(a.r.left) + "," + Math.round(a.r.top) + "]", b: b.txt + " [" + Math.round(b.r.left) + "," + Math.round(b.r.top) + "]", clsA: String(a.el.className).slice(0, 20), clsB: String(b.el.className).slice(0, 20), ix: Math.round(ix) });
            }
          }
        }
        const seen = new Set();
        return bad.filter(o => { const k = o.a + o.b; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
      });
      if (overlaps.length) report[w + " " + p] = overlaps;
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
