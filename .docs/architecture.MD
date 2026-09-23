# Selah Vie — System Architecture

> Updated for the **redesign** (soft & romantic, product-primary, V1 mock backend).
> Reflects the **actual shipped structure** (route groups, template registry, real data
> models) and the new features planned in [tasks.MD](./tasks.MD). Strategy is in
> [../PRODUCT.md](../PRODUCT.md); visual system in [../DESIGN.md](../DESIGN.md).

---

## 1. System Overview

Selah Vie is a **wedding website + guest-management platform**. Couples browse, purchase,
and fully customize a wedding website, publish it for guests, and then run **RSVP and guest
management** from a single dashboard. V1 is a **monolithic Next.js 14 (App Router)
application** with client-side persistence (`localStorage` via Zustand) and mock payments —
a deliberate fast-iteration stage with a clear upgrade path (§10).

The redesign does not change the V1 backend posture. It changes (a) the **visual system**
(see DESIGN.md), (b) the **information architecture** of the couple's app, and (c) the
**feature surface** — real guest/RSVP management, richer published-site sections, deeper
customization, and discovery/onboarding — all still against mock/local data.

---

## 2. Three surfaces, two audiences

| Surface | Routes | Audience | Register | Rendering |
|---|---|---|---|---|
| **Marketing** | `/`, `/templates`, `/templates/[id]` | Prospective couples | brand-leaning | mostly static + client filters |
| **Couple's app** | `/dashboard`, `/dashboard/customize/[id]`, `/checkout`, `/checkout/success` | The couple (organizer) | **product (primary)** | CSR (client state) |
| **Published sites** | `/wedding/[slug]`, `/preview/[id]` | Wedding guests | brand (design-is-product) | CSR now; SSR target (§9) |

Two route groups isolate chrome:
- `app/(main)/` — marketing + app, wrapped in `Navbar` + `Footer` + `CartDrawer`.
- `app/(wedding)/` — chrome-free published sites and live previews.

---

## 3. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Route groups `(main)` / `(wedding)` |
| Language | TypeScript (strict) | |
| Styling | **Tailwind CSS v4** (`@theme` in `app/globals.css`) | *(docs previously said v3; actual is v4, `@tailwindcss/postcss`)* |
| Animations | Framer Motion | Gated via `useReducedMotion()` |
| Icons | Lucide React | |
| State | Zustand (+ `persist`) | `cartStore`, `weddingStore`, both `localStorage` |
| Persistence | localStorage (V1) → real backend (V2, §10) | |
| Payments | Mock form (V1) → Stripe (V2) | |
| Fonts | Google Fonts | Redesign target: **Fraunces + Inter** (shipped: Playfair Display + Outfit) |
| Deployment | Vercel (planned) | |

---

## 4. Folder Structure (actual)

```
selahvie-web/
├── PRODUCT.md · DESIGN.md            # Root strategic + visual docs (impeccable)
├── .docs/                            # Engineering docs (this folder)
│   ├── architecture.MD · design.MD · tasks.MD
│
├── app/
│   ├── layout.tsx                    # Root: fonts, globals.css
│   ├── globals.css                   # Tailwind v4 @theme tokens + base + a11y
│   │
│   ├── (main)/                       # Marketing + app (Navbar/Footer/CartDrawer)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing (/)
│   │   ├── templates/page.tsx        # Gallery
│   │   ├── templates/[id]/page.tsx   # Template detail
│   │   ├── checkout/page.tsx
│   │   ├── checkout/success/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── dashboard/customize/[id]/page.tsx   # 5-step studio
│   │
│   └── (wedding)/                    # Chrome-free
│       ├── layout.tsx
│       ├── wedding/[slug]/page.tsx   # Published site (+ demo slugs)
│       └── preview/[id]/page.tsx     # Live template preview (redesign add)
│
├── components/
│   ├── ui/                           # ButtonPrimary/Secondary/Tertiary, InputField
│   ├── layout/                       # Navbar, Footer
│   ├── cart/                         # CartDrawer, CartItemCard
│   ├── templates/                    # TemplateCard, TemplateGrid
│   └── wedding-templates/            # Template renderers (registry, §7)
│       ├── index.ts                  # templateRegistry + resolveTemplate
│       ├── _shared/AudioPlayer.tsx
│       └── <template>/               # rose-elegy, obsidian-vow, enchanted-grove,
│                                     #   forest-bloom, golden-dusk, wonderstruck,
│                                     #   botanical-serenity — each self-contained
│
├── store/       cartStore.ts, weddingStore.ts
├── types/       template.ts, cart.ts, wedding.ts, order.ts
├── data/        templates.ts, musicTracks.ts, demoConfigs.ts (redesign add)
└── lib/         utils.ts, constants.ts
```

Note vs. the previous doc: there is **no `app/api/`** yet (V1 is client-only), and no
`components/customize/` or `components/wedding/` split — the studio is one page file and
published output is composed under `components/wedding-templates/`.

---

## 5. Data Models (actual, `types/`)

`WeddingTemplate` (`types/template.ts`) — `id, name, slug, description, longDescription,
price (₱ cents), previewImage, previewImages[], tags[], features[], colorPalettes[],
isFeatured, createdAt`.

`CartItem` (`types/cart.ts`) — `templateId, template, addedAt` (one per template).

`WeddingConfig` (`types/wedding.ts`) — couple info, theme (`primaryColor`, `accentColor`,
`themePresetId`), media (`heroImageUrl`, `galleryImageUrls[]`, `coupleStory`), RSVP
settings (`rsvpDeadline`, `mealOptions[]`, `allowPlusOne`, `customQuestions[]`), and music
(`musicTrackId`, `musicCustomUrl`).

`RSVPEntry` (`types/wedding.ts`) — defined but **not yet persisted** (RSVP submit is local
UI state only). The redesign's guest-management feature (§6) makes this real.

### Redesign additions to the data layer (V1, still local)
- **`RSVPEntry` persistence** in `weddingStore` keyed by wedding id; derived selectors for
  counts/meal tallies.
- **`GuestListEntry`** (invited guest: name, contact, party size, status) for guest-list
  management.
- **`WeddingConfig` growth** for richer sections & deeper customization: `registryLinks[]`,
  `travel` (hotels/notes), `faq[]`, `weddingParty[]`, `schedule[]`, `sectionOrder[]` +
  `sectionVisibility{}`, and `fontPresetId` / theme controls.
- **`favorites`** (template ids) for discovery.

---

## 6. Feature Architecture (redesign scope)

Four feature groups, all V1/local:

1. **Guest & RSVP management** — a dashboard area per wedding: guest list CRUD, RSVP
   response tracking, meal tallies, plus-one handling, CSV export, reminder stubs. Backed
   by `RSVPEntry` + `GuestListEntry` in `weddingStore`.
2. **Richer published-site sections** — registry/gift links, travel & accommodation, FAQ,
   wedding party, schedule/itinerary, guestbook/well-wishes. New optional section
   components under each template (or shared section primitives), config-driven.
3. **Deeper customization** — font/theme controls, section reorder + show/hide, live device
   (mobile/desktop) preview, custom-domain setup flow (mock). Studio grows from linear
   5-step to a persistent editor with live preview.
4. **Discovery & delight** — template favorites, richer live previews (already scaffolded
   at `/preview/[id]`), first-run onboarding, save-the-date sender (mock), couple profile.

---

## 7. Template System (actual)

`components/wedding-templates/index.ts` holds `templateRegistry` (template id → React
component) and `resolveTemplate(id)` (falls back to Rosé Elegy). Each template is a
self-contained folder composed of isolated section sub-components; all content is driven by
`WeddingConfig` props (`TemplateComponentProps = { config, showBranding? }`). Demo configs
live in `data/demoConfigs.ts` and power both `/wedding/<demo-slug>` and `/preview/[id]`
(with a synthesized fallback so every catalog template is previewable).

Redesign requirement: templates must (a) honor `prefers-reduced-motion`, (b) render content
visible-by-default (no scroll-gated reveals), and (c) support the new optional sections via
config, rendering nothing when a section's data is absent.

---

## 8. State Management

`cartStore` — `items[]`, `isOpen`; `addItem/removeItem/clearCart/openCart/closeCart`;
derived `isInCart/total/itemCount`; persisted `selahvie-cart`.

`weddingStore` — `configs: Record<id, WeddingConfig>`; `createConfig/updateConfig/
publishConfig/getConfig`; persisted `selahvie-weddings`. Redesign extends this with RSVP +
guest-list slices and their selectors (still `localStorage`).

---

## 9. Rendering Strategy

| Route | Now | Target |
|---|---|---|
| `/`, `/templates`, `/templates/[id]` | client components | prerender static + client filters |
| `/checkout`, `/dashboard/*` | CSR | CSR (user/cart state) |
| `/wedding/[slug]`, `/preview/[id]` | CSR (reads local store) | **SSR/SSG once a backend exists** — guest sites must be crawlable and fast |

Guest sites are the SEO/perf priority; SSR is deferred only because V1 has no server data
source. Until then, published output is optimized for first paint and reduced motion.

---

## 10. V1 → V2 Upgrade Path

| V1 (current) | V2 (planned) |
|---|---|
| localStorage (cart, configs, RSVPs, guest list) | Database (e.g. Supabase/Postgres) |
| Mock payment form | Live Stripe (`/api/checkout`) |
| Static image URLs (picsum) | Object storage (R2/S3) for uploads |
| No auth | Auth (magic link / OAuth) |
| RSVP/guest data client-only | `/api/rsvp`, `/api/wedding/[slug]` route handlers |
| `next.config.js` `images.unoptimized:true` | Next image optimization on real assets |
| Single-tier pricing | Tiered plans |

API routes (`/api/checkout`, `/api/rsvp`, `/api/wedding/[slug]`) are a **V2** addition; they
do not exist in V1 and the redesign does not introduce them.
