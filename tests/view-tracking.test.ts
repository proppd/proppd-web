import { describe, expect, it } from 'vitest';
import { buildVisitorHash, isWithinDedupeWindow, normaliseViewSource, VIEW_DEDUPE_WINDOW_MS } from '@/lib/listings/view-tracking';

describe('buildVisitorHash', () => {
  it('is deterministic for the same ip + user agent', () => {
    const a = buildVisitorHash('41.0.0.1', 'Mozilla/5.0');
    const b = buildVisitorHash('41.0.0.1', 'Mozilla/5.0');
    expect(a).toBe(b);
    expect(a).toHaveLength(32);
  });

  it('differs for different visitors and never leaks the raw ip', () => {
    const a = buildVisitorHash('41.0.0.1', 'Mozilla/5.0');
    const b = buildVisitorHash('41.0.0.2', 'Mozilla/5.0');
    expect(a).not.toBe(b);
    expect(a).not.toContain('41.0.0.1');
  });

  it('handles missing values', () => {
    expect(buildVisitorHash(null, null)).toHaveLength(32);
    expect(buildVisitorHash(undefined, undefined)).toHaveLength(32);
  });
});

describe('isWithinDedupeWindow', () => {
  const now = new Date('2026-06-13T12:00:00Z');

  it('returns true for a very recent view', () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(isWithinDedupeWindow(fiveMinAgo, now)).toBe(true);
  });

  it('returns false once the window has elapsed', () => {
    const longAgo = new Date(now.getTime() - VIEW_DEDUPE_WINDOW_MS - 1000).toISOString();
    expect(isWithinDedupeWindow(longAgo, now)).toBe(false);
  });

  it('returns false for missing or invalid timestamps', () => {
    expect(isWithinDedupeWindow(null, now)).toBe(false);
    expect(isWithinDedupeWindow(undefined, now)).toBe(false);
    expect(isWithinDedupeWindow('not-a-date', now)).toBe(false);
  });
});

describe('normaliseViewSource', () => {
  it('trims and caps the source string', () => {
    expect(normaliseViewSource('listing-page')).toBe('listing-page');
    expect(normaliseViewSource('  search  ')).toBe('search');
    expect(normaliseViewSource('x'.repeat(200))).toHaveLength(80);
  });

  it('returns null for non-strings or empty values', () => {
    expect(normaliseViewSource(42)).toBeNull();
    expect(normaliseViewSource('')).toBeNull();
    expect(normaliseViewSource(undefined)).toBeNull();
  });
});
