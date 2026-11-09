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
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMega(false); setDrawer(false); } });

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

  // Home: one category at a time, at most six cards, with "See all" for the rest.
  var tabs = document.querySelectorAll("[data-tab]");
  var seeAll = document.getElementById("see-all");
  var blurb = document.getElementById("tab-blurb");
  var current = tabs.length ? tabs[0] : null;
  function showGroup(tab, all) {
    current = tab;
    var g = tab.getAttribute("data-tab");
    var limit = seeAll ? Number(seeAll.getAttribute("data-limit")) : 6;
    tabs.forEach(function (o) { o.setAttribute("aria-selected", String(o === tab)); });
    var cards = Array.prototype.filter.call(document.querySelectorAll("#market-cards [data-group]"), function (c) {
      var mine = c.getAttribute("data-group") === g;
      if (!mine) c.hidden = true;
      return mine;
    });
    cards.forEach(function (c, i) { c.hidden = !all && i >= limit; });
    if (blurb) blurb.textContent = tab.getAttribute("data-blurb");
    if (seeAll) {
      var extra = cards.length > limit && !all;
      seeAll.hidden = !extra;
      seeAll.textContent = "See all " + cards.length + " " + tab.getAttribute("data-label").toLowerCase();
    }
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showGroup(t, false); }); });
  if (seeAll) seeAll.addEventListener("click", function () { if (current) showGroup(current, true); });
  if (current) showGroup(current, false);

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

  // Get started: buttons elsewhere link here as ?for=<market>&goal=<goal>#request.
  var form = document.getElementById("request-form");
  var seg = document.getElementById("f-segment");
  var goal = document.getElementById("f-goal");
  if (form && seg && goal) {
    var params = new URLSearchParams(location.search);
    var forSlug = params.get("for") || (location.hash || "").replace("#", "");
    var segOpt = forSlug && seg.querySelector('option[value="' + forSlug + '"]');
    if (segOpt) seg.value = forSlug;
    var g = params.get("goal") || (segOpt && segOpt.getAttribute("data-goal"));
    if (g && goal.querySelector('option[value="' + g + '"]')) goal.value = g;
    if (segOpt || params.get("goal")) {
      var target = document.getElementById("request");
      if (target) target.scrollIntoView({ block: "start" });
    }

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
      var goalText = goal.options[goal.selectedIndex].text;
      var segText = seg.options[seg.selectedIndex].text;
      var body = [
        "Request: " + goalText,
        "Name: " + v("f-name"),
        "Email: " + v("f-email"),
        "Organisation: " + v("f-org"),
        "We are: " + segText,
        v("f-size") ? "Size: " + v("f-size") : "",
        v("f-msg") ? "\n" + v("f-msg") : "",
      ].filter(Boolean).join("\n");
      var subject = "CarePlus: " + goalText + " · " + segText;
      var done = document.getElementById("request-done");
      done.querySelector("pre").textContent = body;
      done.querySelector(".email").textContent = CONTACT_EMAIL;
      done.querySelector("[data-mailto]").href =
        "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    var copyBtn = document.querySelector("[data-copy]");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var pre = document.querySelector("#request-done pre");
      var label = copyBtn.querySelector("span");
      function selectIt() { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = "Selected. Press Ctrl+C to copy"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(function () { label.textContent = "Copied"; }, selectIt);
      } else selectIt();
    });
    var again = document.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () {
      document.getElementById("request-done").hidden = true;
      form.hidden = false;
    });
  }
})();
