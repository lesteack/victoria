// Programme dataset — Te Herenga Waka—Victoria University of Wellington
// Fees are indicative international tuition estimates (NZD per year), rounded.
// Sources: wgtn.ac.nz and public fee guides, 2026 intake. See img/CREDITS.md and README.

const FACULTIES = [
  { id: "humss", name: "Humanities and Social Sciences", campus: "Kelburn" },
  { id: "science", name: "Science", campus: "Kelburn" },
  { id: "business", name: "Wellington School of Business and Government", campus: "Pipitea" },
  { id: "law", name: "Law", campus: "Pipitea" },
  { id: "ecs", name: "Engineering and Computer Science", campus: "Kelburn" },
  { id: "design", name: "Architecture and Design Innovation", campus: "Te Aro" },
  { id: "education", name: "Education", campus: "Kelburn" },
  { id: "health", name: "Health", campus: "Kelburn" }
];

const PROGRAMMES = [
  { id: "ba", name: "Bachelor of Arts", faculty: "humss", level: "ug", campus: "Kelburn", duration: 3, fee: 29400, slug: "bachelor-of-arts", blurb: "The largest degree at Victoria — 40+ majors from politics and international relations to te reo Māori, history, and languages." },
  { id: "bgs", name: "Bachelor of Global Studies", faculty: "humss", level: "ug", campus: "Kelburn", duration: 3, fee: 30500, slug: "bachelor-of-global-studies", blurb: "An interdisciplinary degree on global challenges — culture, sustainability, trade, and languages, with an international exchange built in." },
  { id: "bmus", name: "Bachelor of Music", faculty: "humss", level: "ug", campus: "Kelburn", duration: 3, fee: 31000, slug: "bachelor-of-music", blurb: "Taught with Te Kōkī New Zealand School of Music. Classical, jazz, sonic arts, or music studies. Audition required.", limited: "Audition" },
  { id: "llb", name: "Bachelor of Laws", faculty: "law", level: "ug", campus: "Pipitea", duration: 4, fee: 35350, slug: "bachelor-of-laws", blurb: "New Zealand's capital-city law school, taught beside Parliament and the courts in the historic Old Government Buildings." },
  { id: "bcom", name: "Bachelor of Commerce", faculty: "business", level: "ug", campus: "Pipitea", duration: 3, fee: 33000, slug: "bachelor-of-commerce", blurb: "Accounting, economics, finance, marketing, information systems, or public policy — minutes from Wellington's business district." },
  { id: "bsc", name: "Bachelor of Science", faculty: "science", level: "ug", campus: "Kelburn", duration: 3, fee: 34000, slug: "bachelor-of-science", blurb: "Majors from chemistry and physics to ecology, data science, psychology, and computer science." },
  { id: "bcs", name: "Bachelor of Science (Computer Science)", faculty: "ecs", level: "ug", campus: "Kelburn", duration: 3, fee: 35000, slug: "bachelor-of-science-in-computer-science", blurb: "Algorithms, AI, graphics, and software engineering in the School of Engineering and Computer Science." },
  { id: "be", name: "Bachelor of Engineering", faculty: "ecs", level: "ug", campus: "Kelburn", duration: 4, fee: 37500, slug: "bachelor-of-engineering", blurb: "Accredited four-year engineering degree — software, network, cyber, electronics, or renewable energy specialisations." },
  { id: "bas", name: "Bachelor of Architectural Studies", faculty: "design", level: "ug", campus: "Te Aro", duration: 3, fee: 36000, slug: "bachelor-of-architectural-studies", blurb: "Architecture, interior architecture, and landscape architecture in the heart of Wellington's design district.", limited: "Portfolio + interview" },
  { id: "bbsc", name: "Bachelor of Building Science", faculty: "design", level: "ug", campus: "Te Aro", duration: 3, fee: 36000, slug: "bachelor-of-building-science", blurb: "Sustainable building science, project management, and digital technologies for the built environment." },
  { id: "bdi", name: "Bachelor of Design Innovation", faculty: "design", level: "ug", campus: "Te Aro", duration: 3, fee: 35000, slug: "bachelor-of-design-innovation", blurb: "Design for culture and community, or media design — animation, game design, and interactive media." },
  { id: "btchg", name: "Bachelor of Teaching (Primary)", faculty: "education", level: "ug", campus: "Kelburn", duration: 3, fee: 32000, slug: "bachelor-of-teaching-primary", blurb: "Teacher education with placements in Wellington schools from the first year." },
  { id: "bhealth", name: "Bachelor of Health", faculty: "health", level: "ug", campus: "Kelburn", duration: 3, fee: 35000, slug: "bachelor-of-health", blurb: "Health promotion, health policy, Māori and Pasifika health, and population health." },

  { id: "ma", name: "Master of Arts", faculty: "humss", level: "pg", campus: "Kelburn", duration: 2, fee: 33000, slug: "master-of-arts", blurb: "Advanced study and research across the humanities and social sciences." },
  { id: "mpp", name: "Master of Public Policy", faculty: "business", level: "pg", campus: "Pipitea", duration: 2, fee: 36000, slug: "master-of-public-policy", blurb: "Public policy in the capital — taught beside the public service, with MPs and policy leaders as guest lecturers." },
  { id: "mpac", name: "Master of Professional Accounting", faculty: "business", level: "pg", campus: "Pipitea", duration: 1.5, fee: 37000, slug: "master-of-professional-accounting", blurb: "A conversion qualification for CAANZ/CPA accreditation, open to graduates of any discipline." },
  { id: "llm", name: "Master of Laws", faculty: "law", level: "pg", campus: "Pipitea", duration: 1, fee: 36000, slug: "master-of-laws", blurb: "One-year taught LLM in commercial, public, or international law." },
  { id: "me", name: "Master of Engineering", faculty: "ecs", level: "pg", campus: "Kelburn", duration: 1.5, fee: 38000, slug: "master-of-engineering", blurb: "Coursework and project-based engineering master's with industry connections." },
  { id: "mdt", name: "Master of Design Technology", faculty: "design", level: "pg", campus: "Te Aro", duration: 2, fee: 40000, slug: "master-of-design-technology", blurb: "Film, animation, and game technology — Weta Workshop and Weta FX sit on its advisory board." },
  { id: "march", name: "Master of Architecture", faculty: "design", level: "pg", campus: "Te Aro", duration: 2, fee: 38000, slug: "master-of-architecture", blurb: "Professional architecture qualification after the BAS, with design-led research studios." },
  { id: "mtchg", name: "Master of Teaching", faculty: "education", level: "pg", campus: "Kelburn", duration: 1.5, fee: 34000, slug: "master-of-teaching", blurb: "Graduate initial teacher education for primary or secondary teaching." },
  { id: "mph", name: "Master of Public Health", faculty: "health", level: "pg", campus: "Kelburn", duration: 1.5, fee: 36000, slug: "master-of-public-health", blurb: "Population health, epidemiology, and health systems policy." },
  { id: "msc", name: "Master of Science", faculty: "science", level: "pg", campus: "Kelburn", duration: 2, fee: 34000, slug: "master-of-science", blurb: "Research-based science master's across the faculty's 40+ research institutes." }
];

// Fee ranges per faculty, for the fee estimator (indicative, NZD/year)
const FEE_RANGES = {
  humss:    { ug: [29000, 33000], pg: [32000, 36000] },
  science:  { ug: [33000, 38000], pg: [33000, 38000] },
  business: { ug: [32000, 36000], pg: [35000, 42000] },
  law:      { ug: [34000, 37000], pg: [35000, 39000] },
  ecs:      { ug: [34000, 39000], pg: [36000, 42000] },
  design:   { ug: [34000, 38000], pg: [37000, 42000] },
  education:{ ug: [30000, 34000], pg: [32000, 36000] },
  health:   { ug: [33000, 38000], pg: [34000, 38000] }
};
