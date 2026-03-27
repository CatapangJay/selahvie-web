# Selah Vie — Wedding Management Platform: Task Breakdown

---

## Phase 1: Project Foundation & Infrastructure 🏗️

### 1.1 Project Setup
- [x] **Task 1.1.1:** Initialize Next.js 14 project with TypeScript
  - Bootstrap with `create-next-app` using App Router
  - Configure TypeScript strict mode
  - Set up path aliases (`@/`)
  - Configure ESLint + Prettier
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 1.1.2:** Configure Tailwind CSS + Design Token system
  - Install and configure Tailwind CSS v3
  - Map all design tokens from `design.MD` into `tailwind.config.ts` (colors, typography, spacing, radius)
  - Configure `Noto Serif` + `Plus Jakarta Sans` from Google Fonts
  - Create global CSS with surface hierarchy variables
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 1.1.3:** Set up state management & utilities
  - Install Zustand for global cart state
  - Install Framer Motion for animations
  - Install Lucide React for icons
  - Set up folder structure: `app/`, `components/`, `lib/`, `store/`, `types/`, `data/`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 1.1.4:** Initialize version control
  - Create `.gitignore` for sensitive files and Next.js artifacts
  - Write initial `README.md` documenting project overview and local setup
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

---

## Phase 2: Design System Implementation 🎨

### 2.1 Design Token Configuration
- [x] **Task 2.1.1:** Implement color palette in Tailwind
  - Map `primary` (#7c5454), `primary-container` (#c99999), `secondary` (sage), `tertiary` (gold)
  - Map all `surface` hierarchy tokens: `surface`, `surface-container-low`, `surface-container`, `surface-container-highest`, `surface-container-lowest`
  - Map `on-surface` (#1c1b1a), `outline-variant` (#d1c5b4)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 2.1.2:** Configure typography scale
  - Set up `display-lg`, `headline-sm`, `title-md`, `label-md`, `label-sm` utility classes
  - Configure Noto Serif for headings, Plus Jakarta Sans for UI
  - Add luxury label letter-spacing utilities
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

### 2.2 Core UI Component Library
- [x] **Task 2.2.1:** Build Button components
  - `ButtonPrimary` — silk-sheen gradient, full-radius, no shadow
  - `ButtonSecondary` — ghost style, outline border at 30% opacity
  - `ButtonTertiary` — label-md with underline in `tertiary_fixed_dim`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 2.2.2:** Build Card components
  - `TemplateCard` — `surface-container-low` bg, `roundedness.lg`, zero dividers
  - `CartItemCard` — compact variant with remove action
  - Hover state with ambient shadow (on-surface 6% opacity, 24px blur, 8px Y)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 2.2.3:** Build navigation & layout shells
  - `Navbar` — glassmorphism sticky nav (80% opacity, backdrop-blur 12px)
  - `Footer` — editorial layout with brand mark
  - `PageLayout` wrapper with proper section spacing (`spacing.16` = 5.5rem)
  - `CartBadge` indicator in navbar
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 2.2.4:** Build form Input components
  - Minimalist underline-style text inputs
  - Focus state: `surface-container-lowest` bg + `tertiary` underline
  - `ColorPickerInput`, `ImageUploadInput`, `TextareaInput` variants
  - **Priority:** P1 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 2.2.5:** Build wedding-specific components
  - `TimelineRail` — vertical `outline-variant` line with `secondary` nodes
  - `RSVPToggle` — custom selection chip using `secondary-container`
  - `ThemeSwatchPicker` — color code input with visual preview chip
  - **Priority:** P1 | **Status:** Completed | **Duration:** 1 day

---

## Phase 3: Template Gallery & Discovery 🖼️

### 3.1 Template Data Layer
- [x] **Task 3.1.1:** Define template data model & seed data
  - Create `types/template.ts` with full `WeddingTemplate` interface
  - Seed 6+ mock templates with names, descriptions, price, tags, preview images, features list, color palettes
  - Create `data/templates.ts` static data file
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

### 3.2 Gallery Page (`/templates`)
- [x] **Task 3.2.1:** Build template gallery page
  - Asymmetric masonry-style grid layout following design north star
  - Filter chips by style tags (e.g., "Romantic", "Modern", "Rustic")
  - `TemplateCard` with hover overlay showing quick preview CTA
  - Smooth Framer Motion entrance animations (stagger)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

- [x] **Task 3.2.2:** Implement filter & sort controls
  - Filter by style, price range
  - Sort by "Most Popular", "Price: Low to High", "Newest"
  - URL-based filter state for shareability
  - **Priority:** P1 | **Status:** Completed | **Duration:** 0.5 day

---

## Phase 4: Template Detail & Add to Cart 🛒

### 4.1 Template Detail Page (`/templates/[id]`)
- [x] **Task 4.1.1:** Build template detail page
  - Hero section: large preview image + template name (`display-lg` Noto Serif)
  - Features list, included items (invitation design, RSVP portal, custom domain)
  - Pricing display with `tertiary` gold accent
  - "Add to Cart" `ButtonPrimary` (silk-sheen gradient CTA)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

- [x] **Task 4.1.2:** Build template preview modal/section
  - Embedded iframe or image carousel showing live template preview
  - Desktop / Mobile toggle for responsive preview
  - **Priority:** P1 | **Status:** Completed | **Duration:** 0.5 day

---

## Phase 5: Cart & Checkout Flow 🛍️

### 5.1 Cart State Management
- [x] **Task 5.1.1:** Implement Zustand cart store
  - `addToCart(template)`, `removeFromCart(id)`, `clearCart()` actions
  - Persist cart to `localStorage`
  - Derived selectors: `cartTotal`, `cartCount`, `isInCart(id)`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

### 5.2 Cart Sidebar / Drawer
- [x] **Task 5.2.1:** Build cart drawer component
  - Slide-in panel (right side) with glassmorphism overlay
  - List of `CartItemCard` components with remove action
  - Order summary: subtotal, line items
  - Single "Checkout" `ButtonPrimary`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

### 5.3 Checkout Page (`/checkout`)
- [x] **Task 5.3.1:** Build checkout page
  - Order review section listing all cart items
  - Payment form (Stripe-ready fields: card number, expiry, CVC — mock implementation)
  - Billing info form (name, email, address)
  - "Complete Purchase" CTA with loading state
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

- [x] **Task 5.3.2:** Build order confirmation page (`/checkout/success`)
  - Celebration hero with `tertiary` gold accents
  - Summary of purchased templates
  - CTA: "Customize Your Website Now" → redirects to dashboard
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

---

## Phase 6: User Dashboard & Customization ✍️

### 6.1 Dashboard (`/dashboard`)
- [x] **Task 6.1.1:** Build user dashboard page
  - List of purchased wedding website templates
  - Status badges: "Draft", "Published", "RSVP Active"
  - CTA per template: "Customize", "Preview", "Share Link"
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

### 6.2 Wedding Customization Studio (`/dashboard/customize/[id]`)
- [x] **Task 6.2.1:** Build multi-step customization form
  - Step 1 — Couple Info: partner names, wedding date, venue name & address
  - Step 2 — Theme & Colors: color palette picker, accent color code input, theme preset selector
  - Step 3 — Media: hero photo upload, gallery image uploads (up to 8), couple story text
  - Step 4 — RSVP Settings: RSVP deadline, meal options, plus-one policy, custom questions
  - Step 5 — Review & Publish: live preview thumbnail + "Publish Website" button
  - **Priority:** P0 | **Status:** Completed | **Duration:** 2 days

- [x] **Task 6.2.2:** Implement wedding data store
  - Zustand store for current wedding customization state
  - Persist to `localStorage` as draft
  - Merge with template on publish
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 6.2.3:** Build live customization preview panel
  - Side-by-side layout: form on left, live template preview on right
  - Preview updates in real-time as user fills in data
  - Mobile / Desktop preview toggle
  - **Priority:** P1 | **Status:** Completed | **Duration:** 1 day

---

## Phase 7: Published Wedding Website 💍

### 7.1 Public Wedding Site (`/wedding/[slug]`)
- [x] **Task 7.1.1:** Build public wedding website template renderer
  - Route: `/wedding/[slug]` renders the purchased + customized template
  - Hero section: couple names, wedding date, countdown timer
  - Our Story section with couple-uploaded images
  - Details section: venue map placeholder, schedule/timeline
  - Gallery section: uploaded photos
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1.5 days

- [x] **Task 7.1.2:** Build RSVP form on public wedding site
  - Guest name, attending yes/no, meal choice, plus-one, message to couple
  - Submit confirmation with `RSVPToggle` component
  - Store RSVP responses in local state (mock backend)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

---

## Phase 8: Marketing & Landing Page 🌸

### 8.1 Landing Page (`/`)
- [x] **Task 8.1.1:** Build hero section
  - `display-lg` Noto Serif headline: "Your Dream Wedding, Online."
  - Subheadline in Plus Jakarta Sans
  - Dual CTAs: "Browse Templates" (`ButtonPrimary`) + "See Demo" (`ButtonSecondary`)
  - Asymmetric hero layout with floating editorial image
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

- [x] **Task 8.1.2:** Build features & social proof sections
  - 3-column feature grid: "Beautiful Templates", "Easy RSVP", "Custom Invitations"
  - Testimonial section with `tertiary` gold star ratings
  - Template showcase carousel (3 featured templates)
  - Pricing section with single tier
  - **Priority:** P1 | **Status:** Completed | **Duration:** 1 day

---

## Phase 9: Polish, Testing & Deployment 🚀

### 9.1 Quality Assurance
- [ ] **Task 9.1.1:** Responsive design audit
  - Test all pages at mobile (375px), tablet (768px), desktop (1280px+)
  - Fix any layout or typography regressions
  - **Priority:** P0 | **Status:** Not Started | **Duration:** 1 day

- [ ] **Task 9.1.2:** Accessibility audit
  - Ensure all interactive elements have focus states
  - Check color contrast ratios
  - Add ARIA labels to form inputs and icon buttons
  - **Priority:** P1 | **Status:** Not Started | **Duration:** 0.5 day

### 9.2 Deployment
- [ ] **Task 9.2.1:** Configure Vercel deployment
  - Connect GitHub repo to Vercel
  - Set up environment variables
  - Configure custom domain
  - **Priority:** P0 | **Status:** Not Started | **Duration:** 0.5 day

---

## Phase 10: Template Component System 🖼️

### 10.1 Template Architecture
- [x] **Task 10.1.1:** Build template component folder structure
  - Create `components/wedding-templates/` as the root for all template renderers
  - Each template lives in its own named subfolder (e.g., `rose-elegy/`)
  - Templates export a default component via an `index.ts` barrel file
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 10.1.2:** Build template registry & resolver
  - Create `components/wedding-templates/index.ts` as the central registry
  - `templateRegistry` maps template IDs → React components
  - `resolveTemplate(id)` helper with fallback to Rosé Elegy
  - Export shared `TemplateComponentProps` interface (`config`, `showBranding`)
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 10.1.3:** Refactor public wedding page to use registry
  - `app/wedding/[slug]/page.tsx` now delegates rendering to `resolveTemplate(config.templateId)`
  - Removed all inline rendering logic from the page — page is now ~76 lines
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

### 10.2 Rosé Elegy Template (`t1`)
- [x] **Task 10.2.1:** Build Rosé Elegy sample template
  - Location: `components/wedding-templates/rose-elegy/RoseElegyTemplate.tsx`
  - Full-screen hero with layered gradient overlay, large serif couple names, live countdown (days/hours/minutes/seconds)
  - Save-the-date announcement banner with `primary` gradient
  - Our Story section: two-column layout with story text + couple photo
  - Details section: Date / Venue / Time cards with icon + hover animation
  - Day-Of Schedule timeline rail with `outline-variant` line and `primary` nodes
  - Asymmetric photo gallery grid with hover zoom effect
  - RSVP section with decorative radial background, gradient attending toggle, meal chips, plus-one field, wishes textarea
  - Branded footer with couple names and Selah Vie attribution
  - All sections driven by `WeddingConfig` props — zero hardcoded content
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1 day

- [x] **Task 10.2.2:** Split Rosé Elegy into isolated sub-components
  - Refactored `RoseElegyTemplate.tsx` from a 735-line monolith into a thin ~65-line compositor
  - Each section lives in its own file under `components/wedding-templates/rose-elegy/components/`
  - Sub-components: `Countdown`, `Divider`, `SectionLabel`, `HeroSection`, `SaveTheDateBanner`, `StorySection`, `DetailsSection`, `ScheduleSection`, `GallerySection`, `RsvpSection`, `TemplateFooter`
  - Changes to one section never touch another; new templates share no code with Rosé Elegy
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

### 10.3 Obsidian Vow Template (`t6`)
- [x] **Task 10.3.1:** Build Obsidian Vow advanced template with animations & music
  - Location: `components/wedding-templates/obsidian-vow/ObsidianVowTemplate.tsx`
  - Dark-mode cinematic aesthetic: obsidian `#0a0908` base, gold `#c9a84c` accent, warm-white type
  - **AudioPlayer** (`components/AudioPlayer.tsx`): floating bottom-right music toggle, pulsing ring animation, HTML5 Audio API, graceful error handling, tooltip prompting user to play
  - **HeroSection**: CSS starfield background (80 twinkling stars via keyframe animation), Framer Motion staggered entrance (`container` + `line` + `fadeUp` variants), gold diamond ornament divider, gold glow orb via radial gradient, animated scroll hint arrow
  - **Countdown**: flip animation using `AnimatePresence` + `mode="popLayout"` for each digit change
  - **SaveTheDateBanner**: sweeping shimmer animation across the gold banner on loop
  - **StorySection**: slide-in-from-sides entrance (`x: ±40`) for text and image, decorative gold quote mark, gold corner frame accents on image
  - **DetailsSection**: staggered card entrance, gold corner brackets that expand on hover, icon framed in gold border square
  - **ScheduleSection**: timeline rail with gradient fade, `whileHover` node glow, staggered item slide-in
  - **GallerySection**: `scale: 0.95 → 1` entrance per image, dark overlay lifts on hover, gold border frame appears on hover, varied aspect ratios for masonry feel
  - **RsvpSection**: `AnimatePresence` form↔confirmation swap, gold-filled attending buttons, all inputs dark-themed with gold underline
  - **TemplateFooter**: ambient top glow, gold diamond ornament, attribution
  - Demo accessible at `/wedding/obsidian-demo`
  - All 11 sub-components fully isolated under `obsidian-vow/components/`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 1.5 days

### 10.5 Music Configuration System
- [x] **Task 10.5.1:** Define music data layer
  - Created `data/musicTracks.ts` with `MusicTrack` interface and catalog of 6 royalty-free Bensound tracks: Romantic, Sweet, Memories, Tenderness, Dreams, Jazzy Frenchy
  - Exported `CUSTOM_TRACK_ID = "custom"` and `NO_MUSIC_ID = "none"` sentinel constants
  - Exported `resolveMusicSrc(musicTrackId?, musicCustomUrl?)` helper that returns a resolved `string | null`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 10.5.2:** Update data model & store
  - Added `musicTrackId: string` and `musicCustomUrl: string` to `WeddingConfig` interface in `types/wedding.ts`
  - Updated `defaultConfig()` in `store/weddingStore.ts` with defaults `musicTrackId: "none"` and `musicCustomUrl: ""`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.1 day

- [x] **Task 10.5.3:** Build shared `AudioPlayer` component
  - Created `components/wedding-templates/_shared/AudioPlayer.tsx`
  - Accepts `src: string | null | undefined` and optional `accentColor` prop
  - Hides entirely when `src` is null/undefined; shows after 1.5 s entrance delay
  - Floating bottom-right button with pulsing ring when playing, tooltip label "Play Ambient Music"
  - Graceful error handling (catches audio load/play failures silently)
  - Replaces the old Obsidian-Vow-specific AudioPlayer; all templates use this shared version
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 10.5.4:** Wire both templates to shared AudioPlayer
  - `RoseElegyTemplate.tsx`: added `AudioPlayer` (was absent), calls `resolveMusicSrc()`, passes result as `src` prop
  - `ObsidianVowTemplate.tsx`: replaced local `./components/AudioPlayer` import with shared `_shared/AudioPlayer`, now config-driven
  - Demo configs in `app/wedding/[slug]/page.tsx` updated: `/wedding/demo` uses `"romantic"`, `/wedding/obsidian-demo` uses `"dreams"`
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.25 day

- [x] **Task 10.5.5:** Add music picker to customization studio (Step 3)
  - Added full music picker UI to the end of Step 3 (Media & Story) in `app/dashboard/customize/[id]/page.tsx`
  - "No Music" chip and "Custom MP3 URL" chip as quick-select options
  - 2-column grid displaying all 6 built-in tracks with name, mood badge, description, and a play/pause preview button (live in-browser preview via `HTMLAudioElement`)
  - Custom URL `InputField` appears only when the Custom option is selected
  - Bensound attribution note with link per license requirement
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.5 day

- [x] **Task 10.5.6:** Show music selection in Step 5 review summary
  - Added `{ label: "Music", value: <resolved name> }` entry to the review grid in Step 5
  - Displays "No music", "Custom URL", "Custom (no URL set)", or the track name depending on selection
  - **Priority:** P0 | **Status:** Completed | **Duration:** 0.1 day

### 10.4 Future Templates (Planned)
- [ ] **Task 10.4.1:** Build Sage & Thistle template (`t2`)
  - Earthy sage palette, botanical motifs, timeline rail
  - Location: `components/wedding-templates/sage-and-thistle/`
  - **Priority:** P1 | **Status:** Not Started | **Duration:** 1 day

- [ ] **Task 10.4.2:** Build Champagne Reverie template (`t3`)
  - Gold-foil aesthetic, seating chart module, guest messaging wall
  - Location: `components/wedding-templates/champagne-reverie/`
  - **Priority:** P1 | **Status:** Not Started | **Duration:** 1 day

- [ ] **Task 10.4.3:** Build remaining template variants (`t4` Linen & Light, `t5` Wildflower Barn)
  - One component per template ID; register each in `templateRegistry`
  - **Priority:** P2 | **Status:** Not Started | **Duration:** 1 day each
