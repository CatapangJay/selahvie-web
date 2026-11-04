import { inviteUrl, matchGuestByName } from "@/lib/invitations";
import { normalizePhMobile, renderSms, smsCredits, SMS_MAX_LENGTH, SMS_MIN_LENGTH } from "@/lib/smsMessage";
import { sitePath } from "@/lib/weddingDetails";
import type { GuestListEntry, WeddingConfig } from "@/types/wedding";

/** A number typed in the dashboard rather than picked from the guest list. */
export interface ManualRecipient {
  name: string;
  phone: string;
}

export interface SmsRecipient {
  guestId: string | null;
  name: string;
  recipient: string;
  /** "personal" = the guest's own invite link; "site" = the website's open link. */
  linkKind: "personal" | "site";
  link: string;
  content: string;
  credits: number;
}

export interface SmsRejected {
  name: string;
  phone: string;
  reason: string;
}

/**
 * Who gets which text. Guests picked from the list get their personal invite
 * link. A typed name that confidently matches one guest on the list gets that
 * guest's link too, unless the list has a different number for them: a personal
 * link opens their private invitation, so it never goes to a number that might
 * belong to someone else with a similar name. Everyone else (no match, two guests
 * share the name, or a different number) gets the website's open link, where the
 * RSVP form can still recognise them. The same number and link is only texted once.
 */
export function buildSmsRecipients(input: {
  config: Pick<WeddingConfig, "slug" | "id" | "partner1Name" | "partner2Name">;
  origin: string;
  guests: GuestListEntry[];
  guestIds: string[];
  manual: ManualRecipient[];
  template: string;
}): { recipients: SmsRecipient[]; rejected: SmsRejected[] } {
  const { config, origin, guests, template } = input;
  const slug = config.slug || config.id;
  const siteLink = `${origin}${sitePath(config)}`;
  const couple = [config.partner1Name, config.partner2Name].map((n) => n?.trim()).filter(Boolean).join(" & ");
  const byId = new Map(guests.map((g) => [g.id, g]));

  const recipients: SmsRecipient[] = [];
  const rejected: SmsRejected[] = [];
  const seen = new Set<string>();

  const add = (name: string, phone: string | undefined, guest: GuestListEntry | null) => {
    const recipient = normalizePhMobile(phone);
    if (!recipient) {
      rejected.push({ name, phone: phone ?? "", reason: phone?.trim() ? "Not a Philippine mobile number" : "No mobile number" });
      return;
    }
    const link = guest ? inviteUrl(origin, slug, guest.inviteCode) : siteLink;
    const key = `${recipient}|${link}`;
    if (seen.has(key)) return;
    seen.add(key);
    const content = renderSms(template, { couple, name, link });
    if (content.length < SMS_MIN_LENGTH || content.length > SMS_MAX_LENGTH) {
      rejected.push({ name, phone: recipient, reason: `Message must be ${SMS_MIN_LENGTH}–${SMS_MAX_LENGTH} characters` });
      return;
    }
    recipients.push({
      guestId: guest?.id ?? null,
      name,
      recipient,
      linkKind: guest ? "personal" : "site",
      link,
      content,
      credits: smsCredits(content),
    });
  };

  for (const id of new Set(input.guestIds)) {
    const guest = byId.get(id);
    if (guest) add(guest.name, guest.phone, guest);
    // Picked in the dashboard but not on the saved list (just added, or removed meanwhile).
    else rejected.push({ name: "A guest", phone: "", reason: "Not on your saved guest list yet. Try again in a moment" });
  }
  for (const m of input.manual) {
    const name = m.name.trim();
    if (!name) {
      rejected.push({ name: "(no name)", phone: m.phone, reason: "Add the guest's name" });
      continue;
    }
    const match = matchGuestByName(name, guests);
    const listed = match.status === "match" ? normalizePhMobile(match.guest.phone) : null;
    const typed = normalizePhMobile(m.phone);
    // A match is greeted by their name as it's written on the list ("maria" → "María Santos").
    if (match.status === "match" && (!listed || listed === typed)) add(match.guest.name, m.phone, match.guest);
    else add(name, m.phone, null);
  }
  return { recipients, rejected };
}
