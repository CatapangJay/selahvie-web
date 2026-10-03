/**
 * Centralized wedding imagery.
 *
 * Every marketing/demo image on the site routes through here so real wedding
 * photography can be swapped in one place (instead of scattered random picsum
 * seeds). URLs point at Unsplash wedding/couple photos with sizing params.
 *
 * NOTE: these Unsplash photo IDs were chosen for the wedding subject but could
 * not be network-verified from the build environment. If any one 404s, replace
 * just its URL below — nothing else needs to change. `next.config.js` has
 * `images.unoptimized: true`, so no remotePatterns entry is required.
 */
const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const weddingImages = {
  // Hero / large full-bleed couple shots
  heroCouple: U("1519741497674-611481863552", 1920),
  ceremony: U("1465495976277-4387d4b0b4c6", 1920),
  // About collage
  aboutPortrait: U("1511285560929-80b456fea0bc", 900),
  aboutWide: U("1522673607200-164d1b6ce486", 1200),
  // Feature / service visuals
  invitation: U("1607190074257-dd4b7af0309f", 800),
  rsvp: U("1519225421980-715cb0215aed", 800),
  story: U("1460978812857-470ed1c77af0", 800),
  // Testimonial
  testimonial: U("1591604466107-ec97de577aff", 900),
} as const;

/**
 * A rotating pool of wedding photos for template preview thumbnails, keyed by
 * index so the gallery/cards vary. Deterministic (no randomness) so SSR/CSR match.
 */
export const templatePhotoPool: string[] = [
  U("1519741497674-611481863552", 800), // couple holding hands
  U("1606216794074-735e91aa2c92", 800), // bride bouquet
  U("1522673607200-164d1b6ce486", 800), // ceremony aisle
  U("1465495976277-4387d4b0b4c6", 800), // couple field sunset
  U("1511285560929-80b456fea0bc", 800), // rings / details
  U("1519225421980-715cb0215aed", 800), // reception table
  U("1460978812857-470ed1c77af0", 800), // walking couple
  U("1583939003579-730e3918a45a", 800), // floral arch
  U("1537633552985-df8429e8048b", 800), // first dance
  U("1591604466107-ec97de577aff", 800), // vows
  U("1525258946800-98cfd641d0de", 800), // bridal portrait
];

/** Deterministic photo for a given index (wraps the pool). */
export function templatePhoto(index: number): string {
  return templatePhotoPool[index % templatePhotoPool.length];
}
