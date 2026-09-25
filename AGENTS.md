# AGENTS.md — Contexte projet « victoria »

## Ce que c'est

Site statique de **présentation de classe** sur **Te Herenga Waka—Victoria University of Wellington** (Nouvelle-Zélande). L'utilisateur (lycéen/étudiant français, communique en français) le présente à l'oral **10 minutes** pendant que ses camarades naviguent dessus.

**Contenu du site en anglais.** C'est un projet éducatif, pas un site officiel de l'université — chaque page doit garder la mention "class project" et des liens vers les sources officielles.

## Exigences de l'utilisateur (historique des demandes)

1. Site navigable pendant l'oral — 9 critères de test : homepage loading, navigation, mobile layout, programme filtering, calculators, admissions checker, external links, forms (depuis retirée), keyboard navigation.
2. **Concision** : le site doit supporter un oral de 10 min. Page contact supprimée. Homepage = les 5 sections essentielles, approfondissements en sous-pages.
3. **Devise** : euros par défaut partout, bouton toggle € / NZ$ dans le header. Taux indicatif fixe **1 NZ$ = €0,50**.
4. Homepage : 1. Campus & student life, 2. Majors/courses, 3. Undergraduate admissions for a French student, 4. Tuition fees & scholarships, 5. Accommodation & living expenses.
6. **Carte Google Maps** (iframe `output=embed`, sans clé API) sur la homepage et student-life.
7. Mobile soigné : header une rangée, pas de texte superposé, tap targets ≥44px.
8. **Pop-up d'accueil « Kia ora — Welcome »** au premier chargement d'une visite : annonce que le site a été créé par **Noé, Manon, Inès, Cameron & Valentin**. Une seule fois par visite (`sessionStorage["vuw-welcome-seen"]`), fermable (bouton, clic hors carte, Échap). Mêmes prénoms en crédits dans le footer des 5 pages (`.footer-credits`).
9. **Bannière hero « mieux intégrée »** (demande après capture iOS) : le haut de la photo (ciel délavé quasi blanc) donnait l'impression d'une bande vide détachée du header. Fix : image agrandie ×1,25 et remontée de 25 % (`--hero-h`, clippée par `overflow:hidden` → le contenu de la photo démarre sous le header), dégradé teal `.hero::before` en haut du hero, ombre douce sous le header.
10. Titre du hero descendu : `.hero-content .container { transform: translateY(14px) }` (l'utilisateur a demandé « quelques pixels » puis « encore un peu plus » — ajustable en une ligne).

## Déploiement — IMPORTANT

- Repo : **github.com/lesteack/victoria**, branche `main`. Identité git locale : `noe@ielsch.net` (configurée au niveau repo car l'email global était absent).
- **Hébergé sur Vercel** (bot `vercel[bot]`), PAS GitHub Pages. Chaque push sur `main` déclenche un déploiement auto (~2 min).
- Vérifier le déploiement sans auth :
  `curl -s https://api.github.com/repos/lesteack/victoria/deployments` puis `.../deployments/<id>/statuses` → attendre `"success"`.
- **Cache iOS Safari** : cause de « bugs » fantômes (JS/CSS désynchronisés). Tous les assets locaux portent `?v=8` — **incrémenter la version à chaque modif de CSS/JS** dans les 5 pages HTML.

## Architecture

```
index.html            homepage : pop-up welcome + hero + stats + 5 sections (.topic), maps embed
programmes.html       23 programmes, filtres (recherche, faculty, campus, level chips)
admissions.html       table des prerequisites + checker interactif + "Coming from France?"
calculators.html      rank score NCEA, estimateur de frais, GPA NZ (échelle 9 points)
student-life.html     3 campus, année en trimestres, Wellington, #accommodation, maps
css/style.css         tout le style, mobile-first, media query ≤780px
js/currency.js        module devise (charger en PREMIER sur chaque page)
js/data.js            dataset programmes/facultés/frais (source de vérité en NZD)
js/main.js            nav mobile, reveal au scroll, switch devise dans le menu mobile (matchMedia ≤780px), pop-up welcome (markup `.welcome-overlay` dans les 5 pages HTML, juste après le skip-link)
js/programmes.js      filtres + re-render sur événement "currencychange"
js/admissions.js      checker (NCEA, IB, A-Levels, Bac français, IELTS)
js/calculators.js     3 calculateurs, re-render sur "currencychange"
img/                  logo + photos Wikimedia Commons (CREDITS.md obligatoire, licences CC)
```

### Hero (homepage) — géométrie importante

- `.hero-media img` : hauteur `calc(var(--hero-h) * 1.25)`, `margin-top: calc(var(--hero-h) * -0.25)` — l'image dépasse en haut et `.hero { overflow: hidden }` la clippe → recadre le ciel pâle du haut de la photo. `--hero-h` : `clamp(300px, 55vh, 520px)` en desktop, `clamp(280px, 42vh, 420px)` ≤780px.
- `.hero::before` = dégradé teal du haut (rgba(12,59,56,0.42) → 0 à 45 %), `.hero::after` = dégradé du bas (0.78 au bas, pour le texte blanc).
- `.hero-content` est ancré en bas (`inset: auto 0 0 0`) : sur mobile le bloc titre+sous-titre+boutons fait ~325px dans un hero de ~358px, donc le h1 est près du HAUT de la photo, pas du bas.
- Ne pas « corriger » le recadrage en enlevant le ×1,25/-0,25 sans vérifier le rendu : le haut de `vuw-kelburn-view.jpg` est un ciel quasi blanc qui sinon se confond avec le fond papier.

## Système devise

- Les montants vivent **en NZD** dans data.js et le HTML (`data-nzd="35000"` pour les prix statiques).
- `Currency.money(nzd)` convertit selon l'état (eur par défaut) ; le toggle dans le header émet un événement `currencychange` que programmes.js et calculators.js écoutent pour re-rendre ; les spans `[data-nzd]` sont mis à jour par `applyStatic()`.
- Persistance : `localStorage["vuw-currency"]`.

## Tests

`tests/` (copié du harnais /tmp) — **45 tests DOM jsdom** + audits puppeteer (Chrome headless) :
- `cd tests && npm i jsdom puppeteer-core && node dom.test.js`
- `node mobile-audit.js` : header 65px, zéro scroll horizontal attendus à 390px.
- jsdom n'implémente pas `matchMedia` → polyfill dans le harnais (déjà dans dom.test.js).
- Évaluer les scripts page via `window.eval` **concaténés en un seul appel** (les `const` top-level ne partagent pas le scope entre deux eval, contrairement aux vraies balises `<script>`).
- Chrome : `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

## Données et sources (collectées sept. 2026, indicatives)

- Fondée 1897 ; QS 2026 #240 ; ~22 000 étudiants dont 4 000 internationaux, 100+ pays ; 3 campus (Kelburn, Pipitea, Te Aro) ; 8 facultés ; ~200 programmes ; trimestres (T1 fin février, T2 juillet, T3 été).
- Admissions : depuis 2021 la UE NCEA garantit l'entrée (fini le rank score 150/180 requis). UE = 14 crédits L3 ×3 matières + 10 literacy + 10 numeracy. IB ≥24, A-Levels ~BBC, **Bac français ≥12/20 (indicatif)**, IELTS 6.0 (aucune bande <5.5).
- Rank score NCEA : meilleurs 80 crédits L3, E=4 M=3 A=2, max 320.
- Frais internationaux/an : UG 25 000–40 000 NZD (BA ~29 400, LLB ~35 350, BE ~37 500) ; PG 30 000–45 000 ; vie 15 000–20 000 ; halls 16 000–21 000 ; NZ International Student Grant 5 000–10 000.
- URLs `wgtn.ac.nz/explore/<slug>` des 23 programmes **vérifiées 200** (bachelor-of-arts, bachelor-of-laws, master-of-design-technology, etc. — liste complète dans js/data.js).
- Images : Wikimedia Commons (CC BY-SA 4.0 / CC BY 2.0 / domaine public) — attribution dans `img/CREDITS.md`, à conserver.

## Conventions de code et design

- Vanilla JS ES5-ish (`var`, IIFE), aucune dépendance runtime, aucun build. Pas de framework.
- Design d'après les skills chargés dans `.vibe/skills/` (suite emilkowalski : `animate`, `apple-design`, `emil-design-eng`, `mobile-native`, `review-animations`, etc. — utilisables via le skill tool après `/reload` si absent) : transitions `transform`/`opacity` seulement, `ease-out` fort `cubic-bezier(0.23,1,0.32,1)` pour les entrées, durées ≤300ms, `prefers-reduced-motion`, hover gated `@media (hover:hover) and (pointer:fine)`, jamais `transition: all`, jamais `scale(0)`.
- A11y : skip-link, `aria-current`, `aria-pressed` sur les toggles, live regions `role="status"`, tous les champs labellisés, focus visible doré, alt descriptifs.
- Mobile : tap targets ≥44px, `touch-action: manipulation`, tap-highlight teal, `theme-color` #0c3b38, brand raccourci « Victoria University » sur mobile (span `.brand-sub` masqué ≤780px).

## Pièges connus

- `.gitignore` exclut : `.DS_Store`, `.vibe/`, `Images/`, `skills pour vibe/`, `skills-main/`, `/*.png` (captures d'écran de l'utilisateur).
- Incrémenter `?v=` des assets après toute modif JS/CSS (les 5 pages HTML).
- Après push, attendre le déploiement Vercel (« success ») avant de dire que c'est en ligne ; le CDN peut servir un 404 en cache ~15 min sur une URL jamais visitée — vérifier avec un query string.
- `tools.file_system.bash` du sandbox n'atteint pas le localhost de la machine ; utiliser le `bash` principal ou `tools.process.start`.
- Wikimédia : les thumbs `upload.wikimedia.org` sont bloqués par robot policy ; passer par `commons.wikimedia.org/wiki/Special:FilePath/<File>?width=1600` avec un User-Agent navigateur.
- Analyser une capture d'écran utilisateur sans vision : `sips -s format bmp` puis parser les pixels en Python (cartes ASCII par luminance, moyennes de couleurs par bandes, diff de rendus puppeteer). Pièges : `sips -z` prend **hauteur puis largeur** ; ignorer les pixels verts saturés épars (artefact de conversion Display P3) ; reproduire le viewport exact (iPhone = 393 CSS px @3x) avant de comparer.

## Ce qui reste ouvert

- Rien de bloquant. Idées suggérées non réalisées : page cachée « notes du présentateur » avec le minutage de l'oral ; affiner si l'utilisateur signale un nouveau problème de rendu Safari iOS (demander une capture et la section exacte).
- Réglages fins éventuels : valeur du `translateY(14px)` du titre hero ; opacité 0.42 du dégradé haut du hero (contraste du h1 blanc ≈ 3.7:1 sur mobile, suffisant pour du texte large gras).
- Déploiement de cette session (25 sept. 2026) : pop-up welcome + crédits footer (v=5), intégration bannière hero (v=6), titre descendu 6px (v=7) puis 14px (v=8) — tous « success » sur Vercel.
