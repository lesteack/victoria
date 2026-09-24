# Victoria University of Wellington — class presentation site

A static website about **Te Herenga Waka—Victoria University of Wellington** (New Zealand),
built for a class presentation: classmates browse the site while the presenter walks
them through the university.

This is an **educational project** — it is not an official university website.
Authoritative information lives at [wgtn.ac.nz](https://www.wgtn.ac.nz).

## Features

| Page | What it does |
|---|---|
| `index.html` | Homepage — hero, key figures, faculty overview |
| `programmes.html` | Programme explorer: search + faculty / campus / level filters |
| `admissions.html` | Requirements table + interactive admissions checker (NCEA, IB, A-Levels, French Bac, IELTS) |
| `calculators.html` | NCEA rank score calculator, international fee estimator, NZ 9-point GPA |
| `student-life.html` | The three campuses, the trimester year, Wellington |
| `contact.html` | Validated demo form (front-end only — no backend) + official contact links |

No build step, no dependencies, no network needed at runtime except external links.

## Run locally

```bash
cd victoria
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly from the filesystem also works.)

## Deploy on GitHub Pages

1. Create a repository on GitHub and push this folder.
2. Repository **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site is served at `https://<user>.github.io/<repo>/`.

## Structure

```
├── index.html, programmes.html, admissions.html,
│   calculators.html, student-life.html, contact.html
├── css/style.css
├── js/            data.js (programme dataset), main.js (nav/reveal),
│                  programmes.js, admissions.js, calculators.js, contact.js
└── img/           logo + Wikimedia Commons photos (see img/CREDITS.md)
```

## Data sources and accuracy

Facts, admission requirements, and fee figures were collected in September 2026 from
the university's official pages and public ranking publications, and are **indicative**:
tuition varies by course, and requirements change yearly. Every page links to the
corresponding official source — the presentation should say "check wgtn.ac.nz" too.

## Accessibility

Skip link, labelled form fields, visible focus styles, ARIA on the mobile menu and
live regions on filter/calculator results, `prefers-reduced-motion` support, and
full keyboard operation. Images have descriptive alt text.
