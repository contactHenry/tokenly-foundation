(function () {
  var CONTACT_EMAIL = document.documentElement.getAttribute("data-contact") || "";

  // Header border once the page scrolls.
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Solutions mega menu.
  var megaBtn = document.getElementById("solutions-btn");
  var mega = document.getElementById("solutions-menu");
  function setMega(open) {
    if (!megaBtn || !mega) return;
    megaBtn.setAttribute("aria-expanded", String(open));
    mega.hidden = !open;
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setMega(megaBtn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("click", function (e) { if (!mega.contains(e.target)) setMega(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMega(false); setDrawer(false); } });
  }

  // Mobile drawer.
  var toggle = document.getElementById("nav-toggle");
  var drawer = document.getElementById("drawer");
  function setDrawer(open) {
    if (!toggle || !drawer) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    // SVG elements have no .hidden property, so toggle the attribute itself.
    toggle.querySelector(".i-open").toggleAttribute("hidden", open);
    toggle.querySelector(".i-close").toggleAttribute("hidden", !open);
    drawer.hidden = !open;
  }
  if (toggle) toggle.addEventListener("click", function () { setDrawer(toggle.getAttribute("aria-expanded") !== "true"); });

  // Keep the last row of market cards full: the "find your fit" card takes the spare columns.
  function fitCard() {
    var card = document.getElementById("fit-card");
    if (!card) return;
    var n = document.querySelectorAll("[data-group]:not([hidden])").length % 3;
    card.className = "m-cta " + (n === 1 ? "span-2" : n === 2 ? "" : "span-3");
  }
  fitCard();

  // Market tabs on the home page.
  var tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var g = t.getAttribute("data-tab");
      tabs.forEach(function (o) { o.setAttribute("aria-selected", String(o === t)); });
      document.querySelectorAll("[data-group]").forEach(function (c) {
        c.hidden = g !== "all" && c.getAttribute("data-group") !== g;
      });
      fitCard();
    });
  });

  // Pricing: monthly / annual.
  var cycleBtns = document.querySelectorAll("[data-cycle]");
  cycleBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.getAttribute("data-cycle");
      cycleBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      document.querySelectorAll("[data-monthly]").forEach(function (el) {
        el.textContent = "£" + Number(el.getAttribute(c === "annual" ? "data-annual" : "data-monthly")).toLocaleString("en-GB");
      });
      document.querySelectorAll("[data-per]").forEach(function (el) {
        el.textContent = c === "annual" ? "per branch / year" : "per branch / month";
      });
    });
  });

  // Get started: preselect the segment from the link (#segment) and handle the request form.
  var form = document.getElementById("request-form");
  var seg = document.getElementById("f-segment");
  function preselect() {
    var h = (location.hash || "").replace("#", "");
    if (seg && h && seg.querySelector('option[value="' + h + '"]')) {
      seg.value = h;
      var target = document.getElementById("request");
      if (target) target.scrollIntoView({ block: "start" });
    }
  }
  preselect();
  window.addEventListener("hashchange", preselect);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var err = document.getElementById(f.id + "-err");
        var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.setAttribute("aria-invalid", String(bad));
        if (err) err.hidden = !bad;
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      var v = function (id) { return (document.getElementById(id) || {}).value || ""; };
      var segText = seg.options[seg.selectedIndex].text;
      var body = [
        "Request: " + v("f-goal"),
        "Name: " + v("f-name"),
        "Email: " + v("f-email"),
        "Organisation: " + v("f-org"),
        "We are: " + segText,
        v("f-size") ? "Size: " + v("f-size") : "",
        v("f-msg") ? "\n" + v("f-msg") : "",
      ].filter(Boolean).join("\n");
      var subject = "CarePlus " + v("f-goal").toLowerCase() + " · " + segText;
      var done = document.getElementById("request-done");
      done.querySelector("pre").textContent = body;
      done.querySelector(".email").textContent = CONTACT_EMAIL;
      var mail = done.querySelector("[data-mailto]");
      mail.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    var copyBtn = document.querySelector("[data-copy]");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var pre = document.querySelector("#request-done pre");
      var text = pre.textContent;
      var label = copyBtn.querySelector("span");
      function selectIt() { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = "Selected. Press Ctrl+C to copy"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { label.textContent = "Copied"; }, selectIt);
      } else selectIt();
    });
    var again = document.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () {
      document.getElementById("request-done").hidden = true;
      form.hidden = false;
    });
  }
})();
