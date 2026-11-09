// Builds the static CarePlus website into ./site (plain HTML/CSS/JS, no dependencies).
// Usage: node build.mjs
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOGIN_URL, CONTACT_EMAIL, TAGLINE } from "./src/config.mjs";
import { MARKETS, GROUPS, STATS, PILLARS, PLANS, ADDONS } from "./src/content.mjs";
import { icon, logo } from "./src/icons.mjs";
import { mockup } from "./src/mockups.mjs";

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
const img = (name, alt, extra = "") => `<img src="assets/img/${name}.jpg" alt="${esc(alt)}" loading="lazy"${extra}>`;
const IMG_ALT = {
  hero: "A carer in green scrubs reassuring an older woman",
  nursing: "A nurse holding the hand of an older resident in a nursing home",
  homecare: "A home carer standing with an older man in his home",
  childcare: "A nursery practitioner playing with building blocks with a young child",
  agency: "Recruitment consultants meeting with a candidate",
  suppliers: "Warehouse staff checking an order on a tablet",
  professional: "A nurse in blue scrubs sitting at a desk",
  residential: "A care worker supporting an older resident",
};

function marketCard(m) {
  const media = m.img
    ? `<div class="m-media">${img(m.img, IMG_ALT[m.img])}<span class="m-tag">${icon(m.icon)}${GROUPS.find((g) => g.id === m.group).label}</span></div>`
    : `<div class="m-media is-mock">${mockup(m.mock)}<span class="m-tag">${icon(m.icon)}${GROUPS.find((g) => g.id === m.group).label}</span></div>`;
  return `<a class="m-card" href="${page(m)}" data-group="${m.group}">
  ${media}
  <div class="m-body">
    <h3>${m.name}</h3>
    <p>${m.card.summary}</p>
    <ul class="m-list">${m.card.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    <span class="m-more">See how CarePlus helps ${icon("arrow")}</span>
  </div>
</a>`;
}

// ───────────────────────────── Pages ─────────────────────────────
function home() {
  const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-head">
      <span class="eyebrow">${icon("sparkle")}One platform for care, compliance and workforce</span>
      <h1 class="display h-hero">Safe, timely care starts here.</h1>
    </div>
    <div class="hero-stage">
      ${img("hero", IMG_ALT.hero, ' loading="eager" fetchpriority="high"').replace(' loading="lazy"', "")}
      <div class="hero-copy">
        <h2 class="display h-xl">Run your whole care service <em>from one place.</em></h2>
        <div style="display:grid;gap:28px">
          <p>CarePlus brings residents, medication, rotas, compliance, stock and finance together for nursing homes, home care, supported living, childcare, agencies and the partners who supply them.</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="get-started.html">Get started ${icon("arrow")}</a>
            <a class="btn btn-ghost-light" href="get-started.html#request">Book a demo</a>
          </div>
        </div>
      </div>
      <div class="hero-chip">${mockup("compliance")}</div>
    </div>
  </div>
</section>

<section class="band section" style="margin-top:clamp(64px,8vw,110px)" aria-labelledby="proof-title">
  <div class="wrap proof">
    <div class="proof-left">
      <h2 class="display h-xl" id="proof-title">Built for the reality of regulated care.</h2>
      <p class="lede">CarePlus already runs nursing homes, home care branches, nurseries, agencies and supported living services, each with its own workspace and the same safeguards underneath.</p>
    </div>
    <div class="proof-grid">
      <span class="kicker">CarePlus in numbers</span>
      ${STATS.map((s) => `<div class="stat"><b>${s.n}</b><span>${s.l}</span></div>`).join("")}
    </div>
  </div>
</section>

<section class="section" id="solutions" aria-labelledby="sol-title">
  <div class="wrap">
    <div class="s-head-row">
      <div class="s-head">
        <h2 class="display h-xl" id="sol-title">A CarePlus for every part of care</h2>
        <p class="lede">Choose your part of the care sector to see the problems we solve, the features built for you and how you'll use CarePlus.</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Filter by market">
        <button class="tab" role="tab" aria-selected="true" data-tab="all">All</button>
        ${GROUPS.map((g) => `<button class="tab" role="tab" aria-selected="false" data-tab="${g.id}">${g.label}</button>`).join("")}
      </div>
    </div>
    <div class="cards">${MARKETS.map(marketCard).join("")}<div class="m-cta span-2" id="fit-card"><div><h3>Not sure which fits you?</h3><p>Tell us what your organisation does and we'll show you the parts of CarePlus built for you.</p></div><div class="btn-row"><a class="btn btn-light" href="get-started.html">Find your fit ${icon("arrow")}</a>${signIn("btn btn-ghost-light")}</div></div></div>
  </div>
</section>

<section class="section" style="padding-top:0" aria-labelledby="pl-title">
  <div class="wrap split">
    <div>
      <h2 class="display h-xl" id="pl-title">Everything your service needs, in one place</h2>
      <p class="lede" style="margin-top:24px">Stop juggling spreadsheets, paper charts and disconnected tools. Every team works from the same record, and each person sees only what their role allows.</p>
      <div class="f-list">
        ${PILLARS.slice(0, 4).map((p) => `<div class="f-item">${icon(p.icon)}<h3>${p.t}</h3><p>${p.d}</p></div>`).join("")}
      </div>
      <div class="btn-row" style="margin-top:36px"><a class="btn btn-outline" href="platform.html">Explore the platform ${icon("arrow")}</a></div>
    </div>
    <div class="split-media">${img("professional", IMG_ALT.professional)}${mockup("mar")}</div>
  </div>
</section>

<section class="section" style="padding-top:0" aria-labelledby="tr-title">
  <div class="wrap">
    <div class="s-head">
      <span class="kicker">Safe by design</span>
      <h2 class="display h-lg" id="tr-title">Software that supports people, and leaves every decision with them</h2>
    </div>
    <div class="trust">
      <div>${icon("hand")}<h3>People decide</h3><p>CarePlus flags and suggests. A named person always approves, signs off or decides. It never prescribes or sets doses.</p></div>
      <div>${icon("lock")}<h3>Records you can trust</h3><p>Medication administration is append-only, and controlled drugs need two witnesses. Every change is audited.</p></div>
      <div>${icon("users")}<h3>The right access for every role</h3><p>13 core roles and 6 actions per module, with per-person overrides where a deny always wins.</p></div>
      <div>${icon("shield")}<h3>Your data stays yours</h3><p>Each organisation's data is isolated at the database level, with UK data residency.</p></div>
      <div>${icon("eye")}<h3>Private by default</h3><p>Photos use short-lived private links. Children's photos need recorded consent.</p></div>
      <div>${icon("clipboard")}<h3>Inspection-ready</h3><p>Audits, evidence packs and statutory notifications are built from everyday work.</p></div>
    </div>
  </div>
</section>

${ctaBand({
  title: "Ready to modernise your care operations?",
  text: "See how CarePlus fits your service. Book a demo, or sign in if your organisation already uses CarePlus.",
  primary: `<a class="btn btn-light" href="get-started.html">Get started ${icon("arrow")}</a>`,
  secondary: signIn("btn btn-ghost-light", "Sign in"),
})}`;
  return doc({ title: "CarePlus", description: "CarePlus is one platform for care, compliance and workforce, built for every part of the UK care sector.", current: "home", body });
}

function marketPage(m) {
  const group = GROUPS.find((g) => g.id === m.group);
  const visual = m.img
    ? `<div class="mp-visual has-photo">${img(m.img, IMG_ALT[m.img], ' loading="eager"').replace(' loading="lazy"', "")}${mockup(m.mock)}</div>`
    : `<div class="mp-visual"><span class="illus-note">Illustrative screen</span>${mockup(m.mock)}</div>`;
  const ctaHref = href(m.cta.href || `get-started.html#${m.slug}`);
  const isLogin = m.cta.href === "LOGIN";
  const primary = `<a class="btn btn-light" href="${esc(ctaHref)}"${isLogin ? ' rel="noopener"' : ""}>${m.cta.label} ${icon("arrow")}</a>`;
  const secondary = m.cta.secondary
    ? `<a class="btn btn-ghost-light" href="${esc(href(m.cta.secondary.href))}">${m.cta.secondary.label}</a>`
    : isLogin ? "" : signIn("btn btn-ghost-light", "Already a customer? Sign in");
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
        <div class="btn-row">
          <a class="btn btn-primary" href="${esc(ctaHref)}"${isLogin ? ' rel="noopener"' : ""}>${m.cta.label} ${icon("arrow")}</a>
          ${isLogin ? `<a class="btn btn-outline" href="get-started.html#${m.slug}">Get help joining</a>` : signIn("btn btn-outline", "Sign in")}
        </div>
      </div>
      ${visual}
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
    <div class="s-head"><span class="kicker">The problems we solve</span><h2 class="display h-lg" id="pb-title">What gets in the way today, and how CarePlus fixes it</h2></div>
    <div class="problems">
      ${m.problems.map((p) => `<article class="problem"><div class="pb"><small>The problem</small><p>${p.p}</p></div><div class="ps"><small>With CarePlus</small><p>${p.s}</p></div></article>`).join("")}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0" aria-labelledby="ft-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">Built for ${m.name.toLowerCase()}</span><h2 class="display h-lg" id="ft-title">Features already working for services like yours</h2></div>
    <div class="features">${m.features.map((f) => `<div class="feat">${icon(f.icon)}<h3>${f.t}</h3><p>${f.d}</p></div>`).join("")}</div>
  </div>
</section>

<section class="band section" aria-labelledby="bn-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker" style="color:rgba(255,255,255,.75)">What changes for you</span><h2 class="display h-lg" id="bn-title">How CarePlus improves your day</h2></div>
    <div class="benefits">${m.benefits.map((b) => `<div class="benefit"><h3>${b.t}</h3><p>${b.d}</p></div>`).join("")}</div>
  </div>
</section>

<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker">How you'll use CarePlus</span><h2 class="display h-lg" id="how-title">From first conversation to everyday use</h2></div>
    <div class="how">
      <ol class="steps">${m.access.steps.map((s) => `<li class="step"><h3>${s.t}</h3><p>${s.d}</p></li>`).join("")}</ol>
      <aside class="channels" aria-label="Where you access CarePlus">
        <h3 class="k">Where you'll access it</h3>
        ${m.access.channels.map((c) => `<div class="channel">${icon(c.icon)}<b>${c.t}</b><span>${c.d}</span></div>`).join("")}
        ${signIn("btn btn-outline", `${icon("login")} Sign in to CarePlus`)}
      </aside>
    </div>
  </div>
</section>

${ctaBand({ title: m.cta.title, text: m.cta.text, primary, secondary })}

<section class="section" aria-labelledby="rel-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-md" id="rel-title">Explore other parts of CarePlus</h2></div>
    <div class="related">${[...related, ...fill].map((o) => `<a class="rel" href="${page(o)}">${icon(o.icon)}${o.name}${icon("arrow")}</a>`).join("")}</div>
  </div>
</section>`;
  return doc({ title: `CarePlus for ${m.name}`, description: plain(m.hero.lede), current: "solutions", body });
}

function platform() {
  const detail = {
    "Medication you can trust": ["eMAR and medication rounds", "Controlled drugs register", "Stock ledger and cycle continuity", "Transitions of care", "Printable MAR and inspection pack"],
    "Workforce and rota": ["Shifts, rota and route planning", "Attendance, timesheets and payroll", "Training, competencies and skills matrix", "Supervisions and appraisals", "Hiring and shadow shifts"],
    "Compliance and governance": ["Compliance dashboard and framework", "Audits and inspections", "Incidents and investigations", "Risk register and statutory notifications", "Approvals inbox and permits"],
    "Stock, equipment and suppliers": ["Stock levels, expiry and stocktake", "Equipment passports with QR", "Work orders and technicians", "Procurement, catalogue and cart", "Group buying"],
    "Finance and billing": ["Funding plans", "Client and resident billing", "Payroll settings and pay runs", "Commissions", "Subscription billing"],
    "AI that assists, never decides": ["AI Assist with 23 tasks", "Manager copilot", "Executive dashboards", "Management summaries", "AI-assisted badges on every output"],
  };
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("layers")}The CarePlus platform</span>
  <h1 class="display">One record for care, compliance and workforce</h1>
  <p class="lede">Every CarePlus workspace runs on the same core: the same record, the same safeguards and the same access model, shaped for your care setting.</p>
  <div class="btn-row"><a class="btn btn-primary" href="get-started.html">Get started ${icon("arrow")}</a>${signIn("btn btn-outline")}</div>
</section>
<section class="section" style="padding-top:0" aria-label="Platform capabilities">
  <div class="wrap pillars">
    ${PILLARS.map((p) => `<div class="pillar">${icon(p.icon)}<h3>${p.t}</h3><p>${p.d}</p><ul>${detail[p.t].map((d) => `<li>${icon("check")}${d}</li>`).join("")}</ul></div>`).join("")}
  </div>
</section>
<section class="band section" aria-labelledby="ways-title">
  <div class="wrap">
    <div class="s-head"><span class="kicker" style="color:rgba(255,255,255,.75)">Ways in</span><h2 class="display h-lg" id="ways-title">Everyone gets the right door</h2></div>
    <div class="benefits">
      <div class="benefit"><h3>Web app</h3><p>For managers, nurses, coordinators, finance and office teams, on desktop and tablet.</p></div>
      <div class="benefit"><h3>Carer mobile app</h3><p>Today's work, visits and sync, and it keeps working without signal.</p></div>
      <div class="benefit"><h3>Family portals</h3><p>Consent-led updates for relatives, parents and advocates.</p></div>
      <div class="benefit"><h3>Partner and commissioner portals</h3><p>Scoped access for contractors, suppliers and commissioners.</p></div>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="mk-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-lg" id="mk-title">Find the CarePlus built for you</h2></div>
    <div class="related" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${MARKETS.map((o) => `<a class="rel" href="${page(o)}">${icon(o.icon)}${o.name}${icon("arrow")}</a>`).join("")}</div>
  </div>
</section>
${ctaBand({ title: "See the platform working", text: "We'll tailor the demo to your care setting.", primary: `<a class="btn btn-light" href="get-started.html#request">Book a demo ${icon("arrow")}</a>`, secondary: signIn("btn btn-ghost-light") })}`;
  return doc({ title: "CarePlus Platform", description: "The CarePlus platform: medication, workforce, compliance, operations, finance and AI on one shared record.", current: "platform", body });
}

function compliance() {
  const rows = [
    ["shield", "Organisation-level isolation", "Every organisation's data is isolated in the database with row-level security, not just hidden in the interface."],
    ["users", "One access model", "13 core roles × 6 actions (view, create, edit, approve, delete, export) per module, the same in every care setting."],
    ["lock", "Overrides with limits", "Per-person overrides expire, and a deny always wins. Billing, payroll settings and owner roles can't be granted by override."],
    ["clipboard", "Full audit trail", "Changes are audited, access changes go to an append-only access log, and edits record a reason."],
    ["pill", "Medication safeguards", "Administration records are append-only, controlled drugs need two witnesses, and remote witnessing covers high-risk medicines."],
    ["hand", "Human decisions", "CarePlus never prescribes, sets doses or makes clinical decisions. AI output is marked as AI-assisted and needs a person's approval."],
    ["eye", "Private photos", "Photos are stored privately and shown through signed links that expire within five minutes. Children's photos need recorded consent."],
    ["qr", "Local QR codes", "Equipment QR codes are generated inside CarePlus. Asset details are never sent to third-party services."],
    ["building", "UK data residency", "All plans include UK data residency and record retention suited to CQC inspection."],
  ];
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("shield")}Compliance and security</span>
  <h1 class="display">Safeguards built in, not bolted on</h1>
  <p class="lede">Care is regulated, and so is CarePlus. These protections apply to every organisation, in every care setting, from the first day.</p>
</section>
<section class="section" style="padding-top:0" aria-label="Safeguards">
  <div class="wrap"><div class="trust">${rows.map(([i, t, d]) => `<div>${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join("")}</div></div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="insp-title">
  <div class="wrap split">
    <div>
      <span class="kicker">Inspection-ready every day</span>
      <h2 class="display h-lg" id="insp-title" style="margin-top:14px">Evidence that builds itself from everyday work</h2>
      <div class="f-list">
        <div class="f-item">${icon("clipboard")}<h3>Compliance framework</h3><p>Map your evidence to the standards you're inspected against.</p></div>
        <div class="f-item">${icon("file")}<h3>Evidence and inspection packs</h3><p>Medication and service evidence packs, ready in minutes.</p></div>
        <div class="f-item">${icon("bell")}<h3>Statutory notifications</h3><p>Track what needs notifying, by when, and what was sent.</p></div>
        <div class="f-item">${icon("shield")}<h3>Staff compliance</h3><p>DBS, training and competencies, with hard blocks when something lapses.</p></div>
      </div>
    </div>
    <div class="mp-visual"><span class="illus-note">Illustrative screen</span>${mockup("compliance")}</div>
  </div>
</section>
${ctaBand({ title: "Talk to us about your compliance needs", text: "We'll walk you through access control, audit and inspection features in detail.", primary: `<a class="btn btn-light" href="get-started.html#request">Book a demo ${icon("arrow")}</a>`, secondary: signIn("btn btn-ghost-light") })}`;
  return doc({ title: "CarePlus Compliance", description: "How CarePlus protects people, records and data: isolation, access control, audit trails and medication safeguards.", current: "compliance", body });
}

function pricing() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("wallet")}Pricing</span>
  <h1 class="display">Simple plans, priced per branch</h1>
  <p class="lede">These are our home care plans. Nursing, residential, supported living, mental health, learning disability, childcare and agency workspaces are quoted to fit your service.</p>
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
        <a class="btn ${p.featured ? "btn-primary" : "btn-outline"}" href="get-started.html#home-care">Choose ${p.name}</a>
      </article>`).join("")}
    </div>
    <p class="note">All plans include UK data residency, audit trails and record retention suited to CQC inspection. Prices exclude VAT. Plan changes can only be made by organisation owners, admins and the registered manager.</p>
  </div>
</section>
<section class="section" style="padding-top:0" aria-labelledby="add-title">
  <div class="wrap">
    <div class="s-head"><h2 class="display h-md" id="add-title">Add-ons</h2></div>
    <div class="addons">${ADDONS.map((a) => `<div class="addon"><b>${a.name}</b><span class="p">${a.price}</span><p>${a.d}</p></div>`).join("")}</div>
  </div>
</section>
${ctaBand({ title: "Need a quote for another care setting?", text: "Tell us about your service and we'll put together pricing that fits.", primary: `<a class="btn btn-light" href="get-started.html#request">Request a quote ${icon("arrow")}</a>`, secondary: signIn("btn btn-ghost-light") })}`;
  return doc({ title: "CarePlus Pricing", description: "CarePlus home care plans from £149 per branch per month, plus add-ons and quotes for other care settings.", current: "pricing", body });
}

function getStarted() {
  const body = `
<section class="wrap page-hero">
  <span class="eyebrow">${icon("sparkle")}Get started</span>
  <h1 class="display">Which best describes you?</h1>
  <p class="lede">Choose your part of the care sector to see what CarePlus does for you, or send us a request below.</p>
</section>
<section class="section" style="padding-top:0" aria-label="Choose your market">
  <div class="wrap chooser">
    ${GROUPS.map((g) => `<div><h3>${g.label}</h3><ul>${byGroup(g.id).map((m) => `<li><a class="choice" href="${page(m)}">${icon(m.icon)}${m.name}${icon("arrow")}</a></li>`).join("")}</ul></div>`).join("")}
  </div>
</section>
<section class="section" style="padding-top:0" id="request" aria-labelledby="req-title">
  <div class="wrap form-wrap">
    <div class="form-side">
      <h2 class="display h-lg" id="req-title">Book a demo or become a partner</h2>
      <p class="lede">Access to CarePlus is by invitation. Tell us about your organisation and our team will set up a tailored demo or partner onboarding.</p>
      <div class="signin"><b>Already use CarePlus?</b><span style="color:var(--muted)">Sign in with the email address you were invited with.</span>${signIn("btn btn-primary", `Sign in ${icon("arrow")}`)}</div>
    </div>
    <div>
      <form class="req" id="request-form" novalidate>
        <div class="field"><label for="f-goal">I'd like to</label>
          <select id="f-goal"><option>Book a demo</option><option>Become a partner</option><option>Get a quote</option><option>Ask a question</option></select></div>
        <div class="row2">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" autocomplete="name" required><span class="err" id="f-name-err" hidden>Enter your name.</span></div>
          <div class="field"><label for="f-email">Work email</label><input id="f-email" type="email" autocomplete="email" required><span class="err" id="f-email-err" hidden>Enter a valid email address, like name@yourcare.co.uk.</span></div>
        </div>
        <div class="row2">
          <div class="field"><label for="f-org">Organisation</label><input id="f-org" autocomplete="organization" required><span class="err" id="f-org-err" hidden>Enter your organisation's name.</span></div>
          <div class="field"><label for="f-size">Size (optional)</label><input id="f-size" placeholder="e.g. 2 branches, 80 carers"></div>
        </div>
        <div class="field"><label for="f-segment">We are</label>
          <select id="f-segment">${MARKETS.map((m) => `<option value="${m.slug}">${m.name}</option>`).join("")}</select></div>
        <div class="field"><label for="f-msg">Anything we should know? (optional)</label><textarea id="f-msg"></textarea></div>
        <button class="btn btn-primary" type="submit">Prepare my request ${icon("arrow")}</button>
      </form>
      <div class="done" id="request-done" tabindex="-1" hidden>
        <b>Your request is ready to send</b>
        <p>Send it to <span class="email"></span> from your email. You can open it in your email app or copy the text.</p>
        <pre></pre>
        <div class="btn-row"><a class="btn btn-primary" data-mailto href="#">${icon("mail")} Open in email</a><button class="btn btn-outline" type="button" data-copy>${icon("copy")} <span>Copy text</span></button><button class="btn btn-text" type="button" data-again>Edit request</button></div>
      </div>
    </div>
  </div>
</section>`;
  return doc({ title: "Get Started with CarePlus", description: "Find the part of CarePlus built for you, book a demo, become a partner or sign in.", current: "start", body });
}

// ───────────────────────────── Write ─────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "assets/img"), { recursive: true });
copyFileSync(join(ROOT, "src/styles.css"), join(OUT, "assets/styles.css"));
copyFileSync(join(ROOT, "src/main.js"), join(OUT, "assets/main.js"));
for (const f of readdirSync(join(ROOT, "src/img"))) copyFileSync(join(ROOT, "src/img", f), join(OUT, "assets/img", f));
writeFileSync(
  join(OUT, "assets/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><style>:root{--cp-cyan:#bff5f8;--cp-teal:#005459;--cp-plus:#93a9ab}</style>${readFileSync(join(ROOT, "src/icons.mjs"), "utf8").match(/<svg class="logo-mark"[^>]*>([\s\S]*?)<\/svg>/)[1].replace(/var\(--cp-cyan\)/g, "#bff5f8").replace(/var\(--cp-teal\)/g, "#005459").replace(/var\(--cp-plus\)/g, "#93a9ab")}</svg>`
);

const pages = { "index.html": home(), "platform.html": platform(), "compliance.html": compliance(), "pricing.html": pricing(), "get-started.html": getStarted() };
for (const m of MARKETS) pages[page(m)] = marketPage(m);
for (const [f, html] of Object.entries(pages)) writeFileSync(join(OUT, f), html);

// Start page for the claude.ai preview, whose host supplies the <html>/<head>/<body> shell.
const homeEntry = home().replace(/^[\s\S]*?<head>\n<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n/, "").replace("</head>\n<body>\n", "\n").replace(/<\/body>\n<\/html>\n$/, "");
writeFileSync(join(ROOT, "preview-index.html"), `<script>document.documentElement.setAttribute("data-contact", ${JSON.stringify(CONTACT_EMAIL)});</script>\n` + homeEntry);

console.log(`Built ${Object.keys(pages).length} pages into ${OUT}`);
