// Small, illustrative product views. They mirror screens that exist in the CarePlus app,
// filled with example data, and are labelled as illustrations wherever they appear.

const pill = (tone, text) => `<span class="pill pill-${tone}">${text}</span>`;
const dot = (tone) => `<span class="dot dot-${tone}"></span>`;

function frame(title, meta, body, cls = "") {
  return `<figure class="mock ${cls}" aria-label="Illustrative CarePlus screen: ${title}">
  <div class="mock-bar"><span class="mock-title">${title}</span><span class="mock-meta">${meta}</span></div>
  <div class="mock-body">${body}</div>
</figure>`;
}

const rows = (list) => list.map((r) => `<div class="mk-row">${r}</div>`).join("");

const M = {
  mar: () =>
    frame(
      "Medication round",
      "08:00 · Rowan unit",
      `<div class="mk-grid mk-mar">
        <span class="mk-h">Resident</span><span class="mk-h">Morning</span><span class="mk-h">Status</span>
        <span>Room 4 · E. Hart</span><span class="mk-mono">Donepezil 10mg</span>${pill("ok", "Given")}
        <span>Room 6 · J. Doyle</span><span class="mk-mono">Metformin 500mg</span>${pill("ok", "Given")}
        <span>Room 7 · A. Mensah</span><span class="mk-mono">Paracetamol PRN</span>${pill("info", "PRN offered")}
        <span>Room 9 · R. Singh</span><span class="mk-mono">Warfarin 3mg</span>${pill("warn", "Due 08:30")}
        <span>Room 11 · M. Price</span><span class="mk-mono">Morphine (CD)</span>${pill("cd", "2 witnesses")}
      </div>
      <div class="mk-foot">${dot("ok")}28 given ${dot("warn")}3 due ${dot("bad")}0 missed</div>`
    ),
  admissions: () =>
    frame(
      "Admissions",
      "Maple Grove · 40 beds",
      `<div class="mk-stat-row">
        <div><b>36</b><small>Occupied</small></div><div><b>3</b><small>Enquiries</small></div><div><b>1</b><small>Admitting Fri</small></div>
      </div>
      <div class="mk-bar"><span style="width:90%"></span></div>
      ${rows([
        `<span>Enquiry · daughter of P. Lowe</span>${pill("info", "Assessment booked")}`,
        `<span>Room 12 · Rowan dementia unit</span>${pill("ok", "Ready")}`,
        `<span>Admission checklist · 9 of 11</span>${pill("warn", "2 to do")}`,
      ])}`
    ),
  visits: () =>
    frame(
      "Live monitor",
      "Today · Croydon branch",
      rows([
        `<span class="mk-time">07:30</span><span>Mrs D. Okoro · double-up</span>${pill("ok", "Checked in")}`,
        `<span class="mk-time">08:15</span><span>Mr K. Adams · meds call</span>${pill("ok", "Completed")}`,
        `<span class="mk-time">08:45</span><span>Ms L. Byrne · personal care</span>${pill("bad", "12 min late")}`,
        `<span class="mk-time">09:30</span><span>Mr T. Walsh · lunch prep</span>${pill("neutral", "Scheduled")}`,
      ]) + `<div class="mk-alert">${dot("bad")}Escalated to on-call coordinator · carer rerouted</div>`
    ),
  hours: () =>
    frame(
      "Commissioned hours",
      "This week",
      ["Alder House|86|92", "Birch Court|118|120", "Cedar Flat 2|41|56"]
        .map((s) => {
          const [n, d, c] = s.split("|");
          const pct = Math.round((d / c) * 100);
          return `<div class="mk-hours"><span>${n}</span><span class="mk-mono">${d} / ${c} h</span><div class="mk-bar"><span style="width:${pct}%"></span></div></div>`;
        })
        .join("") + `<div class="mk-foot">${dot("warn")}Cedar Flat 2 under-delivered · review rota</div>`
    ),
  equipment: () =>
    frame(
      "Equipment passports",
      "Scan QR to open",
      rows([
        `<span class="mk-qr"></span><span>Ceiling hoist · Room 3</span>${pill("ok", "Checked 2 Nov")}`,
        `<span class="mk-qr"></span><span>Profiling bed · Room 8</span>${pill("warn", "Service due 14 Nov")}`,
        `<span class="mk-qr"></span><span>Wheelchair · WB-0412</span>${pill("bad", "Fault reported")}`,
        `<span class="mk-qr"></span><span>Sling, medium · S-118</span>${pill("ok", "In date")}`,
      ])
    ),
  stock: () =>
    frame(
      "Stock levels",
      "Ward 2 store",
      rows([
        `<span>Nitrile gloves, M</span><span class="mk-mono">14 boxes</span>${pill("ok", "OK")}`,
        `<span>Incontinence pads, L</span><span class="mk-mono">3 packs</span>${pill("warn", "Reorder")}`,
        `<span>Wound dressings 10cm</span><span class="mk-mono">Exp. 30 Nov</span>${pill("warn", "Expiring")}`,
        `<span>Thickener 300g</span><span class="mk-mono">0 tins</span>${pill("bad", "Out")}`,
      ]) + `<div class="mk-foot">Purchase request sent for manager approval</div>`
    ),
  sharing: () =>
    frame(
      "Sharing with family",
      "Daniel · his wishes",
      rows([
        `<span>Health appointments</span><span>Mum, sister</span>${pill("ok", "Shared")}`,
        `<span>Daily notes</span><span>Mum</span>${pill("ok", "Shared")}`,
        `<span>Money and spending</span><span>Advocate only</span>${pill("neutral", "Private")}`,
        `<span>Photos</span><span>Until 31 Mar</span>${pill("info", "Expires")}`,
      ]) + `<div class="mk-foot">Changes need independent approval · every view is logged</div>`
    ),
  ratios: () =>
    frame(
      "Room ratios",
      "Live · 10:05",
      ["Babies|0–2|9|3|1:3|ok", "Toddlers|2–3|11|3|1:4|ok", "Pre-school|3–5|26|3|1:9|bad"]
        .map((s) => {
          const [room, age, kids, staff, r, t] = s.split("|");
          return `<div class="mk-ratio"><div><b>${room}</b><small>${age} yrs</small></div><span class="mk-mono">${kids} children · ${staff} staff</span>${pill(t, t === "ok" ? r + " OK" : r + " · move 1 staff")}</div>`;
        })
        .join("") + `<div class="mk-foot">${dot("info")}Funded hours claimed this term: 1,284</div>`
    ),
  shifts: () =>
    frame(
      "Open shift",
      "Broadcast to pool",
      `<div class="mk-shift"><b>Night · RGN</b><span>St Anne's Nursing Home · Sat 20:00–08:00</span></div>
      ${rows([
        `<span>Grace A. · RGN</span><span>DBS ✓ · Training ✓</span>${pill("ok", "Matched")}`,
        `<span>Tomasz W. · RGN</span><span>DBS ✓ · Training ✓</span>${pill("info", "Offered")}`,
        `<span>Priya N. · RGN</span><span>Manual handling expired</span>${pill("bad", "Blocked")}`,
      ])}`
    ),
  app: () =>
    `<figure class="mock mock-phone" aria-label="Illustrative CarePlus mobile app screen">
      <div class="ph-notch"></div>
      <div class="ph-head"><small>Today</small><b>Hi Amara</b></div>
      <div class="ph-card"><small>Next visit · 09:30</small><b>Mr T. Walsh</b><span>Lunch prep · meds prompt</span><span class="ph-btn">Check in</span></div>
      <div class="ph-list">
        <div><span>Timesheet · this week</span>${pill("ok", "Approved")}</div>
        <div><span>Moving & handling</span>${pill("warn", "Renew in 21 d")}</div>
        <div><span>Extra shift · Sun</span>${pill("info", "Available")}</div>
      </div>
      <div class="ph-foot">${dot("ok")}Offline ready · syncs when back online</div>
    </figure>`,
  reorders: () =>
    frame(
      "Pharmacy connection",
      "Nominated pharmacy",
      rows([
        `<span>Reorder · 14 clients</span><span class="mk-mono">Cycle wk 4</span>${pill("info", "Sent")}`,
        `<span>Change notice · Mr K. Adams</span><span class="mk-mono">Dose change</span>${pill("warn", "Acknowledge")}`,
        `<span>Delivery · Croydon round</span><span class="mk-mono">Tue 10:00</span>${pill("ok", "Dispatched")}`,
        `<span>Short supply · Ms L. Byrne</span><span class="mk-mono">3 days left</span>${pill("bad", "Urgent")}`,
      ])
    ),
  orders: () =>
    frame(
      "Purchase orders",
      "Group buying",
      rows([
        `<span>PO-2291 · 6 homes combined</span><span class="mk-mono">£4,180</span>${pill("info", "Approved")}`,
        `<span>PO-2290 · Riverbank</span><span class="mk-mono">£612</span>${pill("warn", "Awaiting sign-off")}`,
        `<span>PO-2287 · Willowbrook</span><span class="mk-mono">£1,045</span>${pill("ok", "Delivered")}`,
      ]) + `<div class="mk-foot">${dot("ok")}Open orders under your company name only</div>`
    ),
  jobs: () =>
    frame(
      "Maintenance jobs",
      "Open requests",
      rows([
        `<span>Nurse call fault · Room 14</span><span class="mk-mono">Urgent</span>${pill("bad", "Today")}`,
        `<span>Hoist LOLER inspection</span><span class="mk-mono">Quote £180</span>${pill("info", "Quote sent")}`,
        `<span>Boiler service · Alder House</span><span class="mk-mono">Fri 09:00</span>${pill("ok", "Booked")}`,
        `<span>Fire door closer · Unit B</span><span class="mk-mono">Permit</span>${pill("warn", "Needs permit")}`,
      ])
    ),
  commissioner: () =>
    frame(
      "Commissioner view",
      "Q3 · read only",
      `<div class="mk-stat-row">
        <div><b>97%</b><small>Hours delivered</small></div><div><b>0</b><small>Overdue notifications</small></div><div><b>12</b><small>Evidence packs</small></div>
      </div>
      ${rows([
        `<span>Oakfield · Birch Court</span>${pill("ok", "On track")}`,
        `<span>HomeCare Plus · Croydon</span>${pill("ok", "On track")}`,
        `<span>Cedar Flat 2</span>${pill("warn", "Under-delivered")}`,
      ])}`
    ),
  compliance: () =>
    frame(
      "Compliance health",
      "28 / 32 cleared",
      `<div class="mk-legend">${dot("ok")}Cleared ${dot("info")}Expiring ${dot("warn")}Blocked</div>
       <div class="mk-cells">${Array.from({ length: 32 }, (_, i) =>
         `<span class="c-${i % 11 === 3 ? "dark" : i % 13 === 5 ? "warn" : i % 7 === 2 ? "info" : "ok"}"></span>`
       ).join("")}</div>`
    ),
  payroll: () =>
    frame(
      "Pay run",
      "Week 45",
      rows([
        `<span>Visits reconciled</span><span class="mk-mono">1,912</span>${pill("ok", "Done")}`,
        `<span>Travel & mileage</span><span class="mk-mono">£3,406</span>${pill("ok", "Done")}`,
        `<span>Exceptions</span><span class="mk-mono">4</span>${pill("warn", "Resolve")}`,
        `<span>Payslips</span><span class="mk-mono">84</span>${pill("neutral", "Next")}`,
      ])
    ),
};

export function mockup(key) {
  const fn = M[key];
  if (!fn) throw new Error(`Unknown mockup: ${key}`);
  return fn();
}
