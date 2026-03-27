# Design System Specification: Selah Vie



## 1. Overview & Creative North Star



### Creative North Star: "The Curated Heirloom"

This design system moves away from the transactional nature of project management and toward the emotional resonance of an editorial boutique. We are not building a "utility tool"; we are crafting a digital concierge. The experience should feel like flipping through a high-end bridal magazine—spacious, intentional, and deeply tactile.



To break the "template" look, we leverage **Intentional Asymmetry**. Do not feel forced to center-align every hero or balance every grid. Use the `display-lg` typography to anchor a page, then allow UI elements to "float" around it using the layering principles below. The goal is to create a rhythm of "tension and release"—compressed information in high-utility areas and expansive, breathing room in celebratory moments.



---



## 2. Colors



The palette is rooted in organic, celebratory tones: **Dusty Rose (`primary`)**, **Soft Sage (`secondary`)**, and **Champagne Gold (`tertiary`)**.



### The "No-Line" Rule

**Borders are a failure of hierarchy.** To maintain a premium feel, 1px solid borders are strictly prohibited for sectioning. Contrast must be achieved through background shifts.

* *Implementation:* Place a `surface-container-low` section (for a "vendor list") directly onto a `surface` background. The shift in tone is sufficient to define the boundary without the "boxed-in" feeling of a line.



### Surface Hierarchy & Nesting

Treat the UI as a physical stack of fine paper.

1. **Base:** `surface` (#fdf9f6) - The canvas.

2. **Structural Sections:** `surface-container-low` (#f7f3f0) - Use for large secondary areas.

3. **Interactive Elements:** `surface-container-highest` (#e5e2df) - Use for active states or deeply nested utility panels.



### The "Glass & Gradient" Rule

For floating modals or sticky navigation, use **Glassmorphism**. Apply a background of `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 12px.

* **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#7c5454) to `primary_container` (#c99999) at a 135-degree angle. This adds a "silk-sheen" quality that feels bespoke.



---



## 3. Typography



The system utilizes a high-contrast pairing: **Noto Serif** for the "soul" (Headings) and **Plus Jakarta Sans** for the "engine" (UI/Labels).



* **Display & Headlines (Noto Serif):** These are your editorial anchors. Use `display-lg` for hero moments (e.g., "The Big Day"). Always use `on_surface` (#1c1b1a) to maintain authority.

* **Titles & Body (Plus Jakarta Sans):** Designed for clarity. `title-md` should be used for card headings to ensure they don't compete with the editorial serifs.

* **Letter Spacing:** For `label-md` and `label-sm`, increase letter spacing by 0.05rem and use uppercase for a "luxury brand" feel on small metadata.



---



## 4. Elevation & Depth



### The Layering Principle

Avoid "shadow-heavy" designs. Instead, stack your surface tokens. A `surface-container-lowest` card sitting on a `surface-container` background creates a "natural lift" that feels architectural rather than digital.



### Ambient Shadows

When an element must float (e.g., a "Save Date" FAB), use an **Ambient Shadow**:

* **Color:** `on_surface` at 6% opacity.

* **Blur:** 24px.

* **Y-Offset:** 8px.

This mimics soft, natural light filtered through a window.



### The "Ghost Border" Fallback

If a border is legally or functionally required for accessibility, use the `outline_variant` (#d1c5b4) token at **20% opacity**. It should be felt, not seen.



---



## 5. Components



### Buttons

* **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `full`. No shadow.

* **Secondary:** Ghost style. No background, `outline` token border (at 30% opacity), `primary` text.

* **Tertiary:** `label-md` styling with a 2px underline in `tertiary_fixed_dim`.



### Cards & Lists

* **Constraint:** Zero dividers. Use vertical white space `spacing.6` (2rem) to separate items.

* **Styling:** Use `surface-container-low` for card backgrounds with `roundedness.lg`.



### Input Fields

* **Styling:** Fields should not be boxes. Use a "Minimalist Undersline" or a very soft `surface-variant` background with `roundedness.sm`.

* **Focus State:** Shift background to `surface_container_lowest` and change underline to `tertiary`.



### Wedding-Specific Components

* **The Timeline Rail:** A vertical line using `outline_variant` with `secondary` nodes to track wedding day events.

* **The RSVP Toggle:** A custom "selection chip" using `secondary_container` for the active state to evoke a sense of calm and growth (Sage).



---



## 6. Do's and Don'ts



### Do:

* **Do** use `spacing.16` (5.5rem) or even `spacing.20` (7rem) between major sections to let the design breathe.

* **Do** mix serif and sans-serif in close proximity (e.g., a `label-md` category tag sitting above a `headline-sm` title).

* **Do** use the `tertiary` (Gold) sparingly for "moments of delight"—icon accents, star ratings, or price highlights.



### Don't:

* **Don't** use pure black (#000000). Always use `on_surface` (#1c1b1a) to keep the look soft and premium.

* **Don't** use standard "Material" shadows. If an element looks like it’s "popping" off the screen too hard, it has lost its elegance.

* **Don't** use hard corners. Even "square" elements should have at least `roundedness.sm` (0.25rem) to maintain a soft, welcoming feel.