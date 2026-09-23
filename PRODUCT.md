# Product

## Register

product

## Platform

web

## Users

The primary user is an **engaged couple planning their own wedding** — most often one partner acting as the organizer, non-technical, planning in the evenings on a laptop or phone between everything else the wedding demands. They are emotionally invested but time-poor, and they arrive already stressed by wedding logistics. Their job to be done: stand up a beautiful wedding website, personalize it without design or coding skill, publish it, and then **manage the guest list and RSVPs in one place** through to the wedding day. Success for them is a site they're proud to share and a clear, current picture of who is coming.

The secondary audience is the **wedding guest** visiting a published site. They never see the app; they see one couple's wedding site and, usually, an RSVP form. Their needs (fast load, obvious RSVP, mobile-first, no account) shape the published-site output but not the app itself. This is a genuine surface-vs-user split: the people who use the product (couples) are not the people who see most of what it produces (guests).

## Product Purpose

Selah Vie lets couples browse, buy, and fully customize a wedding website — invitations, story, schedule, gallery, registry, travel details — and then run RSVP and guest management from a single dashboard through the wedding. It exists because the alternatives force a false choice: generic template builders that look templated, or bespoke sites that cost too much and take too long. Selah Vie's job is to make a site that looks handcrafted feel effortless to produce and effortless to run.

Success looks like: a couple completes customization and publishes without hitting a wall, shares the link with confidence, and returns repeatedly to watch RSVPs land and manage their list — the dashboard becoming the calm home base for the guest side of their wedding.

## Positioning

A wedding website you'd be proud to have designed yourself — and a guest list that manages itself — without the price of a designer or the look of a template.

## Brand Personality

Warm, romantic, and quietly confident. The voice is that of a thoughtful friend with impeccable taste: tender without being saccharine, clear without being clinical. It speaks in plain, generous language ("Watch RSVPs arrive while you focus on the day ahead"), never in SaaS jargon or exclamation-point hype. Emotionally, the app should evoke **calm, care, and anticipation** — planning a wedding is overwhelming, and this is the one corner of it that feels handled. Delight is earned in small moments (a first RSVP arriving, a site going live), never sprayed across every screen.

## Anti-references

- **Generic SaaS dashboards** — cold gray-on-white, dense KPI tiles, a "hero-metric" grid. This is a wedding, not an analytics product.
- **The AI cream/sand/parchment template look** — warm near-white body backgrounds at low chroma read as the 2026 AI default regardless of naming. Warmth must come from a committed rose identity, not a beige body.
- **Craft-fair / cutesy wedding clichés** — chalkboard fonts, doily borders, watercolor splashes, script-everything. Romantic, not kitsch.
- **Over-decorated interfaces** — gradient text, glassmorphism-as-default, side-stripe accent borders, bounce/elastic motion, an uppercase tracked eyebrow above every section. These are cross-project AI tells; the [audit findings](.docs) already flagged several in the current build.

## Design Principles

- **The tool disappears into the task.** For the couple, earned familiarity beats novelty: standard affordances, one consistent component vocabulary, every interactive state defined. Surprise is saved for moments, not pages.
- **Warmth is carried by identity, not by beige.** A committed rose palette, editorial typography, and generous rhythm do the emotional work — the body surface stays disciplined so content leads.
- **Every state is a designed state.** Loading (skeletons), empty ("teach the interface, not 'nothing here'"), error, and success are first-class. A couple mid-planning meets a helpful screen at every turn, never a dead end.
- **The published site is the couple's, not ours.** Customization is real and legible; Selah Vie branding is restrained on guest-facing output. The couple's names, colors, and story are the star.
- **Accessible by default, because guests are everyone.** Contrast, focus, reduced motion, and keyboard support are requirements, not polish — guest-facing sites especially reach an unpredictable, all-ages audience on every device.

## Accessibility & Inclusion

Target **WCAG 2.1 AA** across both the couple's app and the published guest sites. Body and label text must meet 4.5:1 (large/decorative text 3:1); this is a hard rule after the audit found the muted-text token failing at 2.41:1. Every interactive element needs a visible `:focus-visible` state and full keyboard operability. All motion — the app's transitions and the templates' parallax/particle effects — must honor `prefers-reduced-motion` with a crossfade or instant fallback, and content must never be gated on a scroll-triggered reveal. Guest sites carry the highest bar: they load on any device, for guests of any age or ability, often on the first and only visit.
