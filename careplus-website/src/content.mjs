// All website copy lives here. Each market page follows the same six-part story:
// who it is for → problems we solve → features built for them → benefits →
// how they use CarePlus → what to do next.
// Every feature named below exists in the CarePlus app today.

export const GROUPS = [
  { id: "providers", label: "Care providers", blurb: "Services that deliver care and support every day." },
  { id: "healthcare", label: "Healthcare", blurb: "Hospitals, clinics, pharmacies and laboratories that work alongside care." },
  { id: "workforce", label: "Workforce", blurb: "The agencies and people who staff care." },
  { id: "partners", label: "Partners & commissioners", blurb: "Organisations that supply, maintain and fund care." },
];

export const MARKETS = [
  // ───────────────────────────── Care providers ─────────────────────────────
  {
    slug: "nursing-homes",
    name: "Nursing homes",
    group: "providers",
    icon: "building",
    img: "nursing",
    mock: "mar",
    card: {
      summary: "Run safe medication rounds, control drugs properly and stay inspection-ready across every unit.",
      bullets: ["eMAR and medication rounds", "Controlled drugs register", "Inspection pack"],
    },
    hero: {
      eyebrow: "For nursing homes",
      title: "Every dose recorded. <em>Every round accounted for.</em>",
      lede: "CarePlus gives nursing homes one place for residents, medication, staffing and compliance, so nurses spend less time on paperwork and managers always know what happened on every unit.",
    },
    audience: {
      intro: "Built for registered nursing homes and the people who run them day and night.",
      roles: ["Registered managers", "Clinical leads and nurses", "Senior carers and care staff", "Quality and compliance leads", "Owners and finance teams"],
    },
    problems: [
      { p: "Paper MAR charts hide missed or unsigned doses until an audit finds them.", s: "Medication rounds run on eMAR, with missed, refused and late doses flagged while the round is still going." },
      { p: "Controlled drug registers and stock balances drift out of step.", s: "A controlled drugs register with two-witness sign-off and a central, append-only stock ledger." },
      { p: "Medication changes get lost when residents go into hospital and come back.", s: "Transitions of care reconcile every admission, transfer and discharge line by line." },
      { p: "Inspection preparation takes weeks of chasing evidence.", s: "Audits, a compliance framework and a medication inspection pack keep the evidence ready every day." },
    ],
    features: [
      { icon: "pill", t: "Medication rounds and eMAR", d: "Unit-by-unit rounds, PRN and refusals, with a printable MAR when you need paper." },
      { icon: "lock", t: "Controlled drugs", d: "Register entries need two witnesses. Balances come from the same append-only ledger." },
      { icon: "box", t: "Stock ledger and cycle continuity", d: "Track every medicine from delivery to administration and keep the next cycle on time." },
      { icon: "route", t: "Transitions of care", d: "Admissions, hospital stays and discharges reconciled against the source documents." },
      { icon: "users", t: "Residents and handover", d: "Resident profiles, care tasks and shift handover in one record." },
      { icon: "shield", t: "Incidents, risks and notifications", d: "Incident investigations, a risk register and statutory notifications with due dates." },
      { icon: "cap", t: "Skills and competencies", d: "Medication competency checks, appraisals and a skills matrix for every nurse and carer." },
      { icon: "clipboard", t: "Audits and inspection pack", d: "Scheduled audits and a ready-made medication pack for inspectors." },
    ],
    benefits: [
      { t: "Fewer missed doses", d: "Problems show up during the round, not at the end of the month." },
      { t: "Ready for inspection any day", d: "Evidence is collected as work happens, so there is nothing to assemble." },
      { t: "Safe, competent staffing", d: "See who is trained and signed off before you put them on a round." },
      { t: "Clear accountability", d: "Medication records can't be overwritten. Every entry has a named person and a time." },
    ],
    access: {
      steps: [
        { t: "We set up your home", d: "Units, beds, residents and medicines are loaded with you during onboarding." },
        { t: "Invite your team", d: "Give each person a role. They only see and do what that role allows." },
        { t: "Run care from any device", d: "Nurses record rounds on a tablet or computer while managers watch oversight dashboards." },
        { t: "Show inspectors the evidence", d: "Open the inspection pack or print a MAR in a few clicks." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "Desktop and tablet, for nurses, managers and office staff." },
        { icon: "bell", t: "Approvals and alerts", d: "One inbox for sign-offs, overdue tasks and notifications." },
        { icon: "users", t: "Team & access", d: "Owners manage members, roles and permissions in one place." },
      ],
    },
    cta: { title: "See CarePlus in your nursing home", text: "Book a walkthrough built around your units, rounds and inspection plans.", label: "Book a nursing home demo" },
  },
  {
    slug: "residential-care",
    name: "Residential care homes",
    group: "providers",
    icon: "home",
    img: "residential",
    mock: "admissions",
    card: {
      summary: "From the first enquiry to daily care, family updates and billing, for 24-hour non-nursing homes.",
      bullets: ["Enquiry to admission", "Person-centred care plans", "Family portal"],
    },
    hero: {
      eyebrow: "For residential care homes",
      title: "Care that follows the person, <em>from enquiry to every day after.</em>",
      lede: "CarePlus connects admissions, care planning, daily records, medication, staffing and finance for residential and dementia care homes, so your team spends its time with residents.",
    },
    audience: {
      intro: "Built for 24-hour residential and dementia care homes without nursing.",
      roles: ["Home managers and deputies", "Senior carers and carers", "Admissions and admin teams", "Activities and wellbeing staff", "Owners and finance teams"],
    },
    problems: [
      { p: "Enquiries live in inboxes and spreadsheets, so empty beds stay empty for longer.", s: "One workflow from enquiry and assessment to room allocation and admission checklist." },
      { p: "Care plans are written once and rarely reviewed.", s: "Person-centred plans, including 'This is me', with scheduled reviews and risk assessments." },
      { p: "Fluids, repositioning and falls are recorded on separate paper charts.", s: "Daily care records and a timeline per resident, with trends flagged for review." },
      { p: "Families have to phone for updates.", s: "A family portal and messages. AI drafts a recap, and staff approve it before anything is shared." },
    ],
    features: [
      { icon: "home", t: "Enquiry to admission", d: "Referrals, pre-admission assessment, rooms and beds, waiting list and admission checklist." },
      { icon: "heart", t: "Person-centred care plans", d: "Goals, 'This is me', dementia support, distress records and planned reviews." },
      { icon: "activity", t: "Daily care", d: "Observations, body map, skin, falls, nutrition, hydration, continence, sleep and activities." },
      { icon: "pill", t: "eMAR and legal safeguards", d: "Rounds, PRN and refusals, plus MCA, DoLS and restrictive practice records." },
      { icon: "shield", t: "Safety", d: "Incidents, safeguarding, missing resident, infection control and outbreaks." },
      { icon: "message", t: "Family portal", d: "Messages, visits and feedback, with staff approving everything families see." },
      { icon: "calendar", t: "Workforce and agency", d: "Rota, open shifts, staff bank, agency bookings, timesheets and training." },
      { icon: "wallet", t: "Funding and billing", d: "Multi-payer resident billing, personal money and occupancy revenue." },
    ],
    benefits: [
      { t: "Fill rooms faster", d: "Every enquiry has an owner and a next step." },
      { t: "Care plans that stay current", d: "Reviews come round on schedule and daily records feed back into the plan." },
      { t: "Evidence on demand", d: "Compliance dashboards and evidence packs build themselves from daily work." },
      { t: "Families who feel included", d: "Regular, approved updates mean fewer anxious phone calls." },
    ],
    access: {
      steps: [
        { t: "We map your home", d: "Floors, units, rooms and residents are set up with you." },
        { t: "Invite staff by role", d: "Carers, seniors, admin and managers each get the right access." },
        { t: "Record care where it happens", d: "Staff log daily care on phones and tablets, with a view for each unit or floor." },
        { t: "Bring families in", d: "Invite relatives to the family portal when you're ready." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "Dashboards for managers, admissions and finance." },
        { icon: "phone", t: "Mobile-friendly care records", d: "Daily care recorded on phones and tablets by carers." },
        { icon: "message", t: "Family portal", d: "Approved updates and messages for relatives." },
      ],
    },
    cta: { title: "See CarePlus in your care home", text: "We'll show you admissions, daily care and family updates using a home like yours.", label: "Book a care home demo" },
  },
  {
    slug: "home-care",
    name: "Home care",
    group: "providers",
    icon: "pin",
    img: "homecare",
    mock: "visits",
    card: {
      summary: "Plan rounds, verify visits, manage medicines in clients' homes and run payroll for your carers.",
      bullets: ["Rota and route planning", "Live visit monitoring", "Carer app that works offline"],
    },
    hero: {
      eyebrow: "For home care (domiciliary) providers",
      title: "Every visit on time. <em>Every carer supported.</em>",
      lede: "CarePlus plans your rota and routes, verifies every visit, flags late calls the moment they happen and keeps medicines stocked in clients' homes. Your carers get an app that works without signal.",
    },
    audience: {
      intro: "Built for domiciliary care agencies with one branch or many.",
      roles: ["Registered managers", "Care coordinators and schedulers", "Field carers", "Finance and payroll teams", "Families and advocates"],
    },
    problems: [
      { p: "Late and missed visits only come to light when a family calls the office.", s: "A live monitor with alerts and an escalation ladder, so late calls are picked up within minutes." },
      { p: "Rotas and runs are rebuilt by hand every week.", s: "Visit scheduling, rota building and route sequencing with travel time included." },
      { p: "Medicines run out in clients' homes.", s: "A household medication ledger, supply continuity checks and a connection to the client's pharmacy." },
      { p: "Payroll takes days of reconciling paper timesheets, travel and mileage.", s: "Approved visits flow into pay runs covering travel, mileage, sleep-ins and holiday pay." },
    ],
    features: [
      { icon: "calendar", t: "Scheduling, rota and routes", d: "Build rounds, sequence routes and see travel time before you publish." },
      { icon: "phone", t: "Carer mobile app", d: "Today's visits, notes and medication prompts, even offline. Syncs when back in signal." },
      { icon: "pin", t: "Visit verification and live monitor", d: "Electronic check-in and check-out, with late and missed calls highlighted live." },
      { icon: "bell", t: "Alerts and lone-worker cover", d: "An escalation ladder and lone-worker check-ins for carers out on their own." },
      { icon: "pill", t: "eMAR and remote witness", d: "Household medication records, with remote witnessing for high-risk medicines." },
      { icon: "plug", t: "Supply continuity and pharmacy", d: "Know what's left in each home and send reorders to the nominated pharmacy." },
      { icon: "wallet", t: "Funding plans and billing", d: "Local authority, NHS and private funding plans, with client invoicing." },
      { icon: "clock", t: "Timesheets and payroll", d: "Pay runs, exceptions, payslips and export files from approved visits." },
    ],
    benefits: [
      { t: "No missed visit goes unnoticed", d: "The office sees late calls as they happen and can act straight away." },
      { t: "Carers who feel backed up", d: "Clear rounds, the right information and help one tap away." },
      { t: "Medicines that don't run out", d: "Stock levels and reorders are tracked for every household." },
      { t: "Payroll right first time", d: "Pay comes from verified visits, not from guesswork." },
    ],
    access: {
      steps: [
        { t: "Choose a plan", d: "Plans are priced per branch, from Essentials to Enterprise." },
        { t: "Import clients and carers", d: "We help you load service users, care plans and your team." },
        { t: "Give carers the app", d: "Carers sign in on their phones and start their first round." },
        { t: "Open the family portal", d: "With consent, relatives can see visit notes and medication summaries." },
      ],
      channels: [
        { icon: "layers", t: "Office web app", d: "Scheduling, monitoring, finance and compliance." },
        { icon: "phone", t: "Carer app", d: "Visits, notes and check-ins, online or offline." },
        { icon: "users", t: "Family and proxy access", d: "Consent-controlled updates for relatives and advocates." },
      ],
    },
    cta: { title: "Start with the plan that fits your branch", text: "Home care plans start at £149 per branch per month. Book a demo or compare plans.", label: "Book a home care demo", secondary: { label: "See plans and pricing", href: "pricing.html" } },
  },
  {
    slug: "supported-living",
    name: "Supported living",
    group: "providers",
    icon: "users",
    img: null,
    mock: "hours",
    card: {
      summary: "Support plans, keyworker sessions, commissioned hours and property upkeep across every address.",
      bullets: ["Commissioned hours", "Support plans and keyworkers", "Equipment passports with QR"],
    },
    hero: {
      eyebrow: "For supported living services",
      title: "Every property, every person, <em>every commissioned hour.</em>",
      lede: "CarePlus brings support plans, keyworker sessions, commissioned hours, properties, equipment and agency staff together, so you can show commissioners the support you deliver at every address.",
    },
    audience: {
      intro: "Built for providers supporting people in their own tenancies and shared houses.",
      roles: ["Service and locality managers", "Support workers and keyworkers", "Property and facilities leads", "Commissioning and finance teams"],
    },
    problems: [
      { p: "Delivered hours and commissioned hours never quite match.", s: "Hours tracking against each commissioned package, with under-delivery flagged early." },
      { p: "Equipment and stock are spread across many addresses.", s: "Property registers, equipment passports with QR codes, stocktakes and inspections." },
      { p: "Agency staff across several properties are hard to keep track of.", s: "Agency shifts, timesheets, worker compliance and performance in one workspace." },
      { p: "Outcomes are hard to evidence.", s: "Support plans with goals, keyworker sessions and reports you can share." },
    ],
    features: [
      { icon: "heart", t: "Support plans and keyworkers", d: "Goals, outcomes and keyworker sessions for each person." },
      { icon: "clock", t: "Commissioned hours", d: "Delivered against commissioned hours, by property and by person." },
      { icon: "home", t: "Properties", d: "Each address with its people, tasks, inspections and upkeep." },
      { icon: "qr", t: "Equipment with QR", d: "Equipment passports, checks, faults and reports. Scan a QR code to open one." },
      { icon: "box", t: "Stock and stocktake", d: "Stock levels, movements and stocktakes for every property." },
      { icon: "briefcase", t: "Agency management", d: "Agencies, shifts, timesheets, worker compliance and access." },
      { icon: "clipboard", t: "Workflows and approvals", d: "Audited records with edit reasons, sign-off and history." },
      { icon: "users", t: "Family sharing", d: "Share updates with families in line with each person's wishes." },
    ],
    benefits: [
      { t: "Hours you can evidence", d: "Show commissioners exactly what was delivered, and where." },
      { t: "Safer homes", d: "Equipment and property checks are due, done and recorded." },
      { t: "Agency spend under control", d: "Every agency hour is booked, approved and matched." },
      { t: "Progress you can see", d: "Goals and outcomes are recorded, not just tasks." },
    ],
    access: {
      steps: [
        { t: "Add your properties", d: "Set up each address with its tenants and equipment." },
        { t: "Load support plans and hours", d: "Commissioned packages and support plans are entered with you." },
        { t: "Invite your team", d: "Support workers, keyworkers and managers each get their role." },
        { t: "Share progress", d: "Run reports for commissioners and share updates with families." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "For managers, coordinators and office staff." },
        { icon: "phone", t: "Mobile-friendly records", d: "Support workers record sessions as they go." },
        { icon: "qr", t: "QR equipment passports", d: "Scan equipment on site to see its history and checks." },
      ],
    },
    cta: { title: "See CarePlus for supported living", text: "We'll walk you through hours, properties and support plans using services like yours.", label: "Book a supported living demo" },
  },
  {
    slug: "mental-health",
    name: "Mental health services",
    group: "providers",
    icon: "brain",
    img: null,
    mock: "stock",
    card: {
      summary: "Keep equipment safe, stock in date and agency staffing under control in calm, clear workspaces.",
      bullets: ["Equipment workspace", "Stock and suppliers", "Healthcare agency"],
    },
    hero: {
      eyebrow: "For mental health services",
      title: "Calm, clear operations <em>behind every service.</em>",
      lede: "CarePlus gives mental health services one calm place to run equipment, stock, suppliers and healthcare agency staffing, with a manager copilot that pulls the evidence together and leaves every decision with you.",
    },
    audience: {
      intro: "Built for mental health care and support providers and the teams behind their wards and services.",
      roles: ["Service managers", "Ward and service teams", "Facilities and stock leads", "Agency and staffing coordinators"],
    },
    problems: [
      { p: "Equipment checks are tracked on separate lists and get missed.", s: "An equipment workspace with passports, scheduled checks and fault reporting." },
      { p: "Stock runs low or goes out of date without anyone noticing.", s: "Stock levels with expiry warnings and reorders through the supplier marketplace." },
      { p: "Healthcare agency bookings and compliance are hard to control.", s: "A healthcare agency workspace for bookings, workers, timesheets, compliance and spend." },
      { p: "Managers are buried in reports.", s: "A manager copilot gathers evidence from your records with links to the source. You decide what to do." },
    ],
    features: [
      { icon: "eye", t: "Service overview", d: "A calm, one-page view of what needs attention today." },
      { icon: "heart", t: "Care and service records", d: "Clear records for the people you support and your services." },
      { icon: "wrench", t: "Equipment workspace", d: "Passports, checks, faults and history for every item, with QR codes." },
      { icon: "box", t: "Stock control", d: "Levels, movements, expiry and stocktakes, with clear warnings." },
      { icon: "cart", t: "Supplier marketplace", d: "Order from suppliers, with purchase approvals before anything is bought." },
      { icon: "briefcase", t: "Healthcare agency", d: "Bookings, worker profiles, timesheets, compliance and agency spend." },
      { icon: "sparkle", t: "Manager copilot", d: "Summaries and suggestions from your records. Read-only, with sources linked." },
      { icon: "lock", t: "Roles and reports", d: "Role-based access and reports saved as snapshots." },
    ],
    benefits: [
      { t: "Safer environments", d: "Equipment is checked on time and faults are followed up." },
      { t: "No surprise shortages", d: "Stock warnings arrive before you run out." },
      { t: "Agency spend you can explain", d: "Bookings, hours and invoices line up." },
      { t: "More time for people", d: "Less chasing, clearer priorities." },
    ],
    access: {
      steps: [
        { t: "Set up your services", d: "Wards, sites and services are configured with you." },
        { t: "Load equipment and stock", d: "Import your equipment list and stock items, and print QR labels." },
        { t: "Connect suppliers and agencies", d: "Add your approved suppliers and agencies." },
        { t: "Invite your team", d: "Everyone signs in with the access their role needs." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "Overview, records, equipment, stock and agency." },
        { icon: "qr", t: "QR equipment passports", d: "Scan to see checks and report a fault." },
        { icon: "sparkle", t: "Manager copilot", d: "Ask for a summary. You make the decision." },
      ],
    },
    cta: { title: "See CarePlus for mental health services", text: "We'll show you equipment, stock and agency workspaces with examples from a service like yours.", label: "Book a mental health demo" },
  },
  {
    slug: "learning-disability",
    name: "Learning disability services",
    group: "providers",
    icon: "hand",
    img: null,
    mock: "sharing",
    card: {
      summary: "Specialist equipment, consent-led family sharing and partner access for contractors and suppliers.",
      bullets: ["Specialist equipment upkeep", "Consent-led family portal", "Partner portal"],
    },
    hero: {
      eyebrow: "For learning disability services",
      title: "Support built around each person's <em>own wishes.</em>",
      lede: "CarePlus helps learning disability services look after specialist equipment, manage stock and agency staffing, and share information with families only in the way each person has chosen.",
    },
    audience: {
      intro: "Built for providers supporting people with learning disabilities and autistic people.",
      roles: ["Service managers", "Support workers", "Families and advocates", "Contractors and suppliers"],
    },
    problems: [
      { p: "Hoists, wheelchairs and specialist beds need regular servicing that's easy to miss.", s: "Equipment passports with upkeep schedules, inspections and repair history." },
      { p: "Sharing information with families has to respect each person's wishes.", s: "A family portal where sharing follows the person's recorded wishes, needs independent approval and can expire." },
      { p: "Contractors and suppliers chase jobs and orders by phone.", s: "A partner portal where they see only the open jobs and orders for their company." },
      { p: "Some sites have poor signal.", s: "Offline checks that sync when the connection returns." },
    ],
    features: [
      { icon: "wrench", t: "Specialist equipment", d: "Passports, upkeep, inspections and repairs, with QR codes." },
      { icon: "box", t: "Stock control", d: "Balances, warnings and stocktakes across sites." },
      { icon: "briefcase", t: "Healthcare agency", d: "Agency bookings, workers, timesheets and compliance." },
      { icon: "users", t: "Family portal", d: "Topic-by-topic sharing based on the person's wishes, with approval and expiry dates." },
      { icon: "building", t: "Partner portal", d: "Contractors and suppliers see their open jobs and orders. They can't approve or release them." },
      { icon: "phone", t: "Offline checks", d: "Complete checks without signal and sync later." },
      { icon: "wallet", t: "Finance and procurement", d: "Saved, audited finance and purchasing records." },
      { icon: "sparkle", t: "Copilot", d: "Read-only summaries linked to your records." },
    ],
    benefits: [
      { t: "The person stays in control", d: "Families see what the person has agreed to share, and nothing more." },
      { t: "Equipment people can rely on", d: "Servicing happens on time, every time." },
      { t: "Fewer phone calls", d: "Partners check the portal instead of ringing the office." },
      { t: "A record you can trust", d: "Every change is audited, with a reason." },
    ],
    access: {
      steps: [
        { t: "Set up services and people", d: "We configure your services, people and equipment with you." },
        { t: "Record each person's wishes", d: "Decide together what can be shared, with whom and for how long." },
        { t: "Invite families and partners", d: "Families use the family portal. Contractors and suppliers use the partner portal." },
        { t: "Work on site, online or off", d: "Support workers complete checks wherever they are." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "For managers and support teams." },
        { icon: "users", t: "Family portal", d: "Consent-led updates for families and advocates." },
        { icon: "building", t: "Partner portal", d: "Open jobs and orders for contractors and suppliers." },
      ],
    },
    cta: { title: "See CarePlus for learning disability services", text: "We'll show you equipment, family sharing and the partner portal in action.", label: "Book a learning disability demo" },
  },
  {
    slug: "childcare",
    name: "Nurseries and childcare",
    group: "providers",
    icon: "baby",
    img: "childcare",
    mock: "ratios",
    card: {
      summary: "Live ratios, EYFS learning journeys, funding claims and a parent portal for early years settings.",
      bullets: ["Live room ratios", "EYFS learning journeys", "Funding and billing"],
    },
    hero: {
      eyebrow: "For nurseries and childcare providers",
      title: "Safe ratios, happy parents, <em>funding claimed on time.</em>",
      lede: "CarePlus brings children's records, EYFS learning journeys, live ratios, funding claims, billing and parent communication together for nurseries and early years settings.",
    },
    audience: {
      intro: "Built for day nurseries, pre-schools and early years settings.",
      roles: ["Nursery owners and managers", "Room leaders and practitioners", "Admin and finance teams", "Parents and carers"],
    },
    problems: [
      { p: "Ratios are worked out on whiteboards and change by the minute.", s: "Live ratios for each room, flagged the moment a room goes over." },
      { p: "Funding claims and invoices take days each term.", s: "Funding claims, a funding ledger, sessions and billing in one place." },
      { p: "Learning journeys pile up as paper and photos.", s: "EYFS observations and learning journeys recorded as they happen." },
      { p: "Parents only hear from you at pick-up.", s: "A parent portal with daily care updates and messages." },
    ],
    features: [
      { icon: "users", t: "Ratios and occupancy", d: "Live room ratios, sessions and occupancy planning." },
      { icon: "cap", t: "EYFS and learning journeys", d: "Observations, development tracking and learning journeys." },
      { icon: "heart", t: "Daily care", d: "Meals, sleep, nappies and wellbeing recorded through the day." },
      { icon: "wallet", t: "Funding and billing", d: "Funding claims, ledger, invoices and session billing." },
      { icon: "message", t: "Parent portal", d: "Updates, messages and engagement with families." },
      { icon: "shield", t: "Safeguarding and complaints", d: "Safeguarding records, complaints and compliance reports." },
      { icon: "search", t: "Enquiries and onboarding", d: "A pipeline from first enquiry to a child's first day." },
      { icon: "briefcase", t: "Hiring and equipment", d: "Recruit practitioners and keep equipment checked." },
    ],
    benefits: [
      { t: "Ratios you can trust", d: "Know every room is safely staffed right now." },
      { t: "Funding claimed in full", d: "Claims come from attendance records you already keep." },
      { t: "Parents who feel close", d: "Regular updates build trust." },
      { t: "Inspection-ready records", d: "EYFS evidence and safeguarding logs are always up to date." },
    ],
    access: {
      steps: [
        { t: "Set up rooms and sessions", d: "Rooms, age groups, sessions and fees are configured with you." },
        { t: "Add children and staff", d: "Load children's records and invite practitioners by role." },
        { t: "Record the day", d: "Practitioners log care and observations on tablets." },
        { t: "Invite parents", d: "Parents join the parent portal to follow their child's day." },
      ],
      channels: [
        { icon: "layers", t: "CarePlus web app", d: "For managers, room leaders and finance." },
        { icon: "phone", t: "Tablet-friendly records", d: "Observations and daily care on the go." },
        { icon: "message", t: "Parent portal", d: "Updates and messages for families." },
      ],
    },
    cta: { title: "See CarePlus in your nursery", text: "We'll show you ratios, learning journeys and funding using a setting like yours.", label: "Book a nursery demo" },
  },

  // ───────────────────────────── Workforce ─────────────────────────────
  {
    slug: "recruitment-agencies",
    name: "Staffing and recruitment agencies",
    group: "workforce",
    icon: "briefcase",
    img: "agency",
    mock: "shifts",
    card: {
      summary: "Onboard candidates, keep them compliant, fill shifts fast and invoice from approved timesheets.",
      bullets: ["Candidate compliance", "Shift matching", "Timesheets and invoicing"],
    },
    hero: {
      eyebrow: "For care staffing and recruitment agencies",
      title: "Fill more shifts <em>with fully compliant staff.</em>",
      lede: "CarePlus runs your whole agency, from candidate onboarding and compliance to shift matching, sign-ins, timesheets and invoicing, and connects you to care providers looking for staff.",
    },
    audience: {
      intro: "Built for agencies that supply nurses, carers and support workers to care providers.",
      roles: ["Agency owners and directors", "Recruiters and consultants", "Compliance officers", "Finance and payroll teams"],
    },
    problems: [
      { p: "DBS checks and training certificates expire without warning.", s: "Candidate compliance tracking that blocks bookings when something has lapsed." },
      { p: "Shifts are filled by phone and WhatsApp.", s: "Shift matching and broadcasting through the workforce marketplace." },
      { p: "Timesheets have to be chased from every client.", s: "Digital sign-ins and timesheets approved by the provider." },
      { p: "Invoices don't match the hours worked.", s: "Invoices built from approved timesheets, with performance and margin insight." },
    ],
    features: [
      { icon: "users", t: "Candidates and onboarding", d: "Applications, onboarding steps and staff directory." },
      { icon: "shield", t: "Compliance", d: "Track documents and training, and block anyone who isn't cleared." },
      { icon: "calendar", t: "Placements and shift matching", d: "Match the right people to shifts and broadcast open shifts." },
      { icon: "building", t: "Provider clients", d: "Client records, contracts and messages." },
      { icon: "clock", t: "Sign-ins and timesheets", d: "Digital sign-ins and timesheets the provider approves." },
      { icon: "wallet", t: "Invoicing", d: "Invoices from approved hours, with commissions tracked." },
      { icon: "chart", t: "Performance and insights", d: "Fill rates, worker performance and agency insights." },
      { icon: "cart", t: "Agency marketplace", d: "Get found by care providers who need staff." },
    ],
    benefits: [
      { t: "Only compliant staff go out", d: "Anyone not cleared is blocked automatically." },
      { t: "Shifts filled faster", d: "Matching and broadcasting replace endless phone calls." },
      { t: "Paid sooner", d: "Approved timesheets turn into accurate invoices." },
      { t: "Clients who trust you", d: "Providers see compliance and performance for themselves." },
    ],
    access: {
      steps: [
        { t: "Set up your agency", d: "Your agency, branches and admin users are configured with you." },
        { t: "Onboard your workers", d: "Candidates complete onboarding and upload compliance documents." },
        { t: "Connect provider clients", d: "Link to the care providers you supply." },
        { t: "Fill, sign in, invoice", d: "Match shifts, collect timesheets and raise invoices." },
      ],
      channels: [
        { icon: "layers", t: "Agency workspace", d: "For admins, recruiters, compliance and finance." },
        { icon: "phone", t: "Worker access", d: "Workers see shifts and sign in on their phones." },
        { icon: "cart", t: "Marketplace", d: "Where providers find agencies and workers." },
      ],
    },
    cta: { title: "Run your agency on CarePlus", text: "See onboarding, compliance and shift matching working together.", label: "Book an agency demo" },
  },
  {
    slug: "care-professionals",
    name: "Carers, nurses and support workers",
    group: "workforce",
    icon: "heart",
    img: "professional",
    mock: "app",
    card: {
      summary: "Your shifts, timesheets, training and pay in one app, with extra shifts when you want them.",
      bullets: ["Shifts and visits", "Timesheets and payslips", "Training and certificates"],
    },
    hero: {
      eyebrow: "For carers, nurses and support workers",
      title: "Your shifts, your training, <em>your pay. In your pocket.</em>",
      lede: "If your employer or agency uses CarePlus, you get one app for your rota, visits, timesheets, training and leave. It works without signal, and you can pick up extra shifts if you want them.",
    },
    audience: {
      intro: "For the people who deliver care, whether you're employed, on the bank or with an agency.",
      roles: ["Carers and care assistants", "Nurses", "Senior carers", "Support workers", "Bank and agency staff"],
    },
    problems: [
      { p: "Rotas arrive by text and change without notice.", s: "Your shifts and visits are always up to date in the app." },
      { p: "Paper timesheets lead to pay queries.", s: "Timesheets come from your check-ins, and you can see payslips and approval status." },
      { p: "Training certificates get lost and expire.", s: "Your certificates and training in one place, with reminders before they expire." },
      { p: "Finding extra work means phoning around.", s: "See open shifts you're eligible for and request them." },
    ],
    features: [
      { icon: "calendar", t: "Shifts and visits", d: "Today's work with addresses, notes and what each person needs." },
      { icon: "phone", t: "Works offline", d: "Record visits without signal. Everything syncs later." },
      { icon: "clock", t: "Timesheets", d: "Built from your check-ins, with approval status you can see." },
      { icon: "wallet", t: "Payslips", d: "Clear pay, including travel, mileage and sleep-ins where they apply." },
      { icon: "cap", t: "Training and certificates", d: "Courses, competencies and expiry reminders." },
      { icon: "calendar", t: "Leave and requests", d: "Request leave and send requests to your manager." },
      { icon: "users", t: "Shadow shifts", d: "Shadow experienced colleagues when you start." },
      { icon: "cart", t: "Extra shifts", d: "See open shifts you're eligible for and request them." },
    ],
    benefits: [
      { t: "Know where you need to be", d: "No more chasing rota changes." },
      { t: "Get paid correctly", d: "Your pay comes from what you actually worked." },
      { t: "Stay qualified", d: "Reminders arrive before training expires." },
      { t: "Work when you want", d: "Pick up extra shifts that suit you." },
    ],
    access: {
      steps: [
        { t: "Get an invitation", d: "CarePlus accounts are invite-only. Your employer or agency sends you an invitation by email." },
        { t: "Accept and set a password", d: "Open the invitation link and create your password." },
        { t: "Sign in on your phone", d: "Use the same login on your phone or computer." },
        { t: "Start your first shift", d: "Your shifts, visits and training are waiting for you." },
      ],
      channels: [
        { icon: "phone", t: "CarePlus mobile app", d: "Today, visits, sync and profile." },
        { icon: "login", t: "Secure sign-in", d: "Your own account, your own records." },
        { icon: "lock", t: "Your data, your view", d: "You always keep access to your own shifts, timesheets and leave." },
      ],
    },
    cta: { title: "Already invited? Sign in.", text: "If you haven't received an invitation, ask your manager or agency to add you to CarePlus.", label: "Sign in to CarePlus", href: "LOGIN", secondary: { label: "My employer isn't on CarePlus", href: "get-started.html#care-professionals" } },
  },

  // ─────────────────────── Partners & commissioners ───────────────────────
  // ─────────────────────────────── Healthcare ───────────────────────────────
  // Hospitals, clinics and laboratories: these pages lead with what works today through
  // care providers on CarePlus, and list planned capabilities under "early access".
  {
    slug: "hospitals",
    name: "Hospitals",
    group: "healthcare",
    icon: "building",
    img: null,
    mock: "discharge",
    card: {
      summary: "Discharge patients to care providers who reconcile every medicine and admit them through a clear, tracked process.",
      bullets: ["Safer discharge to care", "Medication reconciled line by line", "Compliant agency staff"],
    },
    hero: {
      eyebrow: "For hospitals and NHS trusts",
      title: "Discharge to care, <em>without the loose ends.</em>",
      lede: "When patients leave hospital for a care home or home care, providers on CarePlus take them through a tracked admission and reconcile every medicine against your discharge letter. Agencies on CarePlus can also send you compliant nurses and carers.",
    },
    audience: {
      intro: "For the hospital teams who move patients into social care, and the wards that need extra staff.",
      roles: ["Discharge and patient flow teams", "Ward managers and matrons", "Hospital pharmacists", "Integrated care and NHS trust leads", "Staffing and bank offices"],
    },
    problems: [
      { p: "Medication changes made in hospital are missed when the patient arrives at their care home.", s: "Care providers on CarePlus reconcile each discharge line by line: kept, changed, started or stopped, with a named person signing it off." },
      { p: "Discharges stall while a care home works through its admission paperwork.", s: "Care homes manage referrals, pre-admission assessments, rooms and admission checklists in one tracked workflow." },
      { p: "Home care packages start late after discharge.", s: "Home care providers schedule the first visits, set up medication records and get carers there with the app." },
      { p: "Wards are short of nurses and carers.", s: "Agencies on CarePlus supply staff whose DBS checks and training are tracked, and blocked when they lapse." },
    ],
    features: [
      { icon: "route", t: "Transitions of care", d: "Admissions, hospital transfers and discharges reconciled against the source documents." },
      { icon: "pill", t: "Medication reconciliation", d: "Each line is marked as kept, changed, started or stopped, and signed off by a named person." },
      { icon: "home", t: "Referrals into care homes", d: "Enquiry, pre-admission assessment, room allocation and admission checklist." },
      { icon: "pin", t: "Home care starts", d: "First visits scheduled, medication records set up and carers on their way." },
      { icon: "briefcase", t: "Compliant agency staff", d: "Nurses and carers with tracked DBS checks, training and competencies." },
      { icon: "plug", t: "NHS data feeds", d: "Local authority and NHS data feeds are available to providers on Enterprise plans." },
    ],
    benefits: [
      { t: "Safer discharges", d: "Medication changes are checked and signed off when the patient arrives." },
      { t: "Faster flow", d: "Care providers work through admissions in one tracked process." },
      { t: "Fewer readmissions from medication errors", d: "What you prescribed is what gets given." },
      { t: "Staff you can trust", d: "Agency workers arrive cleared and trained." },
    ],
    roadmap: {
      intro: "We're building tools for hospital teams to work with care providers directly. Register for early access to help shape them.",
      items: [
        { t: "Discharge referrals", d: "Send a referral and discharge summary straight to a care provider on CarePlus." },
        { t: "Care vacancy search", d: "See which providers have capacity for a patient's needs." },
        { t: "Discharge status", d: "Follow each patient's admission or first visit until it's complete." },
      ],
    },
    access: {
      steps: [
        { t: "Work with providers on CarePlus", d: "Care homes and home care agencies in your area may already use CarePlus." },
        { t: "Share discharge information", d: "Providers reconcile your discharge letters against their records." },
        { t: "Book compliant staff", d: "Use agencies on CarePlus to cover ward shifts." },
        { t: "Join early access", d: "Register to pilot direct referrals and discharge tracking." },
      ],
      channels: [
        { icon: "users", t: "Through care providers", d: "Available today wherever your local providers use CarePlus." },
        { icon: "briefcase", t: "Through agencies", d: "Book staff from agencies that run on CarePlus." },
        { icon: "sparkle", t: "Early access programme", d: "Pilot the hospital tools as we build them." },
      ],
    },
    cta: { title: "Help shape CarePlus for hospitals", text: "Register for early access, or talk to us about the providers you discharge to.", label: "Register for early access" },
  },
  {
    slug: "clinics",
    name: "Clinics and GP practices",
    group: "healthcare",
    icon: "heart",
    img: null,
    mock: "review",
    card: {
      summary: "Your medication changes and reviews reach the care teams who give the medicines, recorded and signed off.",
      bullets: ["Medication changes followed through", "Audited eMAR records", "Pharmacy change notices"],
    },
    hero: {
      eyebrow: "For clinics, GP practices and community teams",
      title: "Your review, <em>carried out exactly.</em>",
      lede: "When you change a patient's medicines, care providers on CarePlus record the change in their eMAR with a reason and a named person, pass it to the pharmacy and keep stock in step. You get fewer follow-up calls and safer care.",
    },
    audience: {
      intro: "For the primary and community care teams who look after people living in care homes or receiving home care.",
      roles: ["GPs and practice teams", "Practice and clinical pharmacists", "Community nurses", "Outpatient and specialist clinics", "Care home support teams"],
    },
    problems: [
      { p: "Medication changes from a review don't always reach the people giving the medicines.", s: "Care providers record every change in their eMAR, with a reason and a named person. Records can't be overwritten." },
      { p: "Pharmacies dispense the old dose after a change.", s: "Providers send change notices to their nominated pharmacy, which acknowledges them." },
      { p: "Missed or refused doses only come up at the next appointment.", s: "Providers see missed, refused and PRN doses during the round, and trends over time." },
      { p: "Controlled drugs prescribed for end-of-life care need careful oversight.", s: "Providers keep a two-witness controlled drugs register and an append-only stock ledger." },
    ],
    features: [
      { icon: "pill", t: "eMAR with audited changes", d: "Medication changes recorded with a reason and a named person." },
      { icon: "bell", t: "Pharmacy change notices", d: "Changes passed to the nominated pharmacy and acknowledged." },
      { icon: "chart", t: "Medication trends", d: "Missed, refused and PRN doses over time, by resident." },
      { icon: "lock", t: "Controlled drugs", d: "A two-witness register with balances from the same ledger." },
      { icon: "route", t: "Transitions of care", d: "Changes after hospital stays reconciled line by line." },
      { icon: "file", t: "Printable MAR", d: "A current MAR chart whenever you need one." },
    ],
    benefits: [
      { t: "Changes that stick", d: "Your decisions are recorded and carried out." },
      { t: "Fewer follow-up calls", d: "Care teams and pharmacies get the same information." },
      { t: "Better reviews", d: "Missed and refused doses are visible before you review." },
      { t: "Clinical decisions stay yours", d: "CarePlus records care. It never prescribes or sets doses." },
    ],
    roadmap: {
      intro: "We're building ways for clinicians to work with care teams directly. Register for early access to help shape them.",
      items: [
        { t: "Clinician view", d: "Read-only access to a patient's medication record and recent observations." },
        { t: "Change requests", d: "Send a medication change straight to the care team for sign-off." },
        { t: "Review preparation", d: "A pre-review summary of missed doses, PRN use and observations." },
      ],
    },
    access: {
      steps: [
        { t: "Work with providers on CarePlus", d: "Care homes and home care agencies you support may already use it." },
        { t: "Send changes as you do today", d: "Providers record your changes and pass them to the pharmacy." },
        { t: "Ask for a printed MAR", d: "Providers can print a current MAR for reviews." },
        { t: "Join early access", d: "Register to pilot the clinician tools." },
      ],
      channels: [
        { icon: "users", t: "Through care providers", d: "Available today wherever your patients' providers use CarePlus." },
        { icon: "plug", t: "Through pharmacies", d: "Change notices reach nominated pharmacies." },
        { icon: "sparkle", t: "Early access programme", d: "Pilot the clinician view as we build it." },
      ],
    },
    cta: { title: "Help shape CarePlus for clinics", text: "Register for early access, or tell us about the care providers you support.", label: "Register for early access" },
  },
  {
    slug: "laboratories",
    name: "Laboratories",
    group: "healthcare",
    icon: "search",
    img: null,
    mock: "samples",
    card: {
      summary: "Reach care providers through the supplier marketplace today, and pilot sample and results tools in early access.",
      bullets: ["Supplier marketplace", "Outbreak and infection records", "Early access: results"],
    },
    hero: {
      eyebrow: "For pathology and testing laboratories",
      title: "Closer to the care teams <em>who send you samples.</em>",
      lede: "Care providers on CarePlus already manage infection control, outbreaks and their supplies in one place. Laboratories can reach them through the supplier marketplace today and join early access for sample and results tools.",
    },
    audience: {
      intro: "For laboratories that test samples from care homes, home care and supported living services.",
      roles: ["Pathology laboratories", "Private testing laboratories", "Infection prevention teams", "Test kit and consumables suppliers"],
    },
    problems: [
      { p: "Care homes don't always have test kits and sample supplies when an outbreak starts.", s: "Providers order supplies through the supplier marketplace, with approval and stock warnings." },
      { p: "Outbreak information is scattered across calls and emails.", s: "Care homes record infection control and outbreaks in CarePlus, alongside each resident's care." },
      { p: "Results take a while to reach the care team who needs them.", s: "In early access: sending results straight to the provider's record." },
      { p: "It's hard to see which samples are still outstanding.", s: "In early access: sample tracking that both sides can see." },
    ],
    features: [
      { icon: "cart", t: "Supplier marketplace", d: "List test kits and sample supplies where care providers buy." },
      { icon: "clipboard", t: "Approved orders", d: "Orders reach you after the provider has signed them off." },
      { icon: "truck", t: "Delivery tracking", d: "Order status from approval to delivery." },
      { icon: "shield", t: "Infection control records", d: "Care homes record outbreaks and infection control in CarePlus." },
      { icon: "building", t: "Partner portal", d: "See your company's open orders only." },
    ],
    benefits: [
      { t: "Supplies in place", d: "Care teams can order what they need before an outbreak spreads." },
      { t: "Clearer context", d: "Providers record outbreaks alongside care." },
      { t: "New customers", d: "Reach providers across care settings." },
      { t: "A say in what's built", d: "Early access partners shape the results tools." },
    ],
    roadmap: {
      intro: "Laboratory tools are in development. Register for early access to pilot them with care providers.",
      items: [
        { t: "Sample tracking", d: "Follow samples from collection to result, visible to the care provider." },
        { t: "Results to the record", d: "Send results to the right person's record, for a named clinician or manager to review." },
        { t: "Outbreak dashboards", d: "Results across a home during an outbreak, alongside infection control records." },
      ],
    },
    access: {
      steps: [
        { t: "Register your laboratory", d: "Tell us about your tests and the areas you serve." },
        { t: "List your supplies", d: "Put test kits and sample supplies on the marketplace." },
        { t: "Receive approved orders", d: "Providers' signed-off orders reach you." },
        { t: "Pilot the results tools", d: "Early access partners test sample tracking with care providers." },
      ],
      channels: [
        { icon: "cart", t: "Supplier marketplace", d: "Available today." },
        { icon: "building", t: "Partner portal", d: "Your open orders, under your company name." },
        { icon: "sparkle", t: "Early access programme", d: "Sample and results tools, in development." },
      ],
    },
    cta: { title: "Help shape CarePlus for laboratories", text: "Register for early access, or list your supplies on the marketplace.", label: "Register for early access" },
  },
  {
    slug: "pharmacies",
    name: "Pharmacies",
    group: "healthcare",
    icon: "pill",
    img: null,
    mock: "reorders",
    card: {
      summary: "Receive reorders, change notices and delivery requests from the care providers you supply.",
      bullets: ["Electronic reorders", "Change notices", "Delivery tracking"],
    },
    hero: {
      eyebrow: "For community pharmacies",
      title: "Fewer phone calls. <em>Clearer orders.</em> Safer supply.",
      lede: "Care providers on CarePlus can connect to their nominated pharmacy. Reorders, medication changes and delivery requests come to you in a clear, consistent format, so medicines reach people before they run out.",
    },
    audience: {
      intro: "For community pharmacies supplying home care clients and care homes.",
      roles: ["Pharmacists", "Dispensary teams", "Care home and domiciliary account leads"],
    },
    problems: [
      { p: "Reorders arrive by phone, fax and email in different formats.", s: "Electronic reorders from the provider's supply continuity tools." },
      { p: "Dose changes after a hospital stay or GP review get missed.", s: "Change notices from the provider's medication records, which you acknowledge." },
      { p: "Urgent shortages are spotted too late.", s: "Providers track stock in each home, so urgent shortages are flagged early." },
      { p: "Delivery questions tie up your team.", s: "Delivery tracking that both you and the provider can see." },
    ],
    features: [
      { icon: "plug", t: "Pharmacy connection", d: "A direct link between the provider and their nominated pharmacy." },
      { icon: "file", t: "Electronic reorders", d: "Repeat orders grouped by cycle and household." },
      { icon: "bell", t: "Change notices", d: "Medication changes shared for acknowledgement." },
      { icon: "truck", t: "Delivery tracking", d: "Planned and dispatched deliveries, visible to both sides." },
      { icon: "box", t: "Supply continuity", d: "Providers track stock in each home so shortages are spotted early." },
      { icon: "route", t: "Transitions of care", d: "Admissions and discharges reconciled by the provider before orders change." },
    ],
    benefits: [
      { t: "Less admin", d: "Orders arrive complete and consistent." },
      { t: "Fewer errors", d: "Changes are explicit and acknowledged." },
      { t: "Stronger relationships", d: "Providers can see where every order has got to." },
      { t: "Safer supply", d: "Shortages are flagged before they become urgent." },
    ],
    access: {
      steps: [
        { t: "A provider nominates you", d: "Care providers on CarePlus add you as their nominated pharmacy." },
        { t: "Confirm the connection", d: "We confirm your details and how you want to receive orders." },
        { t: "Receive and acknowledge", d: "Reorders and change notices come through the connection." },
        { t: "Update delivery status", d: "Mark deliveries as planned and dispatched." },
      ],
      channels: [
        { icon: "plug", t: "Pharmacy connection", d: "Available on CarePlus home care plans and as an add-on." },
        { icon: "mail", t: "Partner onboarding", d: "Register your interest and we'll set up your connection." },
      ],
    },
    cta: { title: "Become a CarePlus partner pharmacy", text: "Tell us about your pharmacy and the providers you supply.", label: "Register as a partner pharmacy" },
  },
  {
    slug: "suppliers",
    name: "Suppliers and vendors",
    group: "partners",
    icon: "truck",
    img: "suppliers",
    mock: "orders",
    card: {
      summary: "Reach care providers through the supplier marketplace, win group orders and track them to delivery.",
      bullets: ["Supplier marketplace", "Group buying", "Order tracking"],
    },
    hero: {
      eyebrow: "For suppliers and vendors",
      title: "Supply the care sector <em>through one marketplace.</em>",
      lede: "Care providers use CarePlus to buy consumables, equipment and supplies. List with us to be found, receive approved purchase orders and combined group orders, and see every order through to delivery.",
    },
    audience: {
      intro: "For businesses that supply care homes, home care and supported living services.",
      roles: ["Consumables and PPE suppliers", "Equipment and mobility suppliers", "Facilities and catering suppliers", "Account and sales teams"],
    },
    problems: [
      { p: "Selling to care providers one home at a time is slow.", s: "A supplier marketplace where providers can browse your catalogue." },
      { p: "Orders get stuck waiting for approval.", s: "Providers approve purchases in CarePlus before the order reaches you, so you only receive approved orders." },
      { p: "Small orders cost too much to deliver.", s: "Group buying combines orders across homes into one larger order." },
      { p: "Customers keep asking where their order is.", s: "Order and delivery status both sides can see." },
    ],
    features: [
      { icon: "cart", t: "Supplier marketplace", d: "Your catalogue in front of care providers." },
      { icon: "clipboard", t: "Approved purchase orders", d: "Orders arrive after the provider has signed them off." },
      { icon: "layers", t: "Group buying", d: "Combined orders across multiple homes." },
      { icon: "file", t: "Contracts", d: "Supplier contracts and agreed terms in one place." },
      { icon: "truck", t: "Delivery tracking", d: "Order status from approval to delivery." },
      { icon: "building", t: "Partner portal", d: "See your company's open orders only. You can't approve or release them." },
    ],
    benefits: [
      { t: "Reach more providers", d: "Be found where care teams already buy." },
      { t: "Bigger orders", d: "Group buying combines demand across homes." },
      { t: "Less chasing", d: "Orders are already approved when they reach you." },
      { t: "Clear communication", d: "Status updates replace phone calls." },
    ],
    access: {
      steps: [
        { t: "Register your interest", d: "Tell us what you supply and where." },
        { t: "Set up your catalogue", d: "We help you list your products and terms." },
        { t: "Receive approved orders", d: "Providers' signed-off orders reach you." },
        { t: "Fulfil and update", d: "Update status as you dispatch and deliver." },
      ],
      channels: [
        { icon: "cart", t: "Supplier marketplace", d: "Where providers browse and buy." },
        { icon: "building", t: "Partner portal", d: "Your open orders, under your company name." },
      ],
    },
    cta: { title: "Become a CarePlus supplier", text: "Tell us about your products and we'll get you listed.", label: "Register as a supplier" },
  },
  {
    slug: "technicians",
    name: "Technicians and contractors",
    group: "partners",
    icon: "wrench",
    img: null,
    mock: "jobs",
    card: {
      summary: "Receive maintenance requests, send quotes and keep care settings safe and running.",
      bullets: ["Maintenance requests", "Quotes and scheduling", "Permits and inspections"],
    },
    hero: {
      eyebrow: "For technicians and contractors",
      title: "Clear jobs, quick quotes, <em>safe sites.</em>",
      lede: "Care settings use CarePlus to log faults, schedule inspections and manage contractors. Receive clear requests, send quotes, agree visits and see the permits you need, all in one place.",
    },
    audience: {
      intro: "For trades and service engineers who keep care buildings and equipment safe.",
      roles: ["Field service technicians", "Maintenance contractors", "Equipment engineers (hoists, beds, nurse call)", "Building and fire safety trades"],
    },
    problems: [
      { p: "Jobs arrive as vague phone messages.", s: "Maintenance requests with the location, equipment history and photos." },
      { p: "Quotes get lost in email threads.", s: "Send quotes against each request and track whether they're accepted." },
      { p: "Site rules and permits aren't clear.", s: "Permits to work and contractor records the site manages." },
      { p: "Nobody can tell if a job is finished.", s: "Work orders and job status both sides can see." },
    ],
    features: [
      { icon: "wrench", t: "Maintenance requests", d: "Faults raised by staff, with equipment and location attached." },
      { icon: "file", t: "Quotes", d: "Send and track quotes against each request." },
      { icon: "calendar", t: "Scheduling", d: "Agree visit times and get reminders." },
      { icon: "clipboard", t: "Work orders", d: "Job status from request to sign-off." },
      { icon: "shield", t: "Permits and contractors", d: "Permits to work and contractor records the site keeps." },
      { icon: "message", t: "Messages", d: "Talk to the site about each job." },
    ],
    benefits: [
      { t: "Better briefs", d: "Know what you're walking into before you arrive." },
      { t: "Faster approvals", d: "Quotes are seen and decided sooner." },
      { t: "Safer sites", d: "Permits and inspection records are clear." },
      { t: "Repeat work", d: "Become a trusted contractor for more care settings." },
    ],
    access: {
      steps: [
        { t: "A care setting adds you", d: "Providers add you as an approved contractor." },
        { t: "Receive requests", d: "Requests arrive with the details you need." },
        { t: "Quote and schedule", d: "Send a quote and agree a time." },
        { t: "Complete and report", d: "Update the job so the site can sign it off." },
      ],
      channels: [
        { icon: "building", t: "Partner portal", d: "See open jobs for your company. Only the site approves work." },
        { icon: "message", t: "Job messages", d: "Updates on each request." },
      ],
    },
    cta: { title: "Work with care providers on CarePlus", text: "Register your trade and the areas you cover.", label: "Register as a contractor" },
  },
  {
    slug: "commissioners",
    name: "Commissioners and local authorities",
    group: "partners",
    icon: "scale",
    img: null,
    mock: "commissioner",
    card: {
      summary: "See commissioned hours, quality evidence and notifications from the providers you fund.",
      bullets: ["Commissioner portal", "Commissioned hours", "Evidence packs"],
    },
    hero: {
      eyebrow: "For commissioners and local authorities",
      title: "See the care you commission, <em>as it's delivered.</em>",
      lede: "When providers you fund use CarePlus, you can follow delivered hours, quality evidence and statutory notifications through a read-only commissioner portal, without waiting for quarterly returns.",
    },
    audience: {
      intro: "For the teams that buy and monitor adult social care.",
      roles: ["Local authority commissioners", "NHS and ICB commissioning teams", "Quality and contract monitoring officers"],
    },
    problems: [
      { p: "Delivered hours are reported late and by hand.", s: "Commissioned hours compared with delivered hours, from the provider's own records." },
      { p: "Quality evidence differs from provider to provider.", s: "Consistent evidence packs and saved reports." },
      { p: "Notifications arrive through many different channels.", s: "Statutory notifications tracked, with clear status." },
      { p: "Monitoring visits need a lot of preparation.", s: "A read-only portal that's always up to date." },
    ],
    features: [
      { icon: "eye", t: "Commissioner portal", d: "Read-only access to what providers choose to share with you." },
      { icon: "clock", t: "Commissioned hours", d: "Delivered compared with commissioned hours, by package." },
      { icon: "clipboard", t: "Evidence packs", d: "Consistent quality and compliance evidence." },
      { icon: "bell", t: "Statutory notifications", d: "Track what's been notified and when." },
      { icon: "wallet", t: "Funding plans", d: "Local authority and NHS funding linked to care plans." },
      { icon: "plug", t: "Data feeds", d: "Local authority and NHS data feeds are available on Enterprise plans." },
    ],
    benefits: [
      { t: "Earlier warning", d: "Spot under-delivery before it becomes a problem." },
      { t: "Like-for-like evidence", d: "Compare providers on consistent measures." },
      { t: "Less admin for everyone", d: "Fewer returns, spreadsheets and chasing." },
      { t: "Better relationships", d: "Shared facts make for better conversations." },
    ],
    access: {
      steps: [
        { t: "A provider invites you", d: "Providers give commissioners read-only access." },
        { t: "Sign in to the portal", d: "Your account sees only what has been shared with you." },
        { t: "Monitor and review", d: "Follow hours, evidence and notifications." },
        { t: "Talk to us about data feeds", d: "Enterprise providers can set up local authority and NHS feeds." },
      ],
      channels: [
        { icon: "eye", t: "Commissioner portal", d: "Read-only, scoped to what each provider shares." },
        { icon: "login", t: "Secure sign-in", d: "Your own account on CarePlus." },
      ],
    },
    cta: { title: "Bring your providers onto CarePlus", text: "Talk to us about commissioner access and data feeds.", label: "Talk to our team" },
  },
];

export const STATS = [
  { n: "8", l: "Care settings, each with its own workspace" },
  { n: "13", l: "Core roles that control who sees what" },
  { n: "23", l: "AI-assisted tasks, always approved by a person" },
  { n: "1", l: "Shared record for care, compliance and workforce" },
];

export const PILLARS = [
  { icon: "pill", t: "Medication you can trust", d: "eMAR, rounds, controlled drugs with two witnesses, stock ledgers and transitions of care. Administration records can't be overwritten." },
  { icon: "calendar", t: "Workforce and rota", d: "Shifts, rotas, routes, attendance, timesheets, payroll, leave, training and hiring." },
  { icon: "shield", t: "Compliance and governance", d: "Audits, a risk register, statutory notifications, a compliance framework and evidence packs." },
  { icon: "box", t: "Stock, equipment and suppliers", d: "Stock control, QR equipment passports, work orders, procurement and group buying." },
  { icon: "wallet", t: "Finance and billing", d: "Funding plans, client billing, payroll exports and subscription billing." },
  { icon: "sparkle", t: "AI that assists, never decides", d: "Drafts, summaries and suggestions with sources linked. A named person always approves." },
];

export const PLANS = [
  { name: "Essentials", price: 149, annual: 1490, tag: "Single-branch rounds, visit logging and the carer mobile app.", seats: "25", clients: "60", branches: "1",
    caps: ["Client records and care plans", "Rota and round scheduling", "Carer mobile app with offline visits", "Electronic visit verification", "Visit notes and daily records", "Basic timesheets"] },
  { name: "Professional", price: 349, annual: 3490, tag: "Medication oversight, alerts and finance for a growing branch.", seats: "80", clients: "200", branches: "2",
    caps: ["Everything in Essentials", "eMAR and medication oversight", "Live monitor, alerts and escalation ladder", "Route sequencing and travel time", "Timesheet approval and payroll export", "Funding plans and client billing", "Incident reporting"] },
  { name: "Assured", price: 599, annual: 5990, tag: "Multi-branch operations with CQC evidence and lone-worker cover.", seats: "250", clients: "600", branches: "6", featured: true,
    caps: ["Everything in Professional", "Controlled drugs register and remote witness", "Lone-worker assurance and check-ins", "CQC compliance framework and evidence packs", "Audits, risk register and statutory notifications", "Household stock and supply continuity", "Pharmacy connection", "Family and proxy access"] },
  { name: "Enterprise", price: 1199, annual: 11990, tag: "Regional providers with unlimited branches and integrations.", seats: "Unlimited", clients: "Unlimited", branches: "Unlimited",
    caps: ["Everything in Assured", "Unlimited branches and service users", "Local authority and NHS data feeds", "Single sign-on and API access", "Custom reporting and inspection mode", "Named implementation and support lead"] },
];

export const ADDONS = [
  { name: "Lone-worker SOS monitoring", price: "£95 / month", d: "24/7 escalation of missed carer check-ins and panic alerts outside office hours." },
  { name: "Family and proxy access portal", price: "£60 / month", d: "Consent-controlled visit notes and medication summaries for relatives and advocates." },
  { name: "Pharmacy connection", price: "£75 / month", d: "Electronic reorders, change notices and delivery tracking with nominated pharmacies." },
  { name: "Additional 25 carer seats", price: "£110 / month", d: "Extra carer licences for winter cover and new care packages." },
];
