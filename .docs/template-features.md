# Template features catalogue

The sections and features a Selah Vie wedding template may offer, and the data each one reads. A template is built from these pieces only. Anything a reference site has that is not listed here is either left out or mapped onto the closest entry below; it is never added as a new section.

Source of truth: `types/wedding.ts` (`WeddingConfig`), `lib/weddingDetails.ts`, `lib/entourage.ts`, `lib/invitations.ts`, `lib/tiers.ts`, `components/wedding-templates/_shared/`. Update this file whenever one of those changes what a guest can see.

## Page flow

Every template renders in this order. Sections inside the body may be reordered to suit the design, but nothing outside this list is added.

1. **Opening** (optional, recommended): a full-screen intro the guest dismisses (envelope, seal, window, booth…). Carries the guest greeting.
2. **Hero**: names, date, venue, countdown.
3. **Body sections** (from the catalogue below).
4. **Private sections** (Premium).
5. **Footer**.

Rendered for the template, not by it (never rebuild these):
- "Find your invitation" name/code prompt: `_shared/FindInvitation`, rendered by the site page (`app/(wedding)/wedding/[slug]`) on Premium sites that have a guest list, when no invitee is identified and `inviteLookupEnabled` is not false.
- Package gating: `applyPackage(config)` (`lib/invitations.ts`) switches off locked modules before the template renders. Templates only check `isSectionVisible` and the data being present.
- Font preset: `PersonalizedTemplate` sets `--wedding-serif` (and `--font-serif` / `--font-sans`) from `fontPresetId`. Use `var(--wedding-serif, <template default>)` for the display face.

## Packages

| Package | Adds |
|---|---|
| Essential | Homepage, countdown, details with maps, RSVP, order of events, travel notes, registry links, guest list |
| Classic | Entourage, gallery (albums), background music, FAQ |
| Premium | Guestbook, QR codes, invitation download, SMS invites, personal invite links and greeting, private sections, extra guests per invitee, seating chart |

`lib/tiers.ts` → `TIER_MODULES` is authoritative. Templates may set `personalizedOnly` in `data/templates.ts` when the design depends on the guest greeting (sold on Premium only).

## Catalogue

Section key = the `AudienceSectionKey` used with `isSectionVisible(config, key)` and listed in `AUDIENCE_SECTIONS_BY_TEMPLATE`. Sections without a key are always shown when their data is present.

### Opening and greeting
- **Data:** `partner1Name`, `partner2Name`, `weddingDate`; greeting from `greetingFor(config, useInvitee())` → `{ name, message } | null` (null on open invitations and when `inviteGreeting.enabled` is false).
- **Must:** render the greeting inside the template's own design (intro card, hero line, place card) and add the template ID to `OWN_GREETING_TEMPLATES`. Open invitations show the couple's names instead. Lock page scroll while the overlay is up; stop above `var(--preview-chrome-bottom, 0px)`; keyboard-operable; reduced-motion path.

### Hero (no key)
- **Data:** names, `weddingDate` (parse as a local calendar date), `venueName`, `venueCity`, `heroImageUrl`.
- **Countdown:** to `weddingDate`; server renders a placeholder (`useSyncExternalStore`) so hydration matches; past-date message on and after the day.

### Our story (`story`)
- **Data:** `coupleStory` (paragraphs split on blank lines). Hide when empty.

### Details / venues (no key)
- **Data:** `ceremonyVenue(config)` and `receptionVenue(config)` from `lib/weddingDetails.ts` → name, address, city, time, map link. Reception is null when it is the same venue. `ceremonyTime`, `reception.time`, `hashtagOf(config)`.
- **Maps:** use the helpers' map/directions URLs (they honour pasted `venueMapUrl` / `reception.mapUrl`).

### Order of events (`schedule`)
- **Data:** `schedule[]` → `{ time, title, description? }`. Hide when empty.

### Travel & stay (`travel`)
- **Data:** `travel.directions`, `travel.accommodations`, `travel.notes` (one note per line). Hide when all are empty. May be folded into the details section, but still gated by the `travel` key.

### Dress code (no key)
- **Data:** `dressCodeOf(config)` → title, description, palette (hex swatches). Show swatches only if the couple set them.

### Entourage (`weddingParty`, Classic+)
- **Data:** `weddingParty[]` → name, `name2` (pairs), role, side, `photoUrl`, `relationship`, `message`; `entourageLayout`.
- **Helpers:** `groupEntourage` (categories and role headings in ceremony order), `displayName(member, layout.parentNames)`, `columnLayout(layout, category, roles)`. Do not hand-roll role grouping.

### Gallery (`gallery`, Classic+)
- **Data:** `galleryAlbumsOf(config)` → albums Prenup / Engagement / Favorite memories when `galleryAlbums` is used, otherwise `galleryImageUrls` as one gallery.

### RSVP (`rsvp`)
- **Data and behaviour:** `useRsvpSubmit(config)` (submit, `prefillName`, `maxPlusOnes`, name `matching`); `rsvpDeadline`; `mealOptions`; `allowPlusOne`.
- **Fields offered:** full name, email, mobile number (optional, `phone`), attending yes/no, dietary note (optional free text when attending, `dietaryRestrictions`), meal choice (when options exist and attending), plus-one name (`maxPlusOnes === 1`) or `AdditionalGuestsField` (`maxPlusOnes > 1`), note to the couple. `OpenInviteNotice` under the name field. Success and decline states.
- **Not offered:** custom questions (`customQuestions` is stored but not rendered), song requests, dietary checkboxes beyond meal options, file uploads, transport sign-ups.

### Registry (`registry`)
- **Data:** `registryLinks[]` → label, url (optional; only http/https opens in a new tab), note (bank or GCash details, multiline).

### FAQ (`faq`, Classic+)
- **Data:** `faq[]` → question, answer.

### Guestbook (`guestbook`, Premium)
- **Data and UI:** shared `_shared/sections/GuestbookSection`. Restyle by wrapping it; don't rebuild storage.

### Private sections (Premium)
- **UI:** `_shared/PrivateSections` (kinds: text, photo, extra event; audience-filtered already). Mount once near the end of the body with the template's accent and tone.

### Footer (no key)
- **Data:** names, date, `hashtagOf`, `contactOf` (name, email, phone links), `socialLinksOf` (Instagram, Facebook, TikTok, X, YouTube, website), `InvitationDownloadLink` (renders only on Premium), "Created with Selah Vie" when `showBranding`.

### Background music (no key, Classic+)
- **UI:** `_shared/AudioPlayer` with `resolveMusicSrc(config.musicTrackId, config.musicCustomUrl)`; mount after the opening is dismissed. Its floating toggle is the only music control; don't build a second player (a vinyl or cassette visual may start/stop it only if it drives the same audio).

## Not offered (map or drop)

If a reference site has one of these, leave it out or map it as noted. Don't invent data fields for them.

| Seen on reference sites | Do instead |
|---|---|
| Live stream / video link | Drop (or a registry-style link only if the couple adds it as a FAQ answer) |
| Reminders / house rules ("adults only", "unplugged") | Travel notes or FAQ entries |
| Thank-you section | Footer line, or registry intro copy |
| Gift QR code image | Registry entry note (bank/GCash text); QR codes are generated by the dashboard, not uploaded |
| RSVP via QR / external form | Our RSVP section |
| Love-story timeline with dated milestones | Our story paragraphs |
| Separate per-group dress-code illustrations | One dress code with optional swatches |
| Hotel booking widgets, maps embeds | Travel notes + map links |
| Song request, custom RSVP questions | Not offered |
| Multiple pages / tabs | One scrolling page |
| Chat, comments, likes | Guestbook (Premium) |
| Countdown to RSVP deadline | RSVP deadline line in the RSVP section |

## Registration checklist

`components/wedding-templates/index.ts`: `templateRegistry`, `OWN_GREETING_TEMPLATES`, `AUDIENCE_SECTIONS_BY_TEMPLATE` (list exactly the keys the template gates). `data/templates.ts`: catalogue entry with unique palette IDs. `data/demoConfigs.ts`: a demo with fresh content that fills every offered section.
