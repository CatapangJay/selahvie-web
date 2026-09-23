# Selah Vie — Redesign & Feature Task Breakdown

> **Complete redesign — soft & romantic, product-primary, V1 mock backend.**
> Supersedes the original build plan. Strategy: [../PRODUCT.md](../PRODUCT.md).
> Visual system: [../DESIGN.md](../DESIGN.md) + [design.MD](./design.MD).
> Structure: [architecture.MD](./architecture.MD).
>
> Status legend: ✅ done · 🔄 exists, needs rework for redesign · ⬜ new/not started.
> The V1 foundation (Next 14 app, template registry, cart/checkout, studio, 7 templates)
> already ships; this plan **redesigns** it and adds four feature groups.

---

## Phase 0 — Foundations already shipped ✅

- ✅ Next.js 14 App Router with `(main)` / `(wedding)` route groups, TypeScript strict.
- ✅ Tailwind v4 `@theme` token system in `globals.css`.
- ✅ Zustand `cartStore` + `weddingStore` (localStorage).
- ✅ Template registry + `resolveTemplate`, 7 self-contained templates, shared AudioPlayer.
- ✅ Cart drawer, mock checkout + success, 5-step customization studio, music picker.
- ✅ Live template preview at `/preview/[id]` with synthesized-config fallback.
- ✅ **Audit remediation** (accessibility baseline): darkened muted token, global
  `:focus-visible` ring, `prefers-reduced-motion` CSS block, semantic z-index scale,
  44px touch targets, numeric `inputMode`/`autocomplete`, emoji/copy fixes.

---

## Phase 1 — Redesign the design system 🎨

- ✅ **1.1 Repalette to rose identity.** `globals.css` now carries the OKLCH rose surface
  family + rose-tinted ink + brand/semantic tokens (DESIGN.md §2). Shipped a11y fixes
  preserved; muted token kept contrast-safe (`#67595F`, ≥4.5:1 on every panel). **P0**
- ✅ **1.2 Token compat map.** `--color-*` names retained with new values; new canonical
  `--surface`/`--ink`/`--rose`/`--bordeaux`/`--gold`/`--sage` aliases added pointing at the
  same values, so all 17 consuming components keep working while new code adopts the new
  names. Full rename of consumers deferred (non-breaking, incremental). **P0**
- ✅ **1.3 Typography swap.** Fraunces (display/headings) + Inter (UI/body) loaded in
  `layout.tsx`; `--font-serif`/`--font-sans` updated with Playfair/Outfit as fallbacks;
  body inline font updated. Fixed-rem-vs-clamp discipline documented; applying it per
  surface is Phase 2/7 work. **P0**
- 🔄 **1.4 Retire AI/legacy tells.** ✅ Bounce/overshoot easing removed from buttons +
  cards; ✅ glass downgraded to rare-use only (still on nav); ✅ shadow tints moved to ink.
  Remaining: gradient "silk-sheen" CTAs already absent in shipped buttons (verify per
  surface); ⬜ uppercase-eyebrow-on-every-section retirement is per-surface (Phase 2/7). **P1**
- ⬜ **1.5 Component state matrix.** Ensure every UI component defines default/hover/
  focus-visible/active/disabled/loading/error/selected; add skeletons. **P1**
- ⬜ **1.6 Re-audit.** Run `/impeccable audit` after repalette; target AA everywhere. **P1**

---

## Phase 2 — Redesign the couple's app (product-primary) 🖥️

- ✅ **2.1 App shell / navigation IA.** Dashboard is the home base; each website card
  routes to Customize (`/dashboard/customize/[id]`) and Guests & RSVPs
  (`/dashboard/manage/[id]`, new). Aggregate glance (websites / published / attending) in
  the header. **P0**
- ✅ **2.2 Dashboard redesign.** New `WebsiteCard` with real status incl. **RSVP-active**
  (published + responses arriving), per-site RSVP glance (attending / guests / declined),
  and Customize + Guests quick actions. **P0**
- 🔄 **2.3 Customization studio → persistent editor.** Not yet reworked — still the linear
  5-step form (functional). Deferred: live device preview + section reorder land with
  Phase 5. **P1**
- 🔄 **2.4 Checkout + success polish.** Inherits the new palette/type via tokens; a
  dedicated warmer confirmation pass is still pending. **P2**
- ✅ **2.5 Empty/loading states.** Shared `EmptyState` (teach-the-interface) used on
  dashboard, guest list, and RSVP views; shared `Skeleton` primitive + shimmer added
  (reduced-motion safe). **P1**

---

## Phase 3 — Feature: Guest & RSVP management 👥 ✅

- ✅ **3.1 Data layer.** `RSVPEntry` (with `plusOne`) + `GuestListEntry` persisted in
  `weddingStore` (version 2 + migration preserving v1 configs); selectors `getRsvps`,
  `getRsvpSummary` (counts, attending/declined, guest heads incl. plus-ones, meal tally),
  and guest CRUD. **P0**
- ✅ **3.2 Wire published-site RSVP to the store.** Shared `useRsvpSubmit` hook persists
  submissions for all four RSVP templates (rose-elegy, obsidian-vow, enchanted-grove,
  wonderstruck); **no-ops on demo/preview** configs so previews don't pollute real data. **P0**
- ✅ **3.3 Guest list management.** `GuestListManager`: add / status-change / remove,
  party size, email, search + status filter, running head count. **P0**
- ✅ **3.4 RSVP dashboard.** `RsvpDashboard`: summary stats, meal breakdown, attending vs.
  declined, plus-one and wishes per response; hosted with the guest list under tabs at
  `/dashboard/manage/[id]`. **P0**
- ✅ **3.5 Export.** CSV export of the guest list (`toCsv` + `downloadFile`, RFC-escaped).
  Reminder-send remains a future stub. **P2**

---

## Phase 4 — Feature: Richer wedding-site sections 💍 ✅

Built as **shared, config-driven section components** under
`components/wedding-templates/_shared/sections/`, render-nothing-when-empty, styled via
surface tokens + the couple's palette. Integrated into **rose-elegy** as the reference
light template (with visibility gating). Rolling them into the other six templates is
follow-up (tracked in Phase 8 alongside their a11y pass).

- ✅ **4.1 Registry / gift links** — `RegistrySection` + `registryLinks[]`. **P1**
- ✅ **4.2 Travel & accommodation** — `TravelSection` (accommodations/directions/notes). **P1**
- ✅ **4.3 FAQ** — `FaqSection` accordion (`faq[]`). **P1**
- ✅ **4.4 Wedding party** — `WeddingPartySection` (names, roles, optional photos). **P2**
- ✅ **4.5 Schedule / itinerary** — `ScheduleSection` timeline (`schedule[]`). **P2**
- ✅ **4.6 Guestbook / well-wishes** — `GuestbookSection`, persisted to the store
  (`guestbook` slice, v3 migration); no-ops on demo/preview. **P2**

---

## Phase 5 — Feature: Deeper customization ✍️

- ✅ **5.1 Font & theme controls** — `data/fontPresets.ts` (4 presets); studio picker;
  applied on the published template by overriding `--font-serif`/`--font-sans` on the
  template root. **P1**
- 🔄 **5.2 Section show/hide** — ✅ `sectionVisibility{}` + studio toggles + gating in
  rose-elegy. Section **reorder** (`sectionOrder[]`) not yet built. **P1**
- ⬜ **5.3 Live device preview** (mobile/desktop toggle) inside the studio. **P1**
- ⬜ **5.4 Custom-domain setup flow** (mock: instructions + status). **P2**
- ⬜ **5.5 Multi-language toggle** for published sites (stretch). **P3**

New studio step "Sections" (step 5; Review moved to 6) hosts the `SectionsEditor`:
typography picker, show/hide chips, and add/remove editors for schedule, wedding party,
travel, registry, and FAQ.

---

## Phase 6 — Feature: Discovery & delight ✨

- 🔄 **6.1 Richer live previews.** ✅ Desktop/mobile **device toggle** on `/preview/[id]`
  (phone-width frame). In-preview palette switching not yet built. **P2**
- ✅ **6.2 Template favorites.** `favoritesStore` (localStorage), heart on each
  `TemplateCard`, and a "Saved (n)" filter in the gallery with its own empty state. **P2**
- ✅ **6.3 First-run onboarding.** `OnboardingChecklist` on the studio: reads the config,
  shows an activation progress bar + step links, dismissible, auto-hides once complete or
  published. **P1**
- ⬜ **6.4 Save-the-date sender** (mock share/email of the published link). **P3**
- ⬜ **6.5 Couple account profile** (names, contact, wedding basics reused across sites). **P3**

---

## Phase 7 — Marketing surface (brand intensity) 🌸

- ✅ **7.1 Landing redesign.** Bordeaux **drenched hero** (white + gold, 12.3:1), inline
  proof line replacing the hero-metric grid, and eyebrow-on-every-section retired
  (Featured + Pricing kickers removed; "How it works" kept as a genuine labeled sequence). **P1**
- ✅ **7.2 Gallery + detail.** Favorites entry point (heart + Saved filter) and the
  live-preview CTA (from Phase 6) now live in the gallery/detail; system tokens applied. **P2**

---

## Phase 8 — Published-site correctness & a11y 💒

- ✅ **8.1 Reduced motion across all templates.** Systemic fix: both render sites
  (`/wedding/[slug]`, `/preview/[id]`) wrap templates in `TemplateMotionProvider`
  (`<MotionConfig reducedMotion="user">`) so every descendant framer animation — incl. the
  24 infinite loops — respects the OS setting, without editing 19 files. **P1**
- 🔄 **8.2 Reveal robustness.** `MotionConfig` fixes the reduced-motion path (content
  shows at end state). Remaining risk: no-JS/crawler render of `whileInView` content is
  still `opacity:0` — acceptable for now since app data is client-side/CSR; revisit when
  SSR lands (architecture.MD §9). **P1**
- ✅ **8.3 Heading outline.** One `<h1>` per hero — deduped partner-name h1s in rose-elegy,
  obsidian-vow, and enchanted-grove (second name → `<p>`, styling unchanged). **P2**
- ⬜ **8.4 Contrast pass** on template accent-on-dark text (per-template rebalance,
  deferred to avoid breaking each template's aesthetic). **P2**

Note: the richer shared sections (Phase 4) are integrated into **rose-elegy** only;
rolling them into the other six templates remains follow-up work.

---

## Phase 9 — QA & deployment 🚀

- ⬜ **9.1 Responsive audit** at 375 / 768 / 1280px across app + published sites. **P0**
- ⬜ **9.2 Accessibility audit** — WCAG 2.1 AA, focus, keyboard, contrast, reduced motion. **P1**
- ⬜ **9.3 Vercel deploy** — env, domain. **P0**

---

## Deferred to V2 (not in this redesign)

Real backend (Supabase/Postgres), auth, live Stripe + `/api/*` route handlers, object
storage for uploads, tiered pricing. See [architecture.MD §10](./architecture.MD).
All redesign features above are built against **V1 localStorage/mock** data.
