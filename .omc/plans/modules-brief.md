# Wedding modules + packages — shared brief for implementation agents

Repo: C:\Projects\selahvie-web (Next.js 16 — read node_modules/next/dist/docs before using unfamiliar Next APIs; React 19, Tailwind 4, Supabase).
Read PRODUCT.md and DESIGN.md first. Guest-facing sites must meet WCAG 2.1 AA, honor prefers-reduced-motion, be mobile-first.

## What already landed (do not redo; do not edit these files)
- `types/wedding.ts`: Tier is now "essential" | "classic" | "premium". New WeddingConfig fields:
  `ceremonyTime`, `venueMapUrl`, `reception` (ReceptionInfo: sameAsCeremony, name, address, city, time, mapUrl),
  `hashtag` (stored without "#"), `dressCode` (title, description, palette hex[]),
  `galleryAlbums` (Partial<Record<"prenup"|"engagement"|"memories", string[]>>; galleryImageUrls stays the union),
  `contact` (name, email, phone), `socialLinks` (id, platform, url).
  WeddingPartyMember gained `relationship`, `message`. RSVPEntry gained `phone`, `dietaryRestrictions`.
- `lib/tiers.ts`: TIERS, TIER_INFO, TIER_MODULES, MODULE_LABELS, `hasModule(config, module)`, `tierFor(module)`,
  `configTier`, `upgradePrice(from,to)`, `higherTiers`. Modules: entourage, gallery, music, faq (Classic+);
  guestbook, qrCodes, invitationDownload, personalization, seating (Premium).
- `lib/invitations.ts` `applyPackage` (run inside `personalizeConfig`, so every PersonalizedTemplate render):
  sets sectionVisibility false for weddingParty/gallery/faq/guestbook when the package lacks them, and musicTrackId "none"
  without music. **So templates gate modules simply by honoring `isSectionVisible(config, key)` and the normal music check.**
- `lib/weddingDetails.ts`: `ceremonyVenue(config)`, `receptionVenue(config)` (null when same venue),
  `receptionTimeAtCeremony`, `hashtagOf`, `dressCodeOf`, `galleryAlbumsOf`, `galleryHasAlbums`, `flattenAlbums`,
  `GALLERY_ALBUMS`, `SOCIAL_PLATFORMS`, `socialLinksOf`, `contactOf`, `safeUrl`, `sitePath`, `invitationPath`, `RSVP_ANCHOR` ("rsvp").
- `components/wedding-templates/_shared/useRsvpSubmit.ts`: RsvpDraft accepts `phone` and `dietaryRestrictions`.
- `components/wedding-templates/_shared/InvitationDownloadLink.tsx`: `<InvitationDownloadLink config className style>` renders
  only on Premium; style it in the template's own design.
- `_shared/sections/WeddingPartySection.tsx` already shows relationship + message.
- Demo configs (data/demoConfigs.ts) are Premium and filled with all new fields (`withDemoDetails`). Don't edit that file.
- DB migration db/migrations/0012_packages.sql exists.

## House rules
- Match surrounding code style, comment density, naming. No TODOs, stubs, placeholder copy.
- Each template renders new content IN ITS OWN DESIGN (fonts, ornaments, palette, motion vocabulary) — not a generic block.
  Stay adult and elegant, calm motion, nothing cartoonish. Copy is warm and plain, no exclamation hype.
- Empty data = render nothing for that piece (no empty headings).
- Only edit the files in your scope. If you believe a shared file needs a change, don't make it — say so in your report.
- Verify: `npx tsc --noEmit -p .` (ignore errors under `.next/`) and `npx eslint <your files>` must be clean for your files.
- Don't commit. Report: files changed, what each template now renders, anything you could not do.
