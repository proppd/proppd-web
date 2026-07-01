import { describe, expect, it } from 'vitest';
import {
  buildAgentWhatsAppLink,
  buildListingWhatsAppLink,
  buildListingWhatsAppMessage,
  buildWhatsAppLink,
  normalizeWhatsAppNumber,
  type WhatsAppListingContext,
} from '@/lib/leads/whatsapp';

const listing: WhatsAppListingContext = {
  slug: 'modern-3-bedroom-house-in-sandton-12345',
  title: 'Modern 3-bedroom house in Sandton',
  price: 'R 3 250 000',
  location: 'Sandton, Johannesburg',
};

describe('normalizeWhatsAppNumber', () => {
  it('converts SA national format to international digits', () => {
    expect(normalizeWhatsAppNumber('082 123 4567')).toBe('27821234567');
    expect(normalizeWhatsAppNumber('0821234567')).toBe('27821234567');
    expect(normalizeWhatsAppNumber('011-234-9801')).toBe('27112349801');
  });

  it('accepts numbers already in international format', () => {
    expect(normalizeWhatsAppNumber('+27 82 123 4567')).toBe('27821234567');
    expect(normalizeWhatsAppNumber('27821234567')).toBe('27821234567');
    expect(normalizeWhatsAppNumber('+27 11 234 9801')).toBe('27112349801');
  });

  it('strips the 00 international dialling prefix', () => {
    expect(normalizeWhatsAppNumber('0027 82 123 4567')).toBe('27821234567');
  });

  it('keeps non-SA international numbers intact', () => {
    expect(normalizeWhatsAppNumber('+44 7911 123456')).toBe('447911123456');
  });

  it('rejects numbers that are missing, too short, or ambiguous', () => {
    expect(normalizeWhatsAppNumber(undefined)).toBeNull();
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber('')).toBeNull();
    expect(normalizeWhatsAppNumber('  ')).toBeNull();
    expect(normalizeWhatsAppNumber('12345')).toBeNull();
    // National format with the wrong digit count cannot be dialled reliably.
    expect(normalizeWhatsAppNumber('082 123 456')).toBeNull();
    expect(normalizeWhatsAppNumber('call me')).toBeNull();
  });
});

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link with the encoded message', () => {
    const href = buildWhatsAppLink('082 123 4567', 'Hi there');
    expect(href).toBe('https://wa.me/27821234567?text=Hi%20there');
  });

  it('returns null when the number cannot be normalised', () => {
    expect(buildWhatsAppLink('nope', 'Hi')).toBeNull();
    expect(buildWhatsAppLink(undefined, 'Hi')).toBeNull();
  });
});

describe('buildListingWhatsAppLink', () => {
  it('pre-fills the listing title, location, price, and canonical URL', () => {
    const message = buildListingWhatsAppMessage(listing);
    expect(message).toContain('Modern 3-bedroom house in Sandton');
    expect(message).toContain('Sandton, Johannesburg');
    expect(message).toContain('R 3 250 000');
    expect(message).toContain('https://proppd.com/property/modern-3-bedroom-house-in-sandton-12345');

    const href = buildListingWhatsAppLink('+27 82 123 4567', listing);
    expect(href).not.toBeNull();
    expect(href).toContain('https://wa.me/27821234567?text=');
    expect(decodeURIComponent(href!)).toContain('Modern 3-bedroom house in Sandton');
  });

  it('returns null so the CTA stays hidden when the agent has no WhatsApp number', () => {
    expect(buildListingWhatsAppLink(undefined, listing)).toBeNull();
  });
});

describe('buildAgentWhatsAppLink', () => {
  it('greets the agent by name', () => {
    const href = buildAgentWhatsAppLink('082 123 4567', 'Lerato Mokoena');
    expect(href).toContain('https://wa.me/27821234567?text=');
    expect(decodeURIComponent(href!)).toContain('Hi Lerato Mokoena');
  });
});
