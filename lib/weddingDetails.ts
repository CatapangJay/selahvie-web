import type { GalleryAlbumKey, SocialPlatform, WeddingConfig } from "@/types/wedding";

/**
 * Read-side helpers for the wedding details every template renders: venues
 * with maps, hashtag, dress code, gallery albums and footer links. Templates
 * style these themselves; the rules for what to show live here.
 */

/** A venue as templates render it. */
export interface VenueView {
  name: string;
  address: string;
  city: string;
  /** Free text ("3:00 PM"), may be empty. */
  time: string;
  /** Google Maps link, or null when there's nothing to search for. */
  mapUrl: string | null;
  /** "Get directions" link (Google Maps directions to the venue). */
  directionsUrl: string | null;
}

/** Only http(s) links are rendered, so a pasted `javascript:` URL can't run. */
export function safeUrl(raw: string | undefined | null): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function searchQuery(name: string, address: string, city: string): string {
  return [name, address, city].map((s) => s?.trim()).filter(Boolean).join(", ");
}

export function mapsSearchUrl(name: string, address: string, city: string): string | null {
  const query = searchQuery(name, address, city);
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export function mapsDirectionsUrl(name: string, address: string, city: string): string | null {
  const query = searchQuery(name, address, city);
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : null;
}

export function ceremonyVenue(config: WeddingConfig): VenueView {
  const { venueName: name, venueAddress: address, venueCity: city } = config;
  return {
    name,
    address,
    city,
    time: config.ceremonyTime?.trim() ?? "",
    mapUrl: safeUrl(config.venueMapUrl) ?? mapsSearchUrl(name, address, city),
    directionsUrl: mapsDirectionsUrl(name, address, city),
  };
}

/** The reception, or null when it's held at the ceremony venue (or not set). */
export function receptionVenue(config: WeddingConfig): VenueView | null {
  const r = config.reception;
  if (!r || r.sameAsCeremony || !(r.name?.trim() || r.address?.trim())) return null;
  return {
    name: r.name,
    address: r.address,
    city: r.city,
    time: r.time?.trim() ?? "",
    mapUrl: safeUrl(r.mapUrl) ?? mapsSearchUrl(r.name, r.address, r.city),
    directionsUrl: mapsDirectionsUrl(r.name, r.address, r.city),
  };
}

/** Reception time when it's at the ceremony venue (the couple can still give a time). */
export function receptionTimeAtCeremony(config: WeddingConfig): string {
  const r = config.reception;
  return r?.sameAsCeremony ? r.time?.trim() ?? "" : "";
}

/** "#AlexAndSam", or "" when not set. */
export function hashtagOf(config: WeddingConfig): string {
  const tag = config.hashtag?.replace(/^#+/, "").replace(/\s+/g, "").trim();
  return tag ? `#${tag}` : "";
}

/** The dress code, or null when it has nothing to say. */
export function dressCodeOf(config: WeddingConfig) {
  const d = config.dressCode;
  if (!d || !(d.title?.trim() || d.description?.trim() || d.palette?.length)) return null;
  return {
    title: d.title?.trim() ?? "",
    description: d.description?.trim() ?? "",
    palette: (d.palette ?? []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)),
  };
}

export const GALLERY_ALBUMS: { key: GalleryAlbumKey; label: string }[] = [
  { key: "prenup", label: "Prenup" },
  { key: "engagement", label: "Engagement" },
  { key: "memories", label: "Favorite memories" },
];

export interface GalleryAlbumView {
  key: GalleryAlbumKey;
  label: string;
  urls: string[];
}

/**
 * Non-empty albums in display order. A site that never sorted its photos gets
 * one "memories" album of every gallery photo, so templates can always render
 * albums. Use `galleryHasAlbums` to decide whether to show album headings.
 */
export function galleryAlbumsOf(config: WeddingConfig): GalleryAlbumView[] {
  const albums = config.galleryAlbums;
  if (!albums) {
    const urls = config.galleryImageUrls ?? [];
    return urls.length ? [{ key: "memories", label: "Favorite memories", urls }] : [];
  }
  return GALLERY_ALBUMS.map((a) => ({ ...a, urls: albums[a.key] ?? [] })).filter((a) => a.urls.length > 0);
}

/** True when the couple sorted photos into albums, so the albums deserve headings or tabs. */
export function galleryHasAlbums(config: WeddingConfig): boolean {
  return Boolean(config.galleryAlbums) && galleryAlbumsOf(config).length > 0;
}

/** Every album photo in order, for `galleryImageUrls` (kept in sync by the editor). */
export function flattenAlbums(albums: Partial<Record<GalleryAlbumKey, string[]>>): string[] {
  return [...new Set(GALLERY_ALBUMS.flatMap((a) => albums[a.key] ?? []))];
}

export const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourhandle" },
  { key: "x", label: "X", placeholder: "x.com/yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@yourchannel" },
  { key: "website", label: "Website", placeholder: "yourwebsite.com" },
];

export interface SocialLinkView {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export function socialLinksOf(config: WeddingConfig): SocialLinkView[] {
  return (config.socialLinks ?? []).flatMap((l) => {
    const url = safeUrl(l.url);
    const label = SOCIAL_PLATFORMS.find((p) => p.key === l.platform)?.label ?? "Link";
    return url ? [{ id: l.id, platform: l.platform, label, url }] : [];
  });
}

/** Footer contact details, or null when none are set. */
export function contactOf(config: WeddingConfig) {
  const c = config.contact;
  const name = c?.name?.trim() ?? "";
  const email = c?.email?.trim() ?? "";
  const phone = c?.phone?.trim() ?? "";
  if (!name && !email && !phone) return null;
  return {
    name,
    email,
    phone,
    emailHref: email ? `mailto:${email}` : null,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
  };
}

// ─── Links to the site ───────────────────────────────────────────────────────

/** Path of the published website. */
export function sitePath(config: Pick<WeddingConfig, "slug" | "id">): string {
  return `/wedding/${encodeURIComponent(config.slug || config.id)}`;
}

/** Path of the downloadable invitation (Premium). */
export function invitationPath(config: Pick<WeddingConfig, "slug" | "id">): string {
  return `${sitePath(config)}/invitation`;
}

/** Element id templates give their RSVP section, so `#rsvp` links and QR codes land on it. */
export const RSVP_ANCHOR = "rsvp";
