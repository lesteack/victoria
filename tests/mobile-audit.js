// Mobile layout audit for the Victoria site using system Chrome (puppeteer-core).
// Captures screenshots + reports layout problems programmatically.
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/vuw-test/mobile";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });

  const report = {};
  const pages = process.argv[2] ? [process.argv[2]] : ["index.html", "programmes.html", "student-life.html"];

  for (const p of pages) {
    const page = await browser.newPage();
    await page.emulate({
      viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    });
    await page.goto("http://localhost:8765/" + p, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise(r => setTimeout(r, 400));

    const audit = await page.evaluate(() => {
      const problems = [];
      const vw = document.documentElement.clientWidth;

      // 1. Elements wider than viewport (horizontal scroll)
      const wide = [];
      document.querySelectorAll("body *").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > vw + 1 && r.width > 0) {
          const tag = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : "");
          wide.push({ tag, width: Math.round(r.width) });
        }
      });
      if (wide.length) problems.push({ type: "overflow", items: wide.slice(0, 8) });
      problems.push({ type: "scrollWidth", value: document.documentElement.scrollWidth, vw });

      // 2. Header layout: does the brand wrap onto multiple rows?
      const header = document.querySelector(".site-header");
      const hr = header.getBoundingClientRect();
      problems.push({ type: "headerHeight", value: Math.round(hr.height) });

      // 3. Tap targets smaller than 40px
      const small = [];
      document.querySelectorAll("a, button").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < 40) {
          small.push({ tag: el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0], h: Math.round(r.height), text: (el.textContent || "").trim().slice(0, 18) });
        }
      });
      if (small.length) problems.push({ type: "smallTapTargets", items: small.slice(0, 10) });

      // 4. Hero title size and height
      const h1 = document.querySelector("h1");
      if (h1) {
        const cs = getComputedStyle(h1);
        const r = h1.getBoundingClientRect();
        problems.push({ type: "h1", fontSize: cs.fontSize, height: Math.round(r.height), lines: Math.round(r.height / parseFloat(cs.lineHeight)) });
      }

      // 5. Section paddings and content density
      const sec = document.querySelector(".section");
      if (sec) problems.push({ type: "sectionPadding", value: getComputedStyle(sec).paddingTop });

      // 6. Images heights (uniform?)
      const imgs = [];
      document.querySelectorAll(".topic-aside img, .hero-media img").forEach(el => {
        const r = el.getBoundingClientRect();
        imgs.push({ src: el.getAttribute("src").split("/").pop(), w: Math.round(r.width), h: Math.round(r.height) });
      });
      if (imgs.length) problems.push({ type: "images", items: imgs });

      // 7. Font size below 14px anywhere
      let tiny = 0;
      document.querySelectorAll("p, li, span, a").forEach(el => {
        if (parseFloat(getComputedStyle(el).fontSize) < 13) tiny++;
      });
      problems.push({ type: "tinyTextCount", value: tiny });

      return problems;
    });

    report[p] = audit;
    await page.screenshot({ path: OUT + "/" + p.replace(".html", "") + ".png", fullPage: true });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
