/**
 * Text-invitation wording, shared by the dashboard preview and the server that
 * sends it (app/api/sms/invitations), so what the couple previews is what goes out.
 * UniSMS rules: 10–670 characters, plain text (no emoji, few accents), 160 per credit.
 */

/** Placeholders the couple can use in their message. */
export const SMS_PLACEHOLDERS = ["{name}", "{link}"] as const;

/** The couple's part of the text; `smsPrefix` (who it's from) always comes first. */
export const DEFAULT_SMS_TEMPLATE = "Dear {name}, please join us. Your invitation and RSVP: {link}";

export const SMS_MIN_LENGTH = 10;
export const SMS_MAX_LENGTH = 670;
const CREDIT_CHARS = 160;

/** Texts a website may send in total (each long text can use up to 5 credits). */
export const SMS_ALLOWANCE_CREDITS = 300;

/** Texts any one number can receive from a website, so a number can't be flooded. */
export const SMS_PER_NUMBER = 3;

/**
 * Web addresses anywhere but the inserted {link} are refused, so the platform's
 * sender ID can't carry someone else's link (phishing). Matches schemes, www.
 * and bare domains like "bit.ly/x" or "example.ph".
 */
const URL_LIKE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ph|io|co|ly|me|app|site|link|info|xyz|online|shop|biz|us|to|gl|gg)\b)/i;

export function containsLink(text: string): boolean {
  return URL_LIKE.test(text.replace(/\{link\}/gi, ""));
}

/**
 * Plain text UniSMS can deliver: accents dropped ("José" → "Jose", "ñ" → "n"),
 * smart quotes and dashes straightened, anything else non-printable removed.
 */
export function smsSafe(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Fixed opening line naming who the text is from; the couple can't edit it. */
export function smsPrefix(couple: string): string {
  return `${couple.trim() || "Wedding"} wedding invitation:`;
}

/**
 * The message one guest receives: the fixed prefix, then the couple's wording with
 * {name} and {link} filled in (any case). Links in names are dropped; a template
 * without {link} still carries the invitation at the end.
 */
export function renderSms(template: string, vars: { couple: string; name: string; link: string }): string {
  const name = vars.name.replace(new RegExp(URL_LIKE.source, "gi"), "").trim() || "friend";
  const hasLink = /\{link\}/i.test(template);
  const body = template.replace(/\{name\}/gi, () => name).replace(/\{link\}/gi, () => vars.link);
  return smsSafe(`${smsPrefix(vars.couple)} ${hasLink ? body : `${body} ${vars.link}`}`);
}

export function smsCredits(content: string): number {
  return Math.min(5, Math.max(1, Math.ceil(content.length / CREDIT_CHARS)));
}

/**
 * Philippine mobile number in UniSMS's +639XXXXXXXXX form, or null. Accepts
 * spaces, dashes and brackets, and the 09…, 639…, +639… and 9… spellings.
 */
export function normalizePhMobile(input: string | undefined | null): string | null {
  const digits = (input ?? "").replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const national = digits.replace(/^\+?63/, "").replace(/^0/, "");
  return /^9\d{9}$/.test(national) ? `+63${national}` : null;
}

/** "+639171234567" → "0917 123 4567", for display. */
export function formatPhMobile(e164: string): string {
  const n = e164.replace(/^\+63/, "0");
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
}
