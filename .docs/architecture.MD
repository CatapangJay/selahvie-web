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
│   │   ├── dashboard/customize/[id]/page.tsx   # 5-step studio
│   │   └── dashboard/manage/[id]/page.tsx      # Guests · RSVPs · Personalize tabs
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
│   ├── templates/                    # TemplateCard, TemplateGrid, TierPicker
│   ├── manage/                       # GuestListManager, RsvpDashboard,
│   │                                 #   PersonalizationEditor
│   └── wedding-templates/            # Template renderers (registry, §7)
│       ├── index.ts                  # templateRegistry + resolveTemplate
│       │                             #   + audienceSectionsFor
│       ├── _shared/AudioPlayer.tsx
│       ├── _shared/                  # PersonalizedTemplate, InviteeContext,
│       │                             #   PrivateSections, InviteeGreeting,
│       │                             #   FindInvitation, ViewAsSelect
│       └── <template>/               # rose-elegy, obsidian-vow, enchanted-grove,
│                                     #   forest-bloom, golden-dusk, wonderstruck,
│                                     #   botanical-serenity — each self-contained
│
├── store/       cartStore.ts, weddingStore.ts
├── types/       template.ts, cart.ts, wedding.ts, order.ts
├── data/        templates.ts, musicTracks.ts, demoConfigs.ts (redesign add),
│                demoPersonalization.ts (sample groups/guests for previews)
└── lib/         utils.ts, constants.ts, tiers.ts, invitations.ts
```

Note vs. the previous doc: there is **no `app/api/`** yet (V1 is client-only), and no
`components/customize/` or `components/wedding/` split — the studio is one page file and
published output is composed under `components/wedding-templates/`.

---

## 5. Data Models (actual, `types/`)

`WeddingTemplate` (`types/template.ts`) — `id, name, slug, description, longDescription,
price (₱ cents), previewImage, previewImages[], tags[], features[], colorPalettes[],
isFeatured, createdAt`.

`CartItem` (`types/cart.ts`) — `id, kind` (`template` | `upgrade`), `templateId, template,
tier, weddingId?, weddingLabel?` (upgrade items), `addedAt`. An `upgrade` item is the
Personalized add-on for an already-owned wedding (id `upgrade:<weddingId>`).

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

### Tiers & personalized invitations (V1, still local)
- **`Tier`** = `"base" | "personalized"`; `WeddingConfig.tier` records the plan (absent =
  base). `lib/tiers.ts` owns pricing: `PERSONALIZED_ADDON_CENTS = 50000` (₱500),
  `tierPrice(templatePrice, tier)`, `configTier(config)`, and `TIER_INFO` (labels/features).
- **`GuestGroup`** (`id, weddingId, name, inviteCode`) and `GuestListEntry` growth
  (`groupIds[]`, per-guest `inviteCode`). Stored in `weddingStore` (**version 4**).
- **`Audience`** (`groupIds[], guestIds[]`) — who can see something. An **empty audience
  means everyone**.
- `WeddingConfig` additions: `privateSections[]` (`PrivateSection`, kind `text` | `photo` |
  `event`, each with an `audience`), `sectionAudiences` (restrict an existing
  `AudienceSectionKey` — `story`, `gallery`, `rsvp` or an optional section — to an
  audience), `inviteGreeting` (hero "Dear {name}," + message), `inviteLookupEnabled`
  (guest-facing "Find your invitation" prompt, default on).

---

## 6. Feature Architecture (redesign scope)

Five feature groups, all V1/local:

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
5. **Plans & personalized invitations** — see §6.1.

### 6.1 Plans & personalized invitations

**Plans.** *Base* = template price. *Personalized* = template price + ₱500
(`PERSONALIZED_ADDON_CENTS`). Personalized is preselected (`TierPicker` on the template
detail and `/preview/[id]`); the tier can be switched in the cart. A Base owner upgrades
from the dashboard: `addUpgrade()` puts an add-on-only `upgrade` item in the cart, and
checkout calls `updateConfig(weddingId, { tier: "personalized" })`. Locked features stay
visible to Base users with an upgrade prompt.

**Guest list (all plans).** Groups (add/rename/delete with two-step confirm), group
assignment per guest, CSV import (1 MB / 2,000 rows cap; header aliases) and export (cells
are guarded against spreadsheet formula injection in `csvCell`), and status tracking.

**Personalized only** (`/dashboard/manage/[id]` → *Personalize* tab,
`PersonalizationEditor`):
- Private sections (text / photo / extra event) targeted at groups and/or guests.
- Show/hide existing sections per audience. `audienceSectionsFor(templateId)` lists what
  each template supports: `story`/`gallery`/`rsvp` where the template has them; the
  optional sections (schedule, party, travel, registry, FAQ, guestbook) only in Rosé Elegy.
- Hero greeting with the guest's name.
- **Extra guests per guest.** `GuestListEntry.partySize` is the invitation's total seats;
  an identified guest may name `partySize - 1` additional guests on their RSVP (capped at
  `MAX_ADDITIONAL_GUESTS` = 19), regardless of the site-wide plus-one setting.
  `plusOneAllowance(config, invitee)` in `lib/invitations.ts` is the single source; everyone
  else (Base, group links, unidentified visitors) gets the site-wide single plus-one.
  `useRsvpSubmit` returns `maxPlusOnes`; when it is > 1 the RSVP forms of all five RSVP
  templates render the shared `AdditionalGuestsField` (name rows, add/remove, blanks ignored).
  `RSVPEntry` stores `additionalGuests` and `additionalGuestNames` (`plusOne`/`plusOneName`
  are kept for older entries and the single plus-one), and the head count uses
  `1 + (additionalGuests ?? (plusOne ? 1 : 0))`. Couples set it per guest in the guest
  list's expanded row (`PartySizeField`) and review it in the Personalize tab ("Extra guests").

**Resolving the viewer** (`/wedding/[slug]`). `?invite=<code>` → `findInviteeByCode`
(guest code or group code) → `Invitee | null`. Without a code, the `FindInvitation` dialog
accepts a code or a name (`matchGuestByName`, fuzzy; ambiguous names fall back to asking
for the code). The owner gets a `ViewAsSelect` that only they see.

**Rendering.** `PersonalizedTemplate` runs `personalizeConfig(config, invitee)` (applies
`sectionAudiences` and filters private sections), wraps the output in `InviteeProvider` +
`TemplateMotionProvider`, and renders the registry template keyed by the invitee id (via
`createElement`, which satisfies the `react-hooks/static-components` lint rule). Every
template mounts `<PrivateSections>`. `useRsvpSubmit` reads `useInvitee()` to pre-fill the
name, cap party size, set `guestId` on the RSVP, and update that guest's status; it never
auto-accepts.

**Preview.** `/preview/[id]` has a Base/Personalized toggle and a View-as picker over
sample data (`data/demoPersonalization.ts`).

**Limitations (V1, no backend).** Hidden content is still shipped to the client, so this is
**presentation-level personalization, not access control**; the guest list lives in each
browser's `localStorage`. Real enforcement needs server-side filtering by invite code (§10).

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

`cartStore` — `items[]`, `isOpen`; `addItem(template, tier)/addUpgrade/setTier/removeItem/
clearCart/openCart/closeCart`; derived `isInCart/total/itemCount`; `cartItemPrice(item)`
prices an item by tier/kind; persisted `selahvie-cart`.

`weddingStore` — `configs: Record<id, WeddingConfig>`; `createConfig(templateId, email,
tier)/updateConfig/publishConfig/getConfig`; persisted `selahvie-weddings` (version 4).
Redesign extends this with RSVP + guest-list slices and their selectors, guest groups
(`addGroup/renameGroup/…`), `importGuests(weddingId, rows)` and `updateGuest` (still
`localStorage`).

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
| localStorage (cart, configs, RSVPs, guest list) | Database (PostgreSQL; schema in `db/migrations/`) |
| Mock payment form | Live Stripe (`/api/checkout`) |
| Static image URLs (picsum) | Object storage (R2/S3) for uploads |
| ~~No auth~~ **Done:** Supabase Auth (email + password, `/auth/callback` for email links, `proxy.ts` refreshes the session and guards `/dashboard`) | |
| RSVP/guest data client-only | `/api/rsvp`, `/api/wedding/[slug]` route handlers |
| `next.config.js` `images.unoptimized:true` | Next image optimization on real assets |
| Two tiers enforced client-side (Base / Personalized) | Tier entitlements checked server-side |
| Private sections shipped to the client, filtered in the browser | Server returns only the content an invite code is entitled to |

API routes (`/api/checkout`, `/api/rsvp`, `/api/wedding/[slug]`) are a **V2** addition; they
do not exist in V1 and the redesign does not introduce them.
