/**
 * Real screenshots of each template's demo (captured from /preview/[id]), in
 * /public/screens. Used by the home page to show the product itself instead of
 * stock photography. Re-capture them whenever a template's look changes.
 *
 *  - intro: the first thing a guest sees (envelope, title card, lift doors…)
 *  - home:  the same site once it's opened (desktop, 1200×700)
 *  - phone: the opened site on a phone (390 wide)
 */
export interface TemplateScreens {
  intro: string;
  home: string;
  phone: string;
}

const SLUG_BY_ID: Record<string, string> = {
  t12: "jewel-tones",
  t13: "monochrome",
  t14: "apricot-hour",
  t15: "narra-kapis",
  t16: "shutter-strip",
  t17: "wizarding-vows",
  t18: "eucalyptus-folio",
  t19: "mezzanine",
};

export function screensFor(templateId: string): TemplateScreens | null {
  const slug = SLUG_BY_ID[templateId];
  if (!slug) return null;
  return { intro: `/screens/${slug}-intro.webp`, home: `/screens/${slug}-desktop.webp`, phone: `/screens/${slug}-phone.webp` };
}

/** Section close-ups for the "In every template" cards. */
export const sectionScreens = {
  invitation: "/screens/narra-kapis-phone.webp",
  rsvp: "/screens/section-rsvp-3.webp",
  story: "/screens/section-story-2.webp",
} as const;
