/* BuzzBro theme behaviour. No dependencies. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const cfg = window.BuzzBro || { routes: {}, strings: {} };

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message) {
    const el = $('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => { el.hidden = true; }, 250);
    }, 2600);
  }

  /* ---------- Cart ---------- */
  function setCartCount(count) {
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    // The Figma header has no cart icon; it appears once the cart has something in it.
    $$('[data-cart-link]').forEach((el) => { el.hidden = count === 0; });
  }

  async function addToCart(formData) {
    const res = await fetch(`${cfg.routes.cart_add_url}.js`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || cfg.strings.error);
    const cart = await fetch(cfg.routes.cart_js).then((r) => r.json());
    setCartCount(cart.item_count);
    return data;
  }

  function bindAjaxForm(form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      try {
        await addToCart(new FormData(form));
        toast(cfg.strings.added);
      } catch (err) {
        toast(err.message || cfg.strings.error);
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  $$('[data-quick-add]').forEach(bindAjaxForm);

  /* ---------- Header: mobile menu + country selector ---------- */
  const menuToggle = $('[data-menu-toggle]');
  if (menuToggle) {
    const nav = document.getElementById(menuToggle.getAttribute('aria-controls'));
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      nav && nav.classList.toggle('is-open', open);
    });
  }

  $$('[data-country-toggle]').forEach((toggle) => {
    const list = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!list) return;
    const close = () => { list.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = list.hidden;
      list.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!list.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  });

  /* ---------- Hero: pointer tilt on the poster image (no Spline scene) ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-tilt]').forEach((media) => {
    if (reduceMotion) return;
    const img = media.querySelector('img');
    const hero = media.closest('[data-hero]') || media;
    if (!img) return;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      img.style.animationPlayState = 'paused';
      img.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    });
    hero.addEventListener('pointerleave', () => {
      img.style.transform = '';
      img.style.animationPlayState = '';
    });
  });

  /* ---------- Carousel ---------- */
  $$('[data-carousel]').forEach((root) => {
    const track = $('[data-carousel-track]', root);
    if (!track) return;
    const step = () => {
      const item = track.firstElementChild;
      if (!item) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    };
    const prev = $('[data-carousel-prev]', root);
    const next = $('[data-carousel-next]', root);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Why BuzzBro video card ---------- */
  $$('[data-video-card]').forEach((card) => {
    const play = $('[data-video-play]', card);
    const tpl = $('template[data-video-template]', card);
    if (!play || !tpl || !tpl.content.childElementCount) return;
    play.addEventListener('click', () => {
      const node = tpl.content.cloneNode(true);
      card.appendChild(node);
      card.classList.add('is-playing');
      const video = card.querySelector('video');
      if (video) video.play().catch(() => {});
    });
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[data-tab]', root);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      root.classList.toggle('is-reviews', (tab.getAttribute('aria-controls') || '').startsWith('panel-reviews'));
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });

    // Reviews: write form, cancel, load more.
    const openBtn = $('[data-review-open]', root);
    const fields = $('[data-review-fields]', root);
    const list = $('[data-review-list]', root);
    const more = $('[data-review-load-more]', root);
    const toggleForm = (open) => {
      if (!fields) return;
      root.classList.toggle('is-writing', open);
      fields.hidden = !open;
      if (list) list.hidden = open;
      if (more) more.parentElement.hidden = open || !$$('[data-review-more][hidden]', root).length;
      if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
      if (open) { const first = fields.querySelector('input:not([type="hidden"]), textarea'); first && first.focus(); root.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    };
    openBtn && openBtn.addEventListener('click', () => toggleForm(true));
    const cancel = $('[data-review-cancel]', root);
    cancel && cancel.addEventListener('click', () => toggleForm(false));
    more && more.addEventListener('click', () => {
      $$('[data-review-more][hidden]', root).slice(0, 4).forEach((r) => { r.hidden = false; });
      if (!$$('[data-review-more][hidden]', root).length) more.parentElement.hidden = true;
    });

    // After a review is posted Shopify reloads with ?contact_posted=true — show the reviews tab.
    if (/contact_posted=true/.test(location.search) && $('[data-review-posted]', root)) {
      const reviewsTab = tabs.find((t) => (t.getAttribute('aria-controls') || '').startsWith('panel-reviews'));
      if (reviewsTab) select(reviewsTab);
      root.scrollIntoView({ block: 'start' });
    }
  });

  /* ---------- Product page ---------- */
  $$('[data-product-section]').forEach((section) => {
    const jsonEl = $('[data-product-json]', section);
    const data = jsonEl ? JSON.parse(jsonEl.textContent) : null;
    const form = $('[data-product-form]', section);
    const gallery = $('[data-gallery]', section);

    // Gallery thumbnails
    const showMedia = (id) => {
      if (!gallery || !id) return;
      const target = $(`.gallery__main [data-media-id="${id}"]`, gallery);
      if (!target) return;
      $$('.gallery__main img', gallery).forEach((img) => img.classList.toggle('is-active', img === target));
      $$('[data-thumb]', gallery).forEach((t) => t.setAttribute('aria-current', String(t.dataset.thumb === String(id))));
    };
    if (gallery) {
      $$('[data-thumb]', gallery).forEach((thumb) => thumb.addEventListener('click', () => showMedia(thumb.dataset.thumb)));
    }

    if (!form || !data) return;

    const idInput = $('[data-variant-id]', form);
    const planInput = $('[data-selling-plan]', form);
    const button = $('[data-add-button]', form);
    const labelEl = () => $('[data-add-label]', button);
    const priceEl = () => $('[data-add-price]', button);

    const currentVariant = () => {
      const selected = $$('[data-option-input]:checked', form).map((i) => i.value);
      if (!selected.length) return data.variants.find((v) => String(v.id) === idInput.value) || data.variants[0];
      return data.variants.find((v) => v.options.every((o, i) => o === selected[i]));
    };

    const render = () => {
      const variant = currentVariant();
      const planId = planInput ? planInput.value : '';
      if (!variant) {
        button.disabled = true;
        button.textContent = cfg.strings.soldOut || data.soldOut;
        return;
      }
      idInput.value = variant.id;
      const price = planId && variant.plans[planId] ? variant.plans[planId] : variant.price;

      // Price row
      const row = $('[data-price-wrapper] [data-price-row]', section);
      if (row) {
        const p = $('[data-price]', row);
        if (p) p.textContent = variant.price;
        let compare = $('[data-compare-price]', row);
        let badge = $('[data-sale-badge]', row);
        if (variant.compare_at_price && !row.closest('[data-hide-compare]')) {
          if (!compare) { compare = document.createElement('s'); compare.className = 'price__compare'; compare.dataset.comparePrice = ''; $('.price', row).appendChild(compare); }
          compare.textContent = variant.compare_at_price;
          if (data.showBadge) {
            if (!badge) { badge = document.createElement('span'); badge.className = 'badge-sale'; badge.dataset.saleBadge = ''; row.appendChild(badge); }
            badge.textContent = data.badgeText.replace('[percent]', variant.saving);
          }
        } else {
          compare && compare.remove();
          badge && badge.remove();
        }
      }

      // Plan prices
      $$('[data-plan-price]', form).forEach((el) => {
        const id = el.dataset.planPrice;
        el.textContent = id ? (variant.plans[id] || '') : variant.price;
      });

      // Button
      if (!variant.available) {
        button.disabled = true;
        button.innerHTML = '';
        button.textContent = data.soldOut;
      } else {
        button.disabled = false;
        if (!labelEl()) {
          button.innerHTML = '<span data-add-label></span><span class="sep" aria-hidden="true"></span><span data-add-price></span>';
        }
        labelEl().textContent = planId ? button.dataset.labelSubscribe : button.dataset.labelBuy;
        priceEl().textContent = price;
      }

      if (variant.media_id) showMedia(variant.media_id);
      const url = new URL(location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState(null, '', url.toString());
    };

    $$('[data-option-input]', form).forEach((input) => input.addEventListener('change', render));
    $$('[data-plan-input]', form).forEach((input) => input.addEventListener('change', () => {
      if (planInput) planInput.value = input.value;
      render();
    }));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      try {
        const fd = new FormData(form);
        if (!fd.get('selling_plan')) fd.delete('selling_plan');
        await addToCart(fd);
        toast(cfg.strings.added);
      } catch (err) {
        toast(err.message || cfg.strings.error);
      } finally {
        const v = currentVariant();
        button.disabled = !(v && v.available);
      }
    });
  });

  /* ---------- Estimated delivery ("Order within 3 hrs. 2 mins.") ---------- */
  $$('[data-delivery-estimate]').forEach((el) => {
    const minDays = parseInt(el.dataset.minDays, 10) || 3;
    const cutoff = parseInt(el.dataset.cutoffHour, 10) || 17;
    const tpl = el.dataset.template;
    const addBusinessDays = (date, days) => {
      const d = new Date(date);
      while (days > 0) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) days -= 1;
      }
      return d;
    };
    const tick = () => {
      const now = new Date();
      let dispatch = new Date(now);
      dispatch.setHours(cutoff, 0, 0, 0);
      const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
      if (now >= dispatch || isWeekend(now)) {
        do { dispatch.setDate(dispatch.getDate() + 1); } while (isWeekend(dispatch));
        dispatch.setHours(cutoff, 0, 0, 0);
      }
      const ms = dispatch - now;
      const hours = Math.floor(ms / 3.6e6);
      const minutes = Math.floor((ms % 3.6e6) / 6e4);
      const arrival = addBusinessDays(dispatch, minDays);
      const date = arrival.toLocaleDateString(document.documentElement.lang || undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      el.textContent = tpl.replace('[date]', date).replace('[hours]', hours).replace('[minutes]', minutes);
      el.hidden = false;
    };
    tick();
    setInterval(tick, 30000);
  });

  /* ---------- Cart page quantity steppers ---------- */
  $$('[data-qty]').forEach((wrap) => {
    const input = $('[data-qty-input]', wrap);
    $('[data-qty-minus]', wrap).addEventListener('click', () => { input.value = Math.max(0, (parseInt(input.value, 10) || 0) - 1); });
    $('[data-qty-plus]', wrap).addEventListener('click', () => { input.value = (parseInt(input.value, 10) || 0) + 1; });
  });

  /* ---------- Collection sort ---------- */
  $$('[data-sort-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('sort_by', select.value);
      url.searchParams.delete('page');
      location.href = url.toString();
    });
  });
})();
