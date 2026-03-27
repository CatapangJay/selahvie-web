# Selah Vie — System Architecture

---

## 1. System Overview

Selah Vie is a **wedding management SaaS platform** that allows couples to browse, purchase, and fully customize wedding websites complete with digital invitations and RSVP management. The architecture follows a **monolithic Next.js application** pattern for V1, enabling fast iteration with a clear upgrade path to microservices.

---

## 2. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────────────┐ │
│  │ Marketing  │  │  App Shell  │  │  Public Wedding Site      │ │
│  │  Pages     │  │  (Auth'd)   │  │  /wedding/[slug]          │ │
│  │  /         │  │  /dashboard │  │  (Guest-Facing)           │ │
│  │  /templates│  │  /checkout  │  │                           │ │
│  └────────────┘  └─────────────┘  └───────────────────────────┘ │
│         │               │                      │                 │
│         └───────────────┴──────────────────────┘                 │
│                          │                                       │
│              Next.js App Router (SSR + CSR)                      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
    │  Next.js    │ │  Zustand    │ │  Static    │
    │  API Routes │ │  (Client    │ │  Data      │
    │  /api/*     │ │   State)    │ │  Layer     │
    └──────┬──────┘ └─────────────┘ └────────────┘
           │
    ┌──────▼──────────────────────────┐
    │         Data / Services         │
    │                                 │
    │  ┌───────────┐  ┌────────────┐  │
    │  │  Database │  │  Storage   │  │
    │  │  (Future: │  │  (Future:  │  │
    │  │  Supabase)│  │  S3/R2)    │  │
    │  └───────────┘  └────────────┘  │
    │                                 │
    │  ┌───────────────────────────┐  │
    │  │  Payment (Stripe)         │  │
    │  └───────────────────────────┘  │
    └─────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR for SEO on marketing/wedding pages, CSR for interactive dashboard |
| **Language** | TypeScript | Type safety across all data models |
| **Styling** | Tailwind CSS v3 | Utility-first, maps perfectly to design token system |
| **Animations** | Framer Motion | Polished entrance animations for editorial feel |
| **Icons** | Lucide React | Lightweight, consistent icon set |
| **State Management** | Zustand | Lightweight global state for cart + wedding customization |
| **Persistence** | localStorage (V1) → Supabase (V2) | Fast iteration in V1, real backend in V2 |
| **Payments** | Stripe (mock in V1) | Industry standard, easy migration from mock to live |
| **Deployment** | Vercel | Zero-config Next.js deployment, edge CDN |
| **Fonts** | Google Fonts (Noto Serif + Plus Jakarta Sans) | As specified in design system |

---

## 4. Folder Structure

```
selahvie-web/
├── .docs/                        # Project documentation
│   ├── architecture.MD
│   ├── design.MD
│   └── tasks.MD
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, navbar, cart drawer)
│   ├── page.tsx                  # Landing page (/)
│   │
│   ├── templates/
│   │   ├── page.tsx              # Template gallery (/templates)
│   │   └── [id]/
│   │       └── page.tsx          # Template detail (/templates/[id])
│   │
│   ├── checkout/
│   │   ├── page.tsx              # Checkout (/checkout)
│   │   └── success/
│   │       └── page.tsx          # Order confirmation (/checkout/success)
│   │
│   ├── dashboard/
│   │   ├── page.tsx              # User dashboard (/dashboard)
│   │   └── customize/
│   │       └── [id]/
│   │           └── page.tsx      # Customization studio (/dashboard/customize/[id])
│   │
│   ├── wedding/
│   │   └── [slug]/
│   │       └── page.tsx          # Public wedding site (/wedding/[slug])
│   │
│   └── api/                      # Next.js API Routes
│       ├── checkout/
│       │   └── route.ts          # POST /api/checkout (Stripe session)
│       ├── rsvp/
│       │   └── route.ts          # POST /api/rsvp (RSVP submission)
│       └── wedding/
│           └── [slug]/
│               └── route.ts      # GET/PUT /api/wedding/[slug]
│
├── components/                   # Reusable UI Components
│   ├── ui/                       # Primitive design system components
│   │   ├── ButtonPrimary.tsx
│   │   ├── ButtonSecondary.tsx
│   │   ├── ButtonTertiary.tsx
│   │   ├── Card.tsx
│   │   └── InputField.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PageLayout.tsx
│   │
│   ├── cart/                     # Cart feature components
│   │   ├── CartDrawer.tsx
│   │   ├── CartItemCard.tsx
│   │   └── CartBadge.tsx
│   │
│   ├── templates/                # Template feature components
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateGrid.tsx
│   │   └── TemplateFilterBar.tsx
│   │
│   ├── customize/                # Customization studio components
│   │   ├── StepIndicator.tsx
│   │   ├── CoupleInfoStep.tsx
│   │   ├── ThemeStep.tsx
│   │   ├── MediaStep.tsx
│   │   ├── RSVPSettingsStep.tsx
│   │   └── ReviewStep.tsx
│   │
│   └── wedding/                  # Public wedding site components
│       ├── WeddingHero.tsx
│       ├── WeddingGallery.tsx
│       ├── WeddingTimeline.tsx
│       └── RSVPForm.tsx
│
├── store/                        # Zustand stores
│   ├── cartStore.ts              # Cart state (items, add/remove/clear)
│   └── weddingStore.ts           # Wedding customization state
│
├── types/                        # TypeScript type definitions
│   ├── template.ts               # WeddingTemplate interface
│   ├── cart.ts                   # CartItem interface
│   ├── wedding.ts                # WeddingConfig, RSVPEntry interfaces
│   └── order.ts                  # Order, CheckoutSession interfaces
│
├── data/                         # Static seed data (V1)
│   └── templates.ts              # Mock template catalog
│
├── lib/                          # Utility functions
│   ├── utils.ts                  # General helpers (cn, formatPrice, etc.)
│   └── constants.ts              # App-wide constants
│
├── public/
│   ├── templates/                # Template preview images
│   └── icons/                    # Static icon assets
│
├── tailwind.config.ts            # Design token → Tailwind mapping
├── next.config.ts
└── tsconfig.json
```

---

## 5. Data Models

### `WeddingTemplate`
```typescript
interface WeddingTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;               // in cents
  previewImage: string;
  previewImages: string[];     // carousel images
  tags: TemplateTag[];         // "Romantic" | "Modern" | "Rustic" | "Minimalist"
  features: string[];          // included features list
  colorPalettes: ColorPalette[];
  isFeatured: boolean;
  createdAt: string;
}
```

### `CartItem`
```typescript
interface CartItem {
  templateId: string;
  template: WeddingTemplate;
  quantity: 1;                 // always 1 per template
  addedAt: string;
}
```

### `WeddingConfig`
```typescript
interface WeddingConfig {
  id: string;
  templateId: string;
  slug: string;                // public URL slug, e.g. "sarah-and-james"
  status: "draft" | "published";

  // Step 1: Couple Info
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;         // ISO date
  venueName: string;
  venueAddress: string;
  venueCity: string;

  // Step 2: Theme
  primaryColor: string;        // hex code
  accentColor: string;         // hex code
  themePreset: string;         // references template color palette id

  // Step 3: Media
  heroImageUrl: string;
  galleryImageUrls: string[];
  coupleStory: string;

  // Step 4: RSVP Settings
  rsvpDeadline: string;
  mealOptions: string[];
  allowPlusOne: boolean;
  customQuestions: string[];
}
```

### `RSVPEntry`
```typescript
interface RSVPEntry {
  id: string;
  weddingId: string;
  guestName: string;
  email: string;
  attending: boolean;
  mealChoice?: string;
  plusOneName?: string;
  message?: string;
  submittedAt: string;
}
```

---

## 6. User Flow

```
Landing Page (/)
      │
      ▼
Template Gallery (/templates)
      │
      │ Click template card
      ▼
Template Detail (/templates/[id])
      │
      │ "Add to Cart" click
      ▼
Cart Drawer (slides in)
      │
      │ "Checkout" click
      ▼
Checkout Page (/checkout)
      │
      │ "Complete Purchase" click
      ▼
Order Confirmation (/checkout/success)
      │
      │ "Customize Now" click
      ▼
User Dashboard (/dashboard)
      │
      │ "Customize" click on template
      ▼
Customization Studio (/dashboard/customize/[id])
      │  Step 1: Couple Info
      │  Step 2: Theme & Colors
      │  Step 3: Media Uploads
      │  Step 4: RSVP Settings
      │  Step 5: Review & Publish
      ▼
Public Wedding Website (/wedding/[slug])
      │
      │ Guest visits → submits RSVP
      ▼
RSVP Dashboard (in /dashboard)
```

---

## 7. State Management Architecture

### Cart Store (Zustand)
- **Scope:** Global, persisted to `localStorage`
- **State:** `items: CartItem[]`
- **Actions:** `addItem`, `removeItem`, `clearCart`
- **Derived:** `total`, `itemCount`, `isInCart(id)`
- **Hydration:** Rehydrated on app load from `localStorage`

### Wedding Store (Zustand)
- **Scope:** Global, persisted to `localStorage` as draft
- **State:** `configs: Record<string, WeddingConfig>`
- **Actions:** `updateConfig`, `publishConfig`, `resetConfig`

---

## 8. API Routes (Next.js Route Handlers)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/checkout` | Creates Stripe checkout session |
| `POST` | `/api/rsvp` | Submits guest RSVP for a wedding |
| `GET` | `/api/wedding/[slug]` | Fetches published wedding config |
| `PUT` | `/api/wedding/[slug]` | Updates wedding config (autosave draft) |

---

## 9. SEO & Rendering Strategy

| Route | Rendering | Reason |
|-------|-----------|--------|
| `/` | SSG | Static marketing content, max performance |
| `/templates` | SSG + CSR filters | Template catalog is static, filters are client-side |
| `/templates/[id]` | SSG | Pre-render all template detail pages |
| `/checkout` | CSR | Requires live cart state |
| `/dashboard/*` | CSR | Auth-protected, user-specific |
| `/wedding/[slug]` | SSR | Dynamic per-wedding data, crawlable for couples |

---

## 10. V2 Upgrade Path

| V1 (Current) | V2 (Planned) |
|---|---|
| `localStorage` for cart/user data | Supabase (Postgres) for persistent data |
| Mock payment form | Live Stripe integration |
| Static image URLs | Cloudflare R2 / AWS S3 for image uploads |
| No auth | Supabase Auth (magic link / Google OAuth) |
| Single-tier pricing | Tiered plans (Basic, Premium, Elite) |
| Manual deploy | CI/CD via GitHub Actions → Vercel |
