import { describe, expect, it } from 'vitest';
import { parseCsv } from '@/lib/import/csv';
import { extractXmlRecords, parseXml } from '@/lib/import/xml';
import { detectFeedFormat, parseFeed } from '@/lib/import/feed';
import {
  mapRecord,
  normalizePropertyType,
  normalizePurpose,
  normalizeStatus,
  parsePrice,
} from '@/lib/import/mapping';
import { runListingImport } from '@/lib/import/pipeline';

const VALID_DESCRIPTION = 'A bright, modern home in a sought-after suburb with secure parking and great light.';

describe('CSV parsing', () => {
  it('handles quoted fields, embedded commas and newlines', () => {
    const csv = [
      'title,price,description',
      '"Home, sweet home","R 1 250 000","Line one\nLine two"',
      'Plain title,950000,Simple',
    ].join('\n');

    const records = parseCsv(csv);
    expect(records).toHaveLength(2);
    expect(records[0].title).toBe('Home, sweet home');
    expect(records[0].price).toBe('R 1 250 000');
    expect(records[0].description).toBe('Line one\nLine two');
    expect(records[1].title).toBe('Plain title');
  });

  it('escapes doubled quotes', () => {
    const records = parseCsv('title\n"He said ""hi"""');
    expect(records[0].title).toBe('He said "hi"');
  });
});

describe('XML parsing', () => {
  const xml = `<?xml version="1.0"?>
    <properties>
      <property ref="ABC123">
        <title>Modern 3 bed in Bryanston</title>
        <listing_type>For Sale</listing_type>
        <price>R 2 450 000</price>
        <type>Townhouse</type>
        <description><![CDATA[Spacious & secure family home.]]></description>
        <suburb>Bryanston</suburb>
        <city>Sandton</city>
        <province>Gauteng</province>
        <bedrooms>3</bedrooms>
        <images>
          <image>https://cdn.example.com/1.jpg</image>
          <image>https://cdn.example.com/2.jpg</image>
        </images>
      </property>
      <property ref="DEF456">
        <title>Sea Point apartment</title>
        <listing_type>To Rent</listing_type>
        <price>18500</price>
        <type>Flat</type>
      </property>
    </properties>`;

  it('extracts repeated record elements with attributes and nested image lists', () => {
    const records = extractXmlRecords(parseXml(xml));
    expect(records).toHaveLength(2);
    expect(records[0].ref).toBe('ABC123');
    expect(records[0].title).toBe('Modern 3 bed in Bryanston');
    expect(records[0].description).toContain('Spacious & secure');
    expect(records[0].images).toEqual(['https://cdn.example.com/1.jpg', 'https://cdn.example.com/2.jpg']);
  });

  it('decodes entities in text', () => {
    const records = extractXmlRecords(parseXml('<list><item><name>Tom &amp; Jerry</name></item></list>'));
    expect(records[0].name).toBe('Tom & Jerry');
  });
});

describe('format detection', () => {
  it('detects xml, json and csv', () => {
    expect(detectFeedFormat('  <root></root>')).toBe('xml');
    expect(detectFeedFormat('[{"a":1}]')).toBe('json');
    expect(detectFeedFormat('a,b,c\n1,2,3')).toBe('csv');
  });

  it('parses a JSON wrapper object into records', () => {
    const json = JSON.stringify({ listings: [{ title: 'A', images: [{ url: 'https://x/1.jpg' }] }] });
    const { format, records } = parseFeed(json);
    expect(format).toBe('json');
    expect(records[0].title).toBe('A');
    expect(records[0].images).toEqual(['https://x/1.jpg']);
  });
});

describe('value normalisation', () => {
  it('normalises sale/rent purpose synonyms', () => {
    expect(normalizePurpose('For Sale')).toBe('sale');
    expect(normalizePurpose('To Let')).toBe('rent');
    expect(normalizePurpose('Residential Rental')).toBe('rent');
    expect(normalizePurpose('')).toBe('');
  });

  it('maps property type synonyms to canonical slugs', () => {
    expect(normalizePropertyType('Flat')).toBe('apartment');
    expect(normalizePropertyType('Vacant Land')).toBe('vacant-land');
    expect(normalizePropertyType('warehouse')).toBe('industrial');
    expect(normalizePropertyType('house')).toBe('house');
    expect(normalizePropertyType('spaceship')).toBe('');
  });

  it('maps status synonyms with a fallback', () => {
    expect(normalizeStatus('Active', 'pending_review')).toBe('available');
    expect(normalizeStatus('Under Offer', 'pending_review')).toBe('under_offer');
    expect(normalizeStatus('', 'draft')).toBe('draft');
  });

  it('parses South African price formats', () => {
    expect(parsePrice('R 1 250 000')).toBe(1250000);
    expect(parsePrice('R1,250,000')).toBe(1250000);
    expect(parsePrice('950000')).toBe(950000);
    expect(parsePrice('')).toBeUndefined();
  });
});

describe('record mapping', () => {
  it('maps a noisy feed record into a listing input', () => {
    const mapped = mapRecord({
      reference: 'XYZ1',
      heading: 'Charming cottage',
      sale_type: 'For Sale',
      asking_price: 'R 1 800 000',
      type: 'House',
      area: 'Newlands',
      town: 'Cape Town',
      region: 'Western Cape',
      beds: '3',
      baths: '2',
      garages: '1',
      body: VALID_DESCRIPTION,
      images: ['https://cdn/x1.jpg', 'not-a-url', 'https://cdn/x2.jpg'],
    });

    expect(mapped.externalRef).toBe('XYZ1');
    expect(mapped.input.purpose).toBe('sale');
    expect(mapped.input.price).toBe(1800000);
    expect(mapped.input.propertyTypeSlug).toBe('house');
    expect(mapped.input.suburb).toBe('Newlands');
    expect(mapped.input.bedrooms).toBe(3);
    expect(mapped.input.photos).toEqual([
      { src: 'https://cdn/x1.jpg', alt: 'Charming cottage photo' },
      { src: 'https://cdn/x2.jpg', alt: 'Charming cottage photo' },
    ]);
  });

  it('applies the default status when the feed omits one', () => {
    const mapped = mapRecord({ title: 'No status listing' }, { defaultStatus: 'available' });
    expect(mapped.input.status).toBe('available');
  });
});

describe('import pipeline', () => {
  const validRow = {
    reference: 'A1',
    title: 'Modern family home in Bryanston',
    listing_type: 'For Sale',
    price: 'R 2 450 000',
    type: 'Townhouse',
    suburb: 'Bryanston',
    city: 'Sandton',
    province: 'Gauteng',
    description: VALID_DESCRIPTION,
  };

  it('separates valid and invalid rows with errors', () => {
    const xml = buildXml([
      validRow,
      { reference: 'B2', title: 'x', price: 'abc' }, // too short / invalid
    ]);

    const result = runListingImport(xml);
    expect(result.summary.total).toBe(2);
    expect(result.summary.valid).toBe(1);
    expect(result.summary.invalid).toBe(1);
    expect(result.rows[0].status).toBe('valid');
    expect(result.rows[0].data?.price).toBe(2450000);
    expect(result.rows[1].status).toBe('invalid');
    expect(result.rows[1].errors.length).toBeGreaterThan(0);
  });

  it('flags duplicate external references within a feed', () => {
    const xml = buildXml([validRow, { ...validRow, title: 'Another home in Bryanston area' }]);
    const result = runListingImport(xml);
    expect(result.summary.duplicateRefs).toContain('A1');
  });

  it('imports a CSV feed end to end', () => {
    const csv = [
      'ref,title,listing_type,price,property_type,suburb,city,province,description',
      `R9,Spacious home with a view,For Sale,1500000,House,Durbanville,Cape Town,Western Cape,"${VALID_DESCRIPTION}"`,
    ].join('\n');

    const result = runListingImport(csv);
    expect(result.summary.format).toBe('csv');
    expect(result.summary.valid).toBe(1);
    expect(result.rows[0].externalRef).toBe('R9');
    expect(result.rows[0].data?.city).toBe('Cape Town');
  });
});

function buildXml(rows: Record<string, string>[]): string {
  const body = rows
    .map((row) => {
      const fields = Object.entries(row)
        .map(([key, value]) => `<${key}>${value}</${key}>`)
        .join('');
      return `<property>${fields}</property>`;
    })
    .join('');
  return `<properties>${body}</properties>`;
}
