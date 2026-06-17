import { describe, expect, it } from 'vitest';
import {
  buildListingFactSheet,
  hasEnoughFacts,
  isAiConfigured,
  parseListingFactsFromBody,
} from '@/lib/ai/listing-description';

describe('isAiConfigured', () => {
  it('is true only when an API key is present', () => {
    expect(isAiConfigured({})).toBe(false);
    expect(isAiConfigured({ ANTHROPIC_API_KEY: '  ' })).toBe(false);
    expect(isAiConfigured({ ANTHROPIC_API_KEY: 'sk-ant-123' })).toBe(true);
  });
});

describe('hasEnoughFacts', () => {
  it('requires a title or property type', () => {
    expect(hasEnoughFacts({})).toBe(false);
    expect(hasEnoughFacts({ title: 'Modern 3-bed' })).toBe(true);
    expect(hasEnoughFacts({ propertyType: 'House' })).toBe(true);
    expect(hasEnoughFacts({ suburb: 'Sandton' })).toBe(false);
  });
});

describe('buildListingFactSheet', () => {
  it('renders only the facts provided, formatting purpose and location', () => {
    const sheet = buildListingFactSheet({
      title: 'Modern 3-bed house',
      purpose: 'rent',
      propertyType: 'House',
      suburb: 'Sandton',
      city: 'Johannesburg',
      bedrooms: 3,
      features: ['Pool', 'Solar'],
    });
    expect(sheet).toContain('Listing title: Modern 3-bed house');
    expect(sheet).toContain('Purpose: For rent');
    expect(sheet).toContain('Location: Sandton, Johannesburg');
    expect(sheet).toContain('Bedrooms: 3');
    expect(sheet).toContain('Features: Pool, Solar');
    // Omitted facts should not appear
    expect(sheet).not.toContain('Erf size');
    expect(sheet).not.toContain('Bathrooms');
  });

  it('omits empty and blank values', () => {
    const sheet = buildListingFactSheet({ title: 'Loft', suburb: '   ', bedrooms: '' });
    expect(sheet).toBe('Listing title: Loft');
  });
});

describe('parseListingFactsFromBody', () => {
  it('maps a property type slug to a readable label and bounds inputs', () => {
    const facts = parseListingFactsFromBody({
      title: 'Cluster',
      purpose: 'sale',
      propertyTypeSlug: 'townhouse',
      suburb: 'Bryanston',
      bedrooms: 4,
      features: ['Garden', '', '   ', 'Study'],
    });
    expect(facts.propertyType).toBe('Townhouse');
    expect(facts.purpose).toBe('sale');
    expect(facts.bedrooms).toBe('4');
    expect(facts.features).toEqual(['Garden', 'Study']);
  });

  it('defends against malformed input', () => {
    expect(parseListingFactsFromBody(null)).toEqual({
      title: undefined,
      purpose: undefined,
      propertyType: undefined,
      suburb: undefined,
      city: undefined,
      province: undefined,
      price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      parking: undefined,
      floorSizeSqm: undefined,
      erfSizeSqm: undefined,
      features: undefined,
    });
    const bad = parseListingFactsFromBody({ purpose: 'lease', title: 42, features: 'not-an-array' });
    expect(bad.purpose).toBeUndefined();
    expect(bad.title).toBe('42');
    expect(bad.features).toBeUndefined();
  });

  it('caps overly long strings and large feature lists', () => {
    const facts = parseListingFactsFromBody({
      title: 'x'.repeat(500),
      features: Array.from({ length: 50 }, (_, i) => `f${i}`),
    });
    expect(facts.title?.length).toBe(200);
    expect(facts.features?.length).toBe(30);
  });
});
