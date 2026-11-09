# CarePlus website

The public marketing website for CarePlus: one platform for care, compliance and workforce.

The visual layout follows the client's Figma reference (LANDING PAGE 6). All copy, branding and imagery are CarePlus's own,
and the content comes from what is already built in the CarePlus app on Lovable.

## Structure

Each target market has its own page, and every market page follows the same six parts:

1. **Who it is for**: the market segment and the roles within it
2. **The problems we solve**: each problem paired with the CarePlus answer
3. **Features**: what is already built for that segment
4. **Benefits**: how it improves their operations
5. **How you'll use CarePlus**: onboarding steps and where they access it (web app, carer app, portals)
6. **Call to action**: book a demo, register as a partner, or sign in

| Group | Pages |
|---|---|
| Care providers | Nursing homes, Residential care homes, Home care, Supported living, Mental health services, Learning disability services, Nurseries and childcare |
| Workforce | Staffing and recruitment agencies; Carers, nurses and support workers |
| Healthcare | Hospitals, Clinics and GP practices, Laboratories, Pharmacies |
| Partners & commissioners | Suppliers and vendors, Technicians and contractors, Commissioners and local authorities |

Shared pages: Home, Platform, Compliance, Pricing (real home care plans) and Get started (a segment chooser plus a request form).

Hospitals, clinics and laboratories lead with what CarePlus does for them today, through care providers, agencies and the marketplace. Anything not built yet is listed under a clearly labelled **Early access** section.

The same site also runs inside the CarePlus app on Lovable as React pages (`src/site/` in that project): `/` shows the website and Sign in opens `/login`. This folder is the standalone static version.

## Build

There are no dependencies. You need Node 18 or later.

```bash
node build.mjs
```

This writes the finished static site to `site/`. Upload that folder to any static host (Netlify, Vercel, Cloudflare Pages, S3)
or open `site/index.html` directly.

## Editing

| What | Where |
|---|---|
| Sign-in link (every "Sign in" button) | `src/config.mjs` → `LOGIN_URL` |
| Demo and partner request email | `src/config.mjs` → `CONTACT_EMAIL` (currently a placeholder) |
| All page copy, markets, plans | `src/content.mjs` |
| Illustrative product screens | `src/mockups.mjs` |
| Look and feel | `src/styles.css` |
| Logo and icons | `src/icons.mjs` |
| Photos | `src/img/` |

To add a market, add an entry to `MARKETS` in `src/content.mjs` and rebuild. Its page, its menu entry, its home page card
and its footer link are all generated.

## Before going live

- **Sign-in link:** `LOGIN_URL` points at the published app, https://carepulses.lovable.app/login. Update it if you add a
  custom domain.
- **Contact email:** replace the placeholder `CONTACT_EMAIL`. The request form has no backend. It prepares an email for the
  visitor to send. Connect it to a form service or CRM if you want submissions stored.
- **Photos:** the photos are exported from the client's Figma file. Confirm their licences, or replace them with CarePlus's
  own photography. The residential photo is a small crop from the app's login screen, so a full-size original would look sharper.
- **Logo:** the logo is a vector redraw of the CarePlus mark from the app's login page. Swap in the official file if there is one.
