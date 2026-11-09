// Builds the static CarePlus website into ./site (plain HTML/CSS/JS, no dependencies).
// Usage: node build.mjs
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOGIN_URL, CONTACT_EMAIL, TAGLINE } from "./src/config.mjs";
import { MARKETS, GROUPS, GOALS, STATS, PILLARS, PLANS, ADDONS } from "./src/content.mjs";
import { icon, logo } from "./src/icons.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "site");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const href = (h) => (h === "LOGIN" ? LOGIN_URL : h);
const page = (m) => `${m.slug}.html`;
const byGroup = (g) => MARKETS.filter((m) => m.group === g);
const signIn = (cls = "btn btn-text", label = "Sign in") => `<a class="${cls}" href="${esc(LOGIN_URL)}" rel="noopener">${label}</a>`;
const plain = (html) => html.replace(/<[^>]+>/g, "");

// ───────────────────────────── Shared layout ─────────────────────────────
function header(current) {
  const megaCols = GROUPS.map(
    (g) => `<div><h3>${g.label}</h3><ul>${byGroup(g.id)
      .map((m) => `<li><a class="mega-item" href="${page(m)}">${icon(m.icon)}<span><b>${m.name}</b><small>${m.card.bullets.slice(0, 2).join(" · ")}</small></span></a></li>`)
      .join("")}</ul></div>`
  ).join("");
  const drawerGroups = GROUPS.map(
    (g) => `<div><h3>${g.label}</h3>${byGroup(g.id).map((m) => `<a class="d-link" href="${page(m)}">${icon(m.icon)}${m.name}</a>`).join("")}</div>`
  ).join("");
  const nav = (key, label, file) => `<a class="nav-link" href="${file}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header">
  <div class="wrap nav">
    <a href="index.html" aria-label="CarePlus home">${logo()}</a>
    <nav class="nav-links" aria-label="Main">
      <button class="nav-link" id="solutions-btn" aria-expanded="false" aria-controls="solutions-menu"${current === "solutions" ? ' aria-current="page"' : ""}>Solutions ${icon("chevron")}</button>
      ${nav("platform", "Platform", "platform.html")}
      ${nav("compliance", "Compliance", "compliance.html")}
      ${nav("pricing", "Pricing", "pricing.html")}
    </nav>
    <div class="nav-actions">
      ${signIn()}
      <a class="btn btn-primary" href="get-started.html">Get started ${icon("arrow")}</a>
      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">${icon("menu", "i-open")}${icon("close", "i-close").replace("<svg", "<svg hidden")}</button>
    </div>
  </div>
  <div class="mega" id="solutions-menu" hidden>
    <div class="wrap mega-inner">
      ${megaCols}
      <div class="mega-aside"><span class="display">Not sure where you fit?</span><p>Tell us what you do and we'll show you the parts of CarePlus built for you.</p><a class="btn btn-light" href="get-started.html">Find your fit ${icon("arrow")}</a></div>
    </div>
  </div>
  <div class="drawer" id="drawer" hidden>
    <div class="wrap drawer-inner">
      ${drawerGroups}
      <div><h3>CarePlus</h3><a class="d-link" href="platform.html">${icon("layers")}Platform</a><a class="d-link" href="compliance.html">${icon("shield")}Compliance</a><a class="d-link" href="pricing.html">${icon("wallet")}Pricing</a></div>
      <div class="btn-row"><a class="btn btn-primary" href="get-started.html">Get started ${icon("arrow")}</a>${signIn("btn btn-outline", "Sign in")}</div>
    </div>
  </div>
</header>`;
}

const scallopPath = (() => {
  // 12-lobed rounded "badge" shape like the reference design's decorative stars.
  const n = 12, R = 100, r = 86, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n, rad = i % 2 ? r : R;
    pts.push([125 + rad * Math.cos(a), 125 + rad * Math.sin(a)]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= pts.length; i++) {
    const p = pts[i % pts.length], q = pts[(i - 1) % pts.length];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const out = i % 2 ? 1.18 : 0.9;
    d += ` Q${(125 + (mx - 125) * out).toFixed(1)},${(125 + (my - 125) * out).toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }
  return d + "Z";
})();

function ctaBand({ title, text, primary, secondary }) {
  return `<section class="cta-band" aria-labelledby="cta-title">
  <svg class="scallop s1" viewBox="0 0 250 250" aria-hidden="true"><path d="${scallopPath}"/></svg>
  <svg class="scallop s2" viewBox="0 0 250 250" aria-hidden="true"><path d="${scallopPath}"/></svg>
  <div class="wrap">
    <h2 class="display" id="cta-title">${title}</h2>
    <p>${text}</p>
    <div class="btn-row">${primary}${secondary || ""}</div>
  </div>
</section>`;
}

function footer() {
  const col = (title, links) => `<div class="f-col"><h3>${title}</h3><ul>${links.map(([l, h]) => `<li><a href="${esc(h)}"${h.startsWith("http") ? ' rel="noopener"' : ""}>${l}</a></li>`).join("")}</ul></div>`;
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="f-top">
      <div><a href="index.html" aria-label="CarePlus home">${logo("on-dark")}</a><p>${TAGLINE} Built in the UK for regulated care, with UK data residency and a full audit trail.</p></div>
      ${col("Care providers", byGroup("providers").map((m) => [m.name, page(m)]))}
      ${col("Healthcare", byGroup("healthcare").map((m) => [m.name, page(m)]))}
      ${col("Workforce and partners", [...byGroup("workforce"), ...byGroup("partners")].map((m) => [m.name, page(m)]))}
      ${col("CarePlus", [["Platform", "platform.html"], ["Compliance and security", "compliance.html"], ["Pricing", "pricing.html"], ["Get started", "get-started.html"], ["Sign in", LOGIN_URL]])}
    </div>
  </div>
  <div class="f-word" aria-hidden="true">CarePlus</div>
  <div class="wrap"><div class="f-base"><span>© 2026 CarePlus. All rights reserved.</span><span>Software that supports care teams. People make every care decision.</span></div></div>
</footer>`;
}

function doc({ title, description, current, body }) {
  const head = `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#014a4b">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Antonio:wght@500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/styles.css">`;
  const content = `${header(current)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/main.js"></script>`;
  return `<!doctype html>
<html lang="en-GB" data-contact="${esc(CONTACT_EMAIL)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
${content}
</body>
</html>
`;
}

// ───────────────────────────── Pieces ─────────────────────────────
// Realistic photographs only: no product screenshots, labels or logos. Same set as the live app.
const IMG_ALT = {
  hero: "A carer kneels beside a smiling older woman in a bright care home lounge while a colleague serves tea",
  "nursing-homes": "A nurse explains morning medication to an older man resting in his room",
  "residential-care": "A care assistant helps residents with a jigsaw puzzle in a care home dining room",
  "home-care": "A home carer makes a cup of tea with an older man in his kitchen",
  "supported-living": "A young man cooks pasta in his own flat while his support worker looks on",
  "mental-health": "A mental health nurse talks quietly with a young woman in a calm lounge",
  "learning-disability": "A young man and his support worker plant flowers together in a garden",
  childcare: "A nursery practitioner reads a picture book to a group of toddlers",
  "recruitment-agencies": "A recruitment consultant shakes hands with a newly placed nurse",
  "care-professionals": "A smiling care worker in a care home corridor",
  hospitals: "A hospital nurse talks an older woman in a wheelchair through going home",
  clinics: "A GP listens to an older man and his son during a medication review",
  laboratories: "A biomedical scientist places sample tubes into a rack",
  pharmacies: "A pharmacist hands a prescription bag to a care worker",
  suppliers: "A care home manager checks a delivery of supplies at the front door",
  technicians: "An engineer services a ceiling hoist while the care home manager watches",
  commissioners: "Commissioners and a care home manager review reports around a table",
  team: "A care home manager runs a morning handover with her team",
  manager: "A registered manager and a senior nurse review records together",
};
const img = (name, eager = false) => `<img src="assets/img/${name}.jpg" alt="${esc(IMG_ALT[name])}" loading="${eager ? "eager" : "lazy"}">`;

/** Every request button opens the form with the right market and goal already chosen. */
const requestPath = (goal, slug) => `get-started.html?${slug ? `for=${slug}&` : ""}goal=${goal}#request`;
const isOrg = (m) => m.slug !== "care-professionals";
const btn = (cls, to, label, arrow = false) =>
  `<a class="btn ${cls}" href="${esc(href(to))}"${to === "LOGIN" ? ' rel="noopener"' : ""}>${label}${arrow ? " " + icon("arrow") : ""}</a>`;

function marketCard(m, hiddenByDefault) {
  return `<a class="m-card" href="${page(m)}" data-group="${m.group}"${hiddenByDefault ? " hidden" : ""}>
  <div class="m-media">${img(m.img)}</div>
  <div class="m-body">
    <h3>${m.name}</h3>
    <p>${m.card.summary}</p>
    <ul class="m-list">${m.card.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    <span class="m-more">Explore services ${icon("arrow")}</span>
  </div>
</a>`;
}

// ───────────────────────────── Home ─────────────────────────────
const PAINS = [
  ["file", "Paper that hides problems", "Missed signatures on MAR charts and handwritten notes only come to light at the end of the month, or during an inspection."],
  ["phone", "Shifts filled by text message", "Rotas are rebuilt every week and gaps are covered with late-night calls and group chats."],
  ["clipboard", "Inspections that take over", "Evidence lives in folders, inboxes and people's heads, so getting ready takes weeks."],
  ["layers", "Systems that don't talk", "Care records, rotas, payroll and ordering sit in different places, and someone has to join them up by hand."],
];
const HOW = [
  ["Tell us about your service", "Choose your part of care and tell us what you need. Register, or book a demo first if you'd like to see it."],
  ["We set CarePlus up with you", "We load your people, places and records, and invite your team. Each person gets the access their role needs."],
  ["Everyone works from one record", "Managers, nurses, carers, families and partners each see what they need, on a computer, tablet or phone."],
];
const LIMIT = 6;

function home() {
  const first = GROUPS[0].id;
  const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-head">
      <span class="eyebrow">${icon("heart")}For care homes, home care, healthcare and the people behind them</span>
      <h1 class="display h-hero">Safe, timely care starts here.</h1>
    </div>
    <div class="hero-stage">
      ${img("hero", true)}
      <div class="hero-copy">
        <h2 class="display h-xl">Less paperwork. <em>More time for care.</em></h2>
        <div style="display:grid;gap:28px">
          <p>Your team didn't come into care to chase paperwork. CarePlus brings residents, medicines, rotas, compliance and suppliers into one place, so the people in your care get safe, timely support every day.</p>
          <div class="btn-row">${btn("btn-primary", requestPath("register"), "Register your organisation", true)}${btn("btn-ghost-light", requestPath("demo"), "Book a demo")}</div>
          <a class="hero-link" href="#solutions">Or explore services for your part of care ${icon("chevron")}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="pain-title">
  <div class="wrap">
    <div class="s-head">
      <span class="kicker">Sound familiar?</span>
      <h2 class="display h-xl" id="pain-title">Care is hard enough. The admin shouldn't make it harder.</h2>
      <p class="lede">Whether you run a nursing home, a home care branch or a nursery, the same things get in the way of good care.</p>
    </div>
    <div class="pains">${PAINS.map(([i, t, d]) => `<div class="pain">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
    <p class="bridge">CarePlus puts all of it in one place, shaped for your part of care. <a href="#solutions">Find yours below ${icon("chevron")}</a></p>
  </div>
</section>

<section class="section" id="solutions" style="padding-top:0" aria-labelledby="sol-title">
  <div class="wrap">
    <div class="s-head-row">
      <div class="s-head">
        <span class="kicker">Built around your part of care</span>
        <h2 class="display h-xl" id="sol-title">Find the CarePlus made for you</h2>
        <p class="lede">Pick your area to see the problems we solve for you, the services you can use today and how to get started.</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Choose your area of care">
        ${GROUPS.map((g) => `<button class="tab" role="tab" aria-selected="${g.id === first}" data-tab="${g.id}" data-label="${esc(g.label)}" data-blurb="${esc(g.blurb)}">${g.label}</button>`).join("")}
      </div>
    </div>
    <p class="tab-blurb" id="tab-blurb">${GROUPS[0].blurb}</p>
    <div class="cards" id="market-cards">
      ${GROUPS.flatMap((g) => byGroup(g.id).map((m, i) => marketCard(m, g.id !== first || i >= LIMIT))).join("")}
    </div>
    <div class="cards-foot">
      <button class="btn btn-outline" id="see-all" data-limit="${LIMIT}" hidden>See all</button>
      <span>Not sure where you fit? <a href="get-started.html">Tell us what you do</a> and we'll point you in the right direction.</span>
    </div>
  </div>
</section>

<section class="section band-soft" aria-labelledby="how-home-title">
  <div class="wrap split">
    <div>
      <span class="kicker">How it works</span>
      <h2 class="display h-xl" id="how-home-title" style="margin-top:14px">Up and running without the upheaval</h2>
      <p class="lede" style="margin-top:20px">You don't have to change how you care. We fit CarePlus around the way your service already works.</p>
      <ol class="steps" style="margin-top:28px">${HOW.map(([t, d]) => `<li class="step"><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
      <div class="btn-row" style="margin-top:32px">${btn("btn-primary", requestPath("onboard"), "Start onboarding", true)}${btn("btn-outline", requestPath("demo"), "Book a demo")}</div>
    </div>
    <div class="split-media">${img("team")}</div>
  </div>
</section>

<section class="section" aria-labelledby="pl-title">
  <div class="wrap split split-rev">
    <div class="split-media">${img("manager")}</div>
    <div>
      <span class="kicker">What you get</span>
      <h2 class="display h-xl" id="pl-title" style="margin-top:14px">One record for care, compliance and your workforce</h2>
      <p class="lede" style="margin-top:20px">Once you're set up, every team works from the same information, and each person sees only what their role allows.</p>
      <div class="f-list">${PILLARS.slice(0, 4).map((p) => `<div class="f-item">${icon(p.icon)}<h3>${p.t}</h3><p>${p.d}</p></div>`).join("")}</div>
      <div class="btn-row" style="margin-top:36px">${btn("btn-outline", "platform.html", "See everything CarePlus does", true)}</div>
    </div>
  </div>
</section>

<section class="band section" aria-labelledby="proof-title">
  <div class="wrap proof">
    <div class="proof-left">
      <h2 class="display h-xl" id="proof-title">Built for the reality of regulated care.</h2>
      <p class="lede">CarePlus already runs nursing homes, home care branches, nurseries, agencies and supported living services. Under every one of them sit the same safeguards: people make the decisions, records can't be quietly changed, and your data stays yours.</p>
      <div class="btn-row">${btn("btn-ghost-light", "compliance.html", "How we keep care safe")}</div>
    </div>
    <div class="proof-grid">
      <span class="kicker">CarePlus today</span>
      ${STATS.map((s) => `<div class="stat"><b>${s.n}</b><span>${s.l}</span></div>`).join("")}
    </div>
  </div>
</section>

${ctaBand({
  title: "Ready to give your team more time for care?",
  text: "Register your organisation and we'll get you set up. Want to see it first? Book a demo. Already using CarePlus? Sign in.",
  primary: btn("btn-light", requestPath("register"), "Register your organisation", true),
  secondary: btn("btn-ghost-light", requestPath("demo"), "Book a demo") + signIn("btn btn-ghost-light", "Sign in"),
})}`;
  return doc({ title: "CarePlus | One platform for care, compliance and workforce", description: "CarePlus brings residents, medicines, rotas, compliance and suppliers into one place for every part of UK care.", current: "home", body });
}

// ───────────────────────────── Market pages ─────────────────────────────
function marketPage(m) {
  const group = GROUPS.find((g) => g.id === m.group);
  const isLogin = m.cta.href === "LOGIN";
  const primaryTo = isLogin ? "LOGIN" : m.cta.href ?? requestPath(m.cta.goal, m.slug);
  const toStatic = (h) => h.replace(/^\/pricing$/, "pricing.html").replace(/^\/get-started/, "get-started.html");
  const secondaryHero = isOrg(m)
    ? btn("btn-outline", requestPath("demo", m.slug), "Book a demo")
    : btn("btn-outline", toStatic(m.cta.secondary?.href ?? "/get-started"), "Get help joining");
  const ctaSecondary = m.cta.secondary
    ? btn("btn-ghost-light", toStatic(m.cta.secondary.href), m.cta.secondary.label)
    : isOrg(m) ? btn("btn-ghost-light", requestPath("demo", m.slug), "Book a demo") : "";
  const related = MARKETS.filter((o) => o.group === m.group && o.slug !== m.slug).slice(0, 3);
  const fill = related.length < 3 ? MARKETS.filter((o) => o.group !== m.group).slice(0, 3 - related.length) : [];

  const body = `
<section class="mp-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb" style="margin-bottom:28px"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="index.html#solutions">${group.label}</a><span aria-hidden="true">/</span><span aria-current="page">${m.name}</span></nav>
    <div class="mp-grid">
      <div class="mp-copy">
        <span class="eyebrow">${icon(m.icon)}${m.hero.eyebrow}</span>
        <h1 class="display">${m.hero.title}</h1>
        <p class="lede">${m.hero.lede}</p>
        <div class="btn-row">${btn("btn-primary", primaryTo, m.cta.label, true)}${secondaryHero}</div>
        <a class="text-link" href="#services">Explore services for ${m.name.toLowerCase()} ${icon("chevron")}</a>
      </div>
      <div class="mp-visual has-photo">${img(m.img, true)}</div>
    </div>
  </div>
</section>

<section aria-labelledby="who-title">
  <div class="wrap">
    <div class="who">
      <div><span class="kicker">Who this is for</span><h2 class="display h-md" id="who-title" style="margin-top:10px">${m.name}</h2><p>${m.audience.intro}</p></div>
      <ul class="chips">${m.audience.roles.map((r) => `<li class="chip">${icon("check")}${r}</li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="pb-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">Sound familiar?</span><h2 class="display h-lg" id="pb-title">What gets in the way, and how CarePlus helps</h2><p class="lede">These are the problems we hear most often from ${m.name.toLowerCase()}, and how CarePlus solves each one.</p></div>
    <div class="problems">${m.problems.map((p) => `<article class="problem"><div class="pb"><small>The problem</small><p>${p.p}</p></div><div class="ps"><small>With CarePlus</small><p>${p.s}</p></div></article>`).join("")}</div>
  </div>
</section>

<section class="section" id="services" style="padding-top:0" aria-labelledby="ft-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">Services you can use today</span><h2 class="display h-lg" id="ft-title">Everything that makes those fixes possible</h2><p class="lede">Each of these is already built and working for services like yours.</p></div>
    <div class="features">${m.features.map((f) => `<div class="feat">${icon(f.icon)}<h3>${f.t}</h3><p>${f.d}</p></div>`).join("")}</div>
  </div>
</section>

<section class="band section" aria-labelledby="bn-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker" style="color:rgba(255,255,255,.75)">What changes for you</span><h2 class="display h-lg" id="bn-title">What this means for your day</h2></div>
    <div class="benefits">${m.benefits.map((b) => `<div class="benefit"><h3>${b.t}</h3><p>${b.d}</p></div>`).join("")}</div>
    <div class="btn-row" style="margin-top:40px">${btn("btn-light", primaryTo, m.cta.label, true)}</div>
  </div>
</section>

<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">Getting started</span><h2 class="display h-lg" id="how-title">From your first conversation to everyday use</h2><p class="lede">Here's how you'll join CarePlus, and where you'll use it once you're in.</p></div>
    <div class="how">
      <ol class="steps">${m.access.steps.map((s) => `<li class="step"><h3>${s.t}</h3><p>${s.d}</p></li>`).join("")}</ol>
      <aside class="channels" aria-label="Where you access CarePlus">
        <h3 class="k">Where you'll use it</h3>
        ${m.access.channels.map((c) => `<div class="channel">${icon(c.icon)}<b>${c.t}</b><span>${c.d}</span></div>`).join("")}
        ${isLogin ? "" : btn("btn-primary", primaryTo, m.cta.label)}
        ${signIn("btn btn-outline", `${icon("login")} Already invited? Sign in`)}
      </aside>
    </div>
  </div>
</section>

${m.roadmap ? `<section class="section" style="padding-top:0" aria-labelledby="rm-title">
  <div class="wrap">
    <div class="roadmap">
      <div><span class="soon">${icon("sparkle")}Early access</span><h2 class="display h-lg" id="rm-title" style="margin-top:16px">Coming next for ${m.name.toLowerCase()}</h2><p class="lede" style="margin-top:16px">${m.roadmap.intro}</p></div>
      <ul class="rm-list">${m.roadmap.items.map((r) => `<li><b>${r.t}</b><span>${r.d}</span><small>In development</small></li>`).join("")}</ul>
    </div>
  </div>
</section>` : ""}

${ctaBand({ title: m.cta.title, text: m.cta.text, primary: btn("btn-light", primaryTo, m.cta.label, true), secondary: ctaSecondary })}

<section class="section" aria-labelledby="rel-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-md" id="rel-title">Explore other parts of CarePlus</h2></div>
    <div class="related">${[...related, ...fill].map((o) => `<a class="rel" href="${page(o)}">${icon(o.icon)}${o.name}${icon("arrow")}</a>`).join("")}</div>
  </div>
</section>`;
  return doc({ title: `CarePlus for ${m.name}`, description: plain(m.hero.lede), current: "solutions", body });
}

// ───────────────────────────── Platform ─────────────────────────────
const PILLAR_DETAIL = {
  "Medication you can trust": ["eMAR and medication rounds", "Controlled drugs register", "Stock ledger and cycle continuity", "Transitions of care", "Printable MAR and inspection pack"],
  "Workforce and rota": ["Shifts, rota and route planning", "Attendance, timesheets and payroll", "Training, competencies and skills matrix", "Supervisions and appraisals", "Hiring and shadow shifts"],
  "Compliance and governance": ["Compliance dashboard and framework", "Audits and inspections", "Incidents and investigations", "Risk register and statutory notifications", "Approvals inbox and permits"],
  "Stock, equipment and suppliers": ["Stock levels, expiry and stocktake", "Equipment passports with QR", "Work orders and technicians", "Procurement, catalogue and cart", "Group buying"],
  "Finance and billing": ["Funding plans", "Client and resident billing", "Payroll settings and pay runs", "Commissions", "Subscription billing"],
  "AI that assists, never decides": ["AI Assist with 23 tasks", "Manager copilot", "Executive dashboards", "Management summaries", "AI-assisted badges on every output"],
};

function platform() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("layers")}The CarePlus platform</span>
  <h1 class="display">One record for care, compliance and your workforce</h1>
  <p class="lede">Whatever part of care you work in, CarePlus runs on the same core: one shared record, the same safeguards and the same access model, shaped around your service.</p>
  <div class="btn-row">${btn("btn-primary", requestPath("register"), "Register your organisation", true)}${btn("btn-outline", requestPath("demo"), "Book a demo")}</div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="pill-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">What's inside</span><h2 class="display h-lg" id="pill-title">Six areas, one place to run them</h2></div>
    <div class="pillars">${PILLARS.map((p) => `<div class="pillar">${icon(p.icon)}<h3>${p.t}</h3><p>${p.d}</p><ul>${PILLAR_DETAIL[p.t].map((d) => `<li>${icon("check")}${d}</li>`).join("")}</ul></div>`).join("")}</div>
  </div>
</section>
<section class="section band-soft" aria-labelledby="ways-title">
  <div class="wrap split">
    <div>
      <span class="kicker">Everyone gets the right door</span>
      <h2 class="display h-lg" id="ways-title" style="margin-top:14px">The same record, seen the right way by each person</h2>
      <div class="f-list">
        <div class="f-item">${icon("layers")}<h3>Web app</h3><p>For managers, nurses, coordinators, finance and office teams, on desktop and tablet.</p></div>
        <div class="f-item">${icon("phone")}<h3>Carer mobile app</h3><p>Today's work, visits and sync, and it keeps working without signal.</p></div>
        <div class="f-item">${icon("users")}<h3>Family portals</h3><p>Updates for relatives, parents and advocates, shared with consent.</p></div>
        <div class="f-item">${icon("building")}<h3>Partner and commissioner portals</h3><p>Scoped access for contractors, suppliers and commissioners.</p></div>
      </div>
    </div>
    <div class="split-media">${img("team")}</div>
  </div>
</section>
<section class="section" aria-labelledby="mk-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-lg" id="mk-title">Find the CarePlus made for you</h2></div>
    <div class="related" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${MARKETS.map((o) => `<a class="rel" href="${page(o)}">${icon(o.icon)}${o.name}${icon("arrow")}</a>`).join("")}</div>
  </div>
</section>
${ctaBand({ title: "See it working for your service", text: "Register your organisation and we'll set you up, or book a demo tailored to your part of care.", primary: btn("btn-light", requestPath("register"), "Register your organisation", true), secondary: btn("btn-ghost-light", requestPath("demo"), "Book a demo") })}`;
  return doc({ title: "CarePlus Platform", description: "The CarePlus platform: medication, workforce, compliance, operations, finance and AI on one shared record.", current: "platform", body });
}

// ───────────────────────────── Compliance ─────────────────────────────
const SAFEGUARDS = [
  ["shield", "Your data, kept separate", "Every organisation's data is isolated in the database, not just hidden in the interface."],
  ["users", "The right access for every role", "13 core roles and 6 actions (view, create, edit, approve, delete, export) per module, the same in every care setting."],
  ["lock", "Overrides with limits", "Per-person overrides expire, and a deny always wins. Billing, payroll settings and owner roles can't be granted by override."],
  ["clipboard", "A full audit trail", "Changes are audited, access changes go to an append-only log, and edits record a reason."],
  ["pill", "Medication safeguards", "Administration records can't be overwritten, controlled drugs need two witnesses, and high-risk medicines can be witnessed remotely."],
  ["hand", "People make the decisions", "CarePlus never prescribes, sets doses or makes clinical decisions. AI output is marked and needs a person's approval."],
  ["eye", "Private photos", "Photos are stored privately and shown through links that expire within five minutes. Children's photos need recorded consent."],
  ["qr", "QR codes made in-house", "Equipment QR codes are generated inside CarePlus. Asset details are never sent to outside services."],
  ["building", "UK data residency", "All plans keep your data in the UK, with record retention suited to CQC inspection."],
];

function compliance() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("shield")}Compliance and security</span>
  <h1 class="display">Safeguards built in from day one</h1>
  <p class="lede">Care is regulated, and the people in it deserve protection. These safeguards apply to every organisation on CarePlus, in every care setting.</p>
</section>
<section class="section" style="padding-top:0" aria-label="Safeguards">
  <div class="wrap"><div class="trust">${SAFEGUARDS.map(([i, t, d]) => `<div>${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join("")}</div></div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="insp-title">
  <div class="wrap split">
    <div>
      <span class="kicker">Ready for inspection every day</span>
      <h2 class="display h-lg" id="insp-title" style="margin-top:14px">Evidence that builds itself as you work</h2>
      <div class="f-list">
        <div class="f-item">${icon("clipboard")}<h3>Compliance framework</h3><p>Map your evidence to the standards you're inspected against.</p></div>
        <div class="f-item">${icon("file")}<h3>Evidence and inspection packs</h3><p>Medication and service evidence packs, ready in minutes.</p></div>
        <div class="f-item">${icon("bell")}<h3>Statutory notifications</h3><p>Track what needs notifying, by when, and what was sent.</p></div>
        <div class="f-item">${icon("shield")}<h3>Staff compliance</h3><p>DBS checks, training and competencies, with bookings blocked when something lapses.</p></div>
      </div>
    </div>
    <div class="split-media">${img("manager")}</div>
  </div>
</section>
${ctaBand({ title: "Walk through it with us", text: "We'll show you access control, audit trails and inspection tools in detail, using a service like yours.", primary: btn("btn-light", requestPath("demo"), "Book a demo", true), secondary: btn("btn-ghost-light", requestPath("register"), "Register your organisation") })}`;
  return doc({ title: "CarePlus Compliance", description: "How CarePlus protects people, records and data: isolation, access control, audit trails and medication safeguards.", current: "compliance", body });
}

// ───────────────────────────── Pricing ─────────────────────────────
function pricing() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("wallet")}Pricing</span>
  <h1 class="display">Simple plans, priced per branch</h1>
  <p class="lede">These are our home care plans. For nursing, residential, supported living, mental health, learning disability, childcare and agency workspaces, we'll put together a quote that fits your service.</p>
</section>
<section class="section" style="padding-top:0" aria-labelledby="plans-title">
  <div class="wrap">
    <div class="s-head-row" style="margin-bottom:8px"><h2 class="display h-md" id="plans-title">Home care plans</h2>
      <div class="cycle" role="group" aria-label="Billing cycle"><button data-cycle="monthly" aria-pressed="true">Monthly</button><button data-cycle="annual" aria-pressed="false">Annual (2 months free)</button></div>
    </div>
    <div class="plans">
      ${PLANS.map((p) => `<article class="plan${p.featured ? " featured" : ""}">
        ${p.featured ? '<span class="badge">Most popular</span>' : ""}
        <h3>${p.name}</h3><p class="tag">${p.tag}</p>
        <p class="price"><b data-monthly="${p.price}" data-annual="${p.annual}">£${p.price.toLocaleString("en-GB")}</b><br><span data-per>per branch / month</span></p>
        <dl class="limits"><div><dt>Carer and office seats</dt><dd>${p.seats}</dd></div><div><dt>Active service users</dt><dd>${p.clients}</dd></div><div><dt>Branches</dt><dd>${p.branches}</dd></div></dl>
        <ul class="caps">${p.caps.map((c) => `<li>${icon("check")}${c}</li>`).join("")}</ul>
        ${btn(p.featured ? "btn-primary" : "btn-outline", requestPath("register", "home-care"), `Choose ${p.name}`)}
      </article>`).join("")}
    </div>
    <p class="note">All plans include UK data residency, audit trails and record retention suited to CQC inspection. Prices exclude VAT. Only organisation owners, admins and the registered manager can change plans.</p>
  </div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="add-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-md" id="add-title">Add-ons</h2></div>
    <div class="addons">${ADDONS.map((a) => `<div class="addon"><b>${a.name}</b><span class="p">${a.price}</span><p>${a.d}</p></div>`).join("")}</div>
  </div>
</section>
${ctaBand({ title: "Need a quote for another care setting?", text: "Tell us about your service and we'll put together pricing that fits.", primary: btn("btn-light", requestPath("quote"), "Request a quote", true), secondary: btn("btn-ghost-light", requestPath("demo"), "Book a demo") })}`;
  return doc({ title: "CarePlus Pricing", description: "CarePlus home care plans from £149 per branch per month, plus add-ons and quotes for other care settings.", current: "pricing", body });
}

// ───────────────────────────── Get started ─────────────────────────────
function getStarted() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("sparkle")}Get started</span>
  <h1 class="display">Let's find the right CarePlus for you</h1>
  <p class="lede">Tell us who you are below and we'll take it from there. Not sure yet? Pick your area first and explore the services built for you.</p>
</section>
<section class="section" style="padding-top:0" id="request" aria-labelledby="req-title">
  <div class="wrap form-wrap">
    <div class="form-side">
      <h2 class="display h-lg" id="req-title">Register, start onboarding or book a demo</h2>
      <p class="lede">CarePlus accounts are set up by our team, so every organisation starts with the right people, roles and records. Send us a few details and we'll reply to arrange the next step.</p>
      <ul class="next-steps">
        <li>${icon("check")}We reply to arrange your setup or demo</li>
        <li>${icon("check")}We set up your organisation with you</li>
        <li>${icon("check")}You invite your team and start working</li>
      </ul>
      <div class="signin"><b>Already use CarePlus?</b><span style="color:var(--muted)">Sign in with the email address you were invited with.</span>${signIn("btn btn-primary", `Sign in ${icon("arrow")}`)}</div>
    </div>
    <div>
      <form class="req" id="request-form" novalidate>
        <div class="field"><label for="f-goal">I'd like to</label>
          <select id="f-goal">${GOALS.map((g) => `<option value="${g.key}">${g.label}</option>`).join("")}</select></div>
        <div class="field"><label for="f-segment">We are</label>
          <select id="f-segment">${GROUPS.map((g) => `<optgroup label="${esc(g.label)}">${byGroup(g.id).map((m) => `<option value="${m.slug}" data-goal="${m.cta.goal}">${m.name}</option>`).join("")}</optgroup>`).join("")}</select></div>
        <div class="row2">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" autocomplete="name" required><span class="err" id="f-name-err" hidden>Enter your name.</span></div>
          <div class="field"><label for="f-email">Work email</label><input id="f-email" type="email" autocomplete="email" required><span class="err" id="f-email-err" hidden>Enter a valid email address, like name@yourcare.co.uk.</span></div>
        </div>
        <div class="row2">
          <div class="field"><label for="f-org">Organisation</label><input id="f-org" autocomplete="organization" required><span class="err" id="f-org-err" hidden>Enter your organisation's name.</span></div>
          <div class="field"><label for="f-size">Size (optional)</label><input id="f-size" placeholder="e.g. 2 branches, 80 carers"></div>
        </div>
        <div class="field"><label for="f-msg">Anything we should know? (optional)</label><textarea id="f-msg"></textarea></div>
        <button class="btn btn-primary" type="submit">Prepare my request ${icon("arrow")}</button>
        <p class="form-note">This standalone site has no server, so your request is prepared as an email for you to send.</p>
      </form>
      <div class="done" id="request-done" tabindex="-1" hidden>
        <b>Your request is ready to send</b>
        <p>Send it to <span class="email"></span> from your email. You can open it in your email app or copy the text.</p>
        <pre></pre>
        <div class="btn-row"><a class="btn btn-primary" data-mailto href="#">${icon("mail")} Open in email</a><button class="btn btn-outline" type="button" data-copy>${icon("copy")} <span>Copy text</span></button><button class="btn btn-text" type="button" data-again>Edit request</button></div>
      </div>
    </div>
  </div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="choose-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">Prefer to look around first?</span><h2 class="display h-lg" id="choose-title">Explore services for your part of care</h2></div>
    <div class="chooser">
      ${GROUPS.map((g) => `<div><h3>${g.label}</h3><ul>${byGroup(g.id).map((m) => `<li><a class="choice" href="${page(m)}">${icon(m.icon)}${m.name}${icon("arrow")}</a></li>`).join("")}</ul></div>`).join("")}
    </div>
  </div>
</section>`;
  return doc({ title: "Get started with CarePlus", description: "Register your organisation, start onboarding, book a demo or become a partner.", current: "start", body });
}

// ───────────────────────────── Write ─────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "assets/img"), { recursive: true });
copyFileSync(join(ROOT, "src/styles.css"), join(OUT, "assets/styles.css"));
copyFileSync(join(ROOT, "src/main.js"), join(OUT, "assets/main.js"));
for (const f of readdirSync(join(ROOT, "src/img"))) copyFileSync(join(ROOT, "src/img", f), join(OUT, "assets/img", f));
for (const name of [...new Set([...Object.keys(IMG_ALT), ...MARKETS.map((m) => m.img)])]) {
  if (!readdirSync(join(ROOT, "src/img")).includes(`${name}.jpg`)) throw new Error(`Missing photo: src/img/${name}.jpg`);
}
writeFileSync(
  join(OUT, "assets/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${readFileSync(join(ROOT, "src/icons.mjs"), "utf8").match(/<svg class="logo-mark"[^>]*>([\s\S]*?)<\/svg>/)[1].replace(/var\(--cp-cyan\)/g, "#bff5f8").replace(/var\(--cp-teal\)/g, "#005459").replace(/var\(--cp-plus\)/g, "#93a9ab").replace(/\$\{size\}/g, "48")}</svg>`
);

const pages = { "index.html": home(), "platform.html": platform(), "compliance.html": compliance(), "pricing.html": pricing(), "get-started.html": getStarted() };
for (const m of MARKETS) pages[page(m)] = marketPage(m);
for (const [f, html] of Object.entries(pages)) writeFileSync(join(OUT, f), html);

console.log(`Built ${Object.keys(pages).length} pages into ${OUT}`);

// Start page for the claude.ai preview, whose host supplies the <html>/<head>/<body> shell.
const homeEntry = pages["index.html"]
  .replace(/^[\s\S]*?<head>\n<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n/, "")
  .replace("</head>\n<body>\n", "\n")
  .replace(/<\/body>\n<\/html>\n$/, "");
writeFileSync(join(ROOT, "preview-index.html"), `<script>document.documentElement.setAttribute("data-contact", ${JSON.stringify(CONTACT_EMAIL)});</script>\n` + homeEntry);
