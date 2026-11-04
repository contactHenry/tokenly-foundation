# BuzzBro Shopify theme

An Online Store 2.0 theme built from the **BUZZBRO** Figma file
(`figma.com/design/0OkIDJuKo9j0HabmH1DVdf/BUZZBRO`). The home page hero renders the
SmoothShave 2.0 as a **Spline 3D scene**.

```
buzzbro-shopify/
├── theme/            ← the Shopify theme (zip THIS folder's contents and upload)
└── product-images/   ← product cut-outs exported from the Figma file, for your products
```

## 1. Install the theme

Zip the *contents* of `theme/` (so `layout/`, `sections/`… are at the zip root):

```bash
cd buzzbro-shopify/theme && zip -r ../buzzbro-theme.zip . -x '.*'
```

Then **Shopify admin → Online Store → Themes → Add theme → Upload zip file**.

Or with the Shopify CLI:

```bash
cd buzzbro-shopify/theme && shopify theme push --unpublished
```

## 2. Spline hero (home page)

The hero section is **Hero (Spline 3D)**. The product photo shows until the 3D scene
loads. It also stays as the fallback with no scene URL, no WebGL, or reduced motion.

1. In [Spline](https://spline.design), create a scene:
   - **From a 3D model (best):** import the shaver's `.glb`/`.obj`/`.stl` if you have one from the manufacturer.
   - **From the photo:** drag `product-images/smoothshave-hero-cutout.png` (transparent PNG) into the scene. Give it depth with *Extrude*, or place it on a thin rounded box. Add a slow *Rotate* state or a *Mouse follow* event so it moves.
2. Set the scene **background to transparent** (Scene → Background → off). The white
   BUZZBRO wordmark then shows behind the product, as in the design.
3. **Export → Spline Viewer → Update**, then copy the URL ending in `scene.splinecode`.
4. Theme editor → Home page → **Hero (Spline 3D)** → paste it into **Spline scene URL**.
   Adjust *Scene width / height / top offset* to frame it.

The viewer (`@splinetool/viewer@2.0.82`) loads only when the hero is near the viewport,
so it doesn't slow first paint. Free Spline plans show a small "Built with Spline" badge.

## 3. Store setup that matches the design

**Products**
- *BuzzBro SmoothShave Kit 2.0*: price $39.99, compare-at $124.88 (the "Save 60 %" badge is calculated automatically). Image: `product-images/smoothshave-kit-2.png`.
- Blades / attachments (facial brush, sideburn trimmer, guard combs, nose & ear trimmer), with images from `product-images/`.
- Optional subtitle under each card title: create a product metafield `custom.subtitle` (single-line text).
- Put the attachments in a collection (e.g. "Blades") and pick it in **Product carousel** on the home page. Pick the kit in **Featured product** and in the hero/CTA "Button product".

**"Subscribe Now | $39.99" button.** Install **Shopify Subscriptions** (free) and add a
blade-refill plan to the kit. The buy button then shows *Subscribe Now* with the
subscription price, and offers *One-time purchase*. Without a plan it reads *Add to cart*.

**Star ratings / reviews.** Cards and the product page read the standard
`reviews.rating` and `reviews.rating_count` metafields. Review apps such as Judge.me,
Okendo or Shopify Product Reviews fill these in. The product page *Review* tab:
- uses the review blocks you add in the theme editor, or
- shows your review app's app block if you add one to the **FAQ & reviews tabs** section.
"Write A Review" emails the review to you (Shopify contact form) so you can approve it first.

**Pages.** Create these in Online Store → Pages and pick the template shown:

| Page | Handle | Template |
|---|---|---|
| FAQs and Help Center | `faq` | `page.faq` |
| Shipping & Returns Policy | `shipping-returns` | `page.shipping-returns` |
| Product Warranty | `warranty` | `page.warranty` |
| Contact Us | `contact` | `page.contact` |
| Our Story | `our-story` | `page` (default) |

The FAQ, shipping, warranty and contact copy from Figma is already in the templates, so
the pages need no body text.

**Menus** (Online Store → Navigation):
- `main-menu`: Home, Blades, Our Story
- `footer-shop`: Home, Blades, SmoothShave 2.0
- `footer-help`: FAQs and Help Center, Shipping & Returns Policy, Product Warranty, Contact Us
- `footer-company`: Our Story, Reviews, Career, Blog
- `footer-legal`: Privacy Policy, Terms & Conditions

**Social links, logo, colours, font.** Theme settings → *Brand / Colors / Social media*.
The Figma logo is bundled and used until you upload your own.

**Country selector (flag in the header).** Add markets in Settings → Markets. The flag
opens a country/currency switcher.

## 4. What a theme can't change

- **Checkout pages.** Shopify hosts checkout, and themes can't restyle it. To match the Figma checkout:
  - *Settings → Checkout → Customize*: logo, navy `#14103B` buttons, Inter font.
  - Free gifts (Soft Face Sponge, Nose & Ear Trimmer, etc.): an automatic **Buy X get Y** discount.
  - Trust badges and testimonial blocks in checkout need **checkout UI extensions**. These are app-based and some need Shopify Plus.
- **File attachments** on the contact form: Shopify's contact form doesn't accept uploads, so that field was left out. Use a form app if you need it.
- **reCAPTCHA** on forms is handled by Shopify automatically.

## 5. Content notes from the Figma file

- The **"Why use BuzzBro"** photo in Figma is an *Unsplash+* preview with watermarks, so it isn't bundled. Upload your licensed photo or video in that section; until then it shows a dark placeholder.
- Some Figma copy referred to another brand (a `@myfreebird.com` email, "Freebird tracking page", "Freebird FlexSeries®"). These were replaced with links to your contact page and neutral wording. Check them against your real policies.
- The two product-page reviews and the four home-page testimonials are the sample copy from the design. Replace them with real customer reviews before launch.
- Typos fixed: "RREVIEWS", "Conditiions", "© BUZZRO", "shlef".
