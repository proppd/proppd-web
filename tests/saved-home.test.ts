import { describe, expect, it } from 'vitest';
import { normaliseSavedHomeSlug, savedHomeSlugsFromRows } from '@/lib/listings/saved-home';

describe('normaliseSavedHomeSlug', () => {
  it('accepts and lowercases valid listing slugs', () => {
    expect(normaliseSavedHomeSlug('modern-3-bedroom-house-in-sandton-12345')).toBe('modern-3-bedroom-house-in-sandton-12345');
    expect(normaliseSavedHomeSlug('  Sea-Point-Apartment-20401  ')).toBe('sea-point-apartment-20401');
  });

  it('rejects non-strings and malformed slugs', () => {
    expect(normaliseSavedHomeSlug(undefined)).toBeNull();
    expect(normaliseSavedHomeSlug(42)).toBeNull();
    expect(normaliseSavedHomeSlug('')).toBeNull();
    expect(normaliseSavedHomeSlug('a')).toBeNull();
    expect(normaliseSavedHomeSlug('-leading-hyphen')).toBeNull();
    expect(normaliseSavedHomeSlug('trailing-hyphen-')).toBeNull();
    expect(normaliseSavedHomeSlug('has spaces')).toBeNull();
    expect(normaliseSavedHomeSlug('has/slash')).toBeNull();
    expect(normaliseSavedHomeSlug('drop;table')).toBeNull();
  });

  it('rejects absurdly long input', () => {
    expect(normaliseSavedHomeSlug('a'.repeat(200))).toBeNull();
  });
});

describe('savedHomeSlugsFromRows', () => {
  it('extracts non-empty slugs and ignores null/empty rows', () => {
    expect(
      savedHomeSlugsFromRows([{ slug: 'first-home-1' }, { slug: null }, { slug: '' }, { slug: 'second-home-2' }]),
    ).toEqual(['first-home-1', 'second-home-2']);
  });

  it('handles null/undefined input', () => {
    expect(savedHomeSlugsFromRows(null)).toEqual([]);
    expect(savedHomeSlugsFromRows(undefined)).toEqual([]);
  });
});
