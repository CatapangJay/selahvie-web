# Design System Specification: Selah Vie

> **Redesign — soft & romantic.** This is the engineering-side design spec, kept in
> sync with the root [DESIGN.md](../DESIGN.md) (canonical) and [PRODUCT.md](../PRODUCT.md).
> It documents the **target** system for the complete redesign, and notes where the
> shipped code still reflects the previous system so implementation can close the gap.
> Register is **product**: the couple's app leads; marketing/published surfaces reuse
> these tokens at higher intensity.

---

## 1. Creative North Star

**"A love letter, well-kept."** We are moving away from both the transactional SaaS look
*and* the previous quiet sage-on-parchment build, toward a **committed, romantic rose
identity**. The app is the calm, cared-for corner of an overwhelming wedding; the
published guest sites feel handmade. Warmth is carried by a dusty-rose surface family and
a deep bordeaux for drenched moments — **never** by a beige/cream/parchment body (the AI
default this brand rejects).

Intentional asymmetry and "tension and release" (compressed utility areas, expansive
celebratory moments) still apply — but as a rhythm tool, not a license for decoration.

---

## 2. Colors

Authored in **OKLCH**, contrast-checked to WCAG 2.1 AA. Full table with ratios lives in
[DESIGN.md §2](../DESIGN.md). Summary:

**Rose surface family** (warm neutrals tinted toward the brand hue, not beige):
`--surface #FDF8F7` · `--surface-1 #FAF1F1` · `--surface-2 #F6E9E9` · `--surface-3 #EFDEDF`

**Ink** (rose-tinted text neutrals): `--ink #2F1E26` (14.95:1) · `--ink-variant #604C55`
(7.49:1, use for body + labels + placeholders) · `--ink-muted #7D6A72` (4.78:1 on
`--surface` only — **never** on tinted panels; decorative/large captions only).

**Brand & accent:** `--rose #A75463` (primary action/selection/link, 4.88:1) ·
`--rose-dim #8A3A4A` (hover/pressed) · `--bordeaux #611C2A` (drenched heroes/footers,
white text 12.3:1) · `--gold #C69D63` (rare delight only) · `--sage #6B8971` (quiet
secondary).

**Semantic:** `--success #3F774D` · `--error #AE3F2C` · `--warning #C08A3E` ·
`--outline #DFD4D4` (1px hairlines).

### Rules
- **Hairlines are allowed now.** The old "borders are a failure of hierarchy / no 1px
  lines" rule is **retired**. Use hairline `--outline` dividers and full borders freely;
  side-stripe accent borders remain banned.
- **Contrast is a hard gate.** Body/label/placeholder ≥ 4.5:1; large/decorative ≥ 3:1.
  Do not use `--ink-muted` for text on `--surface-2`/`--surface-3`.
- No pure black. No gray text on colored fills (darken the fill's hue instead).
- App = Restrained (rose for action/state only). Marketing/published heroes = Committed →
  Drenched (bordeaux + white + rare gold).

---

## 3. Typography

High-contrast pairing on a real axis: **Fraunces** (romantic editorial serif; `Playfair
Display` is the current shipped fallback) for display/headings, **Inter** (humanist sans;
`Outfit` currently shipped) for all UI, labels, body, and data.

- **App uses a fixed rem scale**; fluid `clamp()` only on marketing/published heroes.
- Scale ratio ~1.2 in-app; display ceiling ≤ 6rem, letter-spacing floor ≥ -0.04em.
- Serifs only for display + couple/wedding content. **Never** serif UI labels/buttons/data.
- Retire the uppercase-tracked eyebrow above every section — one deliberate kicker max,
  otherwise sentence-case labels.
- `text-wrap: balance` on h1–h3; body prose 65–75ch.

---

## 4. Elevation & Depth

Prefer **surface-tone stacking** over shadows (a `--surface` card on `--surface-1` reads
as a natural lift). When an element must float, use an **ambient shadow**: `--ink` at ~7%,
24px blur, 8px Y. No Material pops. **Glassmorphism is rare and purposeful** (sticky nav at
most) — the old "use glass for all floating surfaces" rule is retired.

---

## 5. Components

Every interactive component ships **all** states: default, hover, **focus-visible**,
active, disabled, loading, error, selected.

- **Buttons** — Primary: solid `--rose`, white text, `--rose-dim` hover, radius `sm`,
  **min 44px height** (36px `sm`). Secondary: hairline outline + rose-tint hover.
  Tertiary: underlined sans label. **No gradient "silk-sheen"** (retired), no bounce.
- **Inputs** — underline (text) / `--surface-2` fill (textarea); rose focus underline +
  global focus ring; labels & placeholders in `--ink-variant`; numeric fields carry
  `inputMode` + `autocomplete`.
- **Cards & lists** — `--surface-2`, hairline or tone-shift, radius `md`, ambient hover
  shadow. **Never nested.**
- **Wedding-specific** — Timeline rail (`--outline` line, `--rose`/`--sage` nodes); RSVP
  toggle (selection chip, `--sage`-tinted "attending" for calm, `--rose` otherwise);
  theme swatch picker with live preview chip.
- **Skeletons** for loading (not center-spinners). **Empty states teach** the next action.
- **Status badges** — draft (`--surface-3`), published (`--success`), RSVP-active
  (`--rose`).

---

## 6. Motion

- 150–250ms app transitions; motion = state, never decoration. Ease-out exponential
  curves. **No bounce/elastic.**
- **`prefers-reduced-motion` mandatory** (global CSS block in place; gate framer via
  `useReducedMotion()`).
- **Reveals enhance an already-visible default** — never gate visibility on `whileInView`
  (ships blank to crawlers/no-JS/background tabs). Required fix on published templates.

---

## 7. Z-index scale

Semantic, defined in `globals.css`: `base 0 · dropdown 10 · sticky 40 · drawer-backdrop
50 · drawer 60 · modal-backdrop 70 · modal 80 · toast 90 · grain 100`. No arbitrary values.

---

## 8. Do / Don't

**Do:** breathe (3–4rem app sections, 6–9rem marketing); mix serif display with sans
labels in close proximity; use `--gold` sparingly for moments of delight; use hairlines
and surface-tone shifts for structure; define every interactive state.

**Don't:** use pure black; use `--ink-muted` for text on tinted panels; ship gradient
CTAs, default glassmorphism, side-stripe borders, gradient text, or an eyebrow on every
section; animate without a reduced-motion path; gate content on scroll reveals; nest cards.

---

## 9. Migration note (shipped → target)

The shipped `app/globals.css` currently implements the **previous** system: sage-green
`--color-primary #5D6B55` on warm-parchment surfaces, Playfair + Outfit, plus the audit
fixes already applied (darkened muted token `#605A53`, global focus ring, reduced-motion
block, semantic z-scale). The redesign replaces the palette and type per §2–3 while
**keeping** those accessibility fixes. Token names may migrate from `--color-*` to the
`--surface`/`--ink`/`--rose` naming above; do it in one pass with a compatibility map so
components update predictably.
