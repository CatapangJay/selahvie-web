# Design

Visual system for Selah Vie. Strategic context lives in [PRODUCT.md](PRODUCT.md); this file is the single source of truth for how the product looks and moves. Values are OKLCH-authored and contrast-checked against WCAG 2.1 AA. Register is **product** — the couple's app leads; the marketing/template surfaces borrow the same tokens turned up a stop.

---

## 1. Creative direction

**"A love letter, well-kept."** The redesign moves from the current quiet sage-on-parchment toward a **soft, romantic, committed rose identity**. Warmth comes from a lived-in dusty-rose surface family and a deep bordeaux for drenched moments — not from a beige body background (the AI default this brand explicitly rejects). Editorial serif display over a humanist sans; hairline structure, generous rhythm, ornament used once and meant. The app should feel like the calm, cared-for corner of an overwhelming wedding; the published sites should feel handmade.

Register discipline: in the **app** (dashboard, studio, checkout) color is Restrained — rose carries actions, selection, and state, nothing decorative. On **marketing and published heroes** color can go Committed or Drenched (bordeaux surfaces, rose-forward sections). Same tokens, different intensity.

---

## 2. Color

Authored in OKLCH. Every text pairing below is verified; ratios in parentheses are against the noted surface.

### Rose surface family (warm neutrals, tinted toward the brand hue, NOT beige)
| Token | OKLCH | Hex | Use |
|---|---|---|---|
| `--surface` | `oklch(0.982 0.006 20)` | `#FDF8F7` | App canvas / body |
| `--surface-1` | `oklch(0.965 0.010 20)` | `#FAF1F1` | Structural sections, sidebars |
| `--surface-2` | `oklch(0.945 0.014 18)` | `#F6E9E9` | Cards, panels, order summary |
| `--surface-3` | `oklch(0.915 0.018 16)` | `#EFDEDF` | Active/nested/interactive fills |

### Ink (warm rose-tinted neutrals for text)
| Token | OKLCH | Hex | Use | Contrast |
|---|---|---|---|---|
| `--ink` | `oklch(0.26 0.028 350)` | `#2F1E26` | Headings, primary text | 14.95:1 on surface |
| `--ink-variant` | `oklch(0.44 0.030 350)` | `#604C55` | Body, labels, secondary text | 7.49:1 on surface, 6.08:1 on surface-3 |
| `--ink-muted` | `oklch(0.545 0.028 350)` | `#7D6A72` | Decorative/large captions ONLY | 4.78:1 on surface — **fails on surface-3 (3.87); never use for body/labels on tinted panels** |

Never use pure black. `--ink-muted` is the trap the audit caught: it clears 4.5:1 only on the lightest surface. Body text, form labels, and placeholders use `--ink-variant`; reserve `--ink-muted` for large decorative captions on `--surface` only.

### Brand & accents
| Token | OKLCH | Hex | Use | Contrast |
|---|---|---|---|---|
| `--rose` | `oklch(0.55 0.11 10)` | `#A75463` | Primary actions, selection, links | 4.88:1 on surface · white on rose 5.13:1 |
| `--rose-dim` | `oklch(0.46 0.11 10)` | `#8A3A4A` | Hover/pressed, text-on-light rose | 7.16:1 on surface · white 7.54:1 |
| `--bordeaux` | `oklch(0.34 0.10 12)` | `#611C2A` | Drenched hero surfaces, footers | white on bordeaux 12.30:1 · gold on bordeaux 4.92:1 |
| `--gold` | `oklch(0.72 0.09 75)` | `#C69D63` | Rare delight: price highlight, ornament, moments only | large-text/decorative on surface |
| `--sage` | `oklch(0.60 0.05 150)` | `#6B8971` | Secondary/quiet accent, calm states | pairs with rose without competing |

### Semantic state
| Token | OKLCH | Hex | Contrast on surface |
|---|---|---|---|
| `--success` | `oklch(0.52 0.09 150)` | `#3F774D` | 5.04:1 |
| `--error` | `oklch(0.52 0.15 32)` | `#AE3F2C` | 5.62:1 |
| `--warning` | `oklch(0.66 0.12 70)` | `#C08A3E` | large text only |
| `--outline` | `oklch(0.88 0.012 18)` | `#DFD4D4` | hairline borders/dividers (1px) |

### Color strategy by surface
- **App (Restrained):** `--surface`/`--surface-1` body, `--surface-2` cards, rose for primary action + current selection + state only. No decorative color. A single flow may earn Committed (e.g. a drenched checkout-success or a studio welcome).
- **Marketing / published heroes (Committed → Drenched):** bordeaux drenched heroes with white + gold, rose-forward CTA sections. Gold stays rare — one moment of delight, not a theme.
- Gray text on a colored fill is banned; darken the fill's own hue or use a white/ink transparency instead.

---

## 3. Typography

High-contrast pairing on a real contrast axis (serif + humanist sans), not two similar sans.

- **Display / headings — `Fraunces`** (or `Playfair Display` as the current fallback): editorial serif with optical sizing and a soft, romantic character. Carries hero and section headings.
- **UI / body — `Inter`** (or the current `Outfit`): humanist sans for labels, buttons, data, forms, body. One family across all product chrome.

Product-register type rules (differ from brand):
- **Fixed rem scale in the app, fluid clamp only on marketing/published heroes.** A fluid h1 that shrinks inside a dashboard panel looks worse; users view at consistent DPI.
- Scale ratio ~1.2 in the app (many type elements, low contrast between steps avoids noise); marketing may exaggerate.
- Display heading ceiling `clamp()` max ≤ 6rem; letter-spacing floor ≥ -0.04em.
- Body prose capped 65–75ch; data/dense UI may run wider.
- `text-wrap: balance` on h1–h3, `pretty` on long prose.
- Serifs are for display and couple/wedding content **only** — never for UI labels, buttons, or data (a current-build tell to retire).

Roles: `display` (marketing/hero serif), `headline` (section serif), `title` (card/panel sans, 500), `body` (sans 400), `label` (sans 500, sentence case — retire the uppercase-tracked eyebrow-on-every-section pattern; one deliberate kicker max).

---

## 4. Layout & spacing

- Spacing scale (rem): `0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 · 6 · 9`. Vary it for rhythm; major app sections breathe at 3–4rem, marketing at 6–9rem.
- **Flexbox for 1D, Grid for 2D.** Responsive card grids without breakpoints: `repeat(auto-fit, minmax(280px, 1fr))`.
- App responsive behavior is **structural** — collapsing sidebar, responsive tables, breakpoint-driven columns — not fluid type.
- Cards are used only when they're the right affordance; **never nest cards**. Prefer surface-tone shifts and hairline dividers over boxing everything.
- Test every heading at 375 / 768 / 1280px; copy must never overflow its container (a current-build risk with large clamp scales).

### Z-index scale (semantic — no arbitrary 999/9999)
`base 0 · dropdown 10 · sticky 40 · drawer-backdrop 50 · drawer 60 · modal-backdrop 70 · modal 80 · toast 90 · grain 100`. (Already implemented in `globals.css`; keep all new stacking on this scale.)

---

## 5. Components

Every interactive component ships **all** states: default, hover, focus-visible, active, disabled, loading, error, selected. Do not ship half.

- **Buttons** — Primary: solid `--rose`, white text, `--rose-dim` hover, radius `sm`, min-height 44px (36px for `sm`). Secondary: hairline `--outline`, ink text, rose border+tint on hover. Tertiary: sans label with underline, rose on hover. No gradients (retire the "silk-sheen" gradient from the old spec), no bounce easing.
- **Inputs** — underline style on transparent (text fields) or `--surface-2` fill (textareas), rose underline on focus plus the global focus ring. Labels in `--ink-variant`, placeholders must hit 4.5:1 (use `--ink-variant`, not muted). Numeric fields carry `inputMode` + `autocomplete`.
- **Cards** — `--surface-2` fill, `--outline` hairline or tone-shift, radius `md`, ambient shadow on hover only (see §7). Never nested.
- **Selection controls** — chips/toggles use `--rose` fill + white for active, `--outline` for rest; sage-tinted acceptance states where calm fits (RSVP "attending").
- **Overlays** — cart drawer, modals, and the new studio previews use the z-scale; dropdowns escape `overflow:hidden` via `<dialog>`/popover/`position:fixed`, never clipped.
- **Skeletons, not spinners,** for content loading. **Empty states teach** the next action.
- **Status badges** — draft (`--surface-3` + ink-variant), published (`--success`), RSVP-active (`--rose`).

---

## 6. Motion

- 150–250ms on app transitions; motion conveys **state** (change, feedback, loading, reveal), never decoration. No orchestrated page-load sequences in the app.
- Ease-out with exponential curves (ease-out-quart/quint/expo). **No bounce, no elastic** — retire the spring-overshoot on buttons.
- **Reduced motion is mandatory.** Every animation needs a `@media (prefers-reduced-motion: reduce)` path (crossfade/instant); framer-motion gated via `useReducedMotion()`. Global CSS fallback already in `globals.css`.
- **Reveals enhance an already-visible default** — never gate content visibility on a scroll/`whileInView` class, or it ships blank to crawlers, no-JS, and background tabs. This is a required fix on the published templates.
- Staggering one list is fine; a uniform identical entrance on every section is the tell to avoid.
- Premium materials (blur, mask, clip-path, glow) are allowed on published heroes when they stay smooth and honor reduced motion — not as app decoration.

---

## 7. Elevation

Prefer surface-tone stacking over heavy shadows. When an element must float, use an ambient shadow: `--ink` at ~7% opacity, 24px blur, 8px Y-offset — soft daylight, not a Material pop. Drawers/toasts may layer a second, larger shadow. Glassmorphism is rare and purposeful (a sticky nav at most), never a default card treatment.

---

## 8. Retired from the previous system

The old `.docs/design.MD` described a different, drifted system; these are explicitly retired: gradient/"silk-sheen" CTAs, glassmorphism as a default rule, the strict "no 1px lines ever" rule (hairlines are welcome now), Dusty-Rose+Sage+Gold-as-equals (rose now leads, gold is rare), Noto Serif + Plus Jakarta Sans (→ Fraunces/Playfair + Inter/Outfit), and the uppercase tracked eyebrow above every section. See [.docs/design.MD](.docs/design.MD) for the full engineering-side spec kept in sync with this file.
