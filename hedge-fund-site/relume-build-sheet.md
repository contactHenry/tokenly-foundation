# Vesperline Capital — Relume build sheet

Use this sheet to rebuild the existing Relume project as a hedge fund website. Each page lists its sections in order, using Relume's section categories (Navbar, Header, Layout, Stats, Team, CTA, FAQ, Footer and so on), with the copy and the image to place.

Vesperline Capital is a placeholder name. All figures, people and terms are illustrative and should be replaced with the client's real information before launch.

---

## 1. Style guide (set once in Relume → Style Guide)

**One pattern, used everywhere.** Full-bleed photography for the hero and section breaks. White and warm-grey sections for reading. Navy for emphasis. The copper accent appears only in small places: links, a thin rule, the active nav item.

### Typography
- **One family: Inter.** Headings and body both use it, with upright styles only. No italics and no display or serif faces.
- Headings: Inter Medium (500), tight letter-spacing (−1%).
- Body: Inter Regular (400), 18px, line height 1.6.
- Labels/eyebrows: Inter Medium (500), 13px, uppercase, letter-spacing 8%.
- Suggested scale: H1 64px · H2 44px · H3 28px · H4 20px · Body 18px · Small 15px.

### Colours
| Role | Name | Hex |
|---|---|---|
| Primary / dark sections | Navy | `#0B1F33` |
| Text | Ink | `#12171C` |
| Muted text | Slate | `#5E6873` |
| Page background | Paper | `#F6F4F0` |
| Alternate section | Stone | `#E8E3DA` |
| Lines and borders | Rule | `#D6D0C6` |
| Accent (sparingly) | Copper | `#B8643E` |

### Shape
- Buttons: 4px radius. Primary button is navy with white text. Secondary is an outline.
- Cards and images: 4px radius. No shadows.

### Photography
Cinematic, real and calm. Colour-graded cool navy with warm amber highlights, matching the dusk reference in the mood board. No illustrations, no 3D shapes, no stock handshakes.

- City skylines and aerial views at dusk or night (London, New York, Singapore).
- Architecture: glass towers, stone facades, long corridors, stairwells.
- People at work, shot from a distance: a meeting room at dawn, a trader at a screen, a team in discussion.
- Search terms in Relume's image library: "aerial city night", "skyscraper dusk", "london skyline evening", "boardroom window", "office corridor", "financial district".

---

## 2. Sitemap

1. Home
2. About
3. Strategies
4. Investment Approach
5. Clients (Who we serve)
6. Leadership
7. Insights (list) and Insight (article template)
8. Careers
9. Investors
10. Contact
11. Important Information (legal)

Navbar: About · Strategies · Approach · Clients · Insights · Careers · **Investor Login** (button, links to the administrator portal) · **Contact** (primary button)

---

## 3. Relume AI prompt (to regenerate the sitemap)

> Vesperline Capital is a multi-strategy hedge fund founded in 2009, with offices in London, New York and Singapore and $14.2 billion under management. It manages capital for pension funds, endowments, foundations, sovereign wealth funds, insurers and family offices. It runs four strategies (Multi-Strategy, Global Macro, Credit Opportunities and Systematic Equity) within one independent risk framework. The website must build trust with institutional allocators: serious, clear and corporate, leading with full-bleed cinematic photography. Pages: Home, About, Strategies, Investment Approach, Clients, Leadership, Insights, Careers, Investors, Contact, Important Information.

---

## 3b. Home page: exact Relume components

These components are from the Relume component library. In Relume's wireframe view, use "Swap section" or "Add section" and search for each name below, then paste in the copy from section 4.

| # | Section | Relume component | Why this one |
|---|---|---|---|
| 1 | Navbar | **Navbar 1** | Logo left, menu and buttons right. Set it transparent over the hero. |
| 2 | Hero | **Header 111** | Full background image, left-aligned heading, two buttons |
| 3 | Key figures | **Stats 4** | Figures over a background image. Add a fourth column, or use the stats row inside the hero. |
| 4 | Who we are | **Layout 637** | Text left, image right, button |
| 5 | Who we serve | **Layout 631** | Four columns with images, headings and text |
| 6 | Our strategies | **Layout 627** | Four columns. Remove the images for a text-only strategy row, or keep them. |
| 7 | How we invest | **Layout 669** | Image left, list right, for the three steps |
| 8 | Independent oversight | **Layout 324** | Four columns on a background image |
| 9 | CIO quote | **Testimonial 1** | One centred quote with avatar. Remove the logo. |
| 10 | Leadership | **Team 7** | Three columns of portraits with name and role |
| 11 | Insights | **Blog 38** | Three cards with image, category and title |
| 12 | Closing call to action | **CTA 15** | Two columns on a background image, two buttons |
| 13 | Footer | **Footer 1** | Four link columns. Replace the newsletter sign-up with the legal text. |

Inner pages: use **Header 111** (or a shorter page header) at the top of each page so every page opens on a full-bleed photo, then pick from the Relume categories "Timeline Sections" (About), "Comparison Sections" or "Tables" (Strategies), "Team Sections" (Leadership), "Career Sections" (Careers), "Blog Sections" and "Blog Post Headers" (Insights), "FAQ Sections" (Investors) and "Contact Sections" (Contact).

---

## 4. Pages and copy

### HOME

**Navbar** — transparent over the hero, turns Paper on scroll.

**Header (full-bleed image hero)**
- Image: aerial view of a financial district at dusk, city lights coming on, horizon glow. Dark gradient over the bottom half.
- Eyebrow: MULTI-STRATEGY INVESTMENT MANAGER · LONDON · NEW YORK · SINGAPORE
- H1: **Disciplined capital for institutions that think in decades.**
- Body: For seventeen years, Vesperline has managed capital for pension funds, endowments and sovereign investors. We pursue steady, uncorrelated returns through four strategies and one independent risk framework.
- Buttons: **Our strategies** (primary, white) · **Speak with our team** (outline, white)

**Stats (4 columns, on Navy)**
- $14.2bn — Assets under management
- 17 years — Managing institutional capital
- 140+ — Institutional clients worldwide
- 11% — Of fund capital belongs to our partners and staff
- Footnote: As of 30 September 2026.

**Layout: text left, image right — "Who we are"**
- Eyebrow: WHO WE ARE
- H2: **A partnership built around one responsibility: protecting the capital entrusted to us.**
- Body: Vesperline was founded in 2009, in the aftermath of the financial crisis, by three portfolio managers who had seen sound positions abandoned because the capital behind them could not wait. They built a firm that sizes every investment to survive a downturn first, and judges itself over full market cycles, not quarters.
- Body: Today we are 186 people across three offices. The firm is owned entirely by its eleven partners, who invest the majority of their own wealth in our funds on the same terms as our clients.
- Link: **About the firm →**
- Image: a quiet meeting room at dawn, city view through floor-to-ceiling windows.

**Layout: 4 cards with images — "Who we serve"**
- Eyebrow: WHO WE SERVE
- H2: **We manage capital for institutions with long-term obligations.**
- Cards:
  1. **Pension funds** — Steady returns with low correlation to equity and bond markets, to help meet commitments to members. (Image: city at dawn)
  2. **Endowments and foundations** — Real growth to support grants, scholarships and research, protected against deep drawdowns. (Image: stone university or library facade)
  3. **Sovereign wealth funds** — Separately managed accounts, tailored to each mandate's liquidity, risk and reporting needs. (Image: aerial of a port or financial centre)
  4. **Family offices and insurers** — Access to institutional strategies, with the transparency and governance of a large allocator. (Image: architecture detail, glass and steel)

**Layout: 4 cards — "Our strategies"** (Stone background)
- Eyebrow: OUR STRATEGIES
- H2: **Four strategies. One risk framework.**
- Body: Each strategy has its own team and process. All four share one independent risk function, one investment committee and one operations platform.
- Cards (title, line, figure):
  1. **Multi-Strategy** — Our flagship fund, allocating across all four strategies with a single volatility target. · Since 2009
  2. **Global Macro** — Rates, currencies and commodities across 30 markets, mostly through relative-value positions. · 3–9 month holding period
  3. **Credit Opportunities** — Stressed and special-situation credit and direct lending to mid-market companies. · 64% senior secured
  4. **Systematic Equity** — Market-neutral equity models across 4,000 stocks in the US, Europe and Japan. · Market beta near zero
- Button: **Explore our strategies**

**Layout: image left, 3 numbered steps right — "How we invest"**
- Eyebrow: HOW WE INVEST
- H2: **We decide how much we can afford to lose before we decide what to buy.**
- Steps:
  1. **Research** — Every investment starts as a written thesis, with the case for it, the case against it and a date to review it.
  2. **Risk sizing** — An independent risk team sets the loss limit and position size before any trade is placed.
  3. **Review** — Positions are reviewed on schedule, or as soon as they use half their loss limit. A broken thesis is closed, never averaged down.
- Image: trader at a desk, screens softly out of focus, evening light.

**Layout: full-bleed image with text — "Independent oversight"**
- Image: dusk skyline, darkened.
- H2: **Independent at every point where it matters.**
- 4 short items:
  - **Independent administrator** — A third-party administrator calculates every net asset value.
  - **Annual audit** — Each fund is audited every year by an independent accounting firm.
  - **Four prime brokers** — Assets are spread across four prime brokers and two custodians.
  - **Independent boards** — Every fund board has a majority of independent directors.

**Testimonial-style quote (use the Testimonial section, single quote)**
- Quote: "Our clients are paying for judgement, but they are trusting us with their capital. Our first job is to make sure that trust is never put at risk for the sake of a better quarter."
- Name: Eleanor Ashdown, Founding Partner and Chief Investment Officer
- Image: portrait, business attire, neutral background.

**Team (3 portraits) — "Leadership"**
- H2: **Led by the partners who invest alongside you.**
- Eleanor Ashdown — Chief Investment Officer
- Tobiah Okafor — Head of Credit
- Sofia Varga — Chief Risk Officer
- Link: **Meet the leadership team →**

**Blog (3 cards) — "Insights"**
- H2: **Perspectives from our investment team.**
- Q3 2026 Letter: The cost of being early (Quarterly letter · Oct 2026)
- Term premium is back. Who holds the duration now? (Macro research · Sep 2026)
- Maturity walls in European mid-market loans, 2027–2029 (Credit research · Aug 2026)

**CTA (full-bleed image)**
- Image: city lights from above at night.
- H2: **Begin a conversation with our investor relations team.**
- Body: Tell us about your mandate and time horizon. A partner will respond within two business days.
- Buttons: **Contact us** · **Investor login**

**Footer**
- Columns: Firm (About, Leadership, Careers) · Investing (Strategies, Approach, Clients) · Resources (Insights, Investors, Important Information) · Offices (London, New York, Singapore)
- Legal line: © 2026 Vesperline Capital LLP. Authorised and regulated by the relevant authorities. This website is for institutional and professional investors only and is not an offer to invest. Capital is at risk.

---

### ABOUT

1. **Header (full-bleed image)** — Image: London skyline at dusk. H1: **Built for patience. Governed for trust.** Body: Since 2009, we have managed capital with one principle: protect it first, then grow it.
2. **Layout (text + image) — Our story** — H2: **Founded after a crisis, designed to outlast the next one.** Body: In 2009, our founders saw that the most costly mistakes in investing are made by capital that cannot wait. They built Vesperline around long-term clients, partner ownership and an independent risk function that reports to the board. Seventeen years later, those foundations have not changed.
3. **Timeline** — 2009 Founded in London with $310m from two university endowments · 2012 Launched Credit Opportunities · 2016 Opened New York · 2019 Launched Systematic Equity · 2022 Opened Singapore · 2026 $14.2bn under management, 186 people.
4. **Layout (3 columns) — Our values** — **Stewardship:** we treat client capital with the care we give our own. **Discipline:** we follow our process, especially when it is uncomfortable. **Transparency:** we tell clients what we own, why, and what it could cost them.
5. **Stats** — Partners: 11 · Employees: 186 · Nationalities: 23 · Average investment staff tenure: 9 years.
6. **Layout — Ownership and alignment** — H2: **Our capital sits alongside yours.** Points: Partners hold most of their liquid wealth in our funds. Half of every investment bonus is deferred into the funds for three years. We cap each strategy's size and have closed our flagship twice to protect returns.
7. **CTA** — **Meet the people who manage your capital.** Button: Leadership.

### STRATEGIES

1. **Header (image)** — Image: architecture, glass facade at dusk. H1: **Four strategies, built to work together.** Body: Each strategy can be held on its own or combined in our flagship fund.
2. **Layout (alternating image/text) ×4** — one block per strategy with: description, what it trades, typical holding period, liquidity, target volatility, status.
   - Multi-Strategy — Target volatility 8–10% · Quarterly liquidity · Open by allocation
   - Global Macro — 10–12% · Monthly · Open
   - Credit Opportunities — 7–9% · Annual · Closed, next window Q2 2027
   - Systematic Equity — 6–8% · Monthly · Open
3. **Comparison table** — Strategy · Style · Target volatility · Liquidity · Minimum · Status.
4. **CTA** — **Request our due diligence materials.** Button: Contact investor relations.
5. Small print: Targets are objectives, not forecasts or guarantees.

### INVESTMENT APPROACH

1. **Header (image)** — Image: trading floor at night. H1: **Risk first. Return second.**
2. **Layout — 3 steps** (Research, Risk sizing, Review) as on Home, with one paragraph each.
3. **Layout — Firm-wide risk limits** (4 items with progress bars): Gross exposure 312% of 450% limit · Net equity beta 0.04 within ±0.15 · Largest single issuer 3.1% of 5% limit · 30-day liquidity 81% against a 70% minimum.
4. **Layout — Governance** (6 items): Independent administrator · Annual audit · Four prime brokers · Independent fund boards · Proxy voting record published · Registered in the UK, US and Singapore.
5. **Layout — Responsible investment** — How sustainability risk is considered in research and voting.
6. **CTA**.

### CLIENTS

1. **Header (image)** — H1: **Trusted by institutions with long-term commitments.**
2. **Layout (4 cards)** — Pension funds, Endowments and foundations, Sovereign wealth funds, Family offices and insurers, each with a paragraph on what that client needs and how we serve it.
3. **Layout — Ways to invest** — Commingled funds · Separately managed accounts · Long-lock share classes with lower fees.
4. **Stats** — 140+ clients · 31 countries · Average client relationship 8 years.
5. **CTA**.

### LEADERSHIP

1. **Header** — H1: **The partners responsible for your capital.**
2. **Team (6 portraits with short bios)** — Eleanor Ashdown (CIO) · Tobiah Okafor (Head of Credit) · Mei Kuroda (Head of Systematic) · Julian Reyes (Head of Macro, Singapore) · Sofia Varga (Chief Risk Officer, reports to the board) · David Marchetti (COO).
3. **Layout — Investment committee** — How the committee meets weekly and approves every new strategy and limit.
4. **CTA — Careers**.

### INSIGHTS

1. **Header** — H1: **Perspectives from our investment team.**
2. **Blog list** with category filter: Quarterly letters · Research · Notes. Research is marked "Investors only".
3. **Blog post template** — Title, author, date, read time, hero image, body, related posts. Sample: *Q3 2026 Letter: The cost of being early*.

### CAREERS

1. **Header (image of team at work)** — H1: **Build a career measured in decades.**
2. **Layout — Why Vesperline** — Responsibility early · Time to think · Rewarded as owners.
3. **Careers list** — Quantitative Researcher (London) · Credit Analyst, Special Situations (New York) · Rates Trader, Asia (Singapore) · Risk Engineer (London) · Investor Relations Associate (New York) · Graduate Programme 2027 (All offices).
4. **Layout — How we hire (4 steps)** — Application · Conversation · Case study · Final day.
5. **CTA** — Send your CV to careers@vesperline.com.

### INVESTORS

1. **Header** — H1: **For institutional and professional investors.**
2. **Notice banner** — This information is not an offer to sell or a solicitation to buy any interest in a fund.
3. **Layout — Becoming an investor (4 steps)** — Introduction · Due diligence · Subscription · Onboarding.
4. **Layout — Reporting** table — Monthly NAV statement · Monthly risk report · Quarterly letter and call · Quarterly position transparency · Annual audited financials.
5. **CTA — Investor Login** (links to the administrator's portal; never collect passwords on this site).

### CONTACT

1. **Header** — H1: **Speak with our team.**
2. **Contact form** — Name, Organisation, Work email, Investor type (dropdown), Message, eligibility checkbox.
3. **Locations (3 cards with city images)** — London · New York · Singapore, with address and phone.

### IMPORTANT INFORMATION
Plain text page: No offer · Eligible investors only · Risk warning · Past performance · Regulatory status · Privacy · Cookies.
