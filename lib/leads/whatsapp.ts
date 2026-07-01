/**
 * WhatsApp deep-link helpers for buyer → agent enquiries.
 *
 * Agents capture their WhatsApp number in whatever format they type
 * (082 123 4567, +27 82 123 4567, 27821234567). wa.me only accepts a full
 * international number with no punctuation, so normalisation lives here in
 * one place and every surface (listing page, mobile bar, agent profile)
 * renders the same link.
 */

export type WhatsAppListingContext = {
  slug: string;
  title: string;
  price: string;
  location: string;
};

/**
 * Convert a phone number as typed into wa.me digits (international format,
 * digits only). Returns null when the number is too short or ambiguous to
 * dial internationally — callers hide the WhatsApp action in that case.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  // 00-prefixed international dialling (0027 82 123 4567).
  if (!hasPlus && digits.startsWith('00') && digits.length >= 11 && digits.length <= 17) {
    return digits.slice(2);
  }

  // South African national format: 0 + 9 digits (082 123 4567).
  if (!hasPlus && digits.startsWith('0') && digits.length === 10) {
    return `27${digits.slice(1)}`;
  }

  // Already international: +27 82 123 4567, 27821234567, or another country.
  if (!digits.startsWith('0') && digits.length >= 10 && digits.length <= 15) {
    return digits;
  }

  return null;
}

export function buildWhatsAppLink(number: string | null | undefined, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(number);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildListingWhatsAppMessage(listing: WhatsAppListingContext): string {
  return [
    `Hi, I'm interested in ${listing.title} in ${listing.location} (${listing.price}) that I found on Proppd. Please send me more information.`,
    '',
    `https://proppd.com/property/${listing.slug}`,
  ].join('\n');
}

export function buildListingWhatsAppLink(
  number: string | null | undefined,
  listing: WhatsAppListingContext,
): string | null {
  return buildWhatsAppLink(number, buildListingWhatsAppMessage(listing));
}

export function buildAgentWhatsAppLink(number: string | null | undefined, agentName: string): string | null {
  return buildWhatsAppLink(
    number,
    `Hi ${agentName}, I found your profile on Proppd and would like to chat about a property.`,
  );
}
